import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * xAI Grok Provider implementation
 */
export declare class XAIProvider implements AIProvider {
    readonly name = "xai";
    readonly defaultModel = "grok-beta";
    readonly description = "xAI Grok models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
