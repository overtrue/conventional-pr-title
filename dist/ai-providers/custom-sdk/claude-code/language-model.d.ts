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
    private claudeCodeModule;
    private _moduleLoadPromise;
    constructor(config: AIProviderConfig & {
        settings?: ClaudeCodeSettings;
    });
    getRequiredApiKeyName(): string;
    protected isRequiredApiKey(): boolean;
    getClient(): any;
    private getModel;
    /**
     * Load Claude Code module with caching and better error handling
     */
    private loadClaudeCodeModule;
    private _loadModule;
    /**
     * Generate text using Claude Code with enhanced error handling
     */
    private generateWithClaudeCode;
    generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse>;
    isHealthy(): Promise<boolean>;
}
