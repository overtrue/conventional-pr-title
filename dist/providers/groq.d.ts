import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * Groq Provider implementation
 */
export declare class GroqProvider implements AIProvider {
    readonly name = "groq";
    readonly defaultModel = "llama-3.1-8b-instant";
    readonly description = "Groq models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
