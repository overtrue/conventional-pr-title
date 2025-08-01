/**
 * Validation and pre-checks
 * Handles environment validation and permission checks
 */

import { info, warning } from '@actions/core'
import { context } from '@actions/github'
import { ActionConfig } from './config'
import { OctokitGitHubService } from './github-service'

export interface ValidationResult {
  shouldSkip: boolean
  reason?: string
}

export class EnvironmentValidator {
  static validateGitHubContext(): ValidationResult {
    // Prevent infinite loops: Skip if triggered by bot itself
    if (
      context.actor === 'github-actions[bot]' ||
      context.payload?.sender?.type === 'Bot'
    ) {
      return {
        shouldSkip: true,
        reason: 'Action was triggered by a bot to prevent infinite loops'
      }
    }

    // Validate that this is a pull request event
    if (
      context.eventName !== 'pull_request' &&
      context.eventName !== 'pull_request_target'
    ) {
      throw new Error(
        `This action only supports pull_request and pull_request_target events, got: ${context.eventName}`
      )
    }

    // Validate PR payload
    if (!context.payload.pull_request) {
      throw new Error('Pull request information not found in event payload')
    }

    return { shouldSkip: false }
  }

  static async validatePermissions(
    config: ActionConfig,
    githubService: OctokitGitHubService
  ): Promise<ActionConfig> {
    if (config.mode === 'auto') {
      const hasPermission = await githubService.checkPermissions()
      if (!hasPermission) {
        warning(
          'Insufficient permissions to update PR title automatically. Falling back to suggestion mode.'
        )
        return { ...config, mode: 'suggest' }
      }
    }
    return config
  }
}