import { ActionConfigManager, ConfigurationError, createAIServiceConfig, shouldSkipProcessing, isAutoMode, isSuggestionMode, getModelInfo, getProviderModels, getRecommendedModels, getDefaultModel, getAllSupportedProviders, estimateTokenCost } from '../src/config'

// Mock @actions/core
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  getBooleanInput: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn()
}))

import { getInput, getBooleanInput, setOutput, setFailed } from '@actions/core'

const mockGetInput = getInput as jest.MockedFunction<typeof getInput>
const mockGetBooleanInput = getBooleanInput as jest.MockedFunction<typeof getBooleanInput>
const mockSetOutput = setOutput as jest.MockedFunction<typeof setOutput>
const mockSetFailed = setFailed as jest.MockedFunction<typeof setFailed>

describe('ActionConfigManager', () => {
  let configManager: ActionConfigManager

  beforeEach(() => {
    jest.clearAllMocks()
    configManager = new ActionConfigManager()
  })

  describe('parseConfig', () => {
    beforeEach(() => {
      // Set up default valid inputs
      mockGetInput.mockImplementation((name: string) => {
        const defaults: Record<string, string> = {
          'github-token': 'test-token',
          'ai-provider': 'openai',
          'api-key': 'test-api-key',
          'model': 'gpt-4o-mini',
          'temperature': '0.3',
          'max-tokens': '500',
          'mode': 'suggest',
          'allowed-types': 'feat,fix,docs',
          'max-length': '72',
          'min-description-length': '3',
          'custom-prompt': '',
          'comment-template': ''
        }
        return defaults[name] || ''
      })

      mockGetBooleanInput.mockImplementation((name: string) => {
        const defaults: Record<string, boolean> = {
          'require-scope': false,
          'include-scope': true,
          'skip-if-conventional': true
        }
        return defaults[name] || false
      })
    })

    test('should parse valid configuration successfully', () => {
      const config = configManager.parseConfig()

      expect(config).toEqual({
        githubToken: 'test-token',
        aiProvider: 'openai',
        apiKey: 'test-api-key',
        model: 'gpt-4o-mini',
        baseURL: undefined,
        temperature: 0.3,
        maxTokens: 500,
        mode: 'suggest',
        validationOptions: {
          allowedTypes: ['feat', 'fix', 'docs'],
          requireScope: false,
          maxLength: 72,
          minDescriptionLength: 3
        },
        customPrompt: undefined,
        includeScope: true,
        skipIfConventional: true,
        commentTemplate: undefined,
        debug: false,
        matchLanguage: false,
        autoComment: false
      })
    })

    test('should handle missing required fields', () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'github-token' || name === 'api-key') return ''
        return 'valid-value'
      })

      expect(() => configManager.parseConfig()).toThrow(ConfigurationError)
    })

    test('should handle invalid AI provider', () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'ai-provider') return 'invalid-provider'
        return name === 'github-token' ? 'test-token' : name === 'api-key' ? 'test-key' : 'valid-value'
      })

      expect(() => configManager.parseConfig()).toThrow(ConfigurationError)
    })

    test('should handle invalid operation mode', () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'mode') return 'invalid-mode'
        return name === 'github-token' ? 'test-token' : name === 'api-key' ? 'test-key' : 'valid-value'
      })

      expect(() => configManager.parseConfig()).toThrow(ConfigurationError)
    })

    test('should handle invalid temperature', () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'temperature') return '2.0' // Invalid: > 1.0
        return name === 'github-token' ? 'test-token' : name === 'api-key' ? 'test-key' : 'valid-value'
      })

      expect(() => configManager.parseConfig()).toThrow(ConfigurationError)
    })

    test('should handle invalid max-tokens', () => {
      mockGetInput.mockImplementation((name: string) => {
        if (name === 'max-tokens') return '5000' // Invalid: > 4000
        return name === 'github-token' ? 'test-token' : name === 'api-key' ? 'test-key' : 'valid-value'
      })

      expect(() => configManager.parseConfig()).toThrow(ConfigurationError)
    })

    test('should use default values for optional fields', () => {
      mockGetInput.mockImplementation((name: string) => {
        const required: Record<string, string> = {
          'github-token': 'test-token',
          'api-key': 'test-api-key'
        }
        return required[name] || ''
      })

      const config = configManager.parseConfig()

      expect(config.aiProvider).toBe('openai')
      expect(config.temperature).toBe(0.3)
      expect(config.maxTokens).toBe(500)
      expect(config.mode).toBe('suggest')
    })

    test('should parse allowed types correctly', () => {
      mockGetInput.mockImplementation((name: string) => {
        const values: Record<string, string> = {
          'github-token': 'test-token',
          'api-key': 'test-key',
          'ai-provider': 'openai',
          'allowed-types': 'feat, fix , docs,   style',
          'mode': 'suggest',
          'temperature': '0.3',
          'max-tokens': '500',
          'max-length': '72',
          'min-description-length': '3'
        }
        return values[name] || ''
      })
      mockGetBooleanInput.mockReturnValue(false)

      const config = configManager.parseConfig()
      expect(config.validationOptions.allowedTypes).toEqual(['feat', 'fix', 'docs', 'style'])
    })

    test('should handle all AI providers', () => {
      const providers = ['openai', 'anthropic', 'google', 'mistral', 'xai', 'cohere', 'azure']

      providers.forEach(provider => {
        jest.clearAllMocks()
        mockGetInput.mockImplementation((name: string) => {
          const values: Record<string, string> = {
            'github-token': 'test-token',
            'api-key': 'test-key',
            'ai-provider': provider,
            'mode': 'suggest',
            'temperature': '0.3',
            'max-tokens': '500',
            'max-length': '72',
            'min-description-length': '3'
          }
          return values[name] || ''
        })
        mockGetBooleanInput.mockReturnValue(false)

        const config = configManager.parseConfig()
        expect(config.aiProvider).toBe(provider)
      })
    })
  })

  describe('validateConfig', () => {
    test('should validate compatible model and provider', () => {
      const config = {
        githubToken: 'test-token',
        aiProvider: 'openai' as const,
        apiKey: 'test-key',
        model: 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 500,
        mode: 'suggest' as const,
        validationOptions: {
          allowedTypes: ['feat', 'fix'],
          requireScope: false,
          maxLength: 72,
          minDescriptionLength: 3
        },
        includeScope: true,
        skipIfConventional: true,
        debug: false,
        matchLanguage: false,
        autoComment: false
      }

      const errors = configManager.validateConfig(config)
      expect(errors).toHaveLength(0)
    })

    test('should detect incompatible model and provider', () => {
      const config = {
        githubToken: 'test-token',
        aiProvider: 'openai' as const,
        apiKey: 'test-key',
        model: 'claude-3-haiku-20240307', // Anthropic model with OpenAI provider
        temperature: 0.3,
        maxTokens: 500,
        mode: 'suggest' as const,
        validationOptions: {
          allowedTypes: ['feat', 'fix'],
          requireScope: false,
          maxLength: 72,
          minDescriptionLength: 3
        },
        includeScope: true,
        skipIfConventional: true,
        debug: false,
        matchLanguage: false,
        autoComment: false
      }

      const errors = configManager.validateConfig(config)
      expect(errors).toHaveLength(1)
      expect(errors[0].field).toBe('model')
      expect(errors[0].message).toContain('not compatible')
    })

    test('should validate temperature range', () => {
      const config = {
        githubToken: 'test-token',
        aiProvider: 'openai' as const,
        apiKey: 'test-key',
        temperature: 1.5, // Invalid
        maxTokens: 500,
        mode: 'suggest' as const,
        validationOptions: {
          allowedTypes: ['feat', 'fix'],
          requireScope: false,
          maxLength: 72,
          minDescriptionLength: 3
        },
        includeScope: true,
        skipIfConventional: true,
        debug: false,
        matchLanguage: false,
        autoComment: false
      }

      const errors = configManager.validateConfig(config)
      expect(errors).toHaveLength(1)
      expect(errors[0].field).toBe('temperature')
    })

    test('should validate minimum max-length', () => {
      const config = {
        githubToken: 'test-token',
        aiProvider: 'openai' as const,
        apiKey: 'test-key',
        temperature: 0.3,
        maxTokens: 500,
        mode: 'suggest' as const,
        validationOptions: {
          allowedTypes: ['feat', 'fix'],
          requireScope: false,
          maxLength: 5, // Too short
          minDescriptionLength: 3
        },
        includeScope: true,
        skipIfConventional: true,
        debug: false,
        matchLanguage: false,
        autoComment: false
      }

      const errors = configManager.validateConfig(config)
      expect(errors).toHaveLength(1)
      expect(errors[0].field).toBe('max-length')
    })

    test('should validate empty allowed types', () => {
      const config = {
        githubToken: 'test-token',
        aiProvider: 'openai' as const,
        apiKey: 'test-key',
        temperature: 0.3,
        maxTokens: 500,
        mode: 'suggest' as const,
        validationOptions: {
          allowedTypes: [], // Empty
          requireScope: false,
          maxLength: 72,
          minDescriptionLength: 3
        },
        includeScope: true,
        skipIfConventional: true,
        debug: false,
        matchLanguage: false,
        autoComment: false
      }

      const errors = configManager.validateConfig(config)
      expect(errors).toHaveLength(1)
      expect(errors[0].field).toBe('allowed-types')
    })
  })

  describe('setOutputs', () => {
    test('should set all outputs correctly', () => {
      configManager.setOutputs({
        isConventional: true,
        suggestedTitles: ['feat: add feature', 'fix: resolve bug'],
        originalTitle: 'Add feature',
        actionTaken: 'commented'
      })

      expect(mockSetOutput).toHaveBeenCalledWith('is-conventional', 'true')
      expect(mockSetOutput).toHaveBeenCalledWith('suggested-titles', JSON.stringify(['feat: add feature', 'fix: resolve bug']))
      expect(mockSetOutput).toHaveBeenCalledWith('original-title', 'Add feature')
      expect(mockSetOutput).toHaveBeenCalledWith('action-taken', 'commented')
    })

    test('should set error message when provided', () => {
      configManager.setOutputs({
        isConventional: false,
        suggestedTitles: [],
        originalTitle: 'Bad title',
        actionTaken: 'error',
        errorMessage: 'API error occurred'
      })

      expect(mockSetOutput).toHaveBeenCalledWith('error-message', 'API error occurred')
    })
  })

  describe('handleConfigurationError', () => {
    test('should format and set friendly error message', () => {
      const error = new ConfigurationError([
        {
          field: 'api-key',
          message: 'API key is required',
          suggestion: 'Set the api-key input'
        },
        {
          field: 'temperature',
          message: 'Invalid temperature value'
        }
      ])

      configManager.handleConfigurationError(error)

      expect(mockSetFailed).toHaveBeenCalledWith(
        expect.stringContaining('❌ Configuration Error')
      )
      expect(mockSetFailed).toHaveBeenCalledWith(
        expect.stringContaining('api-key')
      )
      expect(mockSetFailed).toHaveBeenCalledWith(
        expect.stringContaining('temperature')
      )
    })
  })

  describe('getConfig', () => {
    test('should throw error if config not initialized', () => {
      expect(() => configManager.getConfig()).toThrow('Configuration not initialized')
    })

    test('should return config after parsing', () => {
      // Set up proper mocks
      mockGetInput.mockImplementation((name: string) => {
        const values: Record<string, string> = {
          'github-token': 'test-token',
          'api-key': 'test-key',
          'ai-provider': 'openai',
          'mode': 'suggest',
          'temperature': '0.3',
          'max-tokens': '500',
          'max-length': '72',
          'min-description-length': '3'
        }
        return values[name] || ''
      })
      mockGetBooleanInput.mockReturnValue(false)
      
      const config = configManager.parseConfig()
      const retrievedConfig = configManager.getConfig()
      expect(retrievedConfig).toBe(config)
    })
  })
})

