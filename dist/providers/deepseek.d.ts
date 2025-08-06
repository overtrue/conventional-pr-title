import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * DeepSeek Provider implementation
 */
export declare class DeepSeekProvider implements AIProvider {
    readonly name = "deepseek";
    readonly defaultModel = "deepseek-chat";
    readonly description = "DeepSeek models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
