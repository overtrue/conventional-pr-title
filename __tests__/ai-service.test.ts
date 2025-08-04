import { VercelAIService, createAIService, generateConventionalTitle, TitleGenerationRequest } from '../src/ai-service'

// Mock the AI SDK
jest.mock('ai', () => ({
  generateText: jest.fn()
}))

jest.mock('@ai-sdk/openai', () => ({
  openai: jest.fn((model: any, config: any) => ({ provider: 'openai', model, config })),
  createOpenAI: jest.fn((config: any) => (model: any) => ({ provider: 'openai', model, config }))
}))

jest.mock('@ai-sdk/anthropic', () => ({
  anthropic: jest.fn((model: any, config: any) => ({ provider: 'anthropic', model, config })),
  createAnthropic: jest.fn((config: any) => (model: any) => ({ provider: 'anthropic', model, config }))
}))

jest.mock('@ai-sdk/google', () => ({
  google: jest.fn((model: any, config: any) => ({ provider: 'google', model, config })),
  createGoogleGenerativeAI: jest.fn((config: any) => (model: any) => ({ provider: 'google', model, config }))
}))

jest.mock('@ai-sdk/mistral', () => ({
  mistral: jest.fn((model: any, config: any) => ({ provider: 'mistral', model, config })),
  createMistral: jest.fn((config: any) => (model: any) => ({ provider: 'mistral', model, config }))
}))

jest.mock('@ai-sdk/xai', () => ({
  xai: jest.fn((model: any, config: any) => ({ provider: 'xai', model, config })),
  createXai: jest.fn((config: any) => (model: any) => ({ provider: 'xai', model, config }))
}))

jest.mock('@ai-sdk/cohere', () => ({
  cohere: jest.fn((model: any, config: any) => ({ provider: 'cohere', model, config })),
  createCohere: jest.fn((config: any) => (model: any) => ({ provider: 'cohere', model, config }))
}))

jest.mock('@ai-sdk/azure', () => ({
  azure: jest.fn((model: any, config: any) => ({ provider: 'azure', model, config })),
  createAzure: jest.fn((config: any) => (model: any) => ({ provider: 'azure', model, config }))
}))

import { generateText } from 'ai'
import { openai, createOpenAI } from '@ai-sdk/openai'
import { anthropic, createAnthropic } from '@ai-sdk/anthropic'
import { google, createGoogleGenerativeAI } from '@ai-sdk/google'
import { mistral, createMistral } from '@ai-sdk/mistral'
import { xai, createXai } from '@ai-sdk/xai'
import { cohere, createCohere } from '@ai-sdk/cohere'
import { azure, createAzure } from '@ai-sdk/azure'

const mockGenerateText = generateText as jest.MockedFunction<typeof generateText>
const mockCreateOpenAI = createOpenAI as jest.MockedFunction<typeof createOpenAI>
const mockCreateAnthropic = createAnthropic as jest.MockedFunction<typeof createAnthropic>
const mockCreateGoogleGenerativeAI = createGoogleGenerativeAI as jest.MockedFunction<typeof createGoogleGenerativeAI>
const mockCreateMistral = createMistral as jest.MockedFunction<typeof createMistral>
const mockCreateXai = createXai as jest.MockedFunction<typeof createXai>

// Helper function to create proper mock response
function createMockResponse(text: string) {
  return {
    text,
    reasoning: [],
    files: [],
    reasoningDetails: {},
    sources: [],
    usage: { totalTokens: 100, promptTokens: 50, completionTokens: 50 },
    finishReason: 'stop' as const,
    warnings: [],
    rawResponse: {},
    request: {},
    response: {},
    logprobs: undefined,
    experimental_providerMetadata: {},
    experimental_output: undefined,
    toolCalls: [],
    toolResults: [],
    steps: [],
    providerMetadata: {}
  } as any
}

