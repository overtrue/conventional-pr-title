/**
 * Convert AI SDK prompt to Claude Code messages format
 */
export interface ConvertedMessages {
    messagesPrompt: string;
    systemPrompt?: string;
}
export interface GenerationMode {
    type: 'regular' | 'object-json' | 'object-tool';
}
export declare function convertToClaudeCodeMessages(prompt: any[], mode?: GenerationMode): ConvertedMessages;
