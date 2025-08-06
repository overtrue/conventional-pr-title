import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider'

/**
 * Google Generative AI Provider implementation
 */
export class GoogleProvider implements AIProvider {
  readonly name = 'google'
  readonly defaultModel = 'gemini-1.5-flash'
  readonly description = 'Google Generative AI models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const { createGoogleGenerativeAI } = await import('@ai-sdk/google')

      const config: any = {}
      if (options.apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        config.apiKey = options.apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY
      }
      if (options.baseURL || process.env.GOOGLE_BASE_URL) {
        config.baseURL = options.baseURL || process.env.GOOGLE_BASE_URL
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const google = createGoogleGenerativeAI(config)
      return google(modelId)
    } catch (error) {
      throw new Error(`Failed to create Google model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'GOOGLE_GENERATIVE_AI_API_KEY',
      baseURL: 'GOOGLE_BASE_URL'
    }
  }

  isAvailable(): boolean {
    try {
      require.resolve('@ai-sdk/google')
      return true
    } catch {
      return false
    }
  }
}
