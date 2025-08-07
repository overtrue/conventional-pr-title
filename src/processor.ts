import { debug, info, warning } from '@actions/core'
import { generateText } from 'ai'
import { readFileSync } from 'fs'
import { join } from 'path'
import { GitHubService } from './github.js'
import { createModel } from './providers/index.js'
import { ActionConfig, PRContext, ProcessingResult, TitleGenerationResponse } from './types.js'
import { processTemplate, validateTitle } from './utils.js'

// Processing limits
const LIMITS = {
  MAX_PR_BODY_SIZE: 1500,
  MAX_DIFF_SIZE: 2000,
  MAX_CHANGED_FILES: 15
}

export class PRProcessor {
  private systemTemplate: string
  private userTemplate: string

  constructor(
    private readonly config: ActionConfig,
    private readonly githubService: GitHubService
  ) {
    // Load template files
    try {
      this.systemTemplate = readFileSync(join(__dirname, '../templates/system.md'), 'utf-8')
      this.userTemplate = readFileSync(join(__dirname, '../templates/user.md'), 'utf-8')
    } catch (error) {
      throw new Error(`Failed to load prompt templates: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Process PR title
   */
  async process(prContext: PRContext): Promise<ProcessingResult> {
    const { title, number: prNumber } = prContext

    // Validate current title
    const validationResult = validateTitle(title, this.config.validationOptions)
    const isConventional = validationResult.isValid

    info(`Current title is ${isConventional ? 'conventional' : 'not conventional'}`)

    if (validationResult.errors.length > 0) {
      debug(`Validation errors: ${validationResult.errors.join(', ')}`)
    }

    // Check if processing should be skipped
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
    const aiResponse = await this.generateSuggestions(prContext)

    if (aiResponse.suggestions.length === 0) {
      warning('No title suggestions generated')
      return {
        isConventional,
        suggestions: [],
        reasoning: 'No suggestions could be generated',
        actionTaken: 'error',
        errorMessage: 'No title suggestions could be generated'
      }
    }

    // Execute action
    const result = await this.executeAction(prNumber, title, aiResponse)

    return {
      isConventional,
      suggestions: aiResponse.suggestions,
      reasoning: aiResponse.reasoning,
      actionTaken: result.actionTaken,
      errorMessage: result.errorMessage
    }
  }

  private shouldSkipProcessing(isConventional: boolean): boolean {
    return this.config.skipIfConventional && isConventional
  }

  /**
   * Generate AI suggestions
   */
  private async generateSuggestions(prContext: PRContext): Promise<TitleGenerationResponse> {
    info('Generating AI-powered title suggestions...')

    const maxRetries = 3
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const systemPrompt = this.buildSystemPrompt()
        const userPrompt = this.buildUserPrompt(prContext)

        debug(`Attempt ${attempt + 1}/${maxRetries + 1}`)
        debug(`System prompt: ${systemPrompt}`)
        debug(`User prompt: ${userPrompt}`)

        const model = await createModel(this.config.model)
        const result = await generateText({
          model,
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.3
        })

        debug(`Raw AI response: ${result.text}`)
        return this.parseResponse(result.text)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        warning(`Attempt ${attempt + 1} failed: ${lastError.message}`)

        if (attempt < maxRetries) {
          debug(`Retrying after error, attempt ${attempt + 2}...`)
          await this.delay(Math.pow(2, attempt) * 1000)
        }
      }
    }

    throw new Error(
      `AI service failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`
    )
  }

  /**
   * Build system prompt
   */
  private buildSystemPrompt(): string {
    const variables = {
      allowedTypes: this.config.validationOptions.allowedTypes.join(', '),
      scopeRule: this.config.includeScope ? 'MUST include' : 'MAY include',
      maxLength: this.config.validationOptions.maxLength,
      languageInstruction: this.config.matchLanguage
        ? 'Detect the language used in the PR title and description, then respond in the same language. If the content is in Chinese, respond in Chinese; if in English, respond in English, etc.'
        : 'Always respond in English.'
    }

    const systemPrompt = this.config.customPrompt || this.systemTemplate
    return processTemplate(systemPrompt, variables)
  }

  /**
   * Build user prompt
   */
  private buildUserPrompt(prContext: PRContext): string {
    const variables = {
      originalTitle: prContext.title,
      prDescription: prContext.body ? prContext.body.trim() : undefined,
      prBody: prContext.body ? prContext.body.slice(0, LIMITS.MAX_PR_BODY_SIZE) : undefined,
      diffContent: prContext.diffContent ? prContext.diffContent.slice(0, LIMITS.MAX_DIFF_SIZE) : undefined,
      changedFiles: prContext.changedFiles.length > 0
        ? prContext.changedFiles.slice(0, LIMITS.MAX_CHANGED_FILES)
        : undefined
    }

    return processTemplate(this.userTemplate, variables)
  }

  /**
   * Parse AI response
   */
  private parseResponse(text: string): TitleGenerationResponse {
    debug(`parseResponse: raw text: ${text}`)

    try {
      // Clean response text
      let cleanText = text
        .replace(/```json\s*|\s*```/gi, '')
        .replace(/^[^{]*(({[\s\S]*})[^}]*)$/, '$2')
        .trim()

      if (!cleanText.startsWith('{')) {
        const jsonMatch = text.match(/{[\s\S]*}/)
        if (jsonMatch) {
          cleanText = jsonMatch[0]
        }
      }

      debug(`parseResponse: cleaned JSON string: ${cleanText}`)

      const parsed = JSON.parse(cleanText)
      debug(`parseResponse: parsed JSON: ${JSON.stringify(parsed)}`)

      return {
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions
          : [parsed.suggestions || 'feat: improve PR title'],
        reasoning: parsed.reasoning || 'AI generated suggestions based on PR content',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8
      }
    } catch (error) {
      warning(`parseResponse JSON parse error: ${error instanceof Error ? error.message : String(error)}`)
      warning(`parseResponse: failed to parse text: ${text}`)

      const suggestions = this.extractSuggestionsFromText(text)
      return {
        suggestions,
        reasoning: 'AI response could not be parsed as JSON, extracted suggestions from text',
        confidence: 0.5
      }
    }
  }

  /**
   * Extract suggestions from text
   */
  private extractSuggestionsFromText(text: string): string[] {
    const suggestions: string[] = []
    const lines = text.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (
        trimmed.match(/^[a-z0-9]+(\([^)]+\))?(!)?: .+$/i) &&
        trimmed.length <= 100
      ) {
        suggestions.push(trimmed)
      }
    }

    return suggestions.length > 0 ? suggestions : ['feat: improve PR title']
  }

  /**
   * Execute action (auto update or comment)
   */
  private async executeAction(
    prNumber: number,
    currentTitle: string,
    aiResponse: { suggestions: string[]; reasoning: string }
  ): Promise<{ actionTaken: 'updated' | 'commented' | 'error'; errorMessage?: string }> {
    if (this.config.mode === 'auto') {
      return this.handleAutoMode(prNumber, currentTitle, aiResponse)
    } else {
      return this.handleSuggestionMode(prNumber, currentTitle, aiResponse)
    }
  }

  /**
   * Handle auto mode
   */
  private async handleAutoMode(
    prNumber: number,
    currentTitle: string,
    aiResponse: { suggestions: string[]; reasoning: string }
  ): Promise<{ actionTaken: 'updated' | 'error'; errorMessage?: string }> {
    const bestSuggestion = aiResponse.suggestions[0]

    try {
      await this.githubService.updatePRTitle(prNumber, bestSuggestion)
      info(`✅ Updated PR title to: "${bestSuggestion}"`)

      if (this.config.autoComment) {
        await this.addSuccessComment(prNumber, currentTitle, bestSuggestion, aiResponse.reasoning)
      }

      return { actionTaken: 'updated' }
    } catch (error) {
      const errorMessage = `Failed to update PR title: ${error instanceof Error ? error.message : 'Unknown error'}`
      warning(errorMessage)
      return { actionTaken: 'error', errorMessage }
    }
  }

  /**
   * Handle suggestion mode
   */
  private async handleSuggestionMode(
    prNumber: number,
    currentTitle: string,
    aiResponse: { suggestions: string[]; reasoning: string }
  ): Promise<{ actionTaken: 'commented' | 'error'; errorMessage?: string }> {
    try {
      const commentBody = this.formatSuggestionComment(
        currentTitle,
        aiResponse.suggestions,
        aiResponse.reasoning
      )

      await this.githubService.createComment(prNumber, commentBody)
      info(`💬 Added comment with ${aiResponse.suggestions.length} title suggestions`)
      return { actionTaken: 'commented' }
    } catch (error) {
      const errorMessage = `Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}`
      warning(errorMessage)
      return { actionTaken: 'error', errorMessage }
    }
  }

  /**
   * Add success notification comment
   */
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

  /**
   * Format suggestion comment
   */
  private formatSuggestionComment(currentTitle: string, suggestions: string[], reasoning: string): string {
    if (this.config.commentTemplate) {
      return this.config.commentTemplate
        .replace('${currentTitle}', currentTitle)
        .replace('${suggestions}', suggestions.map((s, i) => `${i + 1}. \`${s}\``).join('\n'))
        .replace('${reasoning}', reasoning)
    }

    const lines = [
      `## 🤖 AI-Powered PR Title Suggestions`,
      `> Optimized for Conventional Commits standard`,
      '',
      `### 📝 Current Title`,
      `\`${currentTitle}\``,
      '',
      `### 💡 Suggested Titles`,
      '',
      ...suggestions.map((suggestion, index) =>
        `**${index + 1}.** \`${suggestion}\` ${index === 0 ? '⭐ **(Recommended)**' : ''}`
      ),
      '',
      `### 🧠 AI Reasoning`,
      reasoning,
      '',
      `### ✨ Benefits`,
      '📋 Follows team coding standards',
      '📊 Improves version control and change tracking',
      '🔍 Enhances code review efficiency',
      '📈 Better project maintenance experience',
      '',
      `---`,
      `*This suggestion was generated by AI to help maintain consistent commit message standards.*`
    ]

    return lines.join('\n')
  }

  /**
   * Format success comment
   */
  private formatSuccessComment(originalTitle: string, newTitle: string, reasoning?: string): string {
    const lines = [
      `## ✅ PR Title Auto-Updated`,
      `> Optimized according to Conventional Commits standard`,
      '',
      `### 📝 Changes Made`,
      `**Original:** \`${originalTitle}\``,
      `**Updated:** \`${newTitle}\``,
      ''
    ]

    if (reasoning) {
      lines.push(`### 🧠 AI Reasoning`, reasoning, '')
    }

    lines.push(
      `### ✨ Benefits`,
      '📋 Follows team coding standards',
      '📊 Improves version control and change tracking',
      '🔍 Enhances code review efficiency',
      '',
      `---`,
      `*This update was performed automatically by AI to maintain consistent commit message standards.*`
    )

    return lines.join('\n')
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
