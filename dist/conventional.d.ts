export interface ConventionalCommit {
    type: string;
    scope?: string;
    breaking: boolean;
    description: string;
    body?: string;
    footer?: string;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    suggestions: string[];
    parsed?: ConventionalCommit;
}
export interface ValidationOptions {
    allowedTypes?: string[];
    requireScope?: boolean;
    maxLength?: number;
    minDescriptionLength?: number;
}
export declare const DEFAULT_TYPES: string[];
export declare const DEFAULT_OPTIONS: ValidationOptions;
/**
 * Parse a conventional commit message
 * Format: type(scope)!: description
 */
export declare function parseConventionalCommit(message: string): ConventionalCommit | null;
/**
 * Validate a PR title against Conventional Commits standard
 */
export declare function validateTitle(title: string, options?: ValidationOptions): ValidationResult;
/**
 * Generate suggestions for improving a non-conventional title
 */
export declare function generateSuggestions(title: string, options?: ValidationOptions): string[];
/**
 * Check if a title is already in conventional format
 */
export declare function isConventionalTitle(title: string, options?: ValidationOptions): boolean;
