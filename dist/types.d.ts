export type OperationMode = 'auto' | 'suggest';
export type ActionResult = 'updated' | 'commented' | 'skipped' | 'error';
export interface ActionConfig {
    githubToken: string;
    model: string;
    mode: OperationMode;
    validationOptions: ValidationOptions;
    includeScope: boolean;
    skipIfConventional: boolean;
    debug: boolean;
    matchLanguage: boolean;
    autoComment: boolean;
    customPrompt?: string;
    commentTemplate?: string;
}
export interface ValidationOptions {
    allowedTypes: string[];
    requireScope: boolean;
    maxLength: number;
    minDescriptionLength: number;
}
export interface PRContext {
    number: number;
    title: string;
    body: string | null;
    isDraft: boolean;
    changedFiles: string[];
    diffContent: string;
}
export interface TitleGenerationRequest {
    originalTitle: string;
    prDescription?: string;
    prBody?: string;
    diffContent?: string;
    changedFiles?: string[];
    options?: {
        includeScope?: boolean;
        preferredTypes?: string[];
        maxLength?: number;
        matchLanguage?: boolean;
    };
}
export interface TitleGenerationResponse {
    suggestions: string[];
    reasoning: string;
    confidence: number;
}
export interface ProcessingResult {
    isConventional: boolean;
    suggestions: string[];
    reasoning: string;
    actionTaken: ActionResult;
    errorMessage?: string;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    suggestions: string[];
    parsed?: ConventionalCommit;
}
export interface ConventionalCommit {
    type: string;
    scope?: string;
    breaking: boolean;
    description: string;
    body?: string;
    footer?: string;
}
export interface GitHubServiceConfig {
    token: string;
    owner?: string;
    repo?: string;
}
export interface ConfigError {
    field: string;
    message: string;
    suggestion?: string;
}
