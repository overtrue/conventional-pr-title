/**
 * Claude Code Provider
 * Uses Claude Code CLI for enhanced AI interactions
 */
import { BaseAIProvider, AIProviderConfig } from './base-provider';
import { TitleGenerationRequest, TitleGenerationResponse } from '../shared/types';
export declare class ClaudeCodeProvider extends BaseAIProvider {
    private languageModel;
    constructor(config: AIProviderConfig);
    getRequiredApiKeyName(): string;
    protected isRequiredApiKey(): boolean;
    getClient(): any;
    generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse>;
    isHealthy(): Promise<boolean>;
}
