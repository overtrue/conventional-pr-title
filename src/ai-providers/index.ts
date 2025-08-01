/**
 * AI Providers - Central export point
 * Inspired by claude-task-master architecture
 * https://github.com/eyaltoledano/claude-task-master/tree/main/src/ai-providers
 */

// Base provider and types
export { BaseAIProvider } from './base-provider'
export type { AIProviderConfig } from './base-provider'

// Individual provider implementations
export { OpenAIProvider } from './openai'
export { AnthropicProvider } from './anthropic'
export { GoogleProvider } from './google'
export { MistralProvider } from './mistral'
export { XAIProvider } from './xai'
export { CohereProvider } from './cohere'
export { AzureProvider } from './azure'
export { ClaudeCodeProvider } from './claude-code'

// Custom SDK implementations
export * from './custom-sdk/claude-code'

// Factory and utilities
export { AIProviderFactory } from './factory'
export type { AIProviderType, ProviderInfo } from './factory'