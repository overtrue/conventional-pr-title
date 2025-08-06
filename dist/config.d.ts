import { ActionConfig, ConfigError } from './types';
export declare class ConfigurationError extends Error {
    readonly errors: ConfigError[];
    constructor(errors: ConfigError[]);
}
export declare class ConfigManager {
    private config;
    /**
     * Parse GitHub Actions input parameters
     */
    parseConfig(): ActionConfig;
    /**
     * Get configuration
     */
    getConfig(): ActionConfig;
    /**
     * Set GitHub Actions outputs
     */
    setOutputs(result: {
        isConventional: boolean;
        suggestedTitles: string[];
        originalTitle: string;
        actionTaken: string;
        errorMessage?: string;
    }): void;
    /**
     * Handle configuration errors
     */
    handleConfigurationError(error: ConfigurationError): void;
    private getRequiredInput;
    private parseMode;
    private parseValidationOptions;
    private parseNumber;
    private validateConfig;
    private formatError;
}
