/**
 * Claude Code Provider using AI SDK Claude Code Provider
 * Uses the official ai-sdk-provider-claude-code for better integration
 */
import { BaseAIProvider, AIProviderConfig } from './base-provider';
import { TitleGenerationRequest, TitleGenerationResponse } from '../shared/types';
export declare class ClaudeCodeProvider extends BaseAIProvider {
    private claudeCode;
    constructor(config: AIProviderConfig);
    getRequiredApiKeyName(): string;
    protected isRequiredApiKey(): boolean;
    getClient(): any;
    private mapModelName;
    generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse>;
    isHealthy(): Promise<boolean>;
}