describe('Utility Functions', () => {
  const mockConfig = {
    githubToken: 'test-token',
    aiProvider: 'openai' as const,
    apiKey: 'test-key',
    model: 'gpt-4o-mini',
    temperature: 0.3,
    maxTokens: 500,
    mode: 'suggest' as const,
    validationOptions: {
      allowedTypes: ['feat', 'fix'],
      requireScope: false,
      maxLength: 72,
      minDescriptionLength: 3
    },
    includeScope: true,
    skipIfConventional: true,
    debug: false,
    matchLanguage: false,
    autoComment: false
  }

  describe('createAIServiceConfig', () => {
    test('should create AI service config from action config', () => {
      const aiConfig = createAIServiceConfig(mockConfig)

      expect(aiConfig).toEqual({
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4o-mini',
        baseURL: undefined,
        temperature: 0.3,
        maxTokens: 500,
        debug: false
      })
    })
  })

  describe('shouldSkipProcessing', () => {
    test('should return true when skip is enabled and title is conventional', () => {
      const result = shouldSkipProcessing(mockConfig, true)
      expect(result).toBe(true)
    })

    test('should return false when skip is enabled but title is not conventional', () => {
      const result = shouldSkipProcessing(mockConfig, false)
      expect(result).toBe(false)
    })

    test('should return false when skip is disabled', () => {
      const config = { ...mockConfig, skipIfConventional: false }
      const result = shouldSkipProcessing(config, true)
      expect(result).toBe(false)
    })
  })

  describe('isAutoMode', () => {
    test('should return true for auto mode', () => {
      const config = { ...mockConfig, mode: 'auto' as const }
      expect(isAutoMode(config)).toBe(true)
    })

    test('should return false for suggest mode', () => {
      expect(isAutoMode(mockConfig)).toBe(false)
    })
  })

  describe('isSuggestionMode', () => {
    test('should return true for suggest mode', () => {
      expect(isSuggestionMode(mockConfig)).toBe(true)
    })

    test('should return false for auto mode', () => {
      const config = { ...mockConfig, mode: 'auto' as const }
      expect(isSuggestionMode(config)).toBe(false)
    })
  })
})

