import { debug, info, setFailed, warning } from '@actions/core'
import { context } from '@actions/github'
import { ConfigManager, ConfigurationError } from './config'
import { createGitHubService } from './github'
import { PRProcessor } from './processor'

/**
 * Validate GitHub context
 */
function validateGitHubContext(): { shouldSkip: boolean; reason?: string } {
  // Check event type
  if (!['pull_request', 'pull_request_target'].includes(context.eventName)) {
    return {
      shouldSkip: true,
      reason: `Unsupported event: ${context.eventName}. This action only works with pull_request events.`
    }
  }

  // Check PR data
  if (!context.payload.pull_request) {
    return {
      shouldSkip: true,
      reason: 'No pull request found in the event payload.'
    }
  }

  return { shouldSkip: false }
}

/**
 * Main entry function
 */
async function run(): Promise<void> {
  try {
    debug(`Action triggered by: ${context.eventName}`)
    debug(`Repository: ${context.repo.owner}/${context.repo.repo}`)
    debug(`Triggered by actor: ${context.actor}`)

    // Validate environment
    const validationResult = validateGitHubContext()
    if (validationResult.shouldSkip) {
      info(`Skipping processing: ${validationResult.reason}`)
      const configManager = new ConfigManager()
      configManager.setOutputs({
        isConventional: true,
        suggestedTitles: [],
        originalTitle: context.payload.pull_request?.title || 'Unknown',
        actionTaken: 'skipped'
      })
      return
    }

    const pullRequest = context.payload.pull_request!
    const prNumber = pullRequest.number

    info(`Processing PR #${prNumber}: "${pullRequest.title}"`)

    // Parse configuration
    const configManager = new ConfigManager()
    const config = configManager.parseConfig()

    if (config.debug) {
      debug(`Configuration loaded: model=${config.model}, mode=${config.mode}, skipIfConventional=${config.skipIfConventional}`)
    }

    // Initialize services
    const githubService = createGitHubService(config.githubToken)
    const processor = new PRProcessor(config, githubService)

    // Check permissions (auto mode requires write permissions)
    if (config.mode === 'auto') {
      const hasPermissions = await githubService.checkPermissions()
      if (!hasPermissions) {
        warning('Insufficient permissions for auto mode, falling back to suggestion mode')
        config.mode = 'suggest'
      }
    }

    // Extract PR context
    const prContext = await githubService.extractPRContext(prNumber, pullRequest)

    // Process PR title
    const result = await processor.process(prContext)

    // Set outputs
    configManager.setOutputs({
      isConventional: result.isConventional,
      suggestedTitles: result.suggestions,
      originalTitle: prContext.title,
      actionTaken: result.actionTaken,
      errorMessage: result.errorMessage
    })

    if (result.actionTaken === 'error') {
      setFailed(`❌ Action failed: ${result.errorMessage}`)
    } else {
      info(`🎉 Action completed successfully (${result.actionTaken})`)
    }

  } catch (error) {
    await handleError(error)
  }
}

/**
 * Error handling
 */
async function handleError(error: unknown): Promise<void> {
  if (error instanceof ConfigurationError) {
    const configManager = new ConfigManager()
    configManager.handleConfigurationError(error)
    return
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
  setFailed(`❌ Action failed: ${errorMessage}`)

  // Try to set error outputs
  try {
    const configManager = new ConfigManager()
    configManager.setOutputs({
      isConventional: false,
      suggestedTitles: [],
      originalTitle: context.payload.pull_request?.title || 'Unknown',
      actionTaken: 'error',
      errorMessage
    })
  } catch {
    // Ignore output setting errors
  }
}

// Export for testing
export { run }

// Execute if run directly
if (require.main === module) {
  run().catch(error => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
}
