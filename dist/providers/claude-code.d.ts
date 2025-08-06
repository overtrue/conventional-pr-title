import { LanguageModel } from 'ai';
import { AIProvider } from './base-provider';
/**
 * Claude Code Provider implementation
 */
export declare class ClaudeCodeProvider implements AIProvider {
    readonly name = "claude-code";
    readonly defaultModel = "sonnet";
    readonly description = "Claude Code SDK/CLI";
    createModel(modelId: string, options?: Record<string, any>): Promise<LanguageModel>;
    getEnvVars(): {
        apiKey: string;
        baseURL: string;
    };
    isAvailable(): boolean;
}
