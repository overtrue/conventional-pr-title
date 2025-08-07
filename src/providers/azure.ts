import { createAzure } from '@ai-sdk/azure'
import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider.js'

/**
 * Azure OpenAI Provider implementation
 */
export class AzureProvider implements AIProvider {
  readonly name = 'azure'
  readonly defaultModel = 'gpt-4o-mini'
  readonly description = 'Azure OpenAI models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const config: any = {}
      if (options.apiKey || process.env.AZURE_OPENAI_API_KEY) {
        config.apiKey = options.apiKey || process.env.AZURE_OPENAI_API_KEY
      }
      if (options.baseURL || process.env.AZURE_OPENAI_ENDPOINT) {
        config.baseURL = options.baseURL || process.env.AZURE_OPENAI_ENDPOINT
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const azure = createAzure(config)
      return azure(modelId)
    } catch (error) {
      throw new Error(`Failed to create Azure model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'AZURE_OPENAI_API_KEY',
      baseURL: 'AZURE_OPENAI_ENDPOINT'
    }
  }
}
