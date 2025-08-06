import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * Parse model string to extract provider and model ID
 * @param modelString - Format: "provider/model-id" or "provider"
 */
export declare function parseModelString(modelString: string): {
    provider: string;
    modelId: string;
};
/**
 * Create a language model instance
 * @param modelString - Provider/model format or provider only
 * @param options - Provider-specific options
 */
export declare function createModel(modelString: string, options?: Record<string, any>): Promise<LanguageModel>;
/**
 * Get all available providers
 */
export declare function getAvailableProviders(): AIProvider[];
/**
 * Get all registered providers (including unavailable ones)
 */
export declare function getAllProviders(): AIProvider[];
/**
 * Check if a provider is available
 */
export declare function isProviderAvailable(providerName: string): boolean;
/**
 * Get environment variable names for a provider
 */
export declare function getProviderEnvVars(providerName: string): {
    apiKey: string;
    baseURL: string;
};
/**
 * Get provider information
 */
export declare function getProviderInfo(providerName: string): AIProvider | undefined;
