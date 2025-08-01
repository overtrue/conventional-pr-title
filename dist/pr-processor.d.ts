/**
 * Core business logic for PR title processing
 * Extracted from main index.ts for better separation of concerns
 */
import { ActionConfig, ActionResult } from './config';
import { ModernAIService } from './modern-ai-service';
import { OctokitGitHubService } from './github-service';
export interface PRContext {
    number: number;
    title: string;
    body: string | null;
    isDraft: boolean;
    changedFiles: string[];
    diffContent: string;
}
export interface ProcessingResult {
    isConventional: boolean;
    suggestions: string[];
    reasoning: string;
    actionTaken: ActionResult;
    errorMessage?: string;
}
export declare class PRTitleProcessor {
    private readonly config;
    private readonly aiService;
    private readonly githubService;
    constructor(config: ActionConfig, aiService: ModernAIService, githubService: OctokitGitHubService);
    process(prContext: PRContext): Promise<ProcessingResult>;
    private shouldSkipProcessing;
    private generateSuggestions;
    private executeAction;
    private handleAutoMode;
    private handleSuggestionMode;
    private addSuccessComment;
    private formatSuccessComment;
    private formatSuggestionComment;
}
