import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * Perplexity Provider implementation
 */
export declare class PerplexityProvider implements AIProvider {
    readonly name = "perplexity";
    readonly defaultModel = "llama-3.1-sonar-small-128k-online";
    readonly description = "Perplexity models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
