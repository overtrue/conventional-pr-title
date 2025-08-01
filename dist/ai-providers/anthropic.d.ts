/**
 * Anthropic Provider
 */
import { BaseAIProvider, AIProviderConfig } from './base-provider';
import { TitleGenerationRequest, TitleGenerationResponse } from '../shared/types';
export declare class AnthropicProvider extends BaseAIProvider {
    constructor(config: AIProviderConfig);
    getRequiredApiKeyName(): string;
    getClient(): import("@ai-sdk/anthropic").AnthropicProvider | {
        model: (model: string) => import("ai").LanguageModelV1;
    };
    generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse>;
    isHealthy(): Promise<boolean>;
}
