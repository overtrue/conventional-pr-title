import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * Google Vertex AI Provider implementation
 */
export declare class GoogleVertexProvider implements AIProvider {
    readonly name = "google-vertex";
    readonly defaultModel = "gemini-1.5-flash";
    readonly description = "Google Vertex AI models";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
