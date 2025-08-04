import { AIProviderFactory } from '../src/ai-providers/factory'
import { AIProviderType } from '../src/ai-providers'

// Mock all provider classes to avoid dependency issues
jest.mock('../src/ai-providers/openai', () => ({
  OpenAIProvider: jest.fn().mockImplementation(() => ({
    generateTitle: jest.fn(),
    isHealthy: jest.fn()
  }))
}))

jest.mock('../src/ai-providers/anthropic', () => ({
  AnthropicProvider: jest.fn().mockImplementation(() => ({
    generateTitle: jest.fn(),
    isHealthy: jest.fn()
  }))
}))

jest.mock('../src/ai-providers/google', () => ({
  GoogleProvider: jest.fn().mockImplementation(() => ({
    generateTitle: jest.fn(),
    isHealthy: jest.fn()
  }))
}))

jest.mock('../src/ai-providers/mistral', () => ({
  MistralProvider: jest.fn().mockImplementation(() => ({
    generateTitle: jest.fn(),
    isHealthy: jest.fn()
  }))
}))

jest.mock('../src/ai-providers/xai', () => ({
  XAIProvider: jest.fn().mockImplementation(() => ({
    generateTitle: jest.fn(),
    isHealthy: jest.fn()
  }))
}))

jest.mock('../src/ai-providers/cohere', () => ({
  CohereProvider: jest.fn().mockImplementation(() => ({
    generateTitle: jest.fn(),
    isHealthy: jest.fn()
  }))
}))

jest.mock('../src/ai-providers/azure', () => ({
  AzureProvider: jest.fn().mockImplementation(() => ({
    generateTitle: jest.fn(),
    isHealthy: jest.fn()
  }))
}))

jest.mock('../src/ai-providers/claude-code', () => ({
  ClaudeCodeProvider: jest.fn().mockImplementation(() => ({
    generateTitle: jest.fn(),
    isHealthy: jest.fn()
  }))
}))

