export type AIProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'xai' | 'cohere' | 'azure' | 'claude-code';
export interface AIServiceConfig {
    provider: AIProvider;
    model?: string;
    apiKey?: string;
    baseURL?: string;
    maxTokens?: number;
    temperature?: number;
    maxRetries?: number;
    debug?: boolean;
}
export interface TitleGenerationRequest {
    readonly originalTitle: string;
    readonly prDescription?: string;
    readonly prBody?: string;
    readonly diffContent?: string;
    readonly changedFiles?: readonly string[];
    readonly options?: {
        readonly includeScope?: boolean;
        readonly preferredTypes?: readonly string[];
        readonly maxLength?: number;
        readonly matchLanguage?: boolean;
    };
}
export interface TitleGenerationResponse {
    suggestions: string[];
    reasoning: string;
    confidence: number;
}
export interface AIService {
    generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse>;
    isHealthy(): Promise<boolean>;
}
