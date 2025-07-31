import {
  parseConventionalCommit,
  validateTitle,
  generateSuggestions,
  isConventionalTitle,
  DEFAULT_TYPES,
  DEFAULT_OPTIONS,
  ValidationOptions
} from '../src/conventional'

describe('parseConventionalCommit', () => {
  test('should parse basic conventional commit', () => {
    const result = parseConventionalCommit('feat: add new feature')
    expect(result).toEqual({
      type: 'feat',
      scope: undefined,
      breaking: false,
      description: 'add new feature',
      body: undefined,
      footer: undefined
    })
  })

  test('should parse commit with scope', () => {
    const result = parseConventionalCommit('fix(auth): resolve login issue')
    expect(result).toEqual({
      type: 'fix',
      scope: 'auth',
      breaking: false,
      description: 'resolve login issue',
      body: undefined,
      footer: undefined
    })
  })

  test('should parse breaking change commit', () => {
    const result = parseConventionalCommit('feat!: breaking API change')
    expect(result).toEqual({
      type: 'feat',
      scope: undefined,
      breaking: true,
      description: 'breaking API change',
      body: undefined,
      footer: undefined
    })
  })

  test('should parse breaking change with scope', () => {
    const result = parseConventionalCommit('feat(api)!: breaking API change')
    expect(result).toEqual({
      type: 'feat',
      scope: 'api',
      breaking: true,
      description: 'breaking API change',
      body: undefined,
      footer: undefined
    })
  })

  test('should handle case insensitive types', () => {
    const result = parseConventionalCommit('FEAT: add feature')
    expect(result?.type).toBe('feat')
  })

  test('should return null for invalid format', () => {
    expect(parseConventionalCommit('invalid commit message')).toBeNull()
    expect(parseConventionalCommit('feat add feature')).toBeNull()
    expect(parseConventionalCommit('feat:')).toBeNull()
    expect(parseConventionalCommit('')).toBeNull()
  })

  test('should handle whitespace', () => {
    const result = parseConventionalCommit('  feat:   add feature  ')
    expect(result).toEqual({
      type: 'feat',
      scope: undefined,
      breaking: false,
      description: 'add feature',
      body: undefined,
      footer: undefined
    })
  })
})

