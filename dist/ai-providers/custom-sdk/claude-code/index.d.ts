/**
 * Claude Code provider factory and exports
 */
import { ClaudeCodeProvider, ClaudeCodeProviderSettings } from './types';
/**
 * Create a Claude Code provider using the CLI interface
 */
export declare function createClaudeCode(options?: ClaudeCodeProviderSettings): ClaudeCodeProvider;
export declare const claudeCode: ClaudeCodeProvider;
export { ClaudeCodeLanguageModel } from './language-model';
export * from './types';
export * from './errors';
export * from './json-extractor';
export * from './message-converter';
export default claudeCode;
