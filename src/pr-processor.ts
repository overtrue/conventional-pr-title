/**
 * Core business logic for PR title processing
 * Extracted from main index.ts for better separation of concerns
 */

import { info, warning } from '@actions/core'
import { context } from '@actions/github'
import { ActionConfig, ActionResult } from './config'
import { validateTitle } from './conventional'
import { ModernAIService } from './modern-ai-service'
import { OctokitGitHubService } from './github-service'
import { Logger } from './utils'
import { PROCESSING_LIMITS } from './constants'

export interface PRContext {
  number: number
  title: string
  body: string | null
  isDraft: boolean
  changedFiles: string[]
  diffContent: string
}

export interface ProcessingResult {
  isConventional: boolean
  suggestions: string[]
  reasoning: string
  actionTaken: ActionResult
  errorMessage?: string
}

export class PRTitleProcessor {
  constructor(
    private readonly config: ActionConfig,
    private readonly aiService: ModernAIService,
    private readonly githubService: OctokitGitHubService
  ) {}

  async process(prContext: PRContext): Promise<ProcessingResult> {
    const { title, number: prNumber } = prContext
    
    // Validate current title
    const validationResult = validateTitle(title, this.config.validationOptions)
    const isConventional = validationResult.isValid

    info(`Current title is ${isConventional ? 'conventional' : 'not conventional'}`)

    if (validationResult.errors.length > 0) {
      Logger.debug(`Validation errors: ${validationResult.errors.join(', ')}`)
    }

    // Check if we should skip processing
    if (this.shouldSkipProcessing(isConventional)) {
      info('Skipping processing: title is already conventional and skip-if-conventional is enabled')
      return {
        isConventional: true,
        suggestions: [],
        reasoning: 'Title is already conventional',
        actionTaken: 'skipped'
      }
    }

    // Generate AI suggestions
    const suggestions = await this.generateSuggestions(prContext)
    
    if (suggestions.suggestions.length === 0) {
      warning('No title suggestions generated')
      return {
        isConventional,
        suggestions: [],
        reasoning: 'No suggestions could be generated',
        actionTaken: 'error',
        errorMessage: 'No title suggestions could be generated'
      }
    }

    // Execute action based on mode
    const actionTaken = await this.executeAction(prNumber, title, suggestions)

    return {
      isConventional,
      suggestions: suggestions.suggestions,
      reasoning: suggestions.reasoning,
      actionTaken
    }
  }

  private shouldSkipProcessing(isConventional: boolean): boolean {
    return this.config.skipIfConventional && isConventional
  }

  private async generateSuggestions(prContext: PRContext) {
    info('Generating AI-powered title suggestions...')
    
    return await this.aiService.generateTitle({
      originalTitle: prContext.title,
      prDescription: prContext.body || undefined,
      prBody: prContext.body || undefined,
      diffContent: prContext.diffContent || undefined,
      changedFiles: prContext.changedFiles.slice(0, PROCESSING_LIMITS.MAX_CHANGED_FILES),
      options: {
        includeScope: this.config.includeScope,
        preferredTypes: this.config.validationOptions.allowedTypes,
        maxLength: this.config.validationOptions.maxLength,
        matchLanguage: this.config.matchLanguage
      }
    })
  }

  private async executeAction(
    prNumber: number, 
    currentTitle: string, 
    aiResponse: { suggestions: string[]; reasoning: string }
  ): Promise<ActionResult> {
    if (this.config.mode === 'auto') {
      return this.handleAutoMode(prNumber, currentTitle, aiResponse)
    } else {
      return this.handleSuggestionMode(prNumber, currentTitle, aiResponse)
    }
  }

  private async handleAutoMode(
    prNumber: number,
    currentTitle: string,
    aiResponse: { suggestions: string[]; reasoning: string }
  ): Promise<ActionResult> {
    const bestSuggestion = aiResponse.suggestions[0]

    try {
      await this.githubService.updatePRTitle(prNumber, bestSuggestion)
      info(`✅ Updated PR title to: "${bestSuggestion}"`)

      if (this.config.autoComment) {
        await this.addSuccessComment(prNumber, currentTitle, bestSuggestion, aiResponse.reasoning)
      }

      return 'updated'
    } catch (error) {
      const errorMessage = `Failed to update PR title: ${error instanceof Error ? error.message : 'Unknown error'}`
      warning(errorMessage)
      return 'error'
    }
  }

