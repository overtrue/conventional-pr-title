export declare const CONFIG_DEFAULTS: {
    readonly AI_PROVIDER: "openai";
    readonly MODE: "suggest";
    readonly TEMPERATURE: 0.3;
    readonly MAX_TOKENS: 500;
    readonly MAX_LENGTH: 72;
    readonly MIN_DESCRIPTION_LENGTH: 3;
    readonly INCLUDE_SCOPE: false;
    readonly SKIP_IF_CONVENTIONAL: false;
    readonly MATCH_LANGUAGE: true;
    readonly AUTO_COMMENT: false;
    readonly DEBUG: false;
};
export declare const PROCESSING_LIMITS: {
    readonly MAX_CHANGED_FILES: 20;
    readonly MAX_DIFF_FILES: 5;
    readonly MAX_DIFF_SIZE: 3000;
    readonly MAX_PR_BODY_SIZE: 1500;
    readonly MAX_RETRIES: 3;
    readonly RETRY_DELAY_BASE: 1000;
};
export declare const CONVENTIONAL_TYPES: readonly ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"];
export declare const AI_PROVIDERS: readonly ["openai", "anthropic", "google", "mistral", "xai", "cohere", "azure", "claude-code"];
export type ConventionalType = typeof CONVENTIONAL_TYPES[number];
export type AIProviderType = typeof AI_PROVIDERS[number];
