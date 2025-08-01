/**
 * Error handling utilities for Claude Code provider
 */
export declare class ClaudeCodeAPIError extends Error {
    readonly isRetryable: boolean;
    readonly code?: string;
    readonly exitCode?: number;
    readonly stderr?: string;
    readonly data?: any;
    readonly cause?: Error;
    constructor(options: {
        message: string;
        cause?: Error;
        code?: string;
        exitCode?: number;
        stderr?: string;
        isRetryable?: boolean;
        data?: any;
    });
}
export declare class ClaudeCodeAuthenticationError extends Error {
    readonly cause?: Error;
    constructor(message: string, cause?: Error);
}
export declare class ClaudeCodeTimeoutError extends ClaudeCodeAPIError {
    constructor(message: string, timeout: number);
}
export declare function createAPICallError(options: {
    message: string;
    cause?: Error;
    data?: any;
}): ClaudeCodeAPIError;
export declare function createAuthenticationError(options: {
    message: string;
    cause?: Error;
}): ClaudeCodeAuthenticationError;
export declare function createTimeoutError(options: {
    message: string;
    timeout: number;
}): ClaudeCodeTimeoutError;
export declare function isAuthenticationError(error: Error): error is ClaudeCodeAuthenticationError;
export declare function isTimeoutError(error: Error): error is ClaudeCodeTimeoutError;
export declare function getErrorMetadata(error: any): any;
