import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * DeepInfra Provider implementation
 */
export declare class DeepInfraProvider implements AIProvider {
    readonly name = "deepinfra";
    readonly defaultModel = "meta-llama/Llama-2-7b-chat-hf";
    readonly description = "DeepInfra models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
