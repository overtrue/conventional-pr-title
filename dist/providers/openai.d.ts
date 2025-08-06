import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * OpenAI Provider implementation
 */
export declare class OpenAIProvider implements AIProvider {
    readonly name = "openai";
    readonly defaultModel = "gpt-4o-mini";
    readonly description = "OpenAI GPT models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