  private async handleSuggestionMode(
    prNumber: number,
    currentTitle: string,
    aiResponse: { suggestions: string[]; reasoning: string }
  ): Promise<ActionResult> {
    try {
      const commentBody = this.formatSuggestionComment(
        currentTitle,
        aiResponse.suggestions,
        aiResponse.reasoning
      )

      await this.githubService.createComment(prNumber, commentBody)
      info(`💬 Added comment with ${aiResponse.suggestions.length} title suggestions`)
      return 'commented'
    } catch (error) {
      const errorMessage = `Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}`
      warning(errorMessage)
      return 'error'
    }
  }

  private async addSuccessComment(
    prNumber: number,
    originalTitle: string,
    newTitle: string,
    reasoning: string
  ): Promise<void> {
    try {
      const commentBody = this.formatSuccessComment(originalTitle, newTitle, reasoning)
      await this.githubService.createComment(prNumber, commentBody)
      info(`💬 Added success notification comment`)
    } catch (error) {
      warning(`Failed to create success comment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private formatSuccessComment(originalTitle: string, newTitle: string, reasoning?: string): string {
    const lines = [
      `## ✅ PR Title Auto-Updated`,
      `> Optimized according to Conventional Commits standard`,
      '',
      `### 📝 Changes Made`,
      '',
      '| | Title |',
      '|---|---|',
      `| **Original** | \`${originalTitle}\` |`,
      `| **Updated** | \`${newTitle}\` ✨ |`,
      ''
    ]

    if (reasoning) {
      lines.push(
        `### 🤖 AI Analysis`,
        '',
        `> ${reasoning}`,
        ''
      )
    }

    lines.push(
      `### 🎯 Benefits`,
      '',
      '✨ Follows team coding standards',
      '📊 Improves version control and change tracking',
      '🔍 Enhances code review efficiency', 
      '📈 Better project maintenance experience',
      '',
      '---',
      '',
      `<div align="center">`,
      '',
      `🎉 **Your PR is now following best practices!** 🎉`,
      '',
      '_This comment was generated by [conventional-pr-title](https://github.com/overtrue/conventional-pr-title) action_',
      '',
      `</div>`
    )

    return lines.join('\n')
  }

  private formatSuggestionComment(
    currentTitle: string,
    suggestions: string[],
    reasoning?: string
  ): string {
    if (this.config.commentTemplate) {
      return this.config.commentTemplate
        .replace(/\${currentTitle}/g, currentTitle)
        .replace(/\${suggestions}/g, suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n'))
        .replace(/\${reasoning}/g, reasoning || '')
    }

    const lines = [
      `## 🚀 AI-Powered PR Title Suggestions`,
      '',
      `> **Current title:** \`"${currentTitle}"\``,
      `> doesn't follow the [Conventional Commits](https://conventionalcommits.org/) standard`,
      '',
      `### 💡 Suggested Titles`,
      '',
      ...suggestions.map((suggestion, index) => 
        `**${index + 1}.** \`${suggestion}\` ${index === 0 ? '⭐ **(Recommended)**' : ''}`
      ),
      ''
    ]

    if (reasoning) {
      lines.push(
        `### 🧠 AI Analysis`,
        '',
        `> ${reasoning}`,
        ''
      )
    }

    lines.push(
      '---',
      '',
      `### 📝 How to Apply`,
      '',
      '1. Click the **"Edit"** button next to your PR title',
      '2. Copy one of the suggested titles above',
      '3. Save the changes',
      '',
      '💫 **Tip**: Standardized PR titles help with team collaboration and project maintenance!',
      '',
      '_This comment was generated by [conventional-pr-title](https://github.com/overtrue/conventional-pr-title) action_'
    )

    return lines.join('\n')
  }
}