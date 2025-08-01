/**
 * Base AI Provider - Abstract base class for all AI providers
 * Inspired by claude-task-master architecture
 */

import { TitleGenerationRequest, TitleGenerationResponse } from '../shared/types'

export interface AIProviderConfig {
  apiKey: string
  baseURL?: string
  model?: string
  maxTokens?: number
  temperature?: number
  timeout?: number
  debug?: boolean
}

export abstract class BaseAIProvider {
  protected config: AIProviderConfig
  protected providerName: string

  constructor(config: AIProviderConfig, providerName: string) {
    this.config = config
    this.providerName = providerName
    this.validateAuth()
  }

  // Abstract methods that must be implemented by each provider
  abstract getClient(): any
  abstract getRequiredApiKeyName(): string
  abstract generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse>
  abstract isHealthy(): Promise<boolean>

  // Common validation methods
  protected validateAuth(): void {
    if (this.isRequiredApiKey() && !this.config.apiKey) {
      throw new Error(`${this.getRequiredApiKeyName()} is required for ${this.providerName}`)
    }
  }

  protected validateParams(): void {
    this.validateAuth()
    
    if (this.config.temperature !== undefined && (this.config.temperature < 0 || this.config.temperature > 1)) {
      throw new Error('Temperature must be between 0 and 1')
    }

    if (this.config.maxTokens !== undefined && this.config.maxTokens < 1) {
      throw new Error('maxTokens must be greater than 0')
    }
  }

  protected isRequiredApiKey(): boolean {
    return true
  }

  // Common utility methods
  protected buildSystemMessage(options?: TitleGenerationRequest['options']): string {
    const allowedTypes = options?.preferredTypes || ['feat', 'fix', 'docs', 'refactor', 'test', 'chore']
    const maxLength = options?.maxLength || 72
    const includeScope = options?.includeScope ? 'MUST include' : 'MAY include'
    const matchLanguage = options?.matchLanguage !== false

    const languageInstruction = matchLanguage 
      ? 'Detect the language used in the PR title and description, then respond in the same language.'
      : 'Always respond in English.'

    return `You are an expert at creating Conventional Commits titles for Pull Requests.

Your task is to analyze a PR title and content, then suggest 1-3 improved titles that follow the Conventional Commits standard.

RULES:
1. Format: type(scope): description
2. Allowed types: ${allowedTypes.join(', ')}
3. Scope: ${includeScope} a scope in parentheses
4. Description: lowercase, no period, max ${maxLength} chars total
5. Be specific and descriptive
6. Focus on WHAT changed, not HOW
7. IMPORTANT: ${languageInstruction}

RESPONSE FORMAT:
Return a JSON object with:
{
  "suggestions": ["title1", "title2", "title3"],
  "reasoning": "explanation of why these titles are better",
  "confidence": 0.9
}

Only return valid JSON, no additional text.`
  }

  protected buildPrompt(request: TitleGenerationRequest): string {
    const { originalTitle, prDescription, prBody, diffContent, changedFiles } = request

    let prompt = `Original PR Title: "${originalTitle}"\n\n`

    if (prDescription?.trim()) {
      prompt += `PR Description: ${prDescription.trim()}\n\n`
    }

    if (prBody?.trim()) {
      const body = prBody.slice(0, 1500)
      prompt += `PR Body: ${body}${prBody.length > 1500 ? '...' : ''}\n\n`
    }

    if (diffContent?.trim()) {
      const diff = diffContent.slice(0, 2000)
      prompt += `Code Changes (diff):\n${diff}${diffContent.length > 2000 ? '...' : ''}\n\n`
    }

    if (changedFiles?.length) {
      prompt += `Changed Files:\n${changedFiles
        .slice(0, 15)
        .map((f: string) => `- ${f}`)
        .join('\n')}\n\n`
    }

    prompt += 'Generate improved Conventional Commits titles for this PR.'

    return prompt
  }

  protected parseResponse(text: string): TitleGenerationResponse {
    try {
      let cleanText = text
        .replace(/```json\s*|\s*```/gi, '')
        .replace(/^[^{]*({.*})[^}]*$/s, '$1')
        .trim()

      if (!cleanText.startsWith('{')) {
        const jsonMatch = text.match(/{[\s\S]*}/)
        if (jsonMatch) {
          cleanText = jsonMatch[0]
        }
      }

      const parsed = JSON.parse(cleanText)

      return {
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions
          : [parsed.suggestions || 'feat: improve PR title'],
        reasoning: parsed.reasoning || 'AI generated suggestions based on PR content',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8
      }
    } catch (error) {
      const suggestions = this.extractSuggestionsFromText(text)
      return {
        suggestions,
        reasoning: 'AI response could not be parsed as JSON, extracted suggestions from text',
        confidence: 0.5
      }
    }
  }

  protected extractSuggestionsFromText(text: string): string[] {
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

  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  protected handleError(error: unknown, context: string): never {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorCode = error instanceof Error && 'code' in error ? String(error.code) : 'UNKNOWN'
    
    console.error(`[${this.providerName}] Error in ${context}:`, {
      message: errorMessage,
      code: errorCode,
      provider: this.providerName,
      timestamp: new Date().toISOString()
    })
    
    throw new Error(`${this.providerName} provider failed in ${context}: ${errorMessage} (${errorCode})`)
  }
}