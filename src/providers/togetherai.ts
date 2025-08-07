import { createTogetherAI } from '@ai-sdk/togetherai'
import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider.js'

/**
 * TogetherAI Provider implementation
 */
export class TogetherAIProvider implements AIProvider {
  readonly name = 'togetherai'
  readonly defaultModel = 'meta-llama/Llama-3-8b-chat-hf'
  readonly description = 'TogetherAI models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const config: any = {}
      if (options.apiKey || process.env.TOGETHERAI_API_KEY) {
        config.apiKey = options.apiKey || process.env.TOGETHERAI_API_KEY
      }
      if (options.baseURL || process.env.TOGETHERAI_BASE_URL) {
        config.baseURL = options.baseURL || process.env.TOGETHERAI_BASE_URL
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const togetherProvider = createTogetherAI(config)
      return togetherProvider(modelId)
    } catch (error) {
      throw new Error(`Failed to create TogetherAI model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'TOGETHERAI_API_KEY',
      baseURL: 'TOGETHERAI_BASE_URL'
    }
  }
}
