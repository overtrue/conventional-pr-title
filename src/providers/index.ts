import { LanguageModel } from 'ai'
import { AmazonBedrockProvider } from './amazon-bedrock.js'
import { AnthropicProvider } from './anthropic.js'
import { AzureProvider } from './azure.js'
import { AIProvider } from './base-provider.js'
import { CerebrasProvider } from './cerebras.js'
import { ClaudeCodeProvider } from './claude-code.js'
import { CohereProvider } from './cohere.js'
import { DeepInfraProvider } from './deepinfra.js'
import { DeepSeekProvider } from './deepseek.js'
import { FireworksProvider } from './fireworks.js'
import { GoogleVertexProvider } from './google-vertex.js'
import { GoogleProvider } from './google.js'
import { GroqProvider } from './groq.js'
import { MistralProvider } from './mistral.js'
import { OpenAIProvider } from './openai.js'
import { OpenRouterProvider } from './openrouter.js'
import { PerplexityProvider } from './perplexity.js'
import { TogetherAIProvider } from './togetherai.js'
import { XAIProvider } from './xai.js'

/**
 * Registry of all available AI providers
 */
const providers = new Map<string, AIProvider>()

// Register all official AI SDK text generation providers
providers.set('openai', new OpenAIProvider())
providers.set('anthropic', new AnthropicProvider())
providers.set('google', new GoogleProvider())
providers.set('google-vertex', new GoogleVertexProvider())
providers.set('azure', new AzureProvider())
providers.set('mistral', new MistralProvider())
providers.set('cohere', new CohereProvider())
providers.set('xai', new XAIProvider())
providers.set('amazon-bedrock', new AmazonBedrockProvider())
providers.set('togetherai', new TogetherAIProvider())
providers.set('fireworks', new FireworksProvider())
providers.set('deepinfra', new DeepInfraProvider())
providers.set('deepseek', new DeepSeekProvider())
providers.set('cerebras', new CerebrasProvider())
providers.set('groq', new GroqProvider())
providers.set('perplexity', new PerplexityProvider())
providers.set('claude-code', new ClaudeCodeProvider())
providers.set('openrouter', new OpenRouterProvider())

/**
 * Parse model string to extract provider and model ID
 * @param modelString - Format: "provider/model-id" or "provider"
 */
export function parseModelString(modelString: string): { provider: string; modelId: string } {
  const parts = modelString.split('/')
  if (parts.length === 1) {
    // Provider only, use default model
    const provider = parts[0]
    const providerInstance = providers.get(provider)
    if (!providerInstance) {
      throw new Error(`Unknown provider: ${provider}`)
    }
    return { provider, modelId: providerInstance.defaultModel }
  } else {
    // Provider/model format
    const provider = parts[0]
    const modelId = parts.slice(1).join('/') // Handle model IDs with slashes

    // Check if provider exists even for provider/model format
    const providerInstance = providers.get(provider)
    if (!providerInstance) {
      throw new Error(`Unknown provider: ${provider}`)
    }

    return { provider, modelId }
  }
}

/**
 * Create a language model instance
 * @param modelString - Provider/model format or provider only
 * @param options - Provider-specific options
 */
export async function createModel(
  modelString: string,
  options: Record<string, any> = {}
): Promise<LanguageModel> {
  const { provider, modelId } = parseModelString(modelString)

  const providerInstance = providers.get(provider)
  if (!providerInstance) {
    throw new Error(`Unknown provider: ${provider}`)
  }

  return providerInstance.createModel(modelId, options)
}

/**
 * Get all available providers
 */
export function getAvailableProviders(): AIProvider[] {
  return Array.from(providers.values())
}

/**
 * Get all registered providers (including unavailable ones)
 */
export function getAllProviders(): AIProvider[] {
  return Array.from(providers.values())
}

/**
 * Check if a provider is available
 */
export function isProviderAvailable(providerName: string): boolean {
  return providers.has(providerName)
}

/**
 * Get environment variable names for a provider
 */
export function getProviderEnvVars(providerName: string): { apiKey: string; baseURL: string } {
  const provider = providers.get(providerName)
  if (!provider) {
    throw new Error(`Unknown provider: ${providerName}`)
  }
  return provider.getEnvVars()
}

/**
 * Get provider information
 */
export function getProviderInfo(providerName: string): AIProvider | undefined {
  return providers.get(providerName)
}