describe('ConfigurationError', () => {
  test('should format error message correctly', () => {
    const errors = [
      { field: 'api-key', message: 'API key required' },
      { field: 'model', message: 'Invalid model', suggestion: 'Use gpt-4o-mini' }
    ]
    
    const error = new ConfigurationError(errors)
    
    expect(error.message).toContain('api-key: API key required')
    expect(error.name).toBe('ConfigurationError')
    expect(error.errors).toBe(errors)
  })
})

describe('Edge Cases', () => {
  let configManager: ActionConfigManager

  beforeEach(() => {
    jest.clearAllMocks()
    configManager = new ActionConfigManager()
  })

  test('should handle non-numeric temperature input', () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'temperature') return 'not-a-number'
      return name === 'github-token' ? 'test-token' : name === 'api-key' ? 'test-key' : 'valid-value'
    })
    mockGetBooleanInput.mockReturnValue(false)

    expect(() => configManager.parseConfig()).toThrow(ConfigurationError)
  })

  test('should handle whitespace-only allowed types', () => {
    mockGetInput.mockImplementation((name: string) => {
      const values: Record<string, string> = {
        'github-token': 'test-token',
        'api-key': 'test-key',
        'ai-provider': 'openai',
        'allowed-types': '  ,  ,  ',
        'mode': 'suggest',
        'temperature': '0.3',
        'max-tokens': '500',
        'max-length': '72',
        'min-description-length': '3'
      }
      return values[name] || ''
    })
    mockGetBooleanInput.mockReturnValue(false)

    const config = configManager.parseConfig()
    expect(config.validationOptions.allowedTypes).toEqual([])
  })

  test('should handle custom model names that match provider patterns', () => {
    const config = {
      githubToken: 'test-token',
      aiProvider: 'openai' as const,
      apiKey: 'test-key',
      model: 'gpt-custom-fine-tuned',
      temperature: 0.3,
      maxTokens: 500,
      mode: 'suggest' as const,
      validationOptions: {
        allowedTypes: ['feat', 'fix'],
        requireScope: false,
        maxLength: 72,
        minDescriptionLength: 3
      },
      includeScope: true,
      skipIfConventional: true,
      debug: false,
      matchLanguage: false,
      autoComment: false
    }

    const errors = configManager.validateConfig(config)
    expect(errors).toHaveLength(0) // Should be valid due to pattern matching
  })
})

