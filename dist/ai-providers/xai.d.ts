/**
 * XAI (xAI) Provider
 */
import { BaseAIProvider, AIProviderConfig } from './base-provider';
import { TitleGenerationRequest, TitleGenerationResponse } from '../shared/types';
export declare class XAIProvider extends BaseAIProvider {
    constructor(config: AIProviderConfig);
    getRequiredApiKeyName(): string;
    getClient(): import("@ai-sdk/xai").XaiProvider | {
        model: (model: string) => import("ai").LanguageModelV1;
    };
    generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse>;
    isHealthy(): Promise<boolean>;
}
