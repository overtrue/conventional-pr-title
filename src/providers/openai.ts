import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider'

/**
 * OpenAI Provider implementation
 */
export class OpenAIProvider implements AIProvider {
  readonly name = 'openai'
  readonly defaultModel = 'gpt-4o-mini'
  readonly description = 'OpenAI GPT models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const { createOpenAI } = await import('@ai-sdk/openai')

      const config: any = {}
      if (options.apiKey || process.env.OPENAI_API_KEY) {
        config.apiKey = options.apiKey || process.env.OPENAI_API_KEY
      }
      if (options.baseURL || process.env.OPENAI_BASE_URL) {
        config.baseURL = options.baseURL || process.env.OPENAI_BASE_URL
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const openai = createOpenAI(config)
      return openai(modelId)
    } catch (error) {
      throw new Error(`Failed to create OpenAI model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'OPENAI_API_KEY',
      baseURL: 'OPENAI_BASE_URL'
    }
  }

  isAvailable(): boolean {
    try {
      require.resolve('@ai-sdk/openai')
      return true
    } catch {
      return false
    }
  }
}
