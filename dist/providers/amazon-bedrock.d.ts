import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * Amazon Bedrock Provider implementation
 */
export declare class AmazonBedrockProvider implements AIProvider {
    readonly name = "amazon-bedrock";
    readonly defaultModel = "anthropic.claude-3-haiku-20240307-v1:0";
    readonly description = "Amazon Bedrock models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
