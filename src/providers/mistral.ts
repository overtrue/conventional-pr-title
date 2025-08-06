import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider'

/**
 * Mistral Provider implementation
 */
export class MistralProvider implements AIProvider {
  readonly name = 'mistral'
  readonly defaultModel = 'mistral-small-latest'
  readonly description = 'Mistral AI models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const { createMistral } = await import('@ai-sdk/mistral')

      const config: any = {}
      if (options.apiKey || process.env.MISTRAL_API_KEY) {
        config.apiKey = options.apiKey || process.env.MISTRAL_API_KEY
      }
      if (options.baseURL || process.env.MISTRAL_BASE_URL) {
        config.baseURL = options.baseURL || process.env.MISTRAL_BASE_URL
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const mistral = createMistral(config)
      return mistral(modelId)
    } catch (error) {
      throw new Error(`Failed to create Mistral model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'MISTRAL_API_KEY',
      baseURL: 'MISTRAL_BASE_URL'
    }
  }

  isAvailable(): boolean {
    try {
      require.resolve('@ai-sdk/mistral')
      return true
    } catch {
      return false
    }
  }
}
