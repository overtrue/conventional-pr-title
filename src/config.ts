import { getInput, getBooleanInput, setOutput, setFailed } from '@actions/core'
import { AIServiceConfig } from './ai-service'
import { ValidationOptions } from './conventional'
import supportedModels from './supported-models.json'

export type OperationMode = 'auto' | 'suggest'
export type ActionResult = 'updated' | 'commented' | 'skipped' | 'error'

export interface ModelInfo {
  id: string
  name: string
  description: string
  cost_per_1m_tokens: {
    input: number
    output: number
  }
  context_length: number
  max_output_tokens: number
  capabilities: {
    text: boolean
    image: boolean
    tools: boolean
    json_mode: boolean
  }
  supported: boolean
  recommended?: boolean
  default?: boolean
}

export interface ActionConfig {
  // GitHub Configuration
  githubToken: string

  // AI Service Configuration
  aiProvider: AIServiceConfig['provider']
  apiKey: string
  model?: string
  baseURL?: string
  temperature: number
  maxTokens: number

  // Operation Mode
  mode: OperationMode

  // Validation Rules
  validationOptions: ValidationOptions

  // Customization
  customPrompt?: string
  includeScope: boolean

  // Behavior Control
  skipIfConventional: boolean
  commentTemplate?: string
  debug: boolean
}

export interface ConfigError {
  field: string
  message: string
  suggestion?: string
}

export class ConfigurationError extends Error {
  public readonly errors: ConfigError[]

  constructor(errors: ConfigError[]) {
    const message = `Configuration errors:\n${errors.map(e => `- ${e.field}: ${e.message}`).join('\n')}`
    super(message)
    this.name = 'ConfigurationError'
    this.errors = errors
  }
}

export class ActionConfigManager {
  private config: ActionConfig | null = null
  private errors: ConfigError[] = []

