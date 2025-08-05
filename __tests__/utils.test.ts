import { DEFAULT_TYPES, isConventionalTitle, parseConventionalCommit, validateTitle } from '../src/utils'

describe('parseConventionalCommit', () => {
  it('should parse basic conventional commit', () => {
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

  it('should parse commit with scope', () => {
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

  it('should parse breaking change commit', () => {
    const result = parseConventionalCommit('feat!: major API change')

    expect(result).toEqual({
      type: 'feat',
      scope: undefined,
      breaking: true,
      description: 'major API change',
      body: undefined,
      footer: undefined
    })
  })

  it('should return null for invalid format', () => {
    const result = parseConventionalCommit('invalid commit message')
    expect(result).toBeNull()
  })
})

describe('validateTitle', () => {
  it('should validate correct conventional commit', () => {
    const result = validateTitle('feat: add new feature')

    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.parsed).toBeDefined()
  })

  it('should reject empty title', () => {
    const result = validateTitle('')

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Title cannot be empty')
  })

  it('should reject non-conventional format', () => {
    const result = validateTitle('Add new feature')

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Title does not follow conventional commit format')
  })

  it('should reject invalid type', () => {
    const result = validateTitle('invalid: add feature')

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain("Type 'invalid' is not allowed")
  })

  it('should enforce maximum length', () => {
    const longTitle = 'feat: ' + 'a'.repeat(100)
    const result = validateTitle(longTitle, { allowedTypes: DEFAULT_TYPES, requireScope: false, maxLength: 50, minDescriptionLength: 3 })

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Title exceeds maximum length of 50 characters')
  })
})

describe('isConventionalTitle', () => {
  it('should return true for valid conventional titles', () => {
    expect(isConventionalTitle('feat: add new feature')).toBe(true)
    expect(isConventionalTitle('fix(auth): resolve issue')).toBe(true)
    expect(isConventionalTitle('docs: update readme')).toBe(true)
  })

  it('should return false for invalid titles', () => {
    expect(isConventionalTitle('Add new feature')).toBe(false)
    expect(isConventionalTitle('invalid: feature')).toBe(false)
    expect(isConventionalTitle('')).toBe(false)
  })
})
