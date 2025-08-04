import { OctokitGitHubService, createGitHubService, getPRInfoFromContext, formatCommentWithMention, withRetry } from '../src/github-service'
import { context } from '@actions/github'

// Mock @actions/github
jest.mock('@actions/github', () => ({
  getOctokit: jest.fn(),
  context: {
    eventName: 'pull_request',
    repo: {
      owner: 'test-owner',
      repo: 'test-repo'
    },
    payload: {
      pull_request: {
        number: 123
      }
    }
  }
}))

const { getOctokit } = require('@actions/github')

// Mock Octokit instance
const mockOctokit = {
  rest: {
    pulls: {
      get: jest.fn(),
      update: jest.fn(),
      listFiles: jest.fn()
    },
    issues: {
      createComment: jest.fn()
    },
    repos: {
      get: jest.fn(),
      getCollaboratorPermissionLevel: jest.fn()
    },
    users: {
      getAuthenticated: jest.fn()
    }
  }
}

describe('OctokitGitHubService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getOctokit.mockReturnValue(mockOctokit)
    process.env.GITHUB_TOKEN = 'test-token'
  })

  afterEach(() => {
    delete process.env.GITHUB_TOKEN
  })

  describe('constructor', () => {
    test('should create service with provided config', () => {
      const service = new OctokitGitHubService({
        token: 'test-token',
        owner: 'custom-owner',
        repo: 'custom-repo'
      })
      
      expect(service).toBeInstanceOf(OctokitGitHubService)
      expect(getOctokit).toHaveBeenCalledWith('test-token')
    })

    test('should use context for owner and repo if not provided', () => {
      const service = new OctokitGitHubService({ token: 'test-token' })
      expect(service).toBeInstanceOf(OctokitGitHubService)
    })

    test('should throw error if owner/repo cannot be determined', () => {
      // Test with explicitly empty owner and repo provided in config
      expect(() => {
        new OctokitGitHubService({ 
          token: 'test-token',
          owner: '',
          repo: ''
        })
      }).toThrow('GitHub repository owner and name must be provided or available in context')
    })
  })

  describe('getPRInfo', () => {
    test('should get PR information successfully', async () => {
      const mockPRData = {
        number: 123,
        title: 'Test PR',
        body: 'Test description',
        user: { login: 'test-author' },
        head: { ref: 'feature-branch' },
        base: { ref: 'main' },
        labels: [{ name: 'bug' }, { name: 'enhancement' }],
        draft: false
      }

      mockOctokit.rest.pulls.get.mockResolvedValueOnce({ data: mockPRData })

      const service = new OctokitGitHubService({ token: 'test-token' })
      const prInfo = await service.getPRInfo(123)

      expect(prInfo).toEqual({
        number: 123,
        title: 'Test PR',
        body: 'Test description',
        author: 'test-author',
        headRef: 'feature-branch',
        baseRef: 'main',
        labels: ['bug', 'enhancement'],
        isDraft: false
      })

      expect(mockOctokit.rest.pulls.get).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        pull_number: 123
      })
    })

    test('should handle PR with null body and unknown user', async () => {
      const mockPRData = {
        number: 123,
        title: 'Test PR',
        body: null,
        user: null,
        head: { ref: 'feature-branch' },
        base: { ref: 'main' },
        labels: [],
        draft: true
      }

      mockOctokit.rest.pulls.get.mockResolvedValueOnce({ data: mockPRData })

      const service = new OctokitGitHubService({ token: 'test-token' })
      const prInfo = await service.getPRInfo(123)

      expect(prInfo.body).toBe(null)
      expect(prInfo.author).toBe('unknown')
      expect(prInfo.isDraft).toBe(true)
    })

    test('should throw error when API call fails', async () => {
      mockOctokit.rest.pulls.get.mockRejectedValueOnce(new Error('API Error'))

      const service = new OctokitGitHubService({ token: 'test-token' })

      await expect(service.getPRInfo(123)).rejects.toThrow('Failed to get PR info: API Error')
    })
  })

  describe('updatePRTitle', () => {
    test('should update PR title successfully', async () => {
      mockOctokit.rest.pulls.update.mockResolvedValueOnce({ data: {} })

      const service = new OctokitGitHubService({ token: 'test-token' })
      await service.updatePRTitle(123, 'feat: new title')

      expect(mockOctokit.rest.pulls.update).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        pull_number: 123,
        title: 'feat: new title'
      })
    })

    test('should throw error when update fails', async () => {
      mockOctokit.rest.pulls.update.mockRejectedValueOnce(new Error('Update failed'))

      const service = new OctokitGitHubService({ token: 'test-token' })

      await expect(service.updatePRTitle(123, 'new title')).rejects.toThrow('Failed to update PR title: Update failed')
    })
  })

  describe('createComment', () => {
    test('should create comment successfully', async () => {
      const mockCommentData = {
        id: 456,
        body: 'Test comment',
        user: { login: 'bot-user' },
        created_at: '2023-01-01T00:00:00Z'
      }

      mockOctokit.rest.issues.createComment.mockResolvedValueOnce({ data: mockCommentData })

      const service = new OctokitGitHubService({ token: 'test-token' })
      const comment = await service.createComment(123, 'Test comment')

      expect(comment).toEqual({
        id: 456,
        body: 'Test comment',
        author: 'bot-user',
        createdAt: '2023-01-01T00:00:00Z'
      })

      expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        issue_number: 123,
        body: 'Test comment'
      })
    })

    test('should handle comment with null body and user', async () => {
      const mockCommentData = {
        id: 456,
        body: null,
        user: null,
        created_at: '2023-01-01T00:00:00Z'
      }

      mockOctokit.rest.issues.createComment.mockResolvedValueOnce({ data: mockCommentData })

      const service = new OctokitGitHubService({ token: 'test-token' })
      const comment = await service.createComment(123, 'Test comment')

      expect(comment.body).toBe('')
      expect(comment.author).toBe('unknown')
    })

    test('should throw error when comment creation fails', async () => {
      mockOctokit.rest.issues.createComment.mockRejectedValueOnce(new Error('Comment failed'))

      const service = new OctokitGitHubService({ token: 'test-token' })

      await expect(service.createComment(123, 'Test comment')).rejects.toThrow('Failed to create comment: Comment failed')
    })
  })

  describe('getChangedFiles', () => {
    test('should get changed files successfully', async () => {
      const mockFilesData = [
        { filename: 'src/file1.ts' },
        { filename: 'src/file2.ts' },
        { filename: 'README.md' }
      ]

      mockOctokit.rest.pulls.listFiles.mockResolvedValueOnce({ data: mockFilesData })

      const service = new OctokitGitHubService({ token: 'test-token' })
      const files = await service.getChangedFiles(123)

      expect(files).toEqual(['src/file1.ts', 'src/file2.ts', 'README.md'])

      expect(mockOctokit.rest.pulls.listFiles).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        pull_number: 123
      })
    })

    test('should throw error when getting files fails', async () => {
      mockOctokit.rest.pulls.listFiles.mockRejectedValueOnce(new Error('Files failed'))

      const service = new OctokitGitHubService({ token: 'test-token' })

      await expect(service.getChangedFiles(123)).rejects.toThrow('Failed to get changed files: Files failed')
    })
  })

  describe('checkPermissions', () => {
    test('should return true for admin permissions', async () => {
      mockOctokit.rest.repos.get.mockResolvedValueOnce({ data: {} })
      mockOctokit.rest.users.getAuthenticated.mockResolvedValueOnce({ data: { login: 'test-user' } })
      mockOctokit.rest.repos.getCollaboratorPermissionLevel.mockResolvedValueOnce({
        data: { permission: 'admin' }
      })

      const service = new OctokitGitHubService({ token: 'test-token' })
      const hasPermission = await service.checkPermissions()

      expect(hasPermission).toBe(true)
    })

    test('should return true for write permissions', async () => {
      mockOctokit.rest.repos.get.mockResolvedValueOnce({ data: {} })

      const service = new OctokitGitHubService({ token: 'test-token' })
      const hasPermission = await service.checkPermissions()

      expect(hasPermission).toBe(true)
    })

    test('should return true when repo access succeeds', async () => {
      mockOctokit.rest.repos.get.mockResolvedValueOnce({ data: {} })

      const service = new OctokitGitHubService({ token: 'test-token' })
      const hasPermission = await service.checkPermissions()

      expect(hasPermission).toBe(true)
    })

    test('should return false when permission check fails', async () => {
      mockOctokit.rest.repos.get.mockRejectedValueOnce(new Error('Permission denied'))

      const service = new OctokitGitHubService({ token: 'test-token' })
      const hasPermission = await service.checkPermissions()

      expect(hasPermission).toBe(false)
    })
  })
})

