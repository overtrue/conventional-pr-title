import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider'

/**
 * Cohere Provider implementation
 */
export class CohereProvider implements AIProvider {
  readonly name = 'cohere'
  readonly defaultModel = 'command-r-plus'
  readonly description = 'Cohere Command models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const { createCohere } = await import('@ai-sdk/cohere')

      const config: any = {}
      if (options.apiKey || process.env.COHERE_API_KEY) {
        config.apiKey = options.apiKey || process.env.COHERE_API_KEY
      }
      if (options.baseURL || process.env.COHERE_BASE_URL) {
        config.baseURL = options.baseURL || process.env.COHERE_BASE_URL
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const cohere = createCohere(config)
      return cohere(modelId)
    } catch (error) {
      throw new Error(`Failed to create Cohere model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'COHERE_API_KEY',
      baseURL: 'COHERE_BASE_URL'
    }
  }

  isAvailable(): boolean {
    try {
      require.resolve('@ai-sdk/cohere')
      return true
    } catch {
      return false
    }
  }
}
