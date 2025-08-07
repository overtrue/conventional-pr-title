import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock'
import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider.js'

/**
 * Amazon Bedrock Provider implementation
 */
export class AmazonBedrockProvider implements AIProvider {
  readonly name = 'amazon-bedrock'
  readonly defaultModel = 'anthropic.claude-3-haiku-20240307-v1:0'
  readonly description = 'Amazon Bedrock models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const config: any = {}
      if (options.apiKey || process.env.AMAZON_BEDROCK_API_KEY) {
        config.apiKey = options.apiKey || process.env.AMAZON_BEDROCK_API_KEY
      }
      if (options.baseURL || process.env.AMAZON_BEDROCK_BASE_URL) {
        config.baseURL = options.baseURL || process.env.AMAZON_BEDROCK_BASE_URL
      }
      if (options.region || process.env.AWS_REGION) {
        config.region = options.region || process.env.AWS_REGION
      }
      if (options.accessKeyId || process.env.AWS_ACCESS_KEY_ID) {
        config.accessKeyId = options.accessKeyId || process.env.AWS_ACCESS_KEY_ID
      }
      if (options.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY) {
        config.secretAccessKey = options.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const bedrockProvider = createAmazonBedrock(config)
      return bedrockProvider(modelId)
    } catch (error) {
      throw new Error(`Failed to create Amazon Bedrock model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'AMAZON_BEDROCK_API_KEY',
      baseURL: 'AMAZON_BEDROCK_BASE_URL'
    }
  }

}
