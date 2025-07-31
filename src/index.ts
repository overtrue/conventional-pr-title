import { setFailed, info, warning, debug } from '@actions/core'
import { context } from '@actions/github'
import {
  ActionConfigManager,
  ConfigurationError,
  createAIServiceConfig,
  shouldSkipProcessing,
  isAutoMode,
  isSuggestionMode,
  ActionResult
} from './config'
import { validateTitle } from './conventional'
import { VercelAIService } from './ai-service'
import { OctokitGitHubService } from './github-service'

/**
 * Main entry point for the GitHub Action
 */
async function run(): Promise<void> {
  try {
    debug(`Action triggered by: ${context.eventName}`)
    debug(`Repository: ${context.repo.owner}/${context.repo.repo}`)
    debug(`Triggered by actor: ${context.actor}`)

    // Prevent infinite loops: Skip if triggered by bot itself
    if (context.actor === 'github-actions[bot]' || context.payload?.sender?.type === 'Bot') {
      info('Skipping processing: Action was triggered by a bot to prevent infinite loops')
      const configManager = new ActionConfigManager()
      configManager.setOutputs({
        isConventional: true,
        suggestedTitles: [],
        originalTitle: context.payload.pull_request?.title || 'Unknown',
        actionTaken: 'skipped'
      })
      return
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

    // Get PR information from context
    const pullRequest = context.payload.pull_request
    if (!pullRequest) {
      throw new Error('Pull request information not found in event payload')
    }

    const prNumber = pullRequest.number
    const currentTitle = pullRequest.title
    const isDraft = pullRequest.draft || false

    info(`Processing PR #${prNumber}: "${currentTitle}"`)
    debug(`PR is draft: ${isDraft}`)

    // Initialize configuration
    const configManager = new ActionConfigManager()
    const config = configManager.parseConfig()

    debug(`Configuration loaded:`)
    debug(`- AI Provider: ${config.aiProvider}`)
    debug(`- Model: ${config.model || 'default'}`)
    debug(`- Mode: ${config.mode}`)
    debug(`- Skip if conventional: ${config.skipIfConventional}`)

    // Validate current title against conventional commits
    const validationResult = validateTitle(
      currentTitle,
      config.validationOptions
    )
    const isConventional = validationResult.isValid

    info(
      `Current title is ${isConventional ? 'conventional' : 'not conventional'}`
    )

    if (validationResult.errors.length > 0) {
      debug(`Validation errors: ${validationResult.errors.join(', ')}`)
    }

    // Check if we should skip processing
    if (shouldSkipProcessing(config, isConventional)) {
      info(
        'Skipping processing: title is already conventional and skip-if-conventional is enabled'
      )

      configManager.setOutputs({
        isConventional: true,
        suggestedTitles: [],
        originalTitle: currentTitle,
        actionTaken: 'skipped'
      })
      return
    }

    // Initialize services
    const aiService = new VercelAIService(createAIServiceConfig(config))
    const githubService = new OctokitGitHubService({
      token: config.githubToken
    })

    // Check permissions if we're in auto mode
    if (isAutoMode(config)) {
      const hasPermission = await githubService.checkPermissions()
      if (!hasPermission) {
        warning(
          'Insufficient permissions to update PR title automatically. Falling back to suggestion mode.'
        )
        config.mode = 'suggest'
      }
    }

    // Get additional context for AI generation
    let changedFiles: string[] = []
    try {
      changedFiles = await githubService.getChangedFiles(prNumber)
      debug(`Found ${changedFiles.length} changed files`)
    } catch (error) {
      warning(
        `Failed to get changed files: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }

    // Generate AI suggestions
    info('Generating AI-powered title suggestions...')
    const aiResponse = await aiService.generateTitle({
      originalTitle: currentTitle,
      changedFiles: changedFiles.slice(0, 20), // Limit to first 20 files to avoid token limits
      options: {
        includeScope: config.includeScope,
        preferredTypes: config.validationOptions.allowedTypes,
        maxLength: config.validationOptions.maxLength
      }
    })

    const suggestedTitles = aiResponse.suggestions
    info(`Generated ${suggestedTitles.length} title suggestions`)

    if (suggestedTitles.length === 0) {
      warning('No title suggestions generated')

      configManager.setOutputs({
        isConventional,
        suggestedTitles: [],
        originalTitle: currentTitle,
        actionTaken: 'error',
        errorMessage: 'No title suggestions could be generated'
      })
      return
    }

    // Log suggestions for debugging
    suggestedTitles.forEach((title, index) => {
      debug(`Suggestion ${index + 1}: ${title}`)
    })

    let actionTaken: ActionResult

    if (isAutoMode(config)) {
      // Auto mode: Update the PR title with the best suggestion
      const bestSuggestion = suggestedTitles[0]

      try {
        await githubService.updatePRTitle(prNumber, bestSuggestion)
        info(`✅ Updated PR title to: "${bestSuggestion}"`)
        actionTaken = 'updated'
      } catch (error) {
        const errorMessage = `Failed to update PR title: ${error instanceof Error ? error.message : 'Unknown error'}`
        warning(errorMessage)

        configManager.setOutputs({
          isConventional,
          suggestedTitles,
          originalTitle: currentTitle,
          actionTaken: 'error',
          errorMessage
        })
        return
      }
    } else {
      // Suggestion mode: Add a comment with suggestions
      const commentBody = formatSuggestionComment(
        currentTitle,
        suggestedTitles,
        aiResponse.reasoning,
        config.commentTemplate
      )

      try {
        await githubService.createComment(prNumber, commentBody)
        info(
          `💬 Added comment with ${suggestedTitles.length} title suggestions`
        )
        actionTaken = 'commented'
      } catch (error) {
        const errorMessage = `Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}`
        warning(errorMessage)

        configManager.setOutputs({
          isConventional,
          suggestedTitles,
          originalTitle: currentTitle,
          actionTaken: 'error',
          errorMessage
        })
        return
      }
    }

    // Set outputs for other actions/steps
    configManager.setOutputs({
      isConventional,
      suggestedTitles,
      originalTitle: currentTitle,
      actionTaken
    })

    info(`🎉 Action completed successfully (${actionTaken})`)
  } catch (error) {
    if (error instanceof ConfigurationError) {
      const configManager = new ActionConfigManager()
      configManager.handleConfigurationError(error)
      return
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    setFailed(`❌ Action failed: ${errorMessage}`)

    // Try to set error outputs if possible
    try {
      const configManager = new ActionConfigManager()
      configManager.setOutputs({
        isConventional: false,
        suggestedTitles: [],
        originalTitle: context.payload.pull_request?.title || 'Unknown',
        actionTaken: 'error',
        errorMessage
      })
    } catch {
      // Ignore errors when setting outputs after failure
    }
  }
}

/**
 * Format the suggestion comment body
 */
function formatSuggestionComment(
  currentTitle: string,
  suggestions: string[],
  reasoning?: string,
  template?: string
): string {
  if (template) {
    // Use custom template
    return template
      .replace(/\${currentTitle}/g, currentTitle)
      .replace(
        /\${suggestions}/g,
        suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')
      )
      .replace(/\${reasoning}/g, reasoning || '')
  }

  // Use default template
  const lines = [
    '## 🤖 AI-Powered PR Title Suggestions',
    '',
    `The current PR title "${currentTitle}" doesn't follow the [Conventional Commits](https://conventionalcommits.org/) standard.`,
    '',
    '### Suggested titles:',
    ...suggestions.map(
      (suggestion, index) => `${index + 1}. \`${suggestion}\``
    ),
    ''
  ]

  if (reasoning) {
    lines.push('### Reasoning:')
    lines.push(reasoning)
    lines.push('')
  }

  lines.push(
    '### How to apply:',
    '1. Click the "Edit" button on your PR title',
    '2. Copy one of the suggested titles above',
    '3. Save the changes',
    '',
    '_This comment was generated by [conventional-pr-title](https://github.com/overtrue/conventional-pr-title) action._'
  )

  return lines.join('\n')
}

// Export the run function for testing
export { run }

// Execute the action if this file is run directly
if (require.main === module) {
  run().catch(error => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
}
