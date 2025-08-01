export type AIProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'xai' | 'cohere' | 'azure' | 'vercel' | 'deepseek' | 'cerebras' | 'groq' | 'vertex';
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
    originalTitle: string;
    prDescription?: string;
    prBody?: string;
    diffContent?: string;
    changedFiles?: string[];
    options?: {
        includeScope?: boolean;
        preferredTypes?: string[];
        maxLength?: number;
        matchLanguage?: boolean;
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
export declare class VercelAIService implements AIService {
    private config;
    private modelCache;
    constructor(config: AIServiceConfig);
    private debugLog;
    private errorLog;
    generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse>;
    isHealthy(): Promise<boolean>;
    private callAI;
    private getModel;
    private buildSystemMessage;
    private buildPrompt;
    private parseResponse;
    private extractSuggestionsFromText;
    private delay;
}
export declare function createAIService(config?: Partial<AIServiceConfig>): AIService;
export declare function generateConventionalTitle(request: TitleGenerationRequest, config?: Partial<AIServiceConfig>): Promise<TitleGenerationResponse>;
export declare function isAIServiceHealthy(config?: Partial<AIServiceConfig>): Promise<boolean>;
