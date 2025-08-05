import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider'

/**
 * Perplexity Provider implementation
 */
export class PerplexityProvider implements AIProvider {
  readonly name = 'perplexity'
  readonly defaultModel = 'llama-3.1-sonar-small-128k-online'
  readonly description = 'Perplexity models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const { createPerplexity } = await import('@ai-sdk/perplexity')

      const config: any = {}
      if (options.apiKey || process.env.PERPLEXITY_API_KEY) {
        config.apiKey = options.apiKey || process.env.PERPLEXITY_API_KEY
      }
      if (options.baseURL || process.env.PERPLEXITY_BASE_URL) {
        config.baseURL = options.baseURL || process.env.PERPLEXITY_BASE_URL
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const perplexityProvider = createPerplexity(config)
      return perplexityProvider(modelId)
    } catch (error) {
      throw new Error(`Failed to create Perplexity model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'PERPLEXITY_API_KEY',
      baseURL: 'PERPLEXITY_BASE_URL'
    }
  }

  isAvailable(): boolean {
    try {
      require.resolve('@ai-sdk/perplexity')
      return true
    } catch {
      return false
    }
  }
}
