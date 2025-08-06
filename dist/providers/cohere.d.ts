import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * Cohere Provider implementation
 */
export declare class CohereProvider implements AIProvider {
    readonly name = "cohere";
    readonly defaultModel = "command-r-plus";
    readonly description = "Cohere Command models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
