import { ModernAIService } from '../src/modern-ai-service'
import { TitleGenerationRequest, TitleGenerationResponse } from '../src/shared/types'

// Mock the AI providers
jest.mock('../src/ai-providers/factory')

// Import after mocking
import { AIProviderFactory } from '../src/ai-providers/factory'

const mockAIProviderFactory = AIProviderFactory as jest.Mocked<typeof AIProviderFactory>

describe('ModernAIService', () => {
  const mockProvider = {
    generateTitle: jest.fn(),
    isHealthy: jest.fn()
  } as any // Type assertion to avoid interface mismatch

  beforeEach(() => {
    jest.clearAllMocks()
    mockAIProviderFactory.isProviderSupported.mockReturnValue(true)
    mockAIProviderFactory.getDefaultModel.mockReturnValue('default-model')
    mockAIProviderFactory.create.mockReturnValue(mockProvider)
    mockAIProviderFactory.getProviderInfo.mockReturnValue({
      name: 'Test Provider',
      className: 'TestProvider',
      requiredApiKey: 'TEST_API_KEY',
      defaultModel: 'default-model',
      supportedModels: ['model1', 'model2']
    })
    mockAIProviderFactory.getSupportedModels.mockReturnValue(['model1', 'model2'])
    mockAIProviderFactory.isModelSupported.mockReturnValue(true)
    mockAIProviderFactory.getSupportedProviders.mockReturnValue(['openai', 'anthropic'])
    mockAIProviderFactory.getProviderEnvironmentKey.mockReturnValue('OPENAI_API_KEY')
  })

  describe('constructor', () => {
    test('should create service with default config', () => {
      const service = new ModernAIService({
        provider: 'openai',
        apiKey: 'test-key'
      })
      expect(service).toBeInstanceOf(ModernAIService)
      expect(AIProviderFactory.isProviderSupported).toHaveBeenCalledWith('openai')
    })

    test('should set default model if not provided', () => {
      new ModernAIService({
        provider: 'anthropic',
        apiKey: 'test-key'
      })
      expect(AIProviderFactory.getDefaultModel).toHaveBeenCalledWith('anthropic')
    })

    test('should throw for unsupported provider', () => {
      mockAIProviderFactory.isProviderSupported.mockReturnValue(false)

      expect(() => new ModernAIService({
        provider: 'unsupported' as any,
        apiKey: 'test-key'
      })).toThrow('Unsupported AI provider: unsupported')
    })

    test('should merge custom config with defaults', () => {
      const service = new ModernAIService({
        provider: 'openai',
        apiKey: 'test-key',
        temperature: 0.7,
        maxTokens: 1000,
        maxRetries: 5,
        debug: true
      })
      expect(service).toBeInstanceOf(ModernAIService)
    })
  })

  describe('generateTitle', () => {
    test('should delegate to provider and return result', async () => {
      const mockResponse: TitleGenerationResponse = {
        suggestions: ['feat: add user authentication'],
        reasoning: 'Added authentication feature',
        confidence: 0.9
      }
      mockProvider.generateTitle.mockResolvedValue(mockResponse)

      const service = new ModernAIService({
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4'
      })

      const request: TitleGenerationRequest = {
        originalTitle: 'Add login',
        prDescription: 'Implement user authentication'
      }

      const result = await service.generateTitle(request)

      expect(AIProviderFactory.create).toHaveBeenCalledWith('openai', {
        apiKey: 'test-key',
        baseURL: undefined,
        model: 'gpt-4',
        maxTokens: 500,
        temperature: 0.3
      })
      expect(mockProvider.generateTitle).toHaveBeenCalledWith(request)
      expect(result).toEqual(mockResponse)
    })

    test('should handle provider errors', async () => {
      mockProvider.generateTitle.mockRejectedValue(new Error('Provider error'))

      const service = new ModernAIService({
        provider: 'openai',
        apiKey: 'test-key'
      })

      await expect(service.generateTitle({
        originalTitle: 'test'
      })).rejects.toThrow('Provider error')
    })
  })

  describe('isHealthy', () => {
    test('should return true when provider is healthy', async () => {
      mockProvider.isHealthy.mockResolvedValue(true)

      const service = new ModernAIService({
        provider: 'openai',
        apiKey: 'test-key'
      })

      const result = await service.isHealthy()

      expect(result).toBe(true)
      expect(mockProvider.isHealthy).toHaveBeenCalled()
    })

    test('should return false when provider is unhealthy', async () => {
      mockProvider.isHealthy.mockResolvedValue(false)

      const service = new ModernAIService({
        provider: 'openai',
        apiKey: 'test-key'
      })

      const result = await service.isHealthy()

      expect(result).toBe(false)
    })

    test('should return false when provider creation fails', async () => {
      mockAIProviderFactory.create.mockImplementation(() => {
        throw new Error('Failed to create provider')
      })

      const service = new ModernAIService({
        provider: 'openai',
        apiKey: 'test-key'
      })

      const result = await service.isHealthy()

      expect(result).toBe(false)
    })
  })

  describe('getProviderInfo', () => {
    test('should return provider info from factory', () => {
      const service = new ModernAIService({
        provider: 'openai',
        apiKey: 'test-key'
      })

      const info = service.getProviderInfo()

      expect(AIProviderFactory.getProviderInfo).toHaveBeenCalledWith('openai')
      expect(info).toEqual({
        name: 'Test Provider',
        className: 'TestProvider',
        requiredApiKey: 'TEST_API_KEY',
        defaultModel: 'default-model',
        supportedModels: ['model1', 'model2']
      })
    })
  })

  describe('getSupportedModels', () => {
    test('should return supported models from factory', () => {
      const service = new ModernAIService({
        provider: 'openai',
        apiKey: 'test-key'
      })

      const models = service.getSupportedModels()

      expect(AIProviderFactory.getSupportedModels).toHaveBeenCalledWith('openai')
      expect(models).toEqual(['model1', 'model2'])
    })
  })

  describe('isModelSupported', () => {
    test('should check model support through factory', () => {
      const service = new ModernAIService({
        provider: 'openai',
        apiKey: 'test-key'
      })

      const isSupported = service.isModelSupported('gpt-4')

      expect(AIProviderFactory.isModelSupported).toHaveBeenCalledWith('openai', 'gpt-4')
      expect(isSupported).toBe(true)
    })
  })

  describe('static methods', () => {
    test('getSupportedProviders should return providers from factory', () => {
      const providers = ModernAIService.getSupportedProviders()

      expect(AIProviderFactory.getSupportedProviders).toHaveBeenCalled()
      expect(providers).toEqual(['openai', 'anthropic'])
    })

    test('getProviderEnvironmentKey should return key from factory', () => {
      const key = ModernAIService.getProviderEnvironmentKey('openai')

      expect(AIProviderFactory.getProviderEnvironmentKey).toHaveBeenCalledWith('openai')
      expect(key).toBe('OPENAI_API_KEY')
    })
  })
})