import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider.js'

/**
 * OpenRouter Provider implementation
 */
export class OpenRouterProvider implements AIProvider {
  readonly name = 'openrouter'
  readonly defaultModel = 'openai/gpt-4o'
  readonly description = 'OpenRouter models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {

      const config: any = {}
      if (options.apiKey || process.env.OPENROUTER_API_KEY) {
        config.apiKey = options.apiKey || process.env.OPENROUTER_API_KEY
      }
      if (options.baseURL || process.env.OPENROUTER_BASE_URL) {
        config.baseURL = options.baseURL || process.env.OPENROUTER_BASE_URL
      }
      if (options.headers) {
        config.headers = options.headers
      }
      if (options.extraBody) {
        config.extraBody = options.extraBody
      }

      // OpenRouter will validate API key during actual API calls

      const openrouterProvider = createOpenRouter(config)

      // Support both model-only and model-with-settings formats
      const model = openrouterProvider(modelId, options.modelSettings || {})

      if (!model) {
        throw new Error(`Failed to create OpenRouter model with ID: ${modelId}`)
      }

      return model
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Failed to create OpenRouter model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'OPENROUTER_API_KEY',
      baseURL: 'OPENROUTER_BASE_URL'
    }
  }

}
