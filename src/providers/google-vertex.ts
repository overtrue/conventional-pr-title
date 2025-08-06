import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider'

/**
 * Google Vertex AI Provider implementation
 */
export class GoogleVertexProvider implements AIProvider {
  readonly name = 'google-vertex'
  readonly defaultModel = 'gemini-1.5-flash'
  readonly description = 'Google Vertex AI models'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const { createVertex } = await import('@ai-sdk/google-vertex')

      const config: any = {}
      if (options.apiKey || process.env.GOOGLE_VERTEX_API_KEY) {
        config.apiKey = options.apiKey || process.env.GOOGLE_VERTEX_API_KEY
      }
      if (options.baseURL || process.env.GOOGLE_VERTEX_BASE_URL) {
        config.baseURL = options.baseURL || process.env.GOOGLE_VERTEX_BASE_URL
      }
      if (options.projectId || process.env.GOOGLE_VERTEX_PROJECT_ID) {
        config.projectId = options.projectId || process.env.GOOGLE_VERTEX_PROJECT_ID
      }
      if (options.location || process.env.GOOGLE_VERTEX_LOCATION) {
        config.location = options.location || process.env.GOOGLE_VERTEX_LOCATION
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const vertex = createVertex(config)
      return vertex(modelId)
    } catch (error) {
      throw new Error(`Failed to create Google Vertex model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'GOOGLE_VERTEX_API_KEY',
      baseURL: 'GOOGLE_VERTEX_BASE_URL'
    }
  }

  isAvailable(): boolean {
    try {
      require.resolve('@ai-sdk/google-vertex')
      return true
    } catch {
      return false
    }
  }
}
