import { createDeepSeek } from '@ai-sdk/deepseek'
import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider.js'

/**
 * DeepSeek Provider implementation
 */
export class DeepSeekProvider implements AIProvider {
  readonly name = 'deepseek'
  readonly defaultModel = 'deepseek-chat'
  readonly description = 'DeepSeek models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {

      const config: any = {}
      if (options.apiKey || process.env.DEEPSEEK_API_KEY) {
        config.apiKey = options.apiKey || process.env.DEEPSEEK_API_KEY
      }
      if (options.baseURL || process.env.DEEPSEEK_BASE_URL) {
        config.baseURL = options.baseURL || process.env.DEEPSEEK_BASE_URL
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const deepseekProvider = createDeepSeek(config)
      return deepseekProvider(modelId)
    } catch (error) {
      throw new Error(`Failed to create DeepSeek model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'DEEPSEEK_API_KEY',
      baseURL: 'DEEPSEEK_BASE_URL'
    }
  }

}
