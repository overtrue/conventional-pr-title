import { ConventionalCommit, ValidationOptions, ValidationResult } from './types';
/**
 * Process template string replacement
 */
export declare function processTemplate(template: string, variables: Record<string, any>): string;
export declare const DEFAULT_TYPES: string[];
export declare const DEFAULT_OPTIONS: ValidationOptions;
/**
 * Parse conventional commit format message
 */
export declare function parseConventionalCommit(message: string): ConventionalCommit | null;
/**
 * Validate if PR title follows Conventional Commits standard
 */
export declare function validateTitle(title: string, options?: ValidationOptions): ValidationResult;
/**
 * Check if title already follows Conventional Commits format
 */
export declare function isConventionalTitle(title: string, options?: Partial<ValidationOptions>): boolean;
