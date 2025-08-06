import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider'

/**
 * xAI Grok Provider implementation
 */
export class XAIProvider implements AIProvider {
  readonly name = 'xai'
  readonly defaultModel = 'grok-beta'
  readonly description = 'xAI Grok models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const { createXai } = await import('@ai-sdk/xai')

      const config: any = {}
      if (options.apiKey || process.env.XAI_API_KEY) {
        config.apiKey = options.apiKey || process.env.XAI_API_KEY
      }
      if (options.baseURL || process.env.XAI_BASE_URL) {
        config.baseURL = options.baseURL || process.env.XAI_BASE_URL
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const xaiProvider = createXai(config)
      return xaiProvider(modelId)
    } catch (error) {
      throw new Error(`Failed to create xAI model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'XAI_API_KEY',
      baseURL: 'XAI_BASE_URL'
    }
  }

  isAvailable(): boolean {
    try {
      require.resolve('@ai-sdk/xai')
      return true
    } catch {
      return false
    }
  }
}
