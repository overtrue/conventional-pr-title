import { generateText } from 'ai'
import { ConfigManager } from '../src/config'
import { GitHubService } from '../src/github'
import { PRProcessor } from '../src/processor'

// Mock dependencies
jest.mock('ai', () => ({
  generateText: jest.fn()
}))

jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  getBooleanInput: jest.fn(),
  setFailed: jest.fn(),
  setOutput: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  debug: jest.fn()
}))

jest.mock('@actions/github', () => ({
  context: {
    repo: { owner: 'test-owner', repo: 'test-repo' }
  },
  getOctokit: jest.fn()
}))

jest.mock('fs', () => ({
  readFileSync: jest.fn()
}))

jest.mock('../src/utils', () => ({
  processTemplate: jest.fn((template, vars) => template),
  validateTitle: jest.fn((title) => ({
    isValid: title.includes(':'),
    errors: [],
    suggestions: [],
    parsed: null
  })),
  DEFAULT_OPTIONS: {
    allowedTypes: ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
    requireScope: false,
    maxLength: 72,
    minDescriptionLength: 3
  }
}))

const mockGenerateText = generateText as jest.MockedFunction<typeof generateText>

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock file system
    const fs = require('fs')
    fs.readFileSync.mockReturnValue('Mock template content')

    // Mock @actions/core inputs
    const core = require('@actions/core')
    core.getInput.mockImplementation((name: string) => {
      const defaults: Record<string, string> = {
        'github-token': 'test-token',
        'model': 'openai',
        'mode': 'suggest'
      }
      return defaults[name] || ''
    })
    core.getBooleanInput.mockReturnValue(false)

    // AI SDK v5 handles API keys automatically

    // Mock GitHub service
    const { getOctokit } = require('@actions/github')
    getOctokit.mockReturnValue({
      rest: {
        pulls: {
          get: jest.fn().mockResolvedValue({ data: { body: 'Test PR body' } }),
          listFiles: jest.fn().mockResolvedValue({ data: [] }),
          update: jest.fn().mockResolvedValue({}),
        },
        repos: {
          get: jest.fn().mockResolvedValue({
            data: { permissions: { push: true } }
          }),
          compareCommits: jest.fn().mockResolvedValue({ data: { files: [] } })
        },
        issues: {
          createComment: jest.fn().mockResolvedValue({ data: { id: 1 } })
        }
      }
    })
  })

  it('should process a non-conventional PR title and generate suggestions', async () => {
    // Mock AI response
    mockGenerateText.mockResolvedValue({
      text: JSON.stringify({
        suggestions: ['feat: add new feature', 'feat(ui): add new feature'],
        reasoning: 'The title should follow conventional commits format',
        confidence: 0.9
      })
    } as any)

    // Create services
    const configManager = new ConfigManager()
    const config = configManager.parseConfig()
    const githubService = new GitHubService({ token: 'test-token' })
    const processor = new PRProcessor(config, githubService)

    // Mock PR context
    const prContext = {
      number: 123,
      title: 'Add new feature',
      body: 'This PR adds a new feature',
      isDraft: false,
      changedFiles: ['src/feature.ts'],
      diffContent: 'diff content'
    }

    // Process the PR
    const result = await processor.process(prContext)

    expect(result.isConventional).toBe(false)
    expect(result.suggestions).toEqual(['feat: add new feature', 'feat(ui): add new feature'])
    expect(result.actionTaken).toBe('commented')
    expect(mockGenerateText).toHaveBeenCalled()
  })

  it('should skip processing if title is already conventional', async () => {
    const configManager = new ConfigManager()
    const config = configManager.parseConfig()
    config.skipIfConventional = true

    const githubService = new GitHubService({ token: 'test-token' })
    const processor = new PRProcessor(config, githubService)

    const prContext = {
      number: 123,
      title: 'feat: add new feature',
      body: 'This PR adds a new feature',
      isDraft: false,
      changedFiles: ['src/feature.ts'],
      diffContent: 'diff content'
    }

    const result = await processor.process(prContext)

    expect(result.isConventional).toBe(true)
    expect(result.actionTaken).toBe('skipped')
    expect(mockGenerateText).not.toHaveBeenCalled()
  })
})
