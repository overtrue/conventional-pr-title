import { getBooleanInput, getInput } from '@actions/core'
import { ConfigManager, ConfigurationError } from '../../src/config'

// Mock @actions/core
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  getBooleanInput: jest.fn(),
  setFailed: jest.fn(),
  setOutput: jest.fn()
}))

// AI SDK v5 handles API keys automatically

const mockGetInput = getInput as jest.MockedFunction<typeof getInput>
const mockGetBooleanInput = getBooleanInput as jest.MockedFunction<typeof getBooleanInput>

describe('ConfigManager', () => {
  let configManager: ConfigManager

  beforeEach(() => {
    configManager = new ConfigManager()
    jest.clearAllMocks()

    // 设置默认输入
    mockGetInput.mockImplementation((name: string) => {
      const defaults: Record<string, string> = {
        'github-token': 'test-token',
        'model': 'openai',
        'mode': 'suggest',
        'allowed-types': 'feat,fix,docs',
        'max-length': '72',
        'min-description-length': '3'
      }
      return defaults[name] || ''
    })

    mockGetBooleanInput.mockImplementation((name: string) => {
      const defaults: Record<string, boolean> = {
        'require-scope': false,
        'include-scope': true,
        'skip-if-conventional': true,
        'debug': false,
        'match-language': true,
        'auto-comment': true
      }
      return defaults[name] || false
    })

    // AI SDK v5 handles API keys automatically
  })

  describe('parseConfig', () => {
    it('should parse valid configuration', () => {
      const config = configManager.parseConfig()

      expect(config.githubToken).toBe('test-token')
      expect(config.model).toBe('openai')
      expect(config.mode).toBe('suggest')
      expect(config.validationOptions.allowedTypes).toEqual(['feat', 'fix', 'docs'])
      expect(config.includeScope).toBe(true)
      expect(config.skipIfConventional).toBe(true)
    })

    it('should throw error for missing required fields', () => {
      mockGetInput.mockReturnValue('')

      expect(() => configManager.parseConfig()).toThrow(ConfigurationError)
    })

    it('should handle invalid mode gracefully', () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'mode') return 'invalid'
        if (name === 'github-token') return 'test-token'
        if (name === 'model') return 'openai'
        return ''
      })

      const config = configManager.parseConfig()
      expect(config.mode).toBe('suggest') // Should default to suggest
    })
  })

  describe('validation', () => {
    // API key validation is handled by AI SDK v5 automatically

    it('should validate allowed types', () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'allowed-types') return ''
        if (name === 'github-token') return 'test-token'
        if (name === 'model') return 'openai'
        return ''
      })

      const config = configManager.parseConfig()
      // Should use default types when empty
      expect(config.validationOptions.allowedTypes.length).toBeGreaterThan(0)
    })
  })

  describe('getConfig', () => {
    it('should throw error when config not initialized', () => {
      expect(() => configManager.getConfig()).toThrow(
        'Configuration not initialized. Call parseConfig() first.'
      )
    })

    it('should return config after initialization', () => {
      const config = configManager.parseConfig()
      const retrievedConfig = configManager.getConfig()

      expect(retrievedConfig).toBe(config)
    })
  })
})
