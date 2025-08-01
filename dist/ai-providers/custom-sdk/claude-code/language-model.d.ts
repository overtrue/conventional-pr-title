/**
 * Claude Code Language Model implementation
 * Uses @anthropic-ai/claude-code SDK for enhanced AI interactions
 */
import { BaseAIProvider, AIProviderConfig } from '../../base-provider';
import { TitleGenerationRequest, TitleGenerationResponse } from '../../../shared/types';
import { ClaudeCodeSettings } from './types';
export declare class ClaudeCodeLanguageModel extends BaseAIProvider {
    private readonly settings;
    private readonly sessionId;
    private claudeCode;
    constructor(config: AIProviderConfig & {
        settings?: ClaudeCodeSettings;
    });
    getRequiredApiKeyName(): string;
    protected isRequiredApiKey(): boolean;
    getClient(): any;
    private getModel;
    private loadClaudeCode;
    generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse>;
    isHealthy(): Promise<boolean>;
}
