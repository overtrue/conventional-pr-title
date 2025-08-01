/**
 * Unified logging utilities for the application
 */
export declare class Logger {
    private static isDebugEnabled;
    static configure(debugEnabled: boolean): void;
    static debug(message: string, data?: any): void;
    static error(message: string, error?: any): void;
    static info(message: string): void;
}
/**
 * Simple dependency injection container for better testability
 */
export declare class DIContainer {
    private static services;
    private static factories;
    static register<T>(key: string, instance: T): void;
    static registerFactory<T>(key: string, factory: () => T): void;
    static get<T>(key: string): T;
    static has(key: string): boolean;
    static clear(): void;
}
/**
 * Performance optimization utilities
 */
export declare class PerformanceCache {
    private static cache;
    static get<T>(key: string): T | undefined;
    static set<T>(key: string, value: T): void;
    static has(key: string): boolean;
    static clear(): void;
}
/**
 * Pre-compiled regex patterns for performance
 */
export declare const REGEX_PATTERNS: {
    readonly CONVENTIONAL_COMMIT: RegExp;
    readonly SCOPE: RegExp;
    readonly TYPE: RegExp;
    readonly CHINESE: RegExp;
};
/**
 * Async retry utility with exponential backoff
 */
export declare function withRetry<T>(operation: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
