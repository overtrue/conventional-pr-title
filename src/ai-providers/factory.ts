/**
 * AI Provider Factory
 * Factory pattern for creating AI provider instances
 * Inspired by claude-task-master architecture
 */

import { BaseAIProvider, AIProviderConfig } from './base-provider'
import { OpenAIProvider } from './openai'
import { AnthropicProvider } from './anthropic'
import { GoogleProvider } from './google'
import { MistralProvider } from './mistral'
import { XAIProvider } from './xai'
import { CohereProvider } from './cohere'
import { AzureProvider } from './azure'
import { ClaudeCodeProvider } from './claude-code'

export type AIProviderType = 
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'xai'
  | 'cohere'
  | 'azure'
  | 'claude-code'

export interface ProviderInfo {
  name: string
  className: string
  requiredApiKey: string
  defaultModel: string
  supportedModels: string[]
}

export class AIProviderFactory {
  private static providers = new Map<string, BaseAIProvider>()
  private static readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private static cacheTimestamps = new Map<string, number>()

  // Provider registry with metadata
  private static readonly providerRegistry: Record<AIProviderType, ProviderInfo> = {
    openai: {
      name: 'OpenAI',
      className: 'OpenAIProvider',
      requiredApiKey: 'OPENAI_API_KEY',
      defaultModel: 'gpt-4o-mini',
      supportedModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo']
    },
    anthropic: {
      name: 'Anthropic',
      className: 'AnthropicProvider',
      requiredApiKey: 'ANTHROPIC_API_KEY',
      defaultModel: 'claude-3-5-sonnet-20241022',
      supportedModels: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229']
    },
    google: {
      name: 'Google',
      className: 'GoogleProvider',
      requiredApiKey: 'GOOGLE_GENERATIVE_AI_API_KEY',
      defaultModel: 'gemini-1.5-flash',
      supportedModels: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro']
    },
    mistral: {
      name: 'Mistral',
      className: 'MistralProvider',
      requiredApiKey: 'MISTRAL_API_KEY',
      defaultModel: 'mistral-large-latest',
      supportedModels: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest']
    },
    xai: {
      name: 'XAI',
      className: 'XAIProvider',
      requiredApiKey: 'XAI_API_KEY',
      defaultModel: 'grok-beta',
      supportedModels: ['grok-beta', 'grok-vision-beta']
    },
    cohere: {
      name: 'Cohere',
      className: 'CohereProvider',
      requiredApiKey: 'COHERE_API_KEY',
      defaultModel: 'command-r-plus',
      supportedModels: ['command-r-plus', 'command-r', 'command-light']
    },
    azure: {
      name: 'Azure',
      className: 'AzureProvider',
      requiredApiKey: 'AZURE_API_KEY',
      defaultModel: 'gpt-4o-mini',
      supportedModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-35-turbo']
    },
    'claude-code': {
      name: 'Claude Code',
      className: 'ClaudeCodeProvider',
      requiredApiKey: 'CLAUDE_CODE_API_KEY',
      defaultModel: 'sonnet',
      supportedModels: ['sonnet', 'opus', 'claude-3-5-sonnet-20241022']
    }
  }

  /**
   * Create an AI provider instance
   */
  static create(provider: AIProviderType, config: AIProviderConfig): BaseAIProvider {
    const cacheKey = `${provider}-${config.model || 'default'}-${config.baseURL || 'default'}`
    
    if (this.providers.has(cacheKey)) {
      return this.providers.get(cacheKey)!
    }

    let providerInstance: BaseAIProvider

    switch (provider) {
      case 'openai':
        providerInstance = new OpenAIProvider(config)
        break
      case 'anthropic':
        providerInstance = new AnthropicProvider(config)
        break
      case 'google':
        providerInstance = new GoogleProvider(config)
        break
      case 'mistral':
        providerInstance = new MistralProvider(config)
        break
      case 'xai':
        providerInstance = new XAIProvider(config)
        break
      case 'cohere':
        providerInstance = new CohereProvider(config)
        break
      case 'azure':
        providerInstance = new AzureProvider(config)
        break
      case 'claude-code':
        providerInstance = new ClaudeCodeProvider(config)
        break
      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }

    this.providers.set(cacheKey, providerInstance)
    return providerInstance
  }

  /**
   * Get provider metadata
   */
  static getProviderInfo(provider: AIProviderType): ProviderInfo {
    if (!this.isProviderSupported(provider)) {
      throw new Error(`Unsupported provider: ${provider}`)
    }
    return this.providerRegistry[provider]
  }

  /**
   * Get all supported providers
   */
  static getSupportedProviders(): AIProviderType[] {
    return Object.keys(this.providerRegistry) as AIProviderType[]
  }

  /**
   * Get environment variable name for a provider
   */
  static getProviderEnvironmentKey(provider: AIProviderType): string {
    if (!this.isProviderSupported(provider)) {
      throw new Error(`Unsupported provider: ${provider}`)
    }
    return this.providerRegistry[provider].requiredApiKey
  }

  /**
   * Check if provider is supported
   */
  static isProviderSupported(provider: string): provider is AIProviderType {
    return provider in this.providerRegistry
  }

  /**
   * Get default model for a provider
   */
  static getDefaultModel(provider: AIProviderType): string {
    if (!this.isProviderSupported(provider)) {
      throw new Error(`Unsupported provider: ${provider}`)
    }
    return this.providerRegistry[provider].defaultModel
  }

  /**
   * Get supported models for a provider
   */
  static getSupportedModels(provider: AIProviderType): string[] {
    if (!this.isProviderSupported(provider)) {
      throw new Error(`Unsupported provider: ${provider}`)
    }
    return this.providerRegistry[provider].supportedModels
  }

  /**
   * Validate if a model is supported by a provider
   */
  static isModelSupported(provider: AIProviderType, model: string): boolean {
    if (!this.isProviderSupported(provider)) {
      return false
    }
    const supportedModels = this.getSupportedModels(provider)
    return supportedModels.includes(model)
  }

  /**
   * Health check for a specific provider
   */
  static async healthCheck(provider: AIProviderType, config: AIProviderConfig): Promise<boolean> {
    try {
      const providerInstance = this.create(provider, config)
      return await providerInstance.isHealthy()
    } catch {
      return false
    }
  }

  /**
   * Clear provider cache
   */
  static clearCache(): void {
    this.providers.clear()
  }

  /**
   * Get provider statistics
   */
  static getStats(): { totalProviders: number; cachedInstances: number; supportedProviders: string[] } {
    return {
      totalProviders: Object.keys(this.providerRegistry).length,
      cachedInstances: this.providers.size,
      supportedProviders: this.getSupportedProviders()
    }
  }
}