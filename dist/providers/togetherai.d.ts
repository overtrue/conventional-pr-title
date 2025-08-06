import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * Together.ai Provider implementation
 */
export declare class TogetherAIProvider implements AIProvider {
    readonly name = "togetherai";
    readonly defaultModel = "meta-llama/Llama-2-7b-chat-hf";
    readonly description = "Together.ai models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