  /**
   * Parse and validate configuration from GitHub Actions inputs
   */
  parseConfig(): ActionConfig {
    this.errors = []

    try {
      // GitHub Configuration
      const githubToken = this.getRequiredInput(
        'github-token',
        'GitHub token is required for API access'
      )

      // AI Service Configuration
      const aiProvider = this.parseAIProvider()
      const apiKey = this.getRequiredInput(
        'api-key',
        'API key is required for AI service'
      )
      const model = getInput('model') || undefined
      const baseURL = getInput('base-url') || undefined
      const temperature = this.parseNumber('temperature', 0.3, 0, 1)
      const maxTokens = this.parseNumber('max-tokens', 500, 1, 4000)

      // Operation Mode
      const mode = this.parseOperationMode()

      // Validation Rules
      const validationOptions = this.parseValidationOptions()

      // Customization
      const customPrompt = getInput('custom-prompt') || undefined
      const includeScope = getBooleanInput('include-scope')

      // Behavior Control
      const skipIfConventional = getBooleanInput('skip-if-conventional')
      const commentTemplate = getInput('comment-template') || undefined
      const debug = getBooleanInput('debug')

      // If there are validation errors, throw them
      if (this.errors.length > 0) {
        throw new ConfigurationError(this.errors)
      }

      this.config = {
        githubToken,
        aiProvider,
        apiKey,
        model,
        baseURL,
        temperature,
        maxTokens,
        mode,
        validationOptions,
        customPrompt,
        includeScope,
        skipIfConventional,
        commentTemplate,
        debug
      }

      return this.config
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error
      }
      throw new ConfigurationError([
        {
          field: 'general',
          message: `Failed to parse configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ])
    }
  }

  /**
   * Get the current configuration (must call parseConfig first)
   */
  getConfig(): ActionConfig {
    if (!this.config) {
      throw new Error(
        'Configuration not initialized. Call parseConfig() first.'
      )
    }
    return this.config
  }

  /**
   * Validate configuration and provide friendly error messages
   */
  validateConfig(config: ActionConfig): ConfigError[] {
    const errors: ConfigError[] = []

    // Validate AI provider and model compatibility
    const providerModels = this.getProviderDefaultModels()
    if (
      config.model &&
      !this.isModelCompatibleWithProvider(config.aiProvider, config.model)
    ) {
      errors.push({
        field: 'model',
        message: `Model '${config.model}' is not compatible with provider '${config.aiProvider}'`,
        suggestion: `Try using: ${providerModels[config.aiProvider]?.slice(0, 3).join(', ')}`
      })
    }

    // Validate baseURL format
    if (config.baseURL) {
      try {
        new URL(config.baseURL)
      } catch {
        errors.push({
          field: 'base-url',
          message: 'Base URL must be a valid HTTP/HTTPS URL',
          suggestion: 'Use format like: https://api.example.com/v1'
        })
      }
    }

    // Validate temperature range
    if (config.temperature < 0 || config.temperature > 1) {
      errors.push({
        field: 'temperature',
        message: 'Temperature must be between 0.0 and 1.0',
        suggestion:
          'Use 0.3 for balanced creativity, 0.1 for consistent results, 0.7 for more creative output'
      })
    }

    // Validate validation options
    if (
      config.validationOptions.maxLength &&
      config.validationOptions.maxLength < 10
    ) {
      errors.push({
        field: 'max-length',
        message: 'Maximum length should be at least 10 characters',
        suggestion: 'Use 50-100 characters for practical PR titles'
      })
    }

    if (
      config.validationOptions.allowedTypes &&
      config.validationOptions.allowedTypes.length === 0
    ) {
      errors.push({
        field: 'allowed-types',
        message: 'At least one commit type must be allowed',
        suggestion: 'Include common types like: feat, fix, docs, refactor'
      })
    }

    return errors
  }

  /**
   * Set GitHub Actions outputs based on results
   */
  setOutputs(result: {
    isConventional: boolean
    suggestedTitles: string[]
    originalTitle: string
    actionTaken: ActionResult
    errorMessage?: string
  }): void {
    setOutput('is-conventional', result.isConventional.toString())
    setOutput('suggested-titles', JSON.stringify(result.suggestedTitles))
    setOutput('original-title', result.originalTitle)
    setOutput('action-taken', result.actionTaken)

    if (result.errorMessage) {
      setOutput('error-message', result.errorMessage)
    }
  }

  /**
   * Handle configuration errors with friendly messages
   */
  handleConfigurationError(error: ConfigurationError): void {
    const friendlyMessage = this.formatConfigurationError(error)
    setFailed(friendlyMessage)
  }

  private getRequiredInput(name: string, errorMessage: string): string {
    const value = getInput(name)
    if (!value) {
      this.errors.push({
        field: name,
        message: errorMessage,
        suggestion: `Set the '${name}' input in your workflow file`
      })
      return ''
    }
    return value
  }

  private parseAIProvider(): AIServiceConfig['provider'] {
    const provider = getInput('ai-provider') || 'openai'
    const validProviders: AIServiceConfig['provider'][] = [
      'openai',
      'anthropic',
      'google',
      'mistral',
      'xai',
      'cohere',
      'azure'
    ]

    if (!validProviders.includes(provider as AIServiceConfig['provider'])) {
      this.errors.push({
        field: 'ai-provider',
        message: `Invalid AI provider: ${provider}`,
        suggestion: `Use one of: ${validProviders.join(', ')}`
      })
      return 'openai'
    }

    return provider as AIServiceConfig['provider']
  }

  private parseOperationMode(): OperationMode {
    const mode = getInput('mode') || 'suggest'

    if (mode !== 'auto' && mode !== 'suggest') {
      this.errors.push({
        field: 'mode',
        message: `Invalid operation mode: ${mode}`,
        suggestion:
          'Use "auto" to update titles automatically or "suggest" to add comments'
      })
      return 'suggest'
    }

    return mode
  }

  private parseNumber(
    inputName: string,
    defaultValue: number,
    min?: number,
    max?: number
  ): number {
    const input = getInput(inputName)
    if (!input) return defaultValue

    const value = parseFloat(input)
    if (isNaN(value)) {
      this.errors.push({
        field: inputName,
        message: `Invalid number: ${input}`,
        suggestion: `Use a numeric value${min !== undefined && max !== undefined ? ` between ${min} and ${max}` : ''}`
      })
      return defaultValue
    }

    if (min !== undefined && value < min) {
      this.errors.push({
        field: inputName,
        message: `Value ${value} is below minimum ${min}`,
        suggestion: `Use a value >= ${min}`
      })
      return defaultValue
    }

    if (max !== undefined && value > max) {
      this.errors.push({
        field: inputName,
        message: `Value ${value} is above maximum ${max}`,
        suggestion: `Use a value <= ${max}`
      })
      return defaultValue
    }

    return value
  }

  private parseValidationOptions(): ValidationOptions {
    const allowedTypesInput = getInput('allowed-types')
    const allowedTypes = allowedTypesInput
      ? allowedTypesInput
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0)
      : undefined

    return {
      allowedTypes,
      requireScope: getBooleanInput('require-scope'),
      maxLength: this.parseNumber('max-length', 72, 10, 200),
      minDescriptionLength: this.parseNumber('min-description-length', 3, 1, 50)
    }
  }

  private getProviderDefaultModels(): Record<
    AIServiceConfig['provider'],
    string[]
  > {
    const providerModels: Record<AIServiceConfig['provider'], string[]> = {
      openai: [],
      anthropic: [],
      google: [],
      mistral: [],
      xai: [],
      cohere: [],
      azure: [],
      vercel: [],
      deepseek: [],
      cerebras: [],
      groq: [],
      vertex: []
    }

    // Populate from the supportedModels JSON
    Object.entries(supportedModels).forEach(([provider, models]) => {
      if (provider === 'metadata') return

      const providerKey = provider as AIServiceConfig['provider']
      if (providerModels[providerKey]) {
        providerModels[providerKey] = Object.keys(
          models as Record<string, ModelInfo>
        ).filter(modelId => {
          const model = (models as Record<string, ModelInfo>)[modelId]
          return model.supported
        })
      }
    })

    return providerModels
  }

  private isModelCompatibleWithProvider(
    provider: AIServiceConfig['provider'],
    model: string
  ): boolean {
    // Check if model exists in the provider's supported models
    const providerModels = supportedModels[provider] as
      | Record<string, ModelInfo>
      | undefined
    if (
      providerModels &&
      providerModels[model] &&
      providerModels[model].supported
    ) {
      return true
    }

    // Fallback to pattern matching for custom models
    const patterns: Record<AIServiceConfig['provider'], RegExp[]> = {
      openai: [/^gpt-/, /^text-/, /^davinci-/, /^o1-/, /^o3-/, /^o4-/],
      anthropic: [/^claude-/],
      google: [/^gemini-/, /^palm-/],
      mistral: [/^mistral-/, /^codestral-/, /^pixtral-/],
      xai: [/^grok-/],
      cohere: [/^command-/, /^embed-/],
      azure: [/^gpt-/, /^text-/],
      vercel: [/^v0-/],
      deepseek: [/^deepseek-/],
      cerebras: [/^llama/, /^meta-/],
      groq: [/^llama/, /^mixtral/, /^gemma/, /^meta-/],
      vertex: [/^gemini-/, /^palm-/]
    }

    const providerPatterns = patterns[provider] || []
    return providerPatterns.some(pattern => pattern.test(model))
  }

  private formatConfigurationError(error: ConfigurationError): string {
    const lines = ['❌ Configuration Error', '']

    error.errors.forEach(configError => {
      lines.push(`🔸 **${configError.field}**: ${configError.message}`)
      if (configError.suggestion) {
        lines.push(`   💡 Suggestion: ${configError.suggestion}`)
      }
      lines.push('')
    })

    lines.push(
      '📚 For more information, visit: https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions'
    )

    return lines.join('\n')
  }
}

// Singleton instance for easy access
export const configManager = new ActionConfigManager()

// Utility functions for common operations
export function createAIServiceConfig(config: ActionConfig): AIServiceConfig {
  return {
    provider: config.aiProvider,
    apiKey: config.apiKey,
    model: config.model,
    baseURL: config.baseURL,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    debug: config.debug
  }
}

export function shouldSkipProcessing(
  config: ActionConfig,
  isConventional: boolean
): boolean {
  return config.skipIfConventional && isConventional
}

export function isAutoMode(config: ActionConfig): boolean {
  return config.mode === 'auto'
}

export function isSuggestionMode(config: ActionConfig): boolean {
  return config.mode === 'suggest'
}

// Model information utilities
export function getModelInfo(
  provider: AIServiceConfig['provider'],
  modelId: string
): ModelInfo | null {
  const providerModels = supportedModels[provider] as
    | Record<string, ModelInfo>
    | undefined
  return providerModels?.[modelId] || null
}

export function getProviderModels(
  provider: AIServiceConfig['provider']
): ModelInfo[] {
  const providerModels = supportedModels[provider] as
    | Record<string, ModelInfo>
    | undefined
  if (!providerModels) return []

  return Object.values(providerModels).filter(model => model.supported)
}

export function getRecommendedModels(
  provider: AIServiceConfig['provider']
): ModelInfo[] {
  return getProviderModels(provider).filter(model => model.recommended)
}

export function getDefaultModel(
  provider: AIServiceConfig['provider']
): ModelInfo | null {
  const models = getProviderModels(provider)
  return (
    models.find(model => model.default) ||
    models.find(model => model.recommended) ||
    models[0] ||
    null
  )
}

export function getAllSupportedProviders(): AIServiceConfig['provider'][] {
  return Object.keys(supportedModels).filter(
    key => key !== 'metadata'
  ) as AIServiceConfig['provider'][]
}

export function estimateTokenCost(
  provider: AIServiceConfig['provider'],
  modelId: string,
  inputTokens: number,
  outputTokens: number
): { input: number; output: number; total: number } | null {
  const modelInfo = getModelInfo(provider, modelId)
  if (!modelInfo) return null

  const inputCost =
    (inputTokens / 1_000_000) * modelInfo.cost_per_1m_tokens.input
  const outputCost =
    (outputTokens / 1_000_000) * modelInfo.cost_per_1m_tokens.output

  return {
    input: inputCost,
    output: outputCost,
    total: inputCost + outputCost
  }
}
