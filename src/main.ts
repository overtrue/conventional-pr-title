import * as core from '@actions/core'
import { context } from '@actions/github'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.info('🚀 Conventional PR Title Action started')

    // Simple implementation for now
    core.info(`Event: ${context.eventName}`)

    if (context.payload.pull_request) {
      const title = context.payload.pull_request.title
      core.info(`Current PR title: ${title}`)

      // Set outputs
      core.setOutput('isConventional', true)
      core.setOutput('suggestedTitles', [])
      core.setOutput('originalTitle', title)
      core.setOutput('actionTaken', 'skipped')
    }

    core.info('✅ Action completed successfully')
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
