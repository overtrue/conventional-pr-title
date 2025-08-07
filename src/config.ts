import { getBooleanInput, getInput, setFailed, setOutput } from '@actions/core'
import { ActionConfig, ConfigError, ValidationOptions } from './types.js'
import { DEFAULT_OPTIONS } from './utils.js'

export class ConfigurationError extends Error {
  public readonly errors: ConfigError[]

  constructor(errors: ConfigError[]) {
    const message = `Configuration errors:\n${errors.map(e => `- ${e.field}: ${e.message}`).join('\n')}`
    super(message)
    this.name = 'ConfigurationError'
    this.errors = errors
  }
}

export class ConfigManager {
  private config: ActionConfig | null = null

  /**
   * Parse GitHub Actions input parameters
   */
  parseConfig(): ActionConfig {
    const errors: ConfigError[] = []

    // Required parameters
    const githubToken = this.getRequiredInput('github-token', errors)
    const model = this.getRequiredInput('model', errors)

    // Operation mode
    const mode = this.parseMode()

    // Validation options
    const validationOptions = this.parseValidationOptions()

    // Behavior control
    const includeScope = getBooleanInput('include-scope')
    const skipIfConventional = getBooleanInput('skip-if-conventional')
    const debug = getBooleanInput('debug')
    const matchLanguage = getBooleanInput('match-language')
    const autoComment = getBooleanInput('auto-comment')

    // Custom options
    const customPrompt = getInput('custom-prompt') || undefined
    const commentTemplate = getInput('comment-template') || undefined

    this.config = {
      githubToken,
      model,
      mode,
      validationOptions,
      includeScope,
      skipIfConventional,
      debug,
      matchLanguage,
      autoComment,
      customPrompt,
      commentTemplate
    }

    // Validate configuration
    this.validateConfig(errors)

    if (errors.length > 0) {
      throw new ConfigurationError(errors)
    }

    return this.config
  }

  /**
   * Get configuration
   */
  getConfig(): ActionConfig {
    if (!this.config) {
      throw new Error('Configuration not initialized. Call parseConfig() first.')
    }
    return this.config
  }

  /**
   * Set GitHub Actions outputs
   */
  setOutputs(result: {
    isConventional: boolean
    suggestedTitles: string[]
    originalTitle: string
    actionTaken: string
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
   * Handle configuration errors
   */
  handleConfigurationError(error: ConfigurationError): void {
    const message = this.formatError(error)
    setFailed(message)
  }

  private getRequiredInput(name: string, errors: ConfigError[]): string {
    const value = getInput(name)
    if (!value) {
      errors.push({
        field: name,
        message: `${name} is required`
      })
    }
    return value
  }

  private parseMode(): 'auto' | 'suggest' {
    const mode = getInput('mode') || 'suggest'
    if (mode !== 'auto' && mode !== 'suggest') {
      return 'suggest'
    }
    return mode
  }

  private parseValidationOptions(): ValidationOptions {
    const allowedTypesInput = getInput('allowed-types')
    const allowedTypes = allowedTypesInput
      ? allowedTypesInput.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : DEFAULT_OPTIONS.allowedTypes

    return {
      allowedTypes,
      requireScope: getBooleanInput('require-scope'),
      maxLength: this.parseNumber('max-length', DEFAULT_OPTIONS.maxLength),
      minDescriptionLength: this.parseNumber('min-description-length', DEFAULT_OPTIONS.minDescriptionLength)
    }
  }

  private parseNumber(inputName: string, defaultValue: number): number {
    const input = getInput(inputName)
    if (!input) return defaultValue

    const value = parseFloat(input)
    return isNaN(value) ? defaultValue : value
  }

  private validateConfig(errors: ConfigError[]): void {
    if (!this.config) return

    // AI SDK v5 automatically validates API keys, no manual check needed

    // Validate allowed types
    if (this.config.validationOptions.allowedTypes.length === 0) {
      errors.push({
        field: 'allowed-types',
        message: 'At least one commit type must be allowed'
      })
    }

    // Validate length limits
    if (this.config.validationOptions.maxLength < 10) {
      errors.push({
        field: 'max-length',
        message: 'Maximum length should be at least 10 characters'
      })
    }
  }

  private formatError(error: ConfigurationError): string {
    const suggestions = error.errors
      .filter(e => e.suggestion)
      .map(e => `- ${e.field}: ${e.suggestion}`)
      .join('\n')

    let message = `Configuration errors:\n${error.errors.map(e => `- ${e.field}: ${e.message}`).join('\n')}`

    if (suggestions) {
      message += `\n\nSuggestions:\n${suggestions}`
    }

    return message
  }
}
