import { ConventionalCommit, ValidationOptions, ValidationResult } from './types'

// =============================================================================
// AI-related utility functions
// =============================================================================

// AI SDK v5 automatically retrieves API keys from environment variables

/**
 * Process template string replacement
 */
export function processTemplate(template: string, variables: Record<string, any>): string {
  let result = template

  // Handle simple variable replacement {{variable}}
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, String(value || ''))
  }

  // Handle conditional blocks {{#variable}}...{{/variable}}
  result = result.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (match, key, content) => {
    const value = variables[key]
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      if (Array.isArray(value)) {
        // Handle array loops {{#each array}}
        return content.replace(/{{#each\s+\w+}}([\s\S]*?){{\/each}}/g, (_: string, itemTemplate: string) => {
          return value.map(item =>
            itemTemplate.replace(/{{this}}/g, String(item))
          ).join('')
        })
      }
      return content
    }
    return ''
  })

  return result.trim()
}

// =============================================================================
// Conventional Commits utility functions
// =============================================================================

// Default allowed commit types
export const DEFAULT_TYPES = [
  'feat', 'fix', 'docs', 'style', 'refactor', 'perf',
  'test', 'build', 'ci', 'chore', 'revert'
]

// Default validation options
export const DEFAULT_OPTIONS: ValidationOptions = {
  allowedTypes: DEFAULT_TYPES,
  requireScope: false,
  maxLength: 72,
  minDescriptionLength: 3
}

/**
 * Parse conventional commit format message
 */
export function parseConventionalCommit(message: string): ConventionalCommit | null {
  const conventionalCommitRegex = /^([a-z0-9]+)(?:\(([^)]+)\))?(!)?: (.+)$/i
  const match = message.trim().match(conventionalCommitRegex)

  if (!match) {
    return null
  }

  const [, type, scope, breaking, description] = match

  return {
    type: type.toLowerCase(),
    scope: scope?.trim(),
    breaking: !!breaking,
    description: description.trim(),
    body: undefined,
    footer: undefined
  }
}

/**
 * Validate if PR title follows Conventional Commits standard
 */
export function validateTitle(
  title: string,
  options: ValidationOptions = DEFAULT_OPTIONS
): ValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const errors: string[] = []
  const suggestions: string[] = []

  // Basic validation
  if (!title || title.trim().length === 0) {
    errors.push('Title cannot be empty')
    return { isValid: false, errors, suggestions }
  }

  const trimmedTitle = title.trim()

  // Length validation
  if (trimmedTitle.length > opts.maxLength) {
    errors.push(`Title exceeds maximum length of ${opts.maxLength} characters`)
    suggestions.push(`Consider shortening the title to ${opts.maxLength} characters or less`)
  }

  // Parse conventional commit format
  const parsed = parseConventionalCommit(trimmedTitle)
  if (!parsed) {
    errors.push('Title does not follow conventional commit format')
    suggestions.push('Use format: type(scope): description')
    return { isValid: false, errors, suggestions }
  }

  // Check if type is allowed
  if (!opts.allowedTypes.includes(parsed.type)) {
    errors.push(`Type '${parsed.type}' is not allowed`)
    suggestions.push(`Use one of: ${opts.allowedTypes.join(', ')}`)
  }

  // Check if scope is required
  if (opts.requireScope && !parsed.scope) {
    errors.push('Scope is required')
    suggestions.push('Add a scope in parentheses after the type')
  }

  // Check description length
  if (parsed.description.length < opts.minDescriptionLength) {
    errors.push(`Description must be at least ${opts.minDescriptionLength} characters`)
    suggestions.push('Provide a more descriptive message')
  }

  // Check description format
  if (parsed.description.endsWith('.')) {
    errors.push('Description should not end with a period')
    suggestions.push('Remove the trailing period')
  }

  if (parsed.description[0] !== parsed.description[0].toLowerCase()) {
    errors.push('Description should start with lowercase')
    suggestions.push('Use lowercase for the first letter of description')
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions,
    parsed
  }
}

/**
 * Check if title already follows Conventional Commits format
 */
export function isConventionalTitle(
  title: string,
  options?: Partial<ValidationOptions>
): boolean {
  const result = validateTitle(title, { ...DEFAULT_OPTIONS, ...options })
  return result.isValid
}
