import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider'

/**
 * Fireworks Provider implementation
 */
export class FireworksProvider implements AIProvider {
  readonly name = 'fireworks'
  readonly defaultModel = 'accounts/fireworks/models/llama-v2-7b-chat'
  readonly description = 'Fireworks AI models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const { createFireworks } = await import('@ai-sdk/fireworks')

      const config: any = {}
      if (options.apiKey || process.env.FIREWORKS_API_KEY) {
        config.apiKey = options.apiKey || process.env.FIREWORKS_API_KEY
      }
      if (options.baseURL || process.env.FIREWORKS_BASE_URL) {
        config.baseURL = options.baseURL || process.env.FIREWORKS_BASE_URL
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const fireworksProvider = createFireworks(config)
      return fireworksProvider(modelId)
    } catch (error) {
      throw new Error(`Failed to create Fireworks model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'FIREWORKS_API_KEY',
      baseURL: 'FIREWORKS_BASE_URL'
    }
  }

  isAvailable(): boolean {
    try {
      require.resolve('@ai-sdk/fireworks')
      return true
    } catch {
      return false
    }
  }
}