describe('VercelAIService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.OPENAI_API_KEY = 'test-openai-key'
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-google-key'
    process.env.MISTRAL_API_KEY = 'test-mistral-key'
    process.env.XAI_API_KEY = 'test-xai-key'
    process.env.COHERE_API_KEY = 'test-cohere-key'
    process.env.AZURE_API_KEY = 'test-azure-key'
  })

  afterEach(() => {
    delete process.env.OPENAI_API_KEY
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY
    delete process.env.MISTRAL_API_KEY
    delete process.env.XAI_API_KEY
    delete process.env.COHERE_API_KEY
    delete process.env.AZURE_API_KEY
    delete process.env.AI_PROVIDER
  })

  describe('constructor', () => {
    test('should create service with default config', () => {
      const service = new VercelAIService({
        provider: 'openai',
        apiKey: 'test-key'
      })
      expect(service).toBeInstanceOf(VercelAIService)
    })

    test('should merge custom config with defaults', () => {
      const service = new VercelAIService({
        provider: 'anthropic',
        apiKey: 'test-key',
        temperature: 0.5,
        maxTokens: 1000
      })
      expect(service).toBeInstanceOf(VercelAIService)
    })
  })

  describe('generateTitle', () => {
    test('should generate title suggestions with valid JSON response', async () => {
      const mockResponse = createMockResponse(JSON.stringify({
        suggestions: ['feat: add user authentication', 'feat(auth): implement login system'],
        reasoning: 'Added authentication features',
        confidence: 0.9
      }))
      
      mockGenerateText.mockResolvedValueOnce(mockResponse)

      const service = new VercelAIService({
        provider: 'openai',
        apiKey: 'test-key'
      })

      const request: TitleGenerationRequest = {
        originalTitle: 'Add login',
        prDescription: 'Implement user authentication system'
      }

      const result = await service.generateTitle(request)

      expect(result.suggestions).toHaveLength(2)
      expect(result.suggestions[0]).toBe('feat: add user authentication')
      expect(result.reasoning).toBe('Added authentication features')
      expect(result.confidence).toBe(0.9)
    })

    test('should handle malformed JSON response', async () => {
      const mockResponse = createMockResponse('feat: add user authentication\nThis is a good title because...')
      
      mockGenerateText.mockResolvedValueOnce(mockResponse)

      const service = new VercelAIService({
        provider: 'openai',
        apiKey: 'test-key'
      })

      const request: TitleGenerationRequest = {
        originalTitle: 'Add login'
      }

      const result = await service.generateTitle(request)

      expect(result.suggestions).toContain('feat: add user authentication')
      expect(result.confidence).toBe(0.5)
    })

    test('should build comprehensive prompt with all available data', async () => {
      const mockResponse = createMockResponse(JSON.stringify({
        suggestions: ['fix(api): resolve authentication timeout'],
        reasoning: 'Fixed authentication issue',
        confidence: 0.8
      }))
      
      mockGenerateText.mockResolvedValueOnce(mockResponse)

      const service = new VercelAIService({
        provider: 'openai',
        apiKey: 'test-key'
      })

      const request: TitleGenerationRequest = {
        originalTitle: 'Fix auth bug',
        prDescription: 'Fix authentication timeout issue',
        prBody: 'This PR fixes the timeout issue in the authentication service...',
        changedFiles: ['src/auth/service.ts', 'src/api/auth.ts'],
        options: {
          includeScope: true,
          maxLength: 60
        }
      }

      await service.generateTitle(request)

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining('Original PR Title: "Fix auth bug"'),
          system: expect.stringContaining('MUST include a scope')
        })
      )
    })

    test('should use OpenAI model correctly', async () => {
      const mockResponse = createMockResponse('{"suggestions": ["feat: test"], "reasoning": "test", "confidence": 0.8}')
      mockGenerateText.mockResolvedValueOnce(mockResponse)
      
      const mockOpenAIModel = { provider: 'openai', model: 'gpt-4' } as any
      const mockProvider = jest.fn().mockReturnValue(mockOpenAIModel)
      mockCreateOpenAI.mockReturnValue(mockProvider as any)

      const service = new VercelAIService({
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4'
      })

      await service.generateTitle({ originalTitle: 'test' })

      expect(mockCreateOpenAI).toHaveBeenCalledWith({ apiKey: 'test-key' })
      expect(mockProvider).toHaveBeenCalledWith('gpt-4')
    })

    test('should use Anthropic model correctly', async () => {
      const mockResponse = createMockResponse('{"suggestions": ["feat: test"], "reasoning": "test", "confidence": 0.8}')
      mockGenerateText.mockResolvedValueOnce(mockResponse)
      
      const mockAnthropicModel = { provider: 'anthropic', model: 'claude-3-opus-20240229' } as any
      const mockProvider = jest.fn().mockReturnValue(mockAnthropicModel)
      mockCreateAnthropic.mockReturnValue(mockProvider as any)

      const service = new VercelAIService({
        provider: 'anthropic',
        apiKey: 'test-key',
        model: 'claude-3-opus-20240229'
      })

      await service.generateTitle({ originalTitle: 'test' })

      expect(mockCreateAnthropic).toHaveBeenCalledWith({ apiKey: 'test-key' })
      expect(mockProvider).toHaveBeenCalledWith('claude-3-opus-20240229')
    })

    test('should use Google model correctly', async () => {
      const mockResponse = createMockResponse('{"suggestions": ["feat: test"], "reasoning": "test", "confidence": 0.8}')
      mockGenerateText.mockResolvedValueOnce(mockResponse)
      
      const mockGoogleModel = { provider: 'google', model: 'gemini-1.5-pro' } as any
      const mockProvider = jest.fn().mockReturnValue(mockGoogleModel)
      mockCreateGoogleGenerativeAI.mockReturnValue(mockProvider as any)

      const service = new VercelAIService({
        provider: 'google',
        apiKey: 'test-key',
        model: 'gemini-1.5-pro'
      })

      await service.generateTitle({ originalTitle: 'test' })

      expect(mockCreateGoogleGenerativeAI).toHaveBeenCalledWith({ apiKey: 'test-key' })
      expect(mockProvider).toHaveBeenCalledWith('gemini-1.5-pro')
    })

    test('should use Mistral model correctly', async () => {
      const mockResponse = createMockResponse('{"suggestions": ["feat: test"], "reasoning": "test", "confidence": 0.8}')
      mockGenerateText.mockResolvedValueOnce(mockResponse)
      
      const mockMistralModel = { provider: 'mistral', model: 'mistral-large-latest' } as any
      const mockProvider = jest.fn().mockReturnValue(mockMistralModel)
      mockCreateMistral.mockReturnValue(mockProvider as any)

      const service = new VercelAIService({
        provider: 'mistral',
        apiKey: 'test-key',
        model: 'mistral-large-latest'
      })

      await service.generateTitle({ originalTitle: 'test' })

      expect(mockCreateMistral).toHaveBeenCalledWith({ apiKey: 'test-key' })
      expect(mockProvider).toHaveBeenCalledWith('mistral-large-latest')
    })

    test('should use XAI model correctly', async () => {
      const mockResponse = createMockResponse('{"suggestions": ["feat: test"], "reasoning": "test", "confidence": 0.8}')
      mockGenerateText.mockResolvedValueOnce(mockResponse)
      
      const mockXaiModel = { provider: 'xai', model: 'grok-beta' } as any
      const mockProvider = jest.fn().mockReturnValue(mockXaiModel)
      mockCreateXai.mockReturnValue(mockProvider as any)

      const service = new VercelAIService({
        provider: 'xai',
        apiKey: 'test-key',
        model: 'grok-beta'
      })

      await service.generateTitle({ originalTitle: 'test' })

      expect(mockCreateXai).toHaveBeenCalledWith({ apiKey: 'test-key' })
      expect(mockProvider).toHaveBeenCalledWith('grok-beta')
    })

    test('should throw error for unsupported provider', async () => {
      const service = new VercelAIService({
        provider: 'unsupported' as any,
        apiKey: 'test-key'
      })

      await expect(service.generateTitle({ originalTitle: 'test' }))
        .rejects.toThrow('Unsupported provider: unsupported')
    }, 10000)

    test('should retry on failure', async () => {
      mockGenerateText
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(createMockResponse('{"suggestions": ["feat: test"], "reasoning": "test", "confidence": 0.8}'))

      const service = new VercelAIService({
        provider: 'openai',
        apiKey: 'test-key',
        maxRetries: 2
      })

      const result = await service.generateTitle({ originalTitle: 'test' })

      expect(result.suggestions).toContain('feat: test')
      expect(mockGenerateText).toHaveBeenCalledTimes(2)
    })

    test('should throw after max retries', async () => {
      mockGenerateText.mockRejectedValue(new Error('Network error'))

      const service = new VercelAIService({
        provider: 'openai',
        apiKey: 'test-key',
        maxRetries: 1
      })

      await expect(service.generateTitle({ originalTitle: 'test' }))
        .rejects.toThrow('AI service failed after 2 attempts')

      expect(mockGenerateText).toHaveBeenCalledTimes(2) // Initial + 1 retry
    })
  })

  describe('isHealthy', () => {
    test('should return true when service responds correctly', async () => {
      mockGenerateText.mockResolvedValueOnce(createMockResponse('OK'))

      const service = new VercelAIService({
        provider: 'openai',
        apiKey: 'test-key'
      })

      const healthy = await service.isHealthy()
      expect(healthy).toBe(true)
    })

    test('should return false when service fails', async () => {
      mockGenerateText.mockRejectedValueOnce(new Error('Service down'))

      const service = new VercelAIService({
        provider: 'openai',
        apiKey: 'test-key'
      })

      const healthy = await service.isHealthy()
      expect(healthy).toBe(false)
    })
  })
})

