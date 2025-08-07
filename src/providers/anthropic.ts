import { createAnthropic } from '@ai-sdk/anthropic'
import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider.js'

/**
 * Anthropic Provider implementation
 */
export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic'
  readonly defaultModel = 'claude-3-5-haiku-20241022'
  readonly description = 'Anthropic Claude models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const config: any = {}
      if (options.apiKey || process.env.ANTHROPIC_API_KEY) {
        config.apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY
      }
      if (options.baseURL || process.env.ANTHROPIC_BASE_URL) {
        config.baseURL = options.baseURL || process.env.ANTHROPIC_BASE_URL
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const anthropic = createAnthropic(config)
      return anthropic(modelId)
    } catch (error) {
      throw new Error(`Failed to create Anthropic model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'ANTHROPIC_API_KEY',
      baseURL: 'ANTHROPIC_BASE_URL'
    }
  }

}