describe('AIProviderFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('isProviderSupported', () => {
    test('should return true for supported providers', () => {
      expect(AIProviderFactory.isProviderSupported('openai')).toBe(true)
      expect(AIProviderFactory.isProviderSupported('anthropic')).toBe(true)
      expect(AIProviderFactory.isProviderSupported('google')).toBe(true)
    })

    test('should return false for unsupported providers', () => {
      expect(AIProviderFactory.isProviderSupported('unsupported' as AIProviderType)).toBe(false)
    })
  })

  describe('getSupportedProviders', () => {
    test('should return list of supported providers', () => {
      const providers = AIProviderFactory.getSupportedProviders()
      expect(providers).toContain('openai')
      expect(providers).toContain('anthropic')
      expect(providers).toContain('google')
      expect(providers.length).toBeGreaterThan(0)
    })
  })

  describe('getDefaultModel', () => {
    test('should return default models for each provider', () => {
      expect(AIProviderFactory.getDefaultModel('openai')).toBe('gpt-4o-mini')
      expect(AIProviderFactory.getDefaultModel('anthropic')).toBe('claude-3-5-sonnet-20241022')
      expect(AIProviderFactory.getDefaultModel('google')).toBe('gemini-1.5-flash')
    })

    test('should throw for unsupported provider', () => {
      expect(() => AIProviderFactory.getDefaultModel('unsupported' as AIProviderType))
        .toThrow('Unsupported provider: unsupported')
    })
  })

  describe('getSupportedModels', () => {
    test('should return models for each provider', () => {
      const openaiModels = AIProviderFactory.getSupportedModels('openai')
      expect(Array.isArray(openaiModels)).toBe(true)
      expect(openaiModels.length).toBeGreaterThan(0)

      const anthropicModels = AIProviderFactory.getSupportedModels('anthropic')
      expect(Array.isArray(anthropicModels)).toBe(true)
      expect(anthropicModels.length).toBeGreaterThan(0)
    })

    test('should throw for unsupported provider', () => {
      expect(() => AIProviderFactory.getSupportedModels('unsupported' as AIProviderType))
        .toThrow('Unsupported provider: unsupported')
    })
  })

  describe('isModelSupported', () => {
    test('should validate models for providers', () => {
      expect(AIProviderFactory.isModelSupported('openai', 'gpt-4o')).toBe(true)
      expect(AIProviderFactory.isModelSupported('openai', 'invalid-model')).toBe(false)
      
      expect(AIProviderFactory.isModelSupported('anthropic', 'claude-3-5-sonnet-20241022')).toBe(true)
      expect(AIProviderFactory.isModelSupported('anthropic', 'invalid-model')).toBe(false)
    })

    test('should return false for unsupported provider', () => {
      expect(AIProviderFactory.isModelSupported('unsupported' as AIProviderType, 'any-model')).toBe(false)
    })
  })

  describe('getProviderInfo', () => {
    test('should return provider information', () => {
      const info = AIProviderFactory.getProviderInfo('openai')
      expect(info).toHaveProperty('name')
      expect(info).toHaveProperty('supportedModels')
      expect(Array.isArray(info.supportedModels)).toBe(true)
    })

    test('should throw for unsupported provider', () => {
      expect(() => AIProviderFactory.getProviderInfo('unsupported' as AIProviderType))
        .toThrow('Unsupported provider: unsupported')
    })
  })

  describe('getProviderEnvironmentKey', () => {
    test('should return correct environment keys', () => {
      expect(AIProviderFactory.getProviderEnvironmentKey('openai')).toBe('OPENAI_API_KEY')
      expect(AIProviderFactory.getProviderEnvironmentKey('anthropic')).toBe('ANTHROPIC_API_KEY')
      expect(AIProviderFactory.getProviderEnvironmentKey('google')).toBe('GOOGLE_GENERATIVE_AI_API_KEY')
      expect(AIProviderFactory.getProviderEnvironmentKey('claude-code')).toBe('CLAUDE_CODE_API_KEY')
    })

    test('should throw for unsupported provider', () => {
      expect(() => AIProviderFactory.getProviderEnvironmentKey('unsupported' as AIProviderType))
        .toThrow('Unsupported provider: unsupported')
    })
  })

  describe('create', () => {
    test('should create OpenAI provider instance', () => {
      const provider = AIProviderFactory.create('openai', {
        apiKey: 'test-key',
        model: 'gpt-4'
      })

      expect(provider).toBeDefined()
      expect(provider.generateTitle).toBeDefined()
      expect(provider.isHealthy).toBeDefined()
    })

    test('should create Anthropic provider instance', () => {
      const provider = AIProviderFactory.create('anthropic', {
        apiKey: 'test-key',
        model: 'claude-3-5-sonnet-20241022'
      })

      expect(provider).toBeDefined()
      expect(provider.generateTitle).toBeDefined()
      expect(provider.isHealthy).toBeDefined()
    })

    test('should create Claude Code provider instance', () => {
      const provider = AIProviderFactory.create('claude-code', {
        apiKey: '', // Not required for Claude Code
        model: 'sonnet'
      })

      expect(provider).toBeDefined()
      expect(provider.generateTitle).toBeDefined()
      expect(provider.isHealthy).toBeDefined()
    })

    test('should throw for unsupported provider', () => {
      expect(() => AIProviderFactory.create('unsupported' as AIProviderType, { apiKey: 'test' }))
        .toThrow('Unsupported AI provider: unsupported')
    })

    test('should cache provider instances', () => {
      const provider1 = AIProviderFactory.create('openai', {
        apiKey: 'test-key',
        model: 'gpt-4'
      })
      
      const provider2 = AIProviderFactory.create('openai', {
        apiKey: 'test-key',
        model: 'gpt-4'
      })

      expect(provider1).toBe(provider2) // Should be the same cached instance
    })
  })
})