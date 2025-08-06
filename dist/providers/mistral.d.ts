import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * Mistral Provider implementation
 */
export declare class MistralProvider implements AIProvider {
    readonly name = "mistral";
    readonly defaultModel = "mistral-small-latest";
    readonly description = "Mistral AI models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
