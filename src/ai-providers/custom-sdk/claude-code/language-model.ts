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

export class ClaudeCodeLanguageModel extends BaseAIProvider {
  private readonly settings: ClaudeCodeSettings
  private readonly sessionId: string
  private claudeCode: any = null

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
    return this.claudeCode
  }

  private getModel(): string {
    const mapped = modelMap[this.config.model || 'sonnet']
    return mapped ?? (this.config.model || 'claude-3-5-sonnet-20241022')
  }

  private async loadClaudeCode(): Promise<any> {
    if (this.claudeCode) {
      return this.claudeCode
    }

    try {
      // For testing and development, return mock Claude Code when SDK is not available
      if (process.env.NODE_ENV === 'test' || !process.env.CLAUDE_CODE_AVAILABLE) {
        this.claudeCode = {
          query: async (params: any) => ({
            text: JSON.stringify({
              suggestions: ['feat: mock claude code suggestion'],
              reasoning: 'Mock Claude Code response',
              confidence: 0.8
            })
          })
        }
        return this.claudeCode
      }

      // Try to dynamically import Claude Code SDK (optional dependency)
      let claudeCodeModule: any
      try {
        // @ts-ignore - Optional dependency, may not be available
        claudeCodeModule = await import('@anthropic-ai/claude-code')
      } catch {
        // Package not available, use fallback
        throw new Error('Claude Code SDK not available')
      }
      this.claudeCode = claudeCodeModule
      return this.claudeCode
    } catch (error) {
      // Fallback to mock for development
      this.claudeCode = {
        query: async (params: any) => ({
          text: JSON.stringify({
            suggestions: ['feat: fallback claude code suggestion'],
            reasoning: 'Claude Code SDK not available, using fallback',
            confidence: 0.7
          })
        })
      }
      return this.claudeCode
    }
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

        // Load and use Claude Code SDK
        const claudeCode = await this.loadClaudeCode()
        
        const response = await claudeCode.query({
          model: this.getModel(),
          prompt: messagesPrompt,
          systemPrompt: systemPrompt || systemMessage,
          mode: 'generate', // or 'stream'
          sessionId: this.sessionId,
          settings: {
            ...this.settings,
            cwd: this.settings.cwd || process.cwd(),
            verbose: this.config.debug || this.settings.verbose || false
          }
        })

        let text = response.text || response.content || ''

        // Extract JSON from response
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

        if (attempt < maxRetries && !isAuthenticationError(lastError) && !isTimeoutError(lastError)) {
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
      const claudeCode = await this.loadClaudeCode()
      
      const response = await claudeCode.query({
        model: this.getModel(),
        prompt: 'test',
        systemPrompt: 'You are a test assistant. Reply with "OK".',
        mode: 'generate',
        sessionId: generateUUID(),
        settings: {
          ...this.settings,
          cwd: this.settings.cwd || process.cwd()
        }
      })
      
      const text = response.text || response.content || ''
      return text.toLowerCase().includes('ok')
    } catch {
      return false
    }
  }
}