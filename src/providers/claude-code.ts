import { LanguageModel } from 'ai'
import { createClaudeCode } from 'ai-sdk-provider-claude-code'
import { AIProvider } from './base-provider.js'

/**
 * Claude Code Provider implementation
 */
export class ClaudeCodeProvider implements AIProvider {
  readonly name = 'claude-code'
  readonly defaultModel = 'sonnet'
  readonly description = 'Claude Code SDK/CLI'

  async createModel(modelId: string, options: Record<string, any> = {}): Promise<LanguageModel> {
    try {
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

      // Add Claude Code executable path configuration
      const defaultSettings: any = {}
      if (options.pathToClaudeCodeExecutable || process.env.CLAUDE_CODE_EXECUTABLE_PATH) {
        defaultSettings.pathToClaudeCodeExecutable = options.pathToClaudeCodeExecutable || process.env.CLAUDE_CODE_EXECUTABLE_PATH
      } else {
        // Try to find claude executable in common locations
        const possiblePaths = [
          '/usr/local/bin/claude',
          '/usr/bin/claude',
          '/opt/homebrew/bin/claude',
          process.env.HOME ? `${process.env.HOME}/.local/bin/claude` : null,
          process.env.HOME ? `${process.env.HOME}/bin/claude` : null
        ].filter(Boolean)

        for (const path of possiblePaths) {
          if (!path) continue
          try {
            const fs = await import('fs')
            if (fs.existsSync(path)) {
              defaultSettings.pathToClaudeCodeExecutable = path
              break
            }
          } catch {
            // Ignore fs import errors
          }
        }
      }

      if (Object.keys(defaultSettings).length > 0) {
        config.defaultSettings = defaultSettings
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

}
