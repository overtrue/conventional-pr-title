import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * Fireworks Provider implementation
 */
export declare class FireworksProvider implements AIProvider {
    readonly name = "fireworks";
    readonly defaultModel = "accounts/fireworks/models/llama-v2-7b-chat";
    readonly description = "Fireworks AI models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
