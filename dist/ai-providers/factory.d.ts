/**
 * AI Provider Factory
 * Factory pattern for creating AI provider instances
 * Inspired by claude-task-master architecture
 */
import { BaseAIProvider, AIProviderConfig } from './base-provider';
export type AIProviderType = 'openai' | 'anthropic' | 'google' | 'mistral' | 'xai' | 'cohere' | 'azure' | 'claude-code';
export interface ProviderInfo {
    name: string;
    className: string;
    requiredApiKey: string;
    defaultModel: string;
    supportedModels: string[];
}
export declare class AIProviderFactory {
    private static providers;
    private static readonly CACHE_TTL;
    private static cacheTimestamps;
    private static readonly providerRegistry;
    /**
     * Create an AI provider instance
     */
    static create(provider: AIProviderType, config: AIProviderConfig): BaseAIProvider;
    /**
     * Get provider metadata
     */
    static getProviderInfo(provider: AIProviderType): ProviderInfo;
    /**
     * Get all supported providers
     */
    static getSupportedProviders(): AIProviderType[];
    /**
     * Get environment variable name for a provider
     */
    static getProviderEnvironmentKey(provider: AIProviderType): string;
    /**
     * Check if provider is supported
     */
    static isProviderSupported(provider: string): provider is AIProviderType;
    /**
     * Get default model for a provider
     */
    static getDefaultModel(provider: AIProviderType): string;
    /**
     * Get supported models for a provider
     */
    static getSupportedModels(provider: AIProviderType): string[];
    /**
     * Validate if a model is supported by a provider
     */
    static isModelSupported(provider: AIProviderType, model: string): boolean;
    /**
     * Health check for a specific provider
     */
    static healthCheck(provider: AIProviderType, config: AIProviderConfig): Promise<boolean>;
    /**
     * Clear provider cache
     */
    static clearCache(): void;
    /**
     * Get provider statistics
     */
    static getStats(): {
        totalProviders: number;
        cachedInstances: number;
        supportedProviders: string[];
    };
}