describe('Model Information Utilities', () => {
  describe('getModelInfo', () => {
    test('should return model info for existing model', () => {
      const modelInfo = getModelInfo('openai', 'gpt-4o-mini')
      
      expect(modelInfo).toBeDefined()
      expect(modelInfo?.id).toBe('gpt-4o-mini')
      expect(modelInfo?.name).toBe('GPT-4o Mini')
      expect(modelInfo?.supported).toBe(true)
    })

    test('should return null for non-existing model', () => {
      const modelInfo = getModelInfo('openai', 'non-existing-model')
      expect(modelInfo).toBeNull()
    })

    test('should return null for non-existing provider', () => {
      const modelInfo = getModelInfo('invalid' as any, 'any-model')
      expect(modelInfo).toBeNull()
    })
  })

  describe('getProviderModels', () => {
    test('should return all supported models for a provider', () => {
      const models = getProviderModels('openai')
      
      expect(models.length).toBeGreaterThan(0)
      expect(models.every(model => model.supported)).toBe(true)
      expect(models.some(model => model.id === 'gpt-4o-mini')).toBe(true)
    })

    test('should return empty array for non-existing provider', () => {
      const models = getProviderModels('invalid' as any)
      expect(models).toEqual([])
    })
  })

  describe('getRecommendedModels', () => {
    test('should return only recommended models', () => {
      const models = getRecommendedModels('openai')
      
      expect(models.length).toBeGreaterThan(0)
      expect(models.every(model => model.recommended === true)).toBe(true)
    })

    test('should return subset of all provider models', () => {
      const allModels = getProviderModels('anthropic')
      const recommendedModels = getRecommendedModels('anthropic')
      
      expect(recommendedModels.length).toBeLessThanOrEqual(allModels.length)
      recommendedModels.forEach(model => {
        expect(allModels.some(m => m.id === model.id)).toBe(true)
      })
    })
  })

  describe('getDefaultModel', () => {
    test('should return default model when available', () => {
      const defaultModel = getDefaultModel('openai')
      
      expect(defaultModel).toBeDefined()
      expect(defaultModel?.default || defaultModel?.recommended).toBe(true)
    })

    test('should return recommended model as fallback', () => {
      const defaultModel = getDefaultModel('anthropic')
      
      expect(defaultModel).toBeDefined()
      expect(defaultModel?.supported).toBe(true)
    })

    test('should return null for non-existing provider', () => {
      const defaultModel = getDefaultModel('invalid' as any)
      expect(defaultModel).toBeNull()
    })
  })

  describe('getAllSupportedProviders', () => {
    test('should return all supported providers', () => {
      const providers = getAllSupportedProviders()
      
      expect(providers).toContain('openai')
      expect(providers).toContain('anthropic')
      expect(providers).toContain('google')
      expect(providers).toContain('mistral')
      expect(providers).toContain('xai')
      expect(providers).toContain('cohere')
      expect(providers).toContain('azure')
      expect(providers).toContain('vercel')
      expect(providers).toContain('deepseek')
      expect(providers).toContain('cerebras')
      expect(providers).toContain('groq')
      expect(providers).toContain('vertex')
      expect(providers).not.toContain('metadata')
    })

    test('should return array of valid provider types', () => {
      const providers = getAllSupportedProviders()
      const validProviders = ['openai', 'anthropic', 'google', 'mistral', 'xai', 'cohere', 'azure', 'vercel', 'deepseek', 'cerebras', 'groq', 'vertex', 'claude-code']
      
      providers.forEach(provider => {
        expect(validProviders).toContain(provider)
      })
    })
  })

  describe('estimateTokenCost', () => {
    test('should calculate cost correctly for known model', () => {
      const cost = estimateTokenCost('openai', 'gpt-4o-mini', 1000, 500)
      
      expect(cost).toBeDefined()
      expect(cost?.input).toBeCloseTo(0.00015) // 1000 tokens * 0.15/1M
      expect(cost?.output).toBeCloseTo(0.0003) // 500 tokens * 0.6/1M
      expect(cost?.total).toBeCloseTo(0.00045)
    })

    test('should return null for unknown model', () => {
      const cost = estimateTokenCost('openai', 'unknown-model', 1000, 500)
      expect(cost).toBeNull()
    })

    test('should handle zero tokens', () => {
      const cost = estimateTokenCost('anthropic', 'claude-3-haiku-20240307', 0, 0)
      
      expect(cost).toBeDefined()
      expect(cost?.input).toBe(0)
      expect(cost?.output).toBe(0)
      expect(cost?.total).toBe(0)
    })

    test('should handle large token counts', () => {
      const cost = estimateTokenCost('google', 'gemini-1.5-flash', 1_000_000, 500_000)
      
      expect(cost).toBeDefined()
      expect(cost?.input).toBeCloseTo(0.075) // 1M tokens * 0.075/1M
      expect(cost?.output).toBeCloseTo(0.15) // 500K tokens * 0.3/1M
      expect(cost?.total).toBeCloseTo(0.225)
    })
  })
})