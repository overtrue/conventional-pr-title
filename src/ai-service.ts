import { anthropic, createAnthropic } from '@ai-sdk/anthropic'
import { azure, createAzure } from '@ai-sdk/azure'
import { cohere, createCohere } from '@ai-sdk/cohere'
import { createGoogleGenerativeAI, google } from '@ai-sdk/google'
import { createMistral, mistral } from '@ai-sdk/mistral'
import { createOpenAI, openai } from '@ai-sdk/openai'
import { createXai, xai } from '@ai-sdk/xai'
import { generateText } from 'ai'
import { DEFAULT_TYPES } from './conventional'

export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'xai'
  | 'cohere'
  | 'azure'
  | 'vercel'
  | 'deepseek'
  | 'cerebras'
  | 'groq'
  | 'vertex'

export interface AIServiceConfig {
  provider: AIProvider
  model?: string
  apiKey?: string
  baseURL?: string
  maxTokens?: number
  temperature?: number
  maxRetries?: number
}

export interface TitleGenerationRequest {
  originalTitle: string
  prDescription?: string
  prBody?: string
  changedFiles?: string[]
  options?: {
    includeScope?: boolean
    preferredTypes?: string[]
    maxLength?: number
  }
}

export interface TitleGenerationResponse {
  suggestions: string[]
  reasoning: string
  confidence: number
}

export interface AIService {
  generateTitle(
    request: TitleGenerationRequest
  ): Promise<TitleGenerationResponse>
  isHealthy(): Promise<boolean>
}

export class VercelAIService implements AIService {
  private config: AIServiceConfig
  private modelCache = new Map<string, any>()

  constructor(config: AIServiceConfig) {
    this.config = {
      maxTokens: 500,
      temperature: 0.3,
      maxRetries: 3,
      ...config
    }
  }

