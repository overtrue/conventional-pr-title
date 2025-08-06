import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * OpenRouter Provider implementation
 */
export declare class OpenRouterProvider implements AIProvider {
    readonly name = "openrouter";
    readonly defaultModel = "openai/gpt-4o";
    readonly description = "OpenRouter - Access to 300+ models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
