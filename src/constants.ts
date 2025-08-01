// Centralized constants for better maintainability
export const CONFIG_DEFAULTS = {
  AI_PROVIDER: 'openai' as const,
  MODE: 'suggest' as const,
  TEMPERATURE: 0.3,
  MAX_TOKENS: 500,
  MAX_LENGTH: 72,
  MIN_DESCRIPTION_LENGTH: 3,
  INCLUDE_SCOPE: false,
  SKIP_IF_CONVENTIONAL: false,
  MATCH_LANGUAGE: true,
  AUTO_COMMENT: false,
  DEBUG: false
} as const

export const PROCESSING_LIMITS = {
  MAX_CHANGED_FILES: 20,
  MAX_DIFF_FILES: 5,
  MAX_DIFF_SIZE: 3000,
  MAX_PR_BODY_SIZE: 1500,
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000
} as const

export const CONVENTIONAL_TYPES = [
  'feat',
  'fix', 
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert'
] as const

export const AI_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'mistral',
  'xai',
  'cohere',
  'azure',
  'claude-code'
] as const

export type ConventionalType = typeof CONVENTIONAL_TYPES[number]
export type AIProviderType = typeof AI_PROVIDERS[number]