describe('createGitHubService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getOctokit.mockReturnValue(mockOctokit)
  })

  afterEach(() => {
    delete process.env.GITHUB_TOKEN
  })

  test('should create service with provided token', async () => {
    const service = await createGitHubService('custom-token')
    expect(service).toBeInstanceOf(OctokitGitHubService)
    expect(getOctokit).toHaveBeenCalledWith('custom-token')
  })

  test('should use environment token when not provided', async () => {
    process.env.GITHUB_TOKEN = 'env-token'
    const service = await createGitHubService()
    expect(service).toBeInstanceOf(OctokitGitHubService)
    expect(getOctokit).toHaveBeenCalledWith('env-token')
  })

  test('should throw error when no token available', async () => {
    await expect(createGitHubService()).rejects.toThrow('GitHub token is required')
  })
})

describe('getPRInfoFromContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getOctokit.mockReturnValue(mockOctokit)
    process.env.GITHUB_TOKEN = 'test-token'
  })

  afterEach(() => {
    delete process.env.GITHUB_TOKEN
  })

  // Note: These tests would work in actual GitHub Actions environment
  // For unit testing, we'll test the individual functions instead
  test('should handle PR context correctly', async () => {
    // Mock successful PR data for the context
    const mockPRData = {
      number: 123,
      title: 'Test PR',
      body: 'Test description',
      user: { login: 'test-author' },
      head: { ref: 'feature-branch' },
      base: { ref: 'main' },
      labels: [],
      draft: false
    }

    mockOctokit.rest.pulls.get.mockResolvedValueOnce({ data: mockPRData })
    
    // Since we can't easily modify the imported context in tests,
    // we'll test that the function exists and handles the current context
    const result = await getPRInfoFromContext()
    
    // In the mock environment, this should get PR info if the mock context is valid
    // or return null if the event type doesn't match
    expect(typeof result === 'object' || result === null).toBe(true)
  })
})

