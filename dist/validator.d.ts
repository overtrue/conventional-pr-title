/**
 * Validation and pre-checks
 * Handles environment validation and permission checks
 */
import { ActionConfig } from './config';
import { OctokitGitHubService } from './github-service';
export interface ValidationResult {
    shouldSkip: boolean;
    reason?: string;
}
export declare class EnvironmentValidator {
    static validateGitHubContext(): ValidationResult;
    static validatePermissions(config: ActionConfig, githubService: OctokitGitHubService): Promise<ActionConfig>;
}
