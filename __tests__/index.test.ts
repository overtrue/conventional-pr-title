import { run } from '../src/index'
import { setFailed, info, warning, debug } from '@actions/core'
import { context } from '@actions/github'
import { ActionConfigManager, ConfigurationError, shouldSkipProcessing, isAutoMode, isSuggestionMode } from '../src/config'
import { validateTitle } from '../src/conventional'
import { VercelAIService } from '../src/ai-service'
import { OctokitGitHubService } from '../src/github-service'

// Mock all dependencies
jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('../src/config', () => {
  const actualConfig = jest.requireActual('../src/config')
  return {
    ...actualConfig,
    ActionConfigManager: jest.fn()
  }
})
jest.mock('../src/conventional')
jest.mock('../src/ai-service')
jest.mock('../src/github-service')

const mockSetFailed = setFailed as jest.MockedFunction<typeof setFailed>
const mockInfo = info as jest.MockedFunction<typeof info>
const mockWarning = warning as jest.MockedFunction<typeof warning>
const mockDebug = debug as jest.MockedFunction<typeof debug>

const mockActionConfigManager = ActionConfigManager as jest.MockedClass<typeof ActionConfigManager>
const mockValidateTitle = validateTitle as jest.MockedFunction<typeof validateTitle>
const mockVercelAIService = VercelAIService as jest.MockedClass<typeof VercelAIService>
const mockOctokitGitHubService = OctokitGitHubService as jest.MockedClass<typeof OctokitGitHubService>