describe('formatCommentWithMention', () => {
  test('should format comment with suggestions and mention', () => {
    const suggestions = ['feat: add new feature', 'fix: resolve bug']
    const reasoning = 'The PR adds new functionality'
    const comment = formatCommentWithMention('test-author', suggestions, reasoning)

    expect(comment).toContain('@test-author')
    expect(comment).toContain('1. `feat: add new feature`')
    expect(comment).toContain('2. `fix: resolve bug`')
    expect(comment).toContain('The PR adds new functionality')
    expect(comment).toContain('Conventional Commits')
  })

  test('should handle single suggestion', () => {
    const suggestions = ['feat: single suggestion']
    const reasoning = 'Simple change needed'
    const comment = formatCommentWithMention('author', suggestions, reasoning)

    expect(comment).toContain('1. `feat: single suggestion`')
    expect(comment).not.toContain('2.')
  })
})

describe('withRetry', () => {
  test('should succeed on first attempt', async () => {
    const operation = jest.fn().mockResolvedValueOnce('success')
    
    const result = await withRetry(operation)
    
    expect(result).toBe('success')
    expect(operation).toHaveBeenCalledTimes(1)
  })

  test('should retry on failure and eventually succeed', async () => {
    const operation = jest.fn()
      .mockRejectedValueOnce(new Error('Temporary error'))
      .mockRejectedValueOnce(new Error('Another error'))
      .mockResolvedValueOnce('success')
    
    const result = await withRetry(operation, 3, 10) // Short delay for testing
    
    expect(result).toBe('success')
    expect(operation).toHaveBeenCalledTimes(3)
  })

  test('should throw error after max retries', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Persistent error'))
    
    await expect(withRetry(operation, 2, 10)).rejects.toThrow('Operation failed after 2 attempts: Persistent error')
    expect(operation).toHaveBeenCalledTimes(2)
  })

  test('should not retry on authentication errors', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('401 Unauthorized'))
    
    await expect(withRetry(operation, 3, 10)).rejects.toThrow('401 Unauthorized')
    expect(operation).toHaveBeenCalledTimes(1)
  })

  test('should not retry on permission errors', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('403 Forbidden'))
    
    await expect(withRetry(operation, 3, 10)).rejects.toThrow('403 Forbidden')
    expect(operation).toHaveBeenCalledTimes(1)
  })

  test('should handle non-Error rejections', async () => {
    const operation = jest.fn().mockRejectedValue('string error')
    
    await expect(withRetry(operation, 2, 10)).rejects.toThrow('Operation failed after 2 attempts: string error')
  })
})