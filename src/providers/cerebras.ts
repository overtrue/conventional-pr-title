import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider'

/**
 * Cerebras Provider implementation
 */
export class CerebrasProvider implements AIProvider {
  readonly name = 'cerebras'
  readonly defaultModel = 'llama3.1-8b'
  readonly description = 'Cerebras models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const { createCerebras } = await import('@ai-sdk/cerebras')

      const config: any = {}
      if (options.apiKey || process.env.CEREBRAS_API_KEY) {
        config.apiKey = options.apiKey || process.env.CEREBRAS_API_KEY
      }
      if (options.baseURL || process.env.CEREBRAS_BASE_URL) {
        config.baseURL = options.baseURL || process.env.CEREBRAS_BASE_URL
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const cerebrasProvider = createCerebras(config)
      return cerebrasProvider(modelId)
    } catch (error) {
      throw new Error(`Failed to create Cerebras model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'CEREBRAS_API_KEY',
      baseURL: 'CEREBRAS_BASE_URL'
    }
  }

  isAvailable(): boolean {
    try {
      require.resolve('@ai-sdk/cerebras')
      return true
    } catch {
      return false
    }
  }
}
