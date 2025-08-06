"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseModelString = parseModelString;
exports.createModel = createModel;
exports.getAvailableProviders = getAvailableProviders;
exports.getAllProviders = getAllProviders;
exports.isProviderAvailable = isProviderAvailable;
exports.getProviderEnvVars = getProviderEnvVars;
exports.getProviderInfo = getProviderInfo;
const amazon_bedrock_1 = require("./amazon-bedrock");
const anthropic_1 = require("./anthropic");
const azure_1 = require("./azure");
const cerebras_1 = require("./cerebras");
const claude_code_1 = require("./claude-code");
const cohere_1 = require("./cohere");
const deepinfra_1 = require("./deepinfra");
const deepseek_1 = require("./deepseek");
const fireworks_1 = require("./fireworks");
const google_1 = require("./google");
const google_vertex_1 = require("./google-vertex");
const groq_1 = require("./groq");
const mistral_1 = require("./mistral");
const openai_1 = require("./openai");
const openrouter_1 = require("./openrouter");
const perplexity_1 = require("./perplexity");
const togetherai_1 = require("./togetherai");
const xai_1 = require("./xai");
/**
 * Registry of all available AI providers
 */
const providers = new Map();
// Register all official AI SDK text generation providers
providers.set('openai', new openai_1.OpenAIProvider());
providers.set('anthropic', new anthropic_1.AnthropicProvider());
providers.set('google', new google_1.GoogleProvider());
providers.set('google-vertex', new google_vertex_1.GoogleVertexProvider());
providers.set('azure', new azure_1.AzureProvider());
providers.set('mistral', new mistral_1.MistralProvider());
providers.set('cohere', new cohere_1.CohereProvider());
providers.set('xai', new xai_1.XAIProvider());
providers.set('amazon-bedrock', new amazon_bedrock_1.AmazonBedrockProvider());
providers.set('togetherai', new togetherai_1.TogetherAIProvider());
providers.set('fireworks', new fireworks_1.FireworksProvider());
providers.set('deepinfra', new deepinfra_1.DeepInfraProvider());
providers.set('deepseek', new deepseek_1.DeepSeekProvider());
providers.set('cerebras', new cerebras_1.CerebrasProvider());
providers.set('groq', new groq_1.GroqProvider());
providers.set('perplexity', new perplexity_1.PerplexityProvider());
providers.set('claude-code', new claude_code_1.ClaudeCodeProvider());
providers.set('openrouter', new openrouter_1.OpenRouterProvider());
/**
 * Parse model string to extract provider and model ID
 * @param modelString - Format: "provider/model-id" or "provider"
 */
function parseModelString(modelString) {
    const parts = modelString.split('/');
    if (parts.length === 1) {
        // Provider only, use default model
        const provider = parts[0];
        const providerInstance = providers.get(provider);
        if (!providerInstance) {
            throw new Error(`Unknown provider: ${provider}`);
        }
        return { provider, modelId: providerInstance.defaultModel };
    }
    else {
        // Provider/model format
        const provider = parts[0];
        const modelId = parts.slice(1).join('/'); // Handle model IDs with slashes
        // Check if provider exists even for provider/model format
        const providerInstance = providers.get(provider);
        if (!providerInstance) {
            throw new Error(`Unknown provider: ${provider}`);
        }
        return { provider, modelId };
    }
}
/**
 * Create a language model instance
 * @param modelString - Provider/model format or provider only
 * @param options - Provider-specific options
 */
async function createModel(modelString, options = {}) {
    const { provider, modelId } = parseModelString(modelString);
    const providerInstance = providers.get(provider);
    if (!providerInstance) {
        throw new Error(`Unknown provider: ${provider}`);
    }
    if (!providerInstance.isAvailable()) {
        throw new Error(`Provider '${provider}' is not available. Install the required package.`);
    }
    return providerInstance.createModel(modelId, options);
}
/**
 * Get all available providers
 */
function getAvailableProviders() {
    return Array.from(providers.values()).filter(p => p.isAvailable());
}
/**
 * Get all registered providers (including unavailable ones)
 */
function getAllProviders() {
    return Array.from(providers.values());
}
/**
 * Check if a provider is available
 */
function isProviderAvailable(providerName) {
    const provider = providers.get(providerName);
    return provider ? provider.isAvailable() : false;
}
/**
 * Get environment variable names for a provider
 */
function getProviderEnvVars(providerName) {
    const provider = providers.get(providerName);
    if (!provider) {
        throw new Error(`Unknown provider: ${providerName}`);
    }
    return provider.getEnvVars();
}
/**
 * Get provider information
 */
function getProviderInfo(providerName) {
    return providers.get(providerName);
}
