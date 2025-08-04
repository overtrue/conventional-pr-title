/**
 * Modern AI Service using the new provider architecture
 * This replaces the old VercelAIService with a more extensible design
 */

import { AIService, AIServiceConfig, TitleGenerationRequest, TitleGenerationResponse } from './shared/types'
import { AIProviderFactory, AIProviderType } from './ai-providers'

export class ModernAIService implements AIService {
  private config: AIServiceConfig

  constructor(config: AIServiceConfig) {
    this.config = {
      maxTokens: 500,
      temperature: 0.3,
      maxRetries: 3,
      debug: false,
      ...config
    }

    // Validate provider
    if (!AIProviderFactory.isProviderSupported(this.config.provider)) {
      throw new Error(`Unsupported AI provider: ${this.config.provider}`)
    }

    // Set default model if not provided
    if (!this.config.model) {
      this.config.model = AIProviderFactory.getDefaultModel(this.config.provider)
    }
  }

  async generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse> {
    let provider = AIProviderFactory.create(this.config.provider, {
      apiKey: this.config.apiKey!,
      baseURL: this.config.baseURL,
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature
    })

    // If using Claude Code, check if it's healthy first
    if (this.config.provider === 'claude-code') {
      const isHealthy = await provider.isHealthy()
      if (!isHealthy) {
        if (this.config.debug) {
          console.warn('Claude Code provider is not healthy, falling back to Anthropic')
        }
        
        // Fallback to Anthropic with same API key
        provider = AIProviderFactory.create('anthropic', {
          apiKey: this.config.apiKey!,
          baseURL: this.config.baseURL,
          model: this.config.model === 'sonnet' ? 'claude-3-5-sonnet-20241022' : this.config.model,
          maxTokens: this.config.maxTokens,
          temperature: this.config.temperature
        })
      }
    }

    return provider.generateTitle(request)
  }

  async isHealthy(): Promise<boolean> {
    try {
      const provider = AIProviderFactory.create(this.config.provider, {
        apiKey: this.config.apiKey!,
        baseURL: this.config.baseURL,
        model: this.config.model,
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature
      })

      return provider.isHealthy()
    } catch {
      return false
    }
  }

  getProviderInfo() {
    return AIProviderFactory.getProviderInfo(this.config.provider)
  }

  getSupportedModels(): string[] {
    return AIProviderFactory.getSupportedModels(this.config.provider)
  }

  isModelSupported(model: string): boolean {
    return AIProviderFactory.isModelSupported(this.config.provider, model)
  }

  static getSupportedProviders(): AIProviderType[] {
    return AIProviderFactory.getSupportedProviders()
  }

  static getProviderEnvironmentKey(provider: AIProviderType): string {
    return AIProviderFactory.getProviderEnvironmentKey(provider)
  }
}