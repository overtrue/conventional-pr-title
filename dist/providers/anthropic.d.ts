import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * Anthropic Provider implementation
 */
export declare class AnthropicProvider implements AIProvider {
    readonly name = "anthropic";
    readonly defaultModel = "claude-3-5-haiku-20241022";
    readonly description = "Anthropic Claude models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