describe('Index (Main Entry Point)', () => {
  let mockConfigManagerInstance: jest.Mocked<ActionConfigManager>
  let mockAiServiceInstance: jest.Mocked<VercelAIService>
  let mockGithubServiceInstance: jest.Mocked<OctokitGitHubService>

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock ActionConfigManager instance
    mockConfigManagerInstance = {
      parseConfig: jest.fn(),
      getConfig: jest.fn(),
      validateConfig: jest.fn(),
      setOutputs: jest.fn(),
      handleConfigurationError: jest.fn()
    } as any

    mockActionConfigManager.mockImplementation(() => mockConfigManagerInstance)

    // Mock VercelAIService instance
    mockAiServiceInstance = {
      generateTitle: jest.fn()
    } as any

    mockVercelAIService.mockImplementation(() => mockAiServiceInstance)

    // Mock OctokitGitHubService instance
    mockGithubServiceInstance = {
      checkPermissions: jest.fn(),
      getChangedFiles: jest.fn(),
      updatePRTitle: jest.fn(),
      createComment: jest.fn(),
      getPRInfo: jest.fn()
    } as any

    mockOctokitGitHubService.mockImplementation((config) => mockGithubServiceInstance)

    // Default context mock
    Object.defineProperty(context, 'eventName', { value: 'pull_request', configurable: true })
    Object.defineProperty(context, 'repo', { 
      value: { owner: 'test-owner', repo: 'test-repo' }, 
      configurable: true 
    })
    Object.defineProperty(context, 'payload', { 
      value: {
        pull_request: {
          number: 123,
          title: 'Add new feature',
          draft: false
        }
      }, 
      configurable: true 
    })
  })

  describe('Event Validation', () => {
    test('should fail for non-PR events', async () => {
      Object.defineProperty(context, 'eventName', { value: 'push', configurable: true })

      await run()

      expect(mockSetFailed).toHaveBeenCalledWith(
        expect.stringContaining('This action only supports pull_request')
      )
    })

    test('should fail when PR payload is missing', async () => {
      Object.defineProperty(context, 'payload', { value: {}, configurable: true })

      await run()

      expect(mockSetFailed).toHaveBeenCalledWith(
        expect.stringContaining('Pull request information not found')
      )
    })

    test('should support pull_request_target event', async () => {
      Object.defineProperty(context, 'eventName', { value: 'pull_request_target', configurable: true })
      
      // Mock successful configuration and processing
      mockConfigManagerInstance.parseConfig.mockReturnValue({
        githubToken: 'test-token',
        aiProvider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 500,
        mode: 'suggest',
        validationOptions: { allowedTypes: ['feat', 'fix'] },
        includeScope: true,
        skipIfConventional: false
      } as any)

      mockValidateTitle.mockReturnValue({
        isValid: false,
        errors: ['Type missing'],
        suggestions: []
      })

      mockAiServiceInstance.generateTitle.mockResolvedValue({
        suggestions: ['feat: add new feature'],
        reasoning: 'Test reasoning',
        confidence: 0.8
      })

      mockGithubServiceInstance.getChangedFiles.mockResolvedValue(['src/file.ts'])
      mockGithubServiceInstance.createComment.mockResolvedValue({
        id: 1,
        body: 'comment',
        author: 'bot',
        createdAt: '2024-01-01T00:00:00Z'
      })

      await run()

      expect(mockSetFailed).not.toHaveBeenCalled()
    })
  })

  describe('Configuration Handling', () => {
    test('should handle configuration errors gracefully', async () => {
      const configError = new ConfigurationError([
        { field: 'api-key', message: 'API key required' }
      ])
      
      mockConfigManagerInstance.parseConfig.mockImplementation(() => {
        throw configError
      })

      await run()

      expect(mockConfigManagerInstance.handleConfigurationError).toHaveBeenCalledWith(configError)
      expect(mockSetFailed).not.toHaveBeenCalled()
    })

    test('should process valid configuration', async () => {
      mockConfigManagerInstance.parseConfig.mockReturnValue({
        githubToken: 'test-token',
        aiProvider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 500,
        mode: 'suggest',
        validationOptions: { allowedTypes: ['feat', 'fix'] },
        includeScope: true,
        skipIfConventional: false
      } as any)

      mockValidateTitle.mockReturnValue({
        isValid: false,
        errors: [],
        suggestions: []
      })

      mockAiServiceInstance.generateTitle.mockResolvedValue({
        suggestions: ['feat: add new feature'],
        reasoning: 'Test reasoning',
        confidence: 0.8
      })

      mockGithubServiceInstance.getChangedFiles.mockResolvedValue([])
      mockGithubServiceInstance.createComment.mockResolvedValue({
        id: 1,
        body: 'comment',
        author: 'bot',
        createdAt: '2024-01-01T00:00:00Z'
      })

      await run()

      expect(mockConfigManagerInstance.parseConfig).toHaveBeenCalled()
      expect(mockInfo).toHaveBeenCalledWith('Processing PR #123: \"Add new feature\"')
    })
  })

  describe('Skip Processing Logic', () => {
    test('should skip processing when title is conventional and skip enabled', async () => {
      const config = {
        githubToken: 'test-token',
        aiProvider: 'openai',
        apiKey: 'test-key',
        mode: 'suggest',
        skipIfConventional: true,
        validationOptions: {}
      } as any
      
      mockConfigManagerInstance.parseConfig.mockReturnValue(config)

      mockValidateTitle.mockReturnValue({
        isValid: true,
        errors: [],
        suggestions: []
      })

      await run()

      expect(mockInfo).toHaveBeenCalledWith(
        'Skipping processing: title is already conventional and skip-if-conventional is enabled'
      )
      expect(mockConfigManagerInstance.setOutputs).toHaveBeenCalledWith({
        isConventional: true,
        suggestedTitles: [],
        originalTitle: 'Add new feature',
        actionTaken: 'skipped'
      })
    })

    test('should not skip when title is not conventional', async () => {
      mockConfigManagerInstance.parseConfig.mockReturnValue({
        githubToken: 'test-token',
        aiProvider: 'openai',
        apiKey: 'test-key',
        mode: 'suggest',
        skipIfConventional: true,
        validationOptions: {}
      } as any)

      mockValidateTitle.mockReturnValue({
        isValid: false,
        errors: ['Type missing'],
        suggestions: []
      })

      mockAiServiceInstance.generateTitle.mockResolvedValue({
        suggestions: ['feat: add new feature'],
        reasoning: 'Test reasoning',
        confidence: 0.8
      })

      mockGithubServiceInstance.getChangedFiles.mockResolvedValue([])
      mockGithubServiceInstance.createComment.mockResolvedValue({
        id: 1,
        body: 'comment',
        author: 'bot',
        createdAt: '2024-01-01T00:00:00Z'
      })

      await run()

      expect(mockInfo).not.toHaveBeenCalledWith(
        expect.stringContaining('Skipping processing')
      )
      expect(mockAiServiceInstance.generateTitle).toHaveBeenCalled()
    })
  })

  describe('Auto Mode', () => {
    test('should update PR title in auto mode with permissions', async () => {
      mockConfigManagerInstance.parseConfig.mockReturnValue({
        githubToken: 'test-token',
        aiProvider: 'openai',
        apiKey: 'test-key',
        mode: 'auto',
        skipIfConventional: false,
        validationOptions: {}
      } as any)

      mockValidateTitle.mockReturnValue({
        isValid: false,
        errors: [],
        suggestions: []
      })

      mockAiServiceInstance.generateTitle.mockResolvedValue({
        suggestions: ['feat: add new feature'],
        reasoning: 'Test reasoning',
        confidence: 0.8
      })

      mockGithubServiceInstance.checkPermissions.mockResolvedValue(true)
      mockGithubServiceInstance.getChangedFiles.mockResolvedValue(['src/file.ts'])
      mockGithubServiceInstance.updatePRTitle.mockResolvedValue(undefined)

      await run()

      expect(mockGithubServiceInstance.updatePRTitle).toHaveBeenCalledWith(
        123,
        'feat: add new feature'
      )
      expect(mockInfo).toHaveBeenCalledWith('✅ Updated PR title to: \"feat: add new feature\"')

      expect(mockConfigManagerInstance.setOutputs).toHaveBeenCalledWith({
        isConventional: false,
        suggestedTitles: ['feat: add new feature'],
        originalTitle: 'Add new feature',
        actionTaken: 'updated'
      })
    })

    test('should fallback to suggestion mode when permissions insufficient', async () => {
      mockConfigManagerInstance.parseConfig.mockReturnValue({
        githubToken: 'test-token',
        aiProvider: 'openai',
        apiKey: 'test-key',
        mode: 'auto',
        skipIfConventional: false,
        validationOptions: {}
      } as any)

      mockValidateTitle.mockReturnValue({
        isValid: false,
        errors: [],
        suggestions: []
      })

      mockAiServiceInstance.generateTitle.mockResolvedValue({
        suggestions: ['feat: add new feature'],
        reasoning: 'Test reasoning',
        confidence: 0.8
      })

      mockGithubServiceInstance.checkPermissions.mockResolvedValue(false)
      mockGithubServiceInstance.getChangedFiles.mockResolvedValue(['src/file.ts'])
      mockGithubServiceInstance.createComment.mockResolvedValue({
        id: 1,
        body: 'comment',
        author: 'bot',
        createdAt: '2024-01-01T00:00:00Z'
      })

      await run()

      expect(mockWarning).toHaveBeenCalledWith(
        'Insufficient permissions to update PR title automatically. Falling back to suggestion mode.'
      )
      expect(mockGithubServiceInstance.createComment).toHaveBeenCalled()
      expect(mockGithubServiceInstance.updatePRTitle).not.toHaveBeenCalled()
    })

    test('should handle update title failure', async () => {
      mockConfigManagerInstance.parseConfig.mockReturnValue({
        githubToken: 'test-token',
        aiProvider: 'openai',
        apiKey: 'test-key',
        mode: 'auto',
        skipIfConventional: false,
        validationOptions: {}
      } as any)

      mockValidateTitle.mockReturnValue({
        isValid: false,
        errors: [],
        suggestions: []
      })

      mockAiServiceInstance.generateTitle.mockResolvedValue({
        suggestions: ['feat: add new feature'],
        reasoning: 'Test reasoning',
        confidence: 0.8
      })

      mockGithubServiceInstance.checkPermissions.mockResolvedValue(true)
      mockGithubServiceInstance.getChangedFiles.mockResolvedValue([])
      mockGithubServiceInstance.updatePRTitle.mockRejectedValue(new Error('Update failed'))

      await run()

      expect(mockWarning).toHaveBeenCalledWith('Failed to update PR title: Update failed')
      expect(mockConfigManagerInstance.setOutputs).toHaveBeenCalledWith({
        isConventional: false,
        suggestedTitles: ['feat: add new feature'],
        originalTitle: 'Add new feature',
        actionTaken: 'error',
        errorMessage: 'Failed to update PR title: Update failed'
      })
    })
  })

  describe('Suggestion Mode', () => {
    test('should create comment with suggestions', async () => {
      mockConfigManagerInstance.parseConfig.mockReturnValue({
        githubToken: 'test-token',
        aiProvider: 'openai',
        apiKey: 'test-key',
        mode: 'suggest',
        skipIfConventional: false,
        validationOptions: {}
      } as any)

      mockValidateTitle.mockReturnValue({
        isValid: false,
        errors: [],
        suggestions: []
      })

      mockAiServiceInstance.generateTitle.mockResolvedValue({
        suggestions: ['feat: add new feature', 'fix: resolve issue'],
        reasoning: 'Test reasoning',
        confidence: 0.8
      })

      mockGithubServiceInstance.getChangedFiles.mockResolvedValue(['src/file.ts'])
      mockGithubServiceInstance.createComment.mockResolvedValue({
        id: 1,
        body: 'comment',
        author: 'bot',
        createdAt: '2024-01-01T00:00:00Z'
      })

      await run()

      expect(mockGithubServiceInstance.createComment).toHaveBeenCalledWith(
        123,
        expect.stringContaining('AI-Powered PR Title Suggestions')
      )
      expect(mockInfo).toHaveBeenCalledWith('💬 Added comment with 2 title suggestions')

      expect(mockConfigManagerInstance.setOutputs).toHaveBeenCalledWith({
        isConventional: false,
        suggestedTitles: ['feat: add new feature', 'fix: resolve issue'],
        originalTitle: 'Add new feature',
        actionTaken: 'commented'
      })
    })

    test('should use custom comment template', async () => {
      mockConfigManagerInstance.parseConfig.mockReturnValue({
        githubToken: 'test-token',
        aiProvider: 'openai',
        apiKey: 'test-key',
        mode: 'suggest',
        skipIfConventional: false,
        validationOptions: {},
        commentTemplate: 'Custom template: ${currentTitle} -> ${suggestions}'
      } as any)

      mockValidateTitle.mockReturnValue({
        isValid: false,
        errors: [],
        suggestions: []
      })

      mockAiServiceInstance.generateTitle.mockResolvedValue({
        suggestions: ['feat: add new feature'],
        reasoning: 'Test reasoning',
        confidence: 0.8
      })

      mockGithubServiceInstance.getChangedFiles.mockResolvedValue([])
      mockGithubServiceInstance.createComment.mockResolvedValue({
        id: 1,
        body: 'comment',
        author: 'bot',
        createdAt: '2024-01-01T00:00:00Z'
      })

      await run()

      expect(mockGithubServiceInstance.createComment).toHaveBeenCalledWith(
        123,
        'Custom template: Add new feature -> 1. feat: add new feature'
      )
    })

    test('should handle comment creation failure', async () => {
      mockConfigManagerInstance.parseConfig.mockReturnValue({
        githubToken: 'test-token',
        aiProvider: 'openai',
        apiKey: 'test-key',
        mode: 'suggest',
        skipIfConventional: false,
        validationOptions: {}
      } as any)

      mockValidateTitle.mockReturnValue({
        isValid: false,
        errors: [],
        suggestions: []
      })

      mockAiServiceInstance.generateTitle.mockResolvedValue({
        suggestions: ['feat: add new feature'],
        reasoning: 'Test reasoning',
        confidence: 0.8
      })

      mockGithubServiceInstance.getChangedFiles.mockResolvedValue([])
      mockGithubServiceInstance.createComment.mockRejectedValue(new Error('Comment failed'))

      await run()

      expect(mockWarning).toHaveBeenCalledWith('Failed to create comment: Comment failed')
      expect(mockConfigManagerInstance.setOutputs).toHaveBeenCalledWith({
        isConventional: false,
        suggestedTitles: ['feat: add new feature'],
        originalTitle: 'Add new feature',
        actionTaken: 'error',
        errorMessage: 'Failed to create comment: Comment failed'
      })
    })
  })

  describe('AI Service Integration', () => {
    test('should handle no suggestions generated', async () => {
      mockConfigManagerInstance.parseConfig.mockReturnValue({
        githubToken: 'test-token',
        aiProvider: 'openai',
        apiKey: 'test-key',
        mode: 'suggest',
        skipIfConventional: false,
        validationOptions: {}
      } as any)

      mockValidateTitle.mockReturnValue({
        isValid: false,
        errors: [],
        suggestions: []
      })

      mockAiServiceInstance.generateTitle.mockResolvedValue({
        suggestions: [],
        reasoning: 'No suggestions could be generated',
        confidence: 0.0
      })

      mockGithubServiceInstance.getChangedFiles.mockResolvedValue([])

      await run()

      expect(mockWarning).toHaveBeenCalledWith('No title suggestions generated')
      expect(mockConfigManagerInstance.setOutputs).toHaveBeenCalledWith({
        isConventional: false,
        suggestedTitles: [],
        originalTitle: 'Add new feature',
        actionTaken: 'error',
        errorMessage: 'No title suggestions could be generated'
      })
    })

    test('should limit changed files to avoid token limits', async () => {
      mockConfigManagerInstance.parseConfig.mockReturnValue({
        githubToken: 'test-token',
        aiProvider: 'openai',
        apiKey: 'test-key',
        mode: 'suggest',
        skipIfConventional: false,
        validationOptions: {}
      } as any)

      mockValidateTitle.mockReturnValue({
        isValid: false,
        errors: [],
        suggestions: []
      })

      mockAiServiceInstance.generateTitle.mockResolvedValue({
        suggestions: ['feat: add new feature'],
        reasoning: 'Test reasoning',
        confidence: 0.8
      })

      // Simulate many changed files
      const manyFiles = Array.from({ length: 30 }, (_, i) => `src/file${i}.ts`)
      mockGithubServiceInstance.getChangedFiles.mockResolvedValue(manyFiles)
      mockGithubServiceInstance.createComment.mockResolvedValue({
        id: 1,
        body: 'comment',
        author: 'bot',
        createdAt: '2024-01-01T00:00:00Z'
      })

      await run()

      expect(mockAiServiceInstance.generateTitle).toHaveBeenCalledWith(
        expect.objectContaining({
          changedFiles: manyFiles.slice(0, 20), // Should be limited to 20 files
          originalTitle: 'Add new feature'
        })
      )
    })

    test('should handle get changed files failure gracefully', async () => {
      mockConfigManagerInstance.parseConfig.mockReturnValue({
        githubToken: 'test-token',
        aiProvider: 'openai',
        apiKey: 'test-key',
        mode: 'suggest',
        skipIfConventional: false,
        validationOptions: {}
      } as any)

      mockValidateTitle.mockReturnValue({
        isValid: false,
        errors: [],
        suggestions: []
      })

      mockAiServiceInstance.generateTitle.mockResolvedValue({
        suggestions: ['feat: add new feature'],
        reasoning: 'Test reasoning',
        confidence: 0.8
      })

      mockGithubServiceInstance.getChangedFiles.mockRejectedValue(new Error('Files fetch failed'))
      mockGithubServiceInstance.createComment.mockResolvedValue({
        id: 1,
        body: 'comment',
        author: 'bot',
        createdAt: '2024-01-01T00:00:00Z'
      })

      await run()

      expect(mockWarning).toHaveBeenCalledWith('Failed to get changed files: Files fetch failed')
      expect(mockAiServiceInstance.generateTitle).toHaveBeenCalledWith(
        expect.objectContaining({
          changedFiles: [], // Should fallback to empty array
          originalTitle: 'Add new feature'
        })
      )
    })
  })

  describe('Error Handling', () => {
    test('should handle unexpected errors gracefully', async () => {
      mockConfigManagerInstance.parseConfig.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      await run()

      expect(mockSetFailed).toHaveBeenCalledWith('❌ Action failed: Unexpected error')
    })

    test('should handle errors when setting outputs fails', async () => {
      mockConfigManagerInstance.parseConfig.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      // Mock setOutputs to also fail
      mockConfigManagerInstance.setOutputs.mockImplementation(() => {
        throw new Error('Output setting failed')
      })

      await run()

      expect(mockSetFailed).toHaveBeenCalledWith('❌ Action failed: Unexpected error')
      // Should not throw additional errors
    })
  })

  describe('Draft PR Handling', () => {
    test('should process draft PRs', async () => {
      Object.defineProperty(context, 'payload', { 
        value: {
          pull_request: {
            number: 123,
            title: 'Add new feature',
            draft: true
          }
        }, 
        configurable: true 
      })

      mockConfigManagerInstance.parseConfig.mockReturnValue({
        githubToken: 'test-token',
        aiProvider: 'openai',
        apiKey: 'test-key',
        mode: 'suggest',
        skipIfConventional: false,
        validationOptions: {}
      } as any)

      mockValidateTitle.mockReturnValue({
        isValid: false,
        errors: [],
        suggestions: []
      })

      mockAiServiceInstance.generateTitle.mockResolvedValue({
        suggestions: ['feat: add new feature'],
        reasoning: 'Test reasoning',
        confidence: 0.8
      })

      mockGithubServiceInstance.getChangedFiles.mockResolvedValue([])
      mockGithubServiceInstance.createComment.mockResolvedValue({
        id: 1,
        body: 'comment',
        author: 'bot',
        createdAt: '2024-01-01T00:00:00Z'
      })

      await run()

      expect(mockDebug).toHaveBeenCalledWith('PR is draft: true')
      expect(mockAiServiceInstance.generateTitle).toHaveBeenCalledWith(
        expect.objectContaining({
          originalTitle: 'Add new feature'
        })
      )
    })
  })
})