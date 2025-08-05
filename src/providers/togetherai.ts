import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider'

/**
 * Together.ai Provider implementation
 */
export class TogetherAIProvider implements AIProvider {
  readonly name = 'togetherai'
  readonly defaultModel = 'meta-llama/Llama-2-7b-chat-hf'
  readonly description = 'Together.ai models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const { createTogetherAI } = await import('@ai-sdk/togetherai')

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
      throw new Error(`Failed to create Together.ai model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'TOGETHERAI_API_KEY',
      baseURL: 'TOGETHERAI_BASE_URL'
    }
  }

  isAvailable(): boolean {
    try {
      require.resolve('@ai-sdk/togetherai')
      return true
    } catch {
      return false
    }
  }
}
