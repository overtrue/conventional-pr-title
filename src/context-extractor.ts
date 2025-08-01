/**
 * Context extraction utilities
 * Handles gathering PR context information from GitHub API
 */

import { context } from '@actions/github'
import { warning } from '@actions/core'
import { OctokitGitHubService } from './github-service'
import { Logger } from './utils'
import { PRContext } from './pr-processor'
import { PROCESSING_LIMITS } from './constants'

export class PRContextExtractor {
  constructor(private readonly githubService: OctokitGitHubService) {}

  async extractContext(prNumber: number, pullRequest: any): Promise<PRContext> {
    let changedFiles: string[] = []
    let prInfo: any = null
    let diffContent: string = ''

    try {
      // Get PR details
      prInfo = await this.githubService.getPRInfo(prNumber)
      
      // Get changed files
      changedFiles = await this.githubService.getChangedFiles(prNumber)
      Logger.debug(`Found ${changedFiles.length} changed files`)

      // Get diff content if there are changed files
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
      const { data: compareData } = await this.githubService.octokit.rest.repos.compareCommits({
        owner: context.repo.owner,
        repo: context.repo.repo,
        base: pullRequest.base.sha,
        head: pullRequest.head.sha
      })

      if (compareData.files && compareData.files.length > 0) {
        return compareData.files
          .slice(0, PROCESSING_LIMITS.MAX_DIFF_FILES)
          .map(file => `--- ${file.filename}\n${file.patch || ''}`)
          .join('\n\n')
          .slice(0, PROCESSING_LIMITS.MAX_DIFF_SIZE)
      }
    } catch (diffError) {
      Logger.debug(`Failed to get diff: ${diffError instanceof Error ? diffError.message : 'Unknown error'}`)
    }

    return ''
  }
}