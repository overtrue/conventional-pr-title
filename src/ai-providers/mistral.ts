/**
 * Mistral AI Provider
 */

import { mistral, createMistral } from '@ai-sdk/mistral'
import { generateText } from 'ai'
import { BaseAIProvider, AIProviderConfig } from './base-provider'
import { TitleGenerationRequest, TitleGenerationResponse } from '../shared/types'

export class MistralProvider extends BaseAIProvider {
  constructor(config: AIProviderConfig) {
    super(config, 'Mistral')
  }

  getRequiredApiKeyName(): string {
    return 'MISTRAL_API_KEY'
  }

  getClient() {
    return this.config.baseURL
      ? createMistral({
          apiKey: this.config.apiKey,
          baseURL: this.config.baseURL
        })
      : { model: (model: string) => mistral(model) }
  }

  async generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse> {
    this.validateParams()
    
    const maxRetries = 3
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const prompt = this.buildPrompt(request)
        const systemMessage = this.buildSystemMessage(request.options)

        const model = this.config.baseURL
          ? createMistral({
              apiKey: this.config.apiKey,
              baseURL: this.config.baseURL
            })(this.config.model || 'mistral-large-latest')
          : mistral(this.config.model || 'mistral-large-latest')

        const result = await generateText({
          model,
          system: systemMessage,
          prompt,
          maxTokens: this.config.maxTokens || 500,
          temperature: this.config.temperature || 0.3
        })

        return this.parseResponse(result.text)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt < maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000)
        }
      }
    }

    this.handleError(lastError, 'generateTitle')
  }

  async isHealthy(): Promise<boolean> {
    try {
      const model = this.config.baseURL
        ? createMistral({
            apiKey: this.config.apiKey,
            baseURL: this.config.baseURL
          })(this.config.model || 'mistral-large-latest')
        : mistral(this.config.model || 'mistral-large-latest')

      const result = await generateText({
        model,
        system: 'You are a test assistant. Reply with "OK".',
        prompt: 'test',
        maxTokens: 10
      })
      
      return result.text.toLowerCase().includes('ok')
    } catch {
      return false
    }
  }
}