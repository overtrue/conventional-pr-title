import { setFailed, info } from '@actions/core'
import { context } from '@actions/github'
import {
  ActionConfigManager,
  ConfigurationError,
  createAIServiceConfig
} from './config'
import { ModernAIService } from './modern-ai-service'
import { OctokitGitHubService } from './github-service'
import { Logger } from './utils'
import { PRTitleProcessor } from './pr-processor'
import { PRContextExtractor } from './context-extractor'
import { EnvironmentValidator } from './validator'

/**
 * Main entry point for the GitHub Action
 * Simplified and modularized for better maintainability
 */
async function run(): Promise<void> {
  try {
    Logger.debug(`Action triggered by: ${context.eventName}`)
    Logger.debug(`Repository: ${context.repo.owner}/${context.repo.repo}`)
    Logger.debug(`Triggered by actor: ${context.actor}`)

    // Environment validation
    const validationResult = EnvironmentValidator.validateGitHubContext()
    if (validationResult.shouldSkip) {
      info(`Skipping processing: ${validationResult.reason}`)
      const configManager = new ActionConfigManager()
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

    // Initialize configuration and services
    const configManager = new ActionConfigManager()
    let config = configManager.parseConfig()
    
    Logger.configure(config.debug)

    Logger.debug('Configuration loaded:', {
      aiProvider: config.aiProvider,
      model: config.model || 'default',
      mode: config.mode,
      skipIfConventional: config.skipIfConventional
    })

    // Initialize services
    const aiService = new ModernAIService(createAIServiceConfig(config))
    const githubService = new OctokitGitHubService({
      token: config.githubToken
    })

    // Validate permissions and adjust config if needed
    config = await EnvironmentValidator.validatePermissions(config, githubService)

    // Extract PR context
    const contextExtractor = new PRContextExtractor(githubService)
    const prContext = await contextExtractor.extractContext(prNumber, pullRequest)

    // Process PR title
    const processor = new PRTitleProcessor(config, aiService, githubService)
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
 * Centralized error handling
 */
async function handleError(error: unknown): Promise<void> {
  if (error instanceof ConfigurationError) {
    const configManager = new ActionConfigManager()
    configManager.handleConfigurationError(error)
    return
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
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

// Export the run function for testing
export { run }

// Execute the action if this file is run directly
if (require.main === module) {
  run().catch(error => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
}