  async generateTitle(
    request: TitleGenerationRequest
  ): Promise<TitleGenerationResponse> {
    const maxRetries = this.config.maxRetries || 3
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const prompt = this.buildPrompt(request)
        const systemMessage = this.buildSystemMessage(request.options)
        const result = await this.callAI(prompt, systemMessage)
        console.log(`response: ${result.text}`);
        return this.parseResponse(result.text)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt < maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000)
        }
      }
    }

    throw new Error(
      `AI service failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`
    )
  }

  async isHealthy(): Promise<boolean> {
    try {
      const testResult = await this.callAI(
        'test',
        'You are a test assistant. Reply with "OK".'
      )
      return testResult.text.toLowerCase().includes('ok')
    } catch {
      return false
    }
  }

  private async callAI(prompt: string, systemMessage: string) {
    const model = this.getModel()

    return await generateText({
      model,
      system: systemMessage,
      prompt,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature
    })
  }

  private getModel() {
    const { provider, model, apiKey, baseURL } = this.config
    const cacheKey = `${provider}-${model}-${apiKey?.slice(0, 8)}`

    if (this.modelCache.has(cacheKey)) {
      return this.modelCache.get(cacheKey)
    }

    const providerConfig: Record<string, any> = {}
    if (apiKey) providerConfig.apiKey = apiKey
    if (baseURL) providerConfig.baseURL = baseURL

    const hasConfig = Object.keys(providerConfig).length > 0
    let modelInstance: any

    switch (provider) {
      case 'openai':
        modelInstance = hasConfig
          ? createOpenAI(providerConfig)(model || 'gpt-4o-mini')
          : openai(model || 'gpt-4o-mini')
        break
      case 'anthropic':
        modelInstance = hasConfig
          ? createAnthropic(providerConfig)(model || 'claude-3-5-sonnet-20241022')
          : anthropic(model || 'claude-3-5-sonnet-20241022')
        break
      case 'google':
        modelInstance = hasConfig
          ? createGoogleGenerativeAI(providerConfig)(model || 'gemini-1.5-flash')
          : google(model || 'gemini-1.5-flash')
        break
      case 'mistral':
        modelInstance = hasConfig
          ? createMistral(providerConfig)(model || 'mistral-large-latest')
          : mistral(model || 'mistral-large-latest')
        break
      case 'xai':
        modelInstance = hasConfig
          ? createXai(providerConfig)(model || 'grok-beta')
          : xai(model || 'grok-beta')
        break
      case 'cohere':
        modelInstance = hasConfig
          ? createCohere(providerConfig)(model || 'command-r-plus')
          : cohere(model || 'command-r-plus')
        break
      case 'azure':
        modelInstance = hasConfig
          ? createAzure(providerConfig)(model || 'gpt-4o-mini')
          : azure(model || 'gpt-4o-mini')
        break
      case 'vertex':
        modelInstance = hasConfig
          ? createGoogleGenerativeAI(providerConfig)(model || 'gemini-1.5-flash')
          : google(model || 'gemini-1.5-flash')
        break
      case 'vercel':
      case 'deepseek':
      case 'cerebras':
      case 'groq':
        throw new Error(`${provider} provider not yet implemented in AI SDK`)
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }

    this.modelCache.set(cacheKey, modelInstance)
    return modelInstance
  }

  private buildSystemMessage(
    options?: TitleGenerationRequest['options']
  ): string {
    const allowedTypes = options?.preferredTypes || DEFAULT_TYPES
    const maxLength = options?.maxLength || 72
    const includeScope = options?.includeScope ? 'MUST include' : 'MAY include'

    return `You are an expert at creating Conventional Commits titles for Pull Requests.

Your task is to analyze a PR title and content, then suggest 1-3 improved titles that follow the Conventional Commits standard.

RULES:
1. Format: type(scope): description
2. Allowed types: ${allowedTypes.join(', ')}
3. Scope: ${includeScope} a scope in parentheses
4. Description: lowercase, no period, max ${maxLength} chars total
5. Be specific and descriptive
6. Focus on WHAT changed, not HOW

RESPONSE FORMAT:
Return a JSON object with:
{
  "suggestions": ["title1", "title2", "title3"],
  "reasoning": "explanation of why these titles are better",
  "confidence": 0.9
}

Only return valid JSON, no additional text.`
  }

  private buildPrompt(request: TitleGenerationRequest): string {
    const { originalTitle, prDescription, prBody, changedFiles } = request

    let prompt = `Original PR Title: "${originalTitle}"\n\n`

    if (prDescription) {
      prompt += `PR Description: ${prDescription}\n\n`
    }

    if (prBody) {
      prompt += `PR Body: ${prBody.slice(0, 1000)}${prBody.length > 1000 ? '...' : ''}\n\n`
    }

    if (changedFiles && changedFiles.length > 0) {
      prompt += `Changed Files:\n${changedFiles
        .slice(0, 10)
        .map(f => `- ${f}`)
        .join('\n')}\n\n`
    }

    prompt += 'Generate improved Conventional Commits titles for this PR.'

    return prompt
  }

  private parseResponse(text: string): TitleGenerationResponse {
    try {
      // More aggressive cleaning - remove code blocks, extra whitespace, and common prefixes
      let cleanText = text
        .replace(/```json\s*|\s*```/gi, '') // Remove markdown code blocks
        .replace(/^[^{]*({.*})[^}]*$/s, '$1') // Extract JSON object from surrounding text
        .trim()

      // If no JSON object found, try to find it anywhere in the text
      if (!cleanText.startsWith('{')) {
        const jsonMatch = text.match(/{[\s\S]*}/);
        if (jsonMatch) {
          cleanText = jsonMatch[0];
        }
      }

      const parsed = JSON.parse(cleanText)

      return {
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions
          : [parsed.suggestions || 'feat: improve PR title'],
        reasoning:
          parsed.reasoning || 'AI generated suggestions based on PR content',
        confidence:
          typeof parsed.confidence === 'number' ? parsed.confidence : 0.8
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[AI ERROR] parseResponse JSON parse error:', error)
      // eslint-disable-next-line no-console
      console.error('[AI ERROR] Raw response text:', text)

      const suggestions = this.extractSuggestionsFromText(text)
      return {
        suggestions,
        reasoning:
          'AI response could not be parsed as JSON, extracted suggestions from text',
        confidence: 0.5
      }
    }
  }

  private extractSuggestionsFromText(text: string): string[] {
    const suggestions: string[] = []

    // Look for lines that might be titles (contain : and start with word)
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

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Factory function to create AI service based on environment
export function createAIService(config?: Partial<AIServiceConfig>): AIService {
  const provider = (config?.provider ||
    process.env.AI_PROVIDER ||
    'openai') as AIProvider

  const providerApiKeys: Record<AIProvider, string | undefined> = {
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    google: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    mistral: process.env.MISTRAL_API_KEY,
    xai: process.env.XAI_API_KEY,
    cohere: process.env.COHERE_API_KEY,
    azure: process.env.AZURE_API_KEY,
    vercel: process.env.VERCEL_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
    cerebras: process.env.CEREBRAS_API_KEY,
    groq: process.env.GROQ_API_KEY,
    vertex: process.env.GOOGLE_VERTEX_AI_API_KEY
  }

  const apiKey = config?.apiKey || providerApiKeys[provider]

  if (!apiKey) {
    const envVarName = `${provider.toUpperCase()}_API_KEY`
    throw new Error(
      `API key required for ${provider}. Set ${envVarName} environment variable.`
    )
  }

  return new VercelAIService({
    provider,
    apiKey,
    ...config
  })
}

// Convenience functions
export async function generateConventionalTitle(
  request: TitleGenerationRequest,
  config?: Partial<AIServiceConfig>
): Promise<TitleGenerationResponse> {
  const service = createAIService(config)
  return service.generateTitle(request)
}

export async function isAIServiceHealthy(
  config?: Partial<AIServiceConfig>
): Promise<boolean> {
  try {
    const service = createAIService(config)
    return service.isHealthy()
  } catch {
    return false
  }
}
