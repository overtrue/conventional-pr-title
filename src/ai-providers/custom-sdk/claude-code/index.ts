/**
 * Claude Code provider factory and exports
 */

import { ClaudeCodeLanguageModel } from './language-model'
import { ClaudeCodeSettings, ClaudeCodeModelId, ClaudeCodeProvider, ClaudeCodeProviderSettings } from './types'
import { AIProviderConfig } from '../../base-provider'

/**
 * Create a Claude Code provider using the CLI interface
 */
export function createClaudeCode(options: ClaudeCodeProviderSettings = {}): ClaudeCodeProvider {
  /**
   * Create a language model instance
   */
  const createModel = (modelId: ClaudeCodeModelId, settings: ClaudeCodeSettings = {}) => {
    const config: AIProviderConfig & { settings?: ClaudeCodeSettings } = {
      apiKey: '', // Not required for Claude Code CLI
      model: modelId,
      settings: {
        ...options.defaultSettings,
        ...settings
      }
    }

    return new ClaudeCodeLanguageModel(config)
  }

  /**
   * Provider function
   */
  const provider = function (modelId: ClaudeCodeModelId, settings?: ClaudeCodeSettings) {
    if (new.target) {
      throw new Error('The Claude Code model function cannot be called with the new keyword.')
    }

    return createModel(modelId, settings)
  } as ClaudeCodeProvider

  provider.languageModel = createModel
  provider.chat = createModel

  return provider
}

// Export the default instance
export const claudeCode = createClaudeCode()

// Export everything
export { ClaudeCodeLanguageModel } from './language-model'
export * from './types'
export * from './errors'
export * from './json-extractor'
export * from './message-converter'

export default claudeCode