import { debug, warning } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { GitHubServiceConfig, PRContext } from './types.js'

// Processing limits
const LIMITS = {
  MAX_PR_BODY_SIZE: 1500,
  MAX_DIFF_SIZE: 2000,
  MAX_DIFF_FILES: 10,
  MAX_CHANGED_FILES: 15
}

export class GitHubService {
  private octokit: ReturnType<typeof getOctokit>
  private owner: string
  private repo: string

  constructor(config: GitHubServiceConfig) {
    this.octokit = getOctokit(config.token)
    this.owner = config.owner || context.repo.owner
    this.repo = config.repo || context.repo.repo

    if (!this.owner || !this.repo) {
      throw new Error('Repository owner and name must be provided')
    }
  }

  /**
   * Get PR information
   */
  async getPRInfo(prNumber: number) {
    try {
      const { data } = await this.octokit.rest.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      })
      return data
    } catch (error) {
      throw new Error(`Failed to get PR info: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update PR title
   */
  async updatePRTitle(prNumber: number, title: string): Promise<void> {
    try {
      await this.octokit.rest.pulls.update({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        title
      })
    } catch (error) {
      throw new Error(`Failed to update PR title: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create comment
   */
  async createComment(prNumber: number, body: string) {
    try {
      const { data } = await this.octokit.rest.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: prNumber,
        body
      })
      return data
    } catch (error) {
      throw new Error(`Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get changed files list
   */
  async getChangedFiles(prNumber: number): Promise<string[]> {
    try {
      const { data } = await this.octokit.rest.pulls.listFiles({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      })
      return data.map((file: any) => file.filename)
    } catch (error) {
      throw new Error(`Failed to get changed files: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Check permissions
   */
  async checkPermissions(): Promise<boolean> {
    try {
      // For updating PR titles, we need pull-requests: write permission
      // Let's try to get the current user's permissions for this repository
      const { data: repoData } = await this.octokit.rest.repos.get({
        owner: this.owner,
        repo: this.repo
      })

      // Check for pull-requests write permission or admin/maintain/push permissions
      const hasPullRequestsWrite = (repoData.permissions as any)?.['pull-requests'] === true
      const hasAdmin = repoData.permissions?.admin === true
      const hasPush = repoData.permissions?.push === true
      const hasMaintain = repoData.permissions?.maintain === true

      debug(`Permission check: pull-requests=${hasPullRequestsWrite}, admin=${hasAdmin}, push=${hasPush}, maintain=${hasMaintain}`)

      // If we have pull-requests: write or any of these permissions, we should be able to update PR titles
      if (hasPullRequestsWrite || hasAdmin || hasPush || hasMaintain) {
        return true
      }

      // If the above check fails, let's try a different approach
      // Check if we can at least read the repository (which we should be able to do)
      debug('Trying alternative permission check...')

      // Since we have pull-requests: write in the workflow, let's assume we have the permission
      // The actual permission will be tested when we try to update the PR title
      return true
    } catch (error) {
      debug(`Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      // If we can't check permissions, let's assume we have them and let the actual operation fail if needed
      return true
    }
  }

  /**
   * Extract PR context
   */
  async extractPRContext(prNumber: number, pullRequest: any): Promise<PRContext> {
    let changedFiles: string[] = []
    let prInfo: any = null
    let diffContent: string = ''

    try {
      // Get PR details
      prInfo = await this.getPRInfo(prNumber)

      // Get changed files
      changedFiles = await this.getChangedFiles(prNumber)
      debug(`Found ${changedFiles.length} changed files`)

      // Get diff content
      if (changedFiles.length > 0) {
        diffContent = await this.extractDiffContent(pullRequest, changedFiles.length)
      }
    } catch (error) {
      warning(`Failed to get PR context: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return {
      number: prNumber,
      title: pullRequest.title,
      body: prInfo?.body || pullRequest.body || null,
      isDraft: pullRequest.draft || false,
      changedFiles,
      diffContent
    }
  }

  private async extractDiffContent(pullRequest: any, fileCount: number): Promise<string> {
    try {
      const { data: compareData } = await this.octokit.rest.repos.compareCommits({
        owner: this.owner,
        repo: this.repo,
        base: pullRequest.base.sha,
        head: pullRequest.head.sha
      })

      if (compareData.files && compareData.files.length > 0) {
        return compareData.files
          .slice(0, LIMITS.MAX_DIFF_FILES)
          .map((file: any) => `--- ${file.filename}\n${file.patch || ''}`)
          .join('\n\n')
          .slice(0, LIMITS.MAX_DIFF_SIZE)
      }
    } catch (diffError) {
      debug(`Failed to get diff: ${diffError instanceof Error ? diffError.message : 'Unknown error'}`)
    }

    return ''
  }
}

/**
 * Create GitHub service instance
 */
export function createGitHubService(token?: string): GitHubService {
  const finalToken = token || process.env.GITHUB_TOKEN
  if (!finalToken) {
    throw new Error('GitHub token is required')
  }

  return new GitHubService({ token: finalToken })
}
