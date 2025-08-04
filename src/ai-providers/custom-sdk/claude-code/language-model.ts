/**
 * Claude Code Language Model implementation
 * Uses @anthropic-ai/claude-code SDK for enhanced AI interactions
 */

import { BaseAIProvider, AIProviderConfig } from '../../base-provider'
import { TitleGenerationRequest, TitleGenerationResponse } from '../../../shared/types'
import { convertToClaudeCodeMessages, GenerationMode } from './message-converter'
import { extractJson } from './json-extractor'
import {
  createAPICallError,
  createAuthenticationError,
  createTimeoutError,
  isAuthenticationError,
  isTimeoutError,
  ClaudeCodeAPIError
} from './errors'
import { ClaudeCodeSettings, ClaudeCodeModelId } from './types'

// Simple UUID v4 generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const modelMap: Record<string, string> = {
  'opus': 'claude-3-5-sonnet-20241022',
  'sonnet': 'claude-3-5-sonnet-20241022'
}

interface ClaudeCodeModule {
  generateText?: (params: any) => Promise<any>
  streamText?: (params: any) => Promise<any>
  experimental_generateText?: (params: any) => Promise<any>
  experimental_streamText?: (params: any) => Promise<any>
  query?: (params: any) => Promise<any>
}

export class ClaudeCodeLanguageModel extends BaseAIProvider {
  private readonly settings: ClaudeCodeSettings
  private readonly sessionId: string
  private claudeCodeModule: ClaudeCodeModule | null = null
  private _moduleLoadPromise: Promise<ClaudeCodeModule> | null = null

  constructor(config: AIProviderConfig & { settings?: ClaudeCodeSettings }) {
    super(config, 'ClaudeCode')
    this.settings = config.settings || {}
    this.sessionId = this.settings.resume || generateUUID()
  }

  getRequiredApiKeyName(): string {
    return 'CLAUDE_CODE_API_KEY' // Optional for Claude Code CLI
  }

  protected isRequiredApiKey(): boolean {
    return false // Claude Code CLI can work without API key
  }

  getClient(): any {
    return this.claudeCodeModule
  }

  private getModel(): string {
    const mapped = modelMap[this.config.model || 'sonnet']
    return mapped ?? (this.config.model || 'claude-3-5-sonnet-20241022')
  }

  /**
   * Load Claude Code module with caching and better error handling
   */
  private async loadClaudeCodeModule(): Promise<ClaudeCodeModule> {
    if (this.claudeCodeModule) {
      return this.claudeCodeModule
    }

    if (this._moduleLoadPromise) {
      return this._moduleLoadPromise
    }

    this._moduleLoadPromise = this._loadModule()
    
    try {
      this.claudeCodeModule = await this._moduleLoadPromise
      return this.claudeCodeModule
    } catch (error) {
      this._moduleLoadPromise = null
      throw error
    }
  }

