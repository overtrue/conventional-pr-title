import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider'

/**
 * Azure OpenAI Provider implementation
 */
export class AzureProvider implements AIProvider {
  readonly name = 'azure'
  readonly defaultModel = 'gpt-4o-mini'
  readonly description = 'Azure OpenAI Service'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const { createAzure } = await import('@ai-sdk/azure')

      const config: any = {}
      if (options.apiKey || process.env.AZURE_API_KEY) {
        config.apiKey = options.apiKey || process.env.AZURE_API_KEY
      }
      if (options.baseURL || process.env.AZURE_BASE_URL) {
        config.baseURL = options.baseURL || process.env.AZURE_BASE_URL
      }
      if (options.resourceName || process.env.AZURE_RESOURCE_NAME) {
        config.resourceName = options.resourceName || process.env.AZURE_RESOURCE_NAME
      }
      if (options.deploymentName || process.env.AZURE_DEPLOYMENT_NAME) {
        config.deploymentName = options.deploymentName || process.env.AZURE_DEPLOYMENT_NAME
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
      apiKey: 'AZURE_API_KEY',
      baseURL: 'AZURE_BASE_URL'
    }
  }

  isAvailable(): boolean {
    try {
      require.resolve('@ai-sdk/azure')
      return true
    } catch {
      return false
    }
  }
}
