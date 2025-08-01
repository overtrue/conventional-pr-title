/**
 * Custom SDK - Placeholder for future extensions
 * This demonstrates the architecture for custom AI provider integrations
 * Inspired by claude-task-master's custom-sdk/claude-code structure
 */
export interface CustomSDKConfig {
    apiKey: string;
    baseURL?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
}
export declare class CustomSDK {
    static createProvider(type: 'claude-code', config: CustomSDKConfig): void;
}