  private async _loadModule(): Promise<ClaudeCodeModule> {
    const moduleLoadErrors: string[] = []

    // Try different import paths
    const importPaths = [
      '@anthropic-ai/claude-code',
      'claude-code',
      '@claude/claude-code'
    ]

    for (const path of importPaths) {
      try {
        const module = await import(path)
        
        // Validate the module has expected methods
        if (module && (module.generateText || module.query || module.experimental_generateText)) {
          if (this.config.debug) {
            console.log(`Claude Code module loaded from: ${path}`)
          }
          return module
        } else {
          moduleLoadErrors.push(`${path}: Module loaded but missing expected methods`)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        moduleLoadErrors.push(`${path}: ${errorMsg}`)
      }
    }

    // All import attempts failed
    const errorDetails = moduleLoadErrors.join(', ')
    throw createAuthenticationError({
      message: `Claude Code SDK not available. Tried paths: ${errorDetails}. ` +
      'Please install @anthropic-ai/claude-code or ensure Claude Code CLI is properly set up.'
    })
  }

  /**
   * Generate text using Claude Code with enhanced error handling
   */
  private async generateWithClaudeCode(
    prompt: string,
    systemPrompt: string,
    mode: 'generate' | 'stream' = 'generate'
  ): Promise<any> {
    const claudeCode = await this.loadClaudeCodeModule()

    const params = {
      model: this.getModel(),
      prompt,
      systemPrompt,
      mode,
      sessionId: this.sessionId,
      settings: {
        ...this.settings,
        cwd: this.settings.cwd || process.cwd(),
        verbose: this.config.debug || this.settings.verbose || false,
        executable: this.settings.executable || 'npx',
        pathToClaudeCodeExecutable: this.settings.pathToClaudeCodeExecutable,
        permissionMode: this.settings.permissionMode || 'default',
        maxTurns: this.settings.maxTurns,
        maxThinkingTokens: this.settings.maxThinkingTokens,
        allowedTools: this.settings.allowedTools,
        disallowedTools: this.settings.disallowedTools,
        env: this.settings.env
      }
    }

    // Try different methods based on what's available
    if (claudeCode.query) {
      return await claudeCode.query(params)
    } else if (claudeCode.generateText || claudeCode.experimental_generateText) {
      const generateFn = claudeCode.generateText || claudeCode.experimental_generateText
      if (generateFn) {
        return await generateFn(params)
      }
    }
    
    throw createAPICallError({
      message: 'No suitable generation method found in Claude Code module'
    })
  }

  async generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse> {
    this.validateParams()
    
    const maxRetries = 3
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const prompt = this.buildPrompt(request)
        const systemMessage = this.buildSystemMessage(request.options)

        // Convert to Claude Code format
        const mode: GenerationMode = { type: 'object-json' }
        const { messagesPrompt, systemPrompt } = convertToClaudeCodeMessages([
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ], mode)

        // Generate using enhanced Claude Code method
        const response = await this.generateWithClaudeCode(
          messagesPrompt,
          systemPrompt || systemMessage,
          'generate'
        )

        // Extract response text with multiple fallbacks
        let text = ''
        if (response) {
          text = response.text || response.content || response.message || response.output || ''
          
          // Handle streaming responses
          if (!text && response.stream) {
            const chunks: string[] = []
            for await (const chunk of response.stream) {
              if (chunk.text || chunk.content) {
                chunks.push(chunk.text || chunk.content)
              }
            }
            text = chunks.join('')
          }
        }

        if (!text) {
          throw createAPICallError({
            message: 'Empty response from Claude Code'
          })
        }

        // Extract JSON from response with better error handling
        try {
          const extractedJson = extractJson(text)
          const parsed = JSON.parse(extractedJson)
          
          return {
            suggestions: Array.isArray(parsed.suggestions) 
              ? parsed.suggestions 
              : [parsed.suggestions || 'feat: improve PR title'],
            reasoning: parsed.reasoning || 'AI generated suggestions based on PR content',
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8
          }
        } catch (jsonError) {
          if (this.config.debug) {
            console.warn('JSON parsing failed:', jsonError)
            console.warn('Raw response:', text)
          }
          
          // Fallback: try to extract suggestions from plain text
          const suggestions = this.extractSuggestionsFromText(text)
          return {
            suggestions,
            reasoning: 'Response could not be parsed as JSON, extracted from text',
            confidence: 0.6
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (this.config.debug) {
          console.warn(`Claude Code attempt ${attempt + 1} failed:`, lastError.message)
        }

        // Check if we should retry
        if (attempt < maxRetries && 
            !isAuthenticationError(lastError) && 
            !isTimeoutError(lastError)) {
          await this.delay(Math.pow(2, attempt) * 1000)
        } else {
          break
        }
      }
    }

    this.handleError(lastError, 'generateTitle')
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.generateWithClaudeCode(
        'test',
        'You are a test assistant. Reply with "OK".',
        'generate'
      )
      
      const text = response?.text || response?.content || ''
      return text.toLowerCase().includes('ok')
    } catch (error) {
      if (this.config.debug) {
        console.warn('Health check failed:', error)
      }
      return false
    }
  }
}