import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider'

/**
 * DeepInfra Provider implementation
 */
export class DeepInfraProvider implements AIProvider {
  readonly name = 'deepinfra'
  readonly defaultModel = 'meta-llama/Llama-2-7b-chat-hf'
  readonly description = 'DeepInfra models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const { createDeepInfra } = await import('@ai-sdk/deepinfra')

      const config: any = {}
      if (options.apiKey || process.env.DEEPINFRA_API_KEY) {
        config.apiKey = options.apiKey || process.env.DEEPINFRA_API_KEY
      }
      if (options.baseURL || process.env.DEEPINFRA_BASE_URL) {
        config.baseURL = options.baseURL || process.env.DEEPINFRA_BASE_URL
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const deepinfraProvider = createDeepInfra(config)
      return deepinfraProvider(modelId)
    } catch (error) {
      throw new Error(`Failed to create DeepInfra model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'DEEPINFRA_API_KEY',
      baseURL: 'DEEPINFRA_BASE_URL'
    }
  }

  isAvailable(): boolean {
    try {
      require.resolve('@ai-sdk/deepinfra')
      return true
    } catch {
      return false
    }
  }
}