describe('validateTitle', () => {
  test('should validate correct conventional commit', () => {
    const result = validateTitle('feat: add new feature')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.parsed).toBeDefined()
  })

  test('should validate commit with scope', () => {
    const result = validateTitle('fix(auth): resolve login issue')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('should reject empty title', () => {
    const result = validateTitle('')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Title cannot be empty')
  })

  test('should reject non-conventional format', () => {
    const result = validateTitle('Fix login bug')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Title does not follow Conventional Commits format')
    expect(result.suggestions).toContain('Use format: type(scope): description')
  })

  test('should reject invalid type', () => {
    const result = validateTitle('invalid: some description')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Invalid commit type: invalid')
  })

  test('should enforce maximum length', () => {
    const longTitle = 'feat: ' + 'a'.repeat(100)
    const result = validateTitle(longTitle, { maxLength: 50 })
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Title exceeds maximum length of 50 characters')
  })

  test('should require scope when configured', () => {
    const result = validateTitle('feat: add feature', { requireScope: true })
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Scope is required but missing')
  })

  test('should enforce minimum description length', () => {
    const result = validateTitle('feat: ab', { minDescriptionLength: 5 })
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Description is too short (minimum 5 characters)')
  })

  test('should reject description ending with period', () => {
    const result = validateTitle('feat: add new feature.')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Description should not end with a period')
  })

  test('should reject description starting with uppercase', () => {
    const result = validateTitle('feat: Add new feature')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Description should start with a lowercase letter')
  })

  test('should validate all default types', () => {
    DEFAULT_TYPES.forEach(type => {
      const result = validateTitle(`${type}: test description`)
      expect(result.isValid).toBe(true)
    })
  })

  test('should validate custom allowed types', () => {
    const customOptions: ValidationOptions = {
      allowedTypes: ['custom', 'special']
    }
    
    const result1 = validateTitle('custom: test', customOptions)
    expect(result1.isValid).toBe(true)
    
    const result2 = validateTitle('feat: test', customOptions)
    expect(result2.isValid).toBe(false)
    expect(result2.errors).toContain('Invalid commit type: feat')
  })
})

describe('generateSuggestions', () => {
  test('should suggest fix for bug-related titles', () => {
    const suggestions = generateSuggestions('Fix login bug')
    expect(suggestions).toContain('Consider using "fix:" prefix for bug fixes')
  })

  test('should suggest feat for feature-related titles', () => {
    const suggestions = generateSuggestions('Add new authentication')
    expect(suggestions).toContain('Consider using "feat:" prefix for new features')
  })

  test('should suggest refactor for improvement titles', () => {
    const suggestions = generateSuggestions('Improve performance')
    expect(suggestions).toContain('Consider using "feat:" for enhancements or "refactor:" for code improvements')
  })

  test('should suggest test for test-related titles', () => {
    const suggestions = generateSuggestions('Add unit tests')
    expect(suggestions).toContain('Consider using "test:" prefix for test-related changes')
  })

  test('should suggest docs for documentation titles', () => {
    const suggestions = generateSuggestions('Update README')
    expect(suggestions).toContain('Consider using "docs:" prefix for documentation changes')
  })

  test('should suggest length reduction for long titles', () => {
    const longTitle = 'This is a very long title that exceeds the maximum length'
    const suggestions = generateSuggestions(longTitle, { maxLength: 50 })
    expect(suggestions).toContain('Shorten title to 50 characters or less')
  })

  test('should handle empty title', () => {
    const suggestions = generateSuggestions('')
    expect(suggestions).toContain('Please provide a meaningful title')
  })
})

describe('isConventionalTitle', () => {
  test('should return true for valid conventional titles', () => {
    expect(isConventionalTitle('feat: add new feature')).toBe(true)
    expect(isConventionalTitle('fix(auth): resolve issue')).toBe(true)
    expect(isConventionalTitle('docs: update readme')).toBe(true)
  })

  test('should return false for invalid titles', () => {
    expect(isConventionalTitle('Fix bug')).toBe(false)
    expect(isConventionalTitle('Add feature')).toBe(false)
    expect(isConventionalTitle('')).toBe(false)
    expect(isConventionalTitle('feat: Add Feature.')).toBe(false)
  })

  test('should respect custom options', () => {
    const options: ValidationOptions = {
      allowedTypes: ['custom'],
      requireScope: true
    }
    
    expect(isConventionalTitle('custom(scope): description', options)).toBe(true)
    expect(isConventionalTitle('feat: description', options)).toBe(false)
    expect(isConventionalTitle('custom: description', options)).toBe(false)
  })
})

describe('edge cases', () => {
  test('should handle special characters in scope', () => {
    const result = parseConventionalCommit('feat(api-v2): add endpoint')
    expect(result?.scope).toBe('api-v2')
  })

  test('should handle numbers in type and scope', () => {
    const result = parseConventionalCommit('v2feat(api1): add endpoint')
    expect(result?.type).toBe('v2feat')
    expect(result?.scope).toBe('api1')
  })

  test('should handle very long descriptions', () => {
    const longDesc = 'a'.repeat(1000)
    const result = parseConventionalCommit(`feat: ${longDesc}`)
    expect(result?.description).toBe(longDesc)
  })

  test('should validate with all options disabled', () => {
    const options: ValidationOptions = {
      allowedTypes: undefined,
      requireScope: false,
      maxLength: undefined,
      minDescriptionLength: undefined
    }
    
    const result = validateTitle('randomtype: any description', options)
    expect(result.isValid).toBe(true)
  })
})