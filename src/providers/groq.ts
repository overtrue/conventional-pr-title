import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider'

/**
 * Groq Provider implementation
 */
export class GroqProvider implements AIProvider {
  readonly name = 'groq'
  readonly defaultModel = 'llama-3.1-8b-instant'
  readonly description = 'Groq models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const { createGroq } = await import('@ai-sdk/groq')

      const config: any = {}
      if (options.apiKey || process.env.GROQ_API_KEY) {
        config.apiKey = options.apiKey || process.env.GROQ_API_KEY
      }
      if (options.baseURL || process.env.GROQ_BASE_URL) {
        config.baseURL = options.baseURL || process.env.GROQ_BASE_URL
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const groqProvider = createGroq(config)
      return groqProvider(modelId)
    } catch (error) {
      throw new Error(`Failed to create Groq model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'GROQ_API_KEY',
      baseURL: 'GROQ_BASE_URL'
    }
  }

  isAvailable(): boolean {
    try {
      require.resolve('@ai-sdk/groq')
      return true
    } catch {
      return false
    }
  }
}