describe('createAIService', () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-openai-key'
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'test-google-key'
    process.env.MISTRAL_API_KEY = 'test-mistral-key'
    process.env.XAI_API_KEY = 'test-xai-key'
    process.env.COHERE_API_KEY = 'test-cohere-key'
    process.env.AZURE_API_KEY = 'test-azure-key'
  })

  afterEach(() => {
    delete process.env.OPENAI_API_KEY
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY
    delete process.env.MISTRAL_API_KEY
    delete process.env.XAI_API_KEY
    delete process.env.COHERE_API_KEY
    delete process.env.AZURE_API_KEY
    delete process.env.AI_PROVIDER
  })

  test('should create OpenAI service by default', () => {
    const service = createAIService()
    expect(service).toBeInstanceOf(VercelAIService)
  })

  test('should create Google service when specified', () => {
    const service = createAIService({ provider: 'google' })
    expect(service).toBeInstanceOf(VercelAIService)
  })

  test('should create Mistral service when specified', () => {
    const service = createAIService({ provider: 'mistral' })
    expect(service).toBeInstanceOf(VercelAIService)
  })

  test('should create XAI service when specified', () => {
    const service = createAIService({ provider: 'xai' })
    expect(service).toBeInstanceOf(VercelAIService)
  })

  test('should use AI_PROVIDER environment variable', () => {
    process.env.AI_PROVIDER = 'google'
    const service = createAIService()
    expect(service).toBeInstanceOf(VercelAIService)
  })

  test('should throw when no API key is available for specified provider', () => {
    delete process.env.OPENAI_API_KEY
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY
    delete process.env.MISTRAL_API_KEY
    delete process.env.XAI_API_KEY
    delete process.env.COHERE_API_KEY
    delete process.env.AZURE_API_KEY

    expect(() => createAIService()).toThrow('API key required for openai')
    expect(() => createAIService({ provider: 'google' })).toThrow('API key required for google')
  })

  test('should prefer provided config over environment', () => {
    const service = createAIService({
      provider: 'anthropic',
      apiKey: 'custom-key'
    })
    expect(service).toBeInstanceOf(VercelAIService)
  })
})

