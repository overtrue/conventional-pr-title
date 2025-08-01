/**
 * Modern AI Service using the new provider architecture
 * This replaces the old VercelAIService with a more extensible design
 */
import { AIService, AIServiceConfig, TitleGenerationRequest, TitleGenerationResponse } from './shared/types';
import { AIProviderType } from './ai-providers';
export declare class ModernAIService implements AIService {
    private config;
    constructor(config: AIServiceConfig);
    generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse>;
    isHealthy(): Promise<boolean>;
    getProviderInfo(): import("./ai-providers").ProviderInfo;
    getSupportedModels(): string[];
    isModelSupported(model: string): boolean;
    static getSupportedProviders(): AIProviderType[];
    static getProviderEnvironmentKey(provider: AIProviderType): string;
}
