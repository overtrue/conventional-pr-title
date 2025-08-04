/**
 * Base AI Provider - Abstract base class for all AI providers
 * Inspired by claude-task-master architecture
 */
import { TitleGenerationRequest, TitleGenerationResponse } from '../shared/types';
export interface AIProviderConfig {
    apiKey: string;
    baseURL?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    timeout?: number;
    debug?: boolean;
    allowedTools?: string[];
    disallowedTools?: string[];
}
export declare abstract class BaseAIProvider {
    protected config: AIProviderConfig;
    protected providerName: string;
    constructor(config: AIProviderConfig, providerName: string);
    abstract getClient(): any;
    abstract getRequiredApiKeyName(): string;
    abstract generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse>;
    abstract isHealthy(): Promise<boolean>;
    protected validateAuth(): void;
    protected validateParams(): void;
    protected isRequiredApiKey(): boolean;
    protected buildSystemMessage(options?: TitleGenerationRequest['options']): string;
    protected buildPrompt(request: TitleGenerationRequest): string;
    protected parseResponse(text: string): TitleGenerationResponse;
    protected extractSuggestionsFromText(text: string): string[];
    protected delay(ms: number): Promise<void>;
    protected handleError(error: unknown, context: string): never;
}
