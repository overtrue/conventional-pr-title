/**
 * TypeScript type definitions for Claude Code provider
 */

export interface ClaudeCodeSettings {
  pathToClaudeCodeExecutable?: string
  customSystemPrompt?: string
  appendSystemPrompt?: string
  maxTurns?: number
  maxThinkingTokens?: number
  cwd?: string
  executable?: 'bun' | 'deno' | 'node' | 'npx'
  executableArgs?: string[]
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan'
  permissionPromptToolName?: string
  continue?: boolean
  resume?: string
  allowedTools?: string[]
  disallowedTools?: string[]
  mcpServers?: Record<string, MCPServerConfig>
  verbose?: boolean
  env?: Record<string, string>
}

export interface MCPServerConfig {
  type?: 'stdio' | 'sse'
  command?: string
  args?: string[]
  env?: Record<string, string>
  url?: string
  headers?: Record<string, string>
}

export type ClaudeCodeModelId = 'opus' | 'sonnet' | string

export interface ClaudeCodeLanguageModelOptions {
  id: ClaudeCodeModelId
  settings?: ClaudeCodeSettings
}

export interface ClaudeCodeErrorMetadata {
  code?: string
  exitCode?: number
  stderr?: string
  promptExcerpt?: string
  isRetryable?: boolean
}

export interface ClaudeCodeProviderSettings {
  defaultSettings?: ClaudeCodeSettings
}

export interface ClaudeCodeProvider {
  (modelId: ClaudeCodeModelId, settings?: ClaudeCodeSettings): any
  languageModel: (modelId: ClaudeCodeModelId, settings?: ClaudeCodeSettings) => any
  chat: (modelId: ClaudeCodeModelId, settings?: ClaudeCodeSettings) => any
}

export interface ClaudeCodeExecutionResult {
  stdout: string
  stderr: string
  exitCode: number
}