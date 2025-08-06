import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * Google Generative AI Provider implementation
 */
export declare class GoogleProvider implements AIProvider {
    readonly name = "google";
    readonly defaultModel = "gemini-1.5-flash";
    readonly description = "Google Generative AI models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
