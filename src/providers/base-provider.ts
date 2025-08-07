import { LanguageModel } from 'ai'

/**
 * Base interface for all AI SDK providers
 */
export interface AIProvider {
  /**
   * Provider name (e.g., 'openai', 'anthropic')
   */
  readonly name: string

  /**
   * Default model for this provider
   */
  readonly defaultModel: string

  /**
   * Description of the provider
   */
  readonly description: string

  /**
   * Create a language model instance
   * @param modelId - The model identifier
   * @param options - Provider-specific options
   */
  createModel(modelId: string, options?: Record<string, any>): LanguageModel | Promise<LanguageModel>

  /**
   * Get environment variable names for this provider
   */
  getEnvVars(): { apiKey: string; baseURL: string }
}
