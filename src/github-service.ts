import { getOctokit } from '@actions/github'
import { context } from '@actions/github'

export interface GitHubConfig {
  token: string
  owner?: string
  repo?: string
}

export interface PRInfo {
  number: number
  title: string
  body: string | null
  author: string
  headRef: string
  baseRef: string
  changedFiles?: string[]
  labels: string[]
  isDraft: boolean
}

export interface PRComment {
  id: number
  body: string
  author: string
  createdAt: string
}

export interface GitHubService {
  getPRInfo(prNumber: number): Promise<PRInfo>
  updatePRTitle(prNumber: number, newTitle: string): Promise<void>
  createComment(prNumber: number, body: string): Promise<PRComment>
  getChangedFiles(prNumber: number): Promise<string[]>
  checkPermissions(): Promise<boolean>
}

export class OctokitGitHubService implements GitHubService {
  private _octokit: ReturnType<typeof getOctokit>
  private owner: string
  private repo: string

  // Public getter for octokit instance
  get octokit() {
    return this._octokit
  }

  constructor(config: GitHubConfig) {
    this._octokit = getOctokit(config.token)

    // Use provided owner/repo or get from context
    this.owner = config.owner !== undefined ? config.owner : context.repo.owner
    this.repo = config.repo !== undefined ? config.repo : context.repo.repo

    if (!this.owner || !this.repo || this.owner === '' || this.repo === '') {
      throw new Error(
        'GitHub repository owner and name must be provided or available in context'
      )
    }
  }

  async getPRInfo(prNumber: number): Promise<PRInfo> {
    try {
      const { data: pr } = await this._octokit.rest.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      })

      return {
        number: pr.number,
        title: pr.title,
        body: pr.body,
        author: pr.user?.login || 'unknown',
        headRef: pr.head.ref,
        baseRef: pr.base.ref,
        labels: pr.labels.map(label =>
          typeof label === 'string' ? label : label.name || ''
        ),
        isDraft: pr.draft || false
      }
    } catch (error) {
      throw new Error(
        `Failed to get PR info: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async updatePRTitle(prNumber: number, newTitle: string): Promise<void> {
    try {
      await this._octokit.rest.pulls.update({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        title: newTitle
      })
    } catch (error) {
      throw new Error(
        `Failed to update PR title: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async createComment(prNumber: number, body: string): Promise<PRComment> {
    try {
      const { data: comment } = await this._octokit.rest.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: prNumber,
        body
      })

      return {
        id: comment.id,
        body: comment.body || '',
        author: comment.user?.login || 'unknown',
        createdAt: comment.created_at
      }
    } catch (error) {
      throw new Error(
        `Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getChangedFiles(prNumber: number): Promise<string[]> {
    try {
      const { data: files } = await this._octokit.rest.pulls.listFiles({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      })

      return files.map(file => file.filename)
    } catch (error) {
      throw new Error(
        `Failed to get changed files: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      // Try to get repository info to check read permissions
      await this._octokit.rest.repos.get({
        owner: this.owner,
        repo: this.repo
      })

      // Try to check if we have write permissions by getting the current user's permission level
      const { data: permission } =
        await this._octokit.rest.repos.getCollaboratorPermissionLevel({
          owner: this.owner,
          repo: this.repo,
          username: await this.getCurrentUser()
        })

      return ['admin', 'write'].includes(permission.permission)
    } catch (error) {
      console.warn('Permission check failed:', error)
      return false
    }
  }

  private async getCurrentUser(): Promise<string> {
    try {
      const { data: user } = await this._octokit.rest.users.getAuthenticated()
      return user.login
    } catch (error) {
      throw new Error(
        `Failed to get current user: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

// Utility functions for common operations
export async function createGitHubService(
  token?: string
): Promise<GitHubService> {
  const githubToken = token || process.env.GITHUB_TOKEN

  if (!githubToken) {
    throw new Error(
      'GitHub token is required. Set GITHUB_TOKEN environment variable or provide token parameter.'
    )
  }

  return new OctokitGitHubService({ token: githubToken })
}

export async function getPRInfoFromContext(): Promise<PRInfo | null> {
  if (
    context.eventName !== 'pull_request' &&
    context.eventName !== 'pull_request_target'
  ) {
    return null
  }

  const prNumber = context.payload.pull_request?.number
  if (!prNumber) {
    return null
  }

  const service = await createGitHubService()
  return service.getPRInfo(prNumber)
}

// Utility function to format comment body with mentions
export function formatCommentWithMention(
  author: string,
  suggestions: string[],
  reasoning: string
): string {
  const suggestionsList = suggestions
    .map((suggestion, index) => `${index + 1}. \`${suggestion}\``)
    .join('\n')

  return `Hi @${author}! 👋

I noticed your PR title doesn't follow the [Conventional Commits](https://www.conventionalcommits.org/) standard. Here are some suggestions:

${suggestionsList}

**Reasoning:** ${reasoning}

Would you like me to update the title automatically, or would you prefer to update it yourself?

---
*This comment was generated by the Conventional PR Title Action*`
}

// Retry wrapper for GitHub API calls
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on authentication or permission errors
      if (
        lastError.message.includes('401') ||
        lastError.message.includes('403')
      ) {
        throw lastError
      }

      if (attempt === maxRetries) {
        throw new Error(
          `Operation failed after ${maxRetries} attempts: ${lastError.message}`
        )
      }

      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, delayMs * Math.pow(2, attempt - 1))
      )
    }
  }

  throw lastError!
}