describe('generateConventionalTitle', () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key'
  })

  afterEach(() => {
    delete process.env.OPENAI_API_KEY
  })

  test('should generate title using convenience function', async () => {
    const mockResponse = createMockResponse('{"suggestions": ["feat: add feature"], "reasoning": "test", "confidence": 0.8}')
    mockGenerateText.mockResolvedValueOnce(mockResponse)

    const result = await generateConventionalTitle({
      originalTitle: 'Add feature'
    })

    expect(result.suggestions).toContain('feat: add feature')
  })
})

describe('integration tests', () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key'
  })

  afterEach(() => {
    delete process.env.OPENAI_API_KEY
  })

  test('should handle complex PR data', async () => {
    const mockResponse = createMockResponse(JSON.stringify({
      suggestions: [
        'feat(auth): implement OAuth2 authentication system',
        'feat(auth): add OAuth2 login integration',
        'feat: add OAuth2 authentication support'
      ],
      reasoning: 'The PR adds OAuth2 authentication functionality with proper scope and descriptive titles',
      confidence: 0.95
    }))
    
    mockGenerateText.mockResolvedValueOnce(mockResponse)

    const request: TitleGenerationRequest = {
      originalTitle: 'Add OAuth',
      prDescription: 'Implement OAuth2 authentication system for user login',
      prBody: `This PR implements a complete OAuth2 authentication system including:
      - OAuth2 provider integration
      - Token management
      - User session handling
      - Security improvements`,
      changedFiles: [
        'src/auth/oauth.ts',
        'src/auth/tokens.ts',
        'src/middleware/auth.ts',
        'tests/auth.test.ts'
      ],
      options: {
        includeScope: true,
        preferredTypes: ['feat', 'fix', 'security'],
        maxLength: 70
      }
    }

    const result = await generateConventionalTitle(request)

    expect(result.suggestions).toHaveLength(3)
    expect(result.suggestions[0]).toMatch(/^feat\(auth\):/)
    expect(result.confidence).toBeGreaterThan(0.9)
    expect(result.reasoning).toContain('OAuth2')
  })
})