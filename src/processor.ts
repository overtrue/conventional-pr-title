import { debug, info, warning } from '@actions/core'
import { generateText } from 'ai'
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
    // Define templates inline
    this.systemTemplate = `# Conventional Commits PR Title Generator

You are an expert at creating Conventional Commits titles for Pull Requests.

## Task
Analyze a PR title and content, then suggest 1-3 improved titles that follow the Conventional Commits standard.

## Rules
1. **Format**: \`type(scope): description\`
2. **Allowed types**: {{allowedTypes}}
3. **Scope**: {{scopeRule}} a scope in parentheses
4. **Description**: lowercase, no period, max {{maxLength}} chars total
5. **Be specific and descriptive**
6. **Focus on WHAT changed, not HOW**
7. **Language**: {{languageInstruction}}
8. **Format consistency**: The conventional commit format (type(scope): description) should always be in English, but your reasoning/explanation should match the detected language.

## Language Matching Rules
When match-language is enabled:
- **Detect the language** used in the PR title and description
- **Generate the description part** in the same language as the original content
- **Keep type and scope in English** (e.g., feat, fix, ui, auth, etc.)
- **Examples**:
  - Chinese: feat(ui): 添加新的用户界面组件
  - Japanese: feat(ui): 新しいユーザーインターフェースコンポーネントを追加
  - Korean: feat(ui): 새로운 사용자 인터페이스 컴포넌트 추가
  - English: feat(ui): add new user interface component

## Response Format
You MUST return ONLY a valid JSON object with this exact structure:
\`\`\`json
{
  "suggestions": ["title1", "title2", "title3"],
  "reasoning": "explanation of why these titles are better (in the detected language)",
  "confidence": 0.9
}
\`\`\`

**CRITICAL**:
- Return ONLY the JSON object, no markdown formatting, no additional text
- Do not include \`\`\`json\` or \`\`\` markers
- Ensure the JSON is valid and properly formatted
- The suggestions array must contain 1-3 conventional commit titles
- The reasoning should explain your choices in the detected language`

    this.userTemplate = `# PR Analysis

## Original PR Title
"{{originalTitle}}"

{{#prDescription}}
## PR Description
{{prDescription}}

{{/prDescription}}
{{#prBody}}
## PR Body
{{prBody}}

{{/prBody}}
{{#diffContent}}
## Code Changes (diff)
{{diffContent}}

{{/diffContent}}
{{#changedFiles}}
## Changed Files
{{#each changedFiles}}
- {{this}}
{{/each}}

{{/changedFiles}}

---

Generate improved Conventional Commits titles for this PR.`
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
    const shouldSkip = this.config.skipIfConventional && isConventional
    debug(`Skip processing check: skipIfConventional=${this.config.skipIfConventional}, isConventional=${isConventional}, shouldSkip=${shouldSkip}`)
    return shouldSkip
  }

  /**
   * Generate AI suggestions
   */
  private async generateSuggestions(prContext: PRContext): Promise<TitleGenerationResponse> {
    info('Generating AI-powered title suggestions...')

    const maxRetries = 3
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      let result: any = null
      try {
        const systemPrompt = this.buildSystemPrompt()
        const userPrompt = this.buildUserPrompt(prContext)

        debug(`Attempt ${attempt + 1}/${maxRetries + 1}`)
        debug(`System prompt: ${systemPrompt}`)
        debug(`User prompt: ${userPrompt}`)

        debug(`Creating model for: ${this.config.model}`)
        const model = await createModel(this.config.model)
        debug(`Model created successfully: ${model.constructor.name}`)

        // Check environment variables for debugging
        if (this.config.model.startsWith('openai')) {
          debug(`OpenAI API Key present: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`)
          debug(`OpenAI Base URL: ${process.env.OPENAI_BASE_URL || 'Not set'}`)
        }

        debug(`Calling generateText with model: ${model.constructor.name}`)
        debug(`System prompt length: ${systemPrompt.length} characters`)
        debug(`User prompt length: ${userPrompt.length} characters`)

        try {
          result = await generateText({
            model,
            system: systemPrompt,
            prompt: userPrompt,
            temperature: 0.3
          })
          debug(`generateText call completed successfully`)
        } catch (generateError) {
          debug(`generateText call failed: ${generateError instanceof Error ? generateError.message : String(generateError)}`)
          throw generateError
        }

        debug(`Raw AI response: ${result.text}`)
        debug(`Response object keys: ${Object.keys(result)}`)

        if (!result || !result.text) {
          throw new Error(`AI service returned empty response. Result: ${JSON.stringify(result)}`)
        }

        const parsedResponse = this.parseResponse(result.text)
        debug(`Parsed response: ${JSON.stringify(parsedResponse)}`)
        return parsedResponse
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        warning(`Attempt ${attempt + 1} failed: ${lastError.message}`)

        // Print detailed error information for debugging
        const errorMessage = error instanceof Error ? error.message : String(error)
        warning(`Detailed error information:`)
        warning(`Error type: ${error instanceof Error ? error.constructor.name : typeof error}`)
        warning(`Error message: ${errorMessage}`)

        if (result) {
          warning(`Result object: ${JSON.stringify(result)}`)
          warning(`Result text: "${result.text || 'No text property'}"`)
        } else {
          warning(`No result object available`)
        }

        // Log the full error stack for debugging
        if (error instanceof Error && error.stack) {
          debug(`Error stack: ${error.stack}`)
        }

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
        ? 'Match the language of the original PR title and description. Generate the description part in the same language while keeping type and scope in English.'
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
      // Clean response text - remove markdown code blocks
      let cleanText = text
        .replace(/```json\s*|\s*```/gi, '')
        .trim()

      // Try to find JSON object in the text
      if (!cleanText.startsWith('{')) {
        const jsonMatch = text.match(/{[\s\S]*}/)
        if (jsonMatch) {
          cleanText = jsonMatch[0]
        }
      }

      // If still no JSON found, try to extract from the entire text
      if (!cleanText.startsWith('{')) {
        const braceStart = text.indexOf('{')
        const braceEnd = text.lastIndexOf('}')
        if (braceStart !== -1 && braceEnd !== -1 && braceEnd > braceStart) {
          cleanText = text.substring(braceStart, braceEnd + 1)
        }
      }

      debug(`parseResponse: cleaned JSON string: ${cleanText}`)

      const parsed = JSON.parse(cleanText)
      debug(`parseResponse: parsed JSON: ${JSON.stringify(parsed)}`)

      // Validate parsed response
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Parsed response is not an object')
      }

      return {
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions.filter((s: any) => typeof s === 'string' && s.length > 0)
          : [parsed.suggestions || 'feat: improve PR title'],
        reasoning: parsed.reasoning || 'AI generated suggestions based on PR content',
        confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.8
      }
    } catch (error) {
      warning(`parseResponse JSON parse error: ${error instanceof Error ? error.message : String(error)}`)
      warning(`parseResponse: failed to parse text: ${text}`)

      const suggestions = this.extractSuggestionsFromText(text)

      // If we couldn't extract any suggestions, throw an error with the original text
      if (suggestions.length === 0 || (suggestions.length === 1 && suggestions[0] === 'feat: improve PR title')) {
        throw new Error(`Invalid JSON response: Could not parse AI response and no valid suggestions found. Original response: "${text}"`)
      }

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

      // Look for conventional commit format
      if (
        trimmed.match(/^[a-z0-9]+(\([^)]+\))?(!)?: .+$/i) &&
        trimmed.length <= 100
      ) {
        suggestions.push(trimmed)
      }
      // Also look for quoted strings that might be suggestions
      else if (trimmed.match(/^["'](.+)["']$/)) {
        const match = trimmed.match(/^["'](.+)["']$/)
        if (match && match[1].length <= 100) {
          suggestions.push(match[1])
        }
      }
      // Look for numbered or bulleted suggestions
      else if (trimmed.match(/^[\d\-*]+\.?\s*(.+)$/)) {
        const match = trimmed.match(/^[\d\-*]+\.?\s*(.+)$/)
        if (match && match[1].length <= 100) {
          suggestions.push(match[1])
        }
      }
    }

    // If no suggestions found, generate a basic one based on the original title
    if (suggestions.length === 0) {
      return ['feat: improve PR title']
    }

    return suggestions.slice(0, 3) // Limit to 3 suggestions
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

    info(`🔄 Auto mode: Attempting to update PR #${prNumber} title`)
    info(`   Current title: "${currentTitle}"`)
    info(`   New title: "${bestSuggestion}"`)

    try {
      await this.githubService.updatePRTitle(prNumber, bestSuggestion)
      info(`✅ Successfully updated PR title to: "${bestSuggestion}"`)

      if (this.config.autoComment) {
        info(`💬 Adding success notification comment...`)
        await this.addSuccessComment(prNumber, currentTitle, bestSuggestion, aiResponse.reasoning)
      }

      return { actionTaken: 'updated' }
    } catch (error) {
      const errorMessage = `Failed to update PR title: ${error instanceof Error ? error.message : 'Unknown error'}`
      warning(`❌ ${errorMessage}`)
      debug(`Full error details: ${error instanceof Error ? error.stack : 'No stack trace'}`)
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
      `---`,
      `*This update was performed automatically by AI to maintain consistent commit message standards.*`
    )

    return lines.join('\n')
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
