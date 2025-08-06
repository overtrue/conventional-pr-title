import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * Azure OpenAI Provider implementation
 */
export declare class AzureProvider implements AIProvider {
    readonly name = "azure";
    readonly defaultModel = "gpt-4o-mini";
    readonly description = "Azure OpenAI Service";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
