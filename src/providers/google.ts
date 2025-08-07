import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider.js'

/**
 * Google Provider implementation
 */
export class GoogleProvider implements AIProvider {
  readonly name = 'google'
  readonly defaultModel = 'gemini-1.5-flash'
  readonly description = 'Google Gemini models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const config: any = {}
      if (options.apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        config.apiKey = options.apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY
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
      baseURL: 'GOOGLE_GENERATIVE_AI_BASE_URL'
    }
  }

}
