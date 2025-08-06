import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * Cerebras Provider implementation
 */
export declare class CerebrasProvider implements AIProvider {
    readonly name = "cerebras";
    readonly defaultModel = "llama3.1-8b";
    readonly description = "Cerebras models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
