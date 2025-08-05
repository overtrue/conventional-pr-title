// Core type definitions

export type OperationMode = 'auto' | 'suggest'
export type ActionResult = 'updated' | 'commented' | 'skipped' | 'error'

// Configuration types
export interface ActionConfig {
  // GitHub configuration
  githubToken: string

  // AI configuration
  model: string

  // Operation mode
  mode: OperationMode

  // Validation rules
  validationOptions: ValidationOptions

  // Behavior control
  includeScope: boolean
  skipIfConventional: boolean
  debug: boolean
  matchLanguage: boolean
  autoComment: boolean

  // Custom options
  customPrompt?: string
  commentTemplate?: string
}

// Validation options
export interface ValidationOptions {
  allowedTypes: string[]
  requireScope: boolean
  maxLength: number
  minDescriptionLength: number
}

// PR context
export interface PRContext {
  number: number
  title: string
  body: string | null
  isDraft: boolean
  changedFiles: string[]
  diffContent: string
}

// AI-related types
export interface TitleGenerationRequest {
  originalTitle: string
  prDescription?: string
  prBody?: string
  diffContent?: string
  changedFiles?: string[]
  options?: {
    includeScope?: boolean
    preferredTypes?: string[]
    maxLength?: number
    matchLanguage?: boolean
  }
}

export interface TitleGenerationResponse {
  suggestions: string[]
  reasoning: string
  confidence: number
}

// Processing results
export interface ProcessingResult {
  isConventional: boolean
  suggestions: string[]
  reasoning: string
  actionTaken: ActionResult
  errorMessage?: string
}

// Validation results
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  suggestions: string[]
  parsed?: ConventionalCommit
}

export interface ConventionalCommit {
  type: string
  scope?: string
  breaking: boolean
  description: string
  body?: string
  footer?: string
}

// GitHub service configuration
export interface GitHubServiceConfig {
  token: string
  owner?: string
  repo?: string
}

// Error types
export interface ConfigError {
  field: string
  message: string
  suggestion?: string
}
