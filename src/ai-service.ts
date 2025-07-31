import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { mistral } from '@ai-sdk/mistral'
import { xai } from '@ai-sdk/xai'
import { cohere } from '@ai-sdk/cohere'
import { azure } from '@ai-sdk/azure'
import { generateText } from 'ai'
import { ConventionalCommit, DEFAULT_TYPES } from './conventional'

export interface AIServiceConfig {
  provider:
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
  private retryCount = 0

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
    const prompt = this.buildPrompt(request)
    const systemMessage = this.buildSystemMessage(request.options)

    try {
      const result = await this.callAI(prompt, systemMessage)
      return this.parseResponse(result.text)
    } catch (error) {
      if (this.retryCount < (this.config.maxRetries || 3)) {
        this.retryCount++
        await this.delay(1000 * this.retryCount) // Exponential backoff
        return this.generateTitle(request)
      }
      throw new Error(
        `AI service failed after ${this.config.maxRetries} retries: ${error}`
      )
    }
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

    // Set API key and baseURL via environment variables
    if (this.config.apiKey) {
      switch (this.config.provider) {
        case 'openai':
          process.env.OPENAI_API_KEY = this.config.apiKey
          if (this.config.baseURL) {
            process.env.OPENAI_BASE_URL = this.config.baseURL
          }
          break
        case 'anthropic':
          process.env.ANTHROPIC_API_KEY = this.config.apiKey
          if (this.config.baseURL) {
            process.env.ANTHROPIC_BASE_URL = this.config.baseURL
          }
          break
        case 'google':
          process.env.GOOGLE_GENERATIVE_AI_API_KEY = this.config.apiKey
          if (this.config.baseURL) {
            process.env.GOOGLE_GENERATIVE_AI_BASE_URL = this.config.baseURL
          }
          break
        case 'mistral':
          process.env.MISTRAL_API_KEY = this.config.apiKey
          if (this.config.baseURL) {
            process.env.MISTRAL_BASE_URL = this.config.baseURL
          }
          break
        case 'xai':
          process.env.XAI_API_KEY = this.config.apiKey
          if (this.config.baseURL) {
            process.env.XAI_BASE_URL = this.config.baseURL
          }
          break
        case 'cohere':
          process.env.COHERE_API_KEY = this.config.apiKey
          if (this.config.baseURL) {
            process.env.COHERE_BASE_URL = this.config.baseURL
          }
          break
        case 'azure':
          process.env.AZURE_API_KEY = this.config.apiKey
          if (this.config.baseURL) {
            process.env.AZURE_BASE_URL = this.config.baseURL
          }
          break
        case 'vercel':
          process.env.VERCEL_API_KEY = this.config.apiKey
          if (this.config.baseURL) {
            process.env.VERCEL_BASE_URL = this.config.baseURL
          }
          break
        case 'deepseek':
          process.env.DEEPSEEK_API_KEY = this.config.apiKey
          if (this.config.baseURL) {
            process.env.DEEPSEEK_BASE_URL = this.config.baseURL
          }
          break
        case 'cerebras':
          process.env.CEREBRAS_API_KEY = this.config.apiKey
          if (this.config.baseURL) {
            process.env.CEREBRAS_BASE_URL = this.config.baseURL
          }
          break
        case 'groq':
          process.env.GROQ_API_KEY = this.config.apiKey
          if (this.config.baseURL) {
            process.env.GROQ_BASE_URL = this.config.baseURL
          }
          break
        case 'vertex':
          process.env.GOOGLE_VERTEX_AI_API_KEY = this.config.apiKey
          if (this.config.baseURL) {
            process.env.GOOGLE_VERTEX_AI_BASE_URL = this.config.baseURL
          }
          break
      }
    }

    return await generateText({
      model,
      system: systemMessage,
      prompt,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature
    })
  }

  private getModel() {
    const { provider, model } = this.config

    switch (provider) {
      case 'openai':
        return openai(model || 'gpt-4o-mini')
      case 'anthropic':
        return anthropic(model || 'claude-3-5-sonnet-20241022')
      case 'google':
        return google(model || 'gemini-1.5-flash')
      case 'mistral':
        return mistral(model || 'mistral-large-latest')
      case 'xai':
        return xai(model || 'grok-beta')
      case 'cohere':
        return cohere(model || 'command-r-plus')
      case 'azure':
        return azure(model || 'gpt-4o-mini')
      case 'vercel':
        // Note: Vercel provider needs to be imported if available
        throw new Error('Vercel provider not yet implemented in AI SDK')
      case 'deepseek':
        // Note: DeepSeek provider needs to be imported if available
        throw new Error('DeepSeek provider not yet implemented in AI SDK')
      case 'cerebras':
        // Note: Cerebras provider needs to be imported if available
        throw new Error('Cerebras provider not yet implemented in AI SDK')
      case 'groq':
        // Note: Groq provider needs to be imported if available
        throw new Error('Groq provider not yet implemented in AI SDK')
      case 'vertex':
        // Note: Vertex is typically same as Google but with different auth
        return google(model || 'gemini-1.5-flash')
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
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
      // Clean up the response - remove any markdown formatting or extra text
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim()
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
      // Fallback parsing if JSON fails
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
    'openai') as AIServiceConfig['provider']

  // Map of providers to their environment variable names
  const providerApiKeys = {
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
    const envVarName = Object.keys(providerApiKeys).find(
      key => key === provider
    )
    const envVarValue = envVarName
      ? `${envVarName.toUpperCase()}_API_KEY`
      : 'API_KEY'
    throw new Error(
      `API key required for ${provider}. Set ${envVarValue} environment variable.`
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
