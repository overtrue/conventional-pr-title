import { LanguageModel } from 'ai'
import { AIProvider } from './base-provider'

/**
 * Claude Code Provider implementation
 */
export class ClaudeCodeProvider implements AIProvider {
  readonly name = 'claude-code'
  readonly defaultModel = 'sonnet'
  readonly description = 'Claude Code SDK/CLI'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
      const { createClaudeCode } = await import('ai-sdk-provider-claude-code')

      const config: any = {}
      if (options.apiKey || process.env.CLAUDE_CODE_API_KEY) {
        config.apiKey = options.apiKey || process.env.CLAUDE_CODE_API_KEY
      }
      if (options.baseURL || process.env.CLAUDE_CODE_BASE_URL) {
        config.baseURL = options.baseURL || process.env.CLAUDE_CODE_BASE_URL
      }
      if (options.headers) {
        config.headers = options.headers
      }

      const claudeCodeProvider = createClaudeCode(config)
      return claudeCodeProvider(modelId)
    } catch (error) {
      throw new Error(`Failed to create Claude Code model: ${error}`)
    }
  }

  getEnvVars(): { apiKey: string; baseURL: string } {
    return {
      apiKey: 'CLAUDE_CODE_API_KEY',
      baseURL: 'CLAUDE_CODE_BASE_URL'
    }
  }

  isAvailable(): boolean {
    try {
      require.resolve('ai-sdk-provider-claude-code')
      return true
    } catch {
      return false
    }
  }
}
