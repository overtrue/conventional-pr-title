import { GitHubService } from './github';
import { ActionConfig, PRContext, ProcessingResult } from './types';
export declare class PRProcessor {
    private readonly config;
    private readonly githubService;
    private systemTemplate;
    private userTemplate;
    constructor(config: ActionConfig, githubService: GitHubService);
    /**
     * Process PR title
     */
    process(prContext: PRContext): Promise<ProcessingResult>;
    private shouldSkipProcessing;
    /**
     * Generate AI suggestions
     */
    private generateSuggestions;
    /**
     * Build system prompt
     */
    private buildSystemPrompt;
    /**
     * Build user prompt
     */
    private buildUserPrompt;
    /**
     * Parse AI response
     */
    private parseResponse;
    /**
     * Extract suggestions from text
     */
    private extractSuggestionsFromText;
    /**
     * Execute action (auto update or comment)
     */
    private executeAction;
    /**
     * Handle auto mode
     */
    private handleAutoMode;
    /**
     * Handle suggestion mode
     */
    private handleSuggestionMode;
    /**
     * Add success notification comment
     */
    private addSuccessComment;
    /**
     * Format suggestion comment
     */
    private formatSuggestionComment;
    /**
     * Format success comment
     */
    private formatSuccessComment;
    private delay;
}
