import { AIServiceConfig } from './ai-service';
import { ValidationOptions } from './conventional';
export type OperationMode = 'auto' | 'suggest';
export type ActionResult = 'updated' | 'commented' | 'skipped' | 'error';
export interface ModelInfo {
    id: string;
    name: string;
    description: string;
    cost_per_1m_tokens: {
        input: number;
        output: number;
    };
    context_length: number;
    max_output_tokens: number;
    capabilities: {
        text: boolean;
        image: boolean;
        tools: boolean;
        json_mode: boolean;
    };
    supported: boolean;
    recommended?: boolean;
    default?: boolean;
}
export interface ActionConfig {
    githubToken: string;
    aiProvider: AIServiceConfig['provider'];
    apiKey: string;
    model?: string;
    temperature: number;
    maxTokens: number;
    mode: OperationMode;
    validationOptions: ValidationOptions;
    customPrompt?: string;
    includeScope: boolean;
    skipIfConventional: boolean;
    commentTemplate?: string;
}
export interface ConfigError {
    field: string;
    message: string;
    suggestion?: string;
}
export declare class ConfigurationError extends Error {
    readonly errors: ConfigError[];
    constructor(errors: ConfigError[]);
}
export declare class ActionConfigManager {
    private config;
    private errors;
    /**
     * Parse and validate configuration from GitHub Actions inputs
     */
    parseConfig(): ActionConfig;
    /**
     * Get the current configuration (must call parseConfig first)
     */
    getConfig(): ActionConfig;
    /**
     * Validate configuration and provide friendly error messages
     */
    validateConfig(config: ActionConfig): ConfigError[];
    /**
     * Set GitHub Actions outputs based on results
     */
    setOutputs(result: {
        isConventional: boolean;
        suggestedTitles: string[];
        originalTitle: string;
        actionTaken: ActionResult;
        errorMessage?: string;
    }): void;
    /**
     * Handle configuration errors with friendly messages
     */
    handleConfigurationError(error: ConfigurationError): void;
    private getRequiredInput;
    private parseAIProvider;
    private parseOperationMode;
    private parseNumber;
    private parseValidationOptions;
    private getProviderDefaultModels;
    private isModelCompatibleWithProvider;
    private formatConfigurationError;
}
export declare const configManager: ActionConfigManager;
export declare function createAIServiceConfig(config: ActionConfig): AIServiceConfig;
export declare function shouldSkipProcessing(config: ActionConfig, isConventional: boolean): boolean;
export declare function isAutoMode(config: ActionConfig): boolean;
export declare function isSuggestionMode(config: ActionConfig): boolean;
export declare function getModelInfo(provider: AIServiceConfig['provider'], modelId: string): ModelInfo | null;
export declare function getProviderModels(provider: AIServiceConfig['provider']): ModelInfo[];
export declare function getRecommendedModels(provider: AIServiceConfig['provider']): ModelInfo[];
export declare function getDefaultModel(provider: AIServiceConfig['provider']): ModelInfo | null;
export declare function getAllSupportedProviders(): AIServiceConfig['provider'][];
export declare function estimateTokenCost(provider: AIServiceConfig['provider'], modelId: string, inputTokens: number, outputTokens: number): {
    input: number;
    output: number;
    total: number;
} | null;
