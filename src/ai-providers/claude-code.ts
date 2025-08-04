/**
 * Claude Code Provider using AI SDK Claude Code Provider
 * Uses the official ai-sdk-provider-claude-code for better integration
 */

import { generateText } from 'ai'
import { createClaudeCode } from 'ai-sdk-provider-claude-code'
import { BaseAIProvider, AIProviderConfig } from './base-provider'
import { TitleGenerationRequest, TitleGenerationResponse } from '../shared/types'

export class ClaudeCodeProvider extends BaseAIProvider {
  private claudeCode: ReturnType<typeof createClaudeCode>

  constructor(config: AIProviderConfig) {
    super(config, 'ClaudeCode')
    
    // Create Claude Code provider instance with default settings
    this.claudeCode = createClaudeCode()
  }

  getRequiredApiKeyName(): string {
    return 'CLAUDE_CODE_API_KEY' // Optional - can use Claude subscription
  }

  protected isRequiredApiKey(): boolean {
    return false // Claude Code can work with subscription or API key
  }

  getClient(): any {
    return this.claudeCode
  }

  private mapModelName(model?: string): string {
    // Map simplified model names to full model IDs
    const modelMap: Record<string, string> = {
      'sonnet': 'claude-3-5-sonnet-20241022',
      'opus': 'claude-3-opus-20240229',
      'haiku': 'claude-3-haiku-20240307'
    }
    
    if (!model) return 'claude-3-5-sonnet-20241022'
    return modelMap[model] || model
  }

  async generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse> {
    this.validateParams()
    
    try {
      const prompt = this.buildPrompt(request)
      const systemMessage = this.buildSystemMessage(request.options)
      
      if (this.config.debug) {
        console.log('Claude Code generateTitle:', {
          model: this.mapModelName(this.config.model),
          promptLength: prompt.length
        })
      }

      const result = await generateText({
        model: this.claudeCode(this.mapModelName(this.config.model)),
        system: systemMessage,
        prompt: prompt,
        temperature: this.config.temperature || 0.3,
        maxTokens: this.config.maxTokens || 500,
        // Specify JSON mode for structured output
        experimental_providerMetadata: {
          anthropic: {
            output: 'json'
          }
        }
      })

      const text = result.text

      if (!text) {
        throw new Error('Empty response from Claude Code')
      }

      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(text)
        return {
          suggestions: Array.isArray(parsed.suggestions) 
            ? parsed.suggestions 
            : [parsed.suggestions || 'feat: improve PR title'],
          reasoning: parsed.reasoning || 'Generated using Claude Code',
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8
        }
      } catch (jsonError) {
        if (this.config.debug) {
          console.warn('JSON parsing failed, extracting from text:', jsonError)
        }
        
        // Fallback: extract suggestions from plain text
        const suggestions = this.extractSuggestionsFromText(text)
        return {
          suggestions,
          reasoning: 'Response parsed from text format',
          confidence: 0.7
        }
      }
    } catch (error) {
      this.handleError(error, 'generateTitle')
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const result = await generateText({
        model: this.claudeCode('claude-3-haiku-20240307'), // Use fastest model for health check
        prompt: 'Reply with just "OK"',
        maxTokens: 10,
        temperature: 0
      })
      
      return result.text.toLowerCase().includes('ok')
    } catch (error) {
      if (this.config.debug) {
        console.warn('Claude Code health check failed:', error)
      }
      return false
    }
  }
}