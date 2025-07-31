"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const config_1 = require("./config");
const conventional_1 = require("./conventional");
const ai_service_1 = require("./ai-service");
const github_service_1 = require("./github-service");
/**
 * Main entry point for the GitHub Action
 */
async function run() {
    var _a, _b, _c, _d;
    try {
        (0, core_1.debug)(`Action triggered by: ${github_1.context.eventName}`);
        (0, core_1.debug)(`Repository: ${github_1.context.repo.owner}/${github_1.context.repo.repo}`);
        (0, core_1.debug)(`Triggered by actor: ${github_1.context.actor}`);
        // Prevent infinite loops: Skip if triggered by bot itself
        if (github_1.context.actor === 'github-actions[bot]' || ((_b = (_a = github_1.context.payload) === null || _a === void 0 ? void 0 : _a.sender) === null || _b === void 0 ? void 0 : _b.type) === 'Bot') {
            (0, core_1.info)('Skipping processing: Action was triggered by a bot to prevent infinite loops');
            const configManager = new config_1.ActionConfigManager();
            configManager.setOutputs({
                isConventional: true,
                suggestedTitles: [],
                originalTitle: ((_c = github_1.context.payload.pull_request) === null || _c === void 0 ? void 0 : _c.title) || 'Unknown',
                actionTaken: 'skipped'
            });
            return;
        }
        // Validate that this is a pull request event
        if (github_1.context.eventName !== 'pull_request' &&
            github_1.context.eventName !== 'pull_request_target') {
            throw new Error(`This action only supports pull_request and pull_request_target events, got: ${github_1.context.eventName}`);
        }
        // Get PR information from context
        const pullRequest = github_1.context.payload.pull_request;
        if (!pullRequest) {
            throw new Error('Pull request information not found in event payload');
        }
        const prNumber = pullRequest.number;
        const currentTitle = pullRequest.title;
        const isDraft = pullRequest.draft || false;
        (0, core_1.info)(`Processing PR #${prNumber}: "${currentTitle}"`);
        (0, core_1.debug)(`PR is draft: ${isDraft}`);
        // Initialize configuration
        const configManager = new config_1.ActionConfigManager();
        const config = configManager.parseConfig();
        (0, core_1.debug)(`Configuration loaded:`);
        (0, core_1.debug)(`- AI Provider: ${config.aiProvider}`);
        (0, core_1.debug)(`- Model: ${config.model || 'default'}`);
        (0, core_1.debug)(`- Mode: ${config.mode}`);
        (0, core_1.debug)(`- Skip if conventional: ${config.skipIfConventional}`);
        // Validate current title against conventional commits
        const validationResult = (0, conventional_1.validateTitle)(currentTitle, config.validationOptions);
        const isConventional = validationResult.isValid;
        (0, core_1.info)(`Current title is ${isConventional ? 'conventional' : 'not conventional'}`);
        if (validationResult.errors.length > 0) {
            (0, core_1.debug)(`Validation errors: ${validationResult.errors.join(', ')}`);
        }
        // Check if we should skip processing
        if ((0, config_1.shouldSkipProcessing)(config, isConventional)) {
            (0, core_1.info)('Skipping processing: title is already conventional and skip-if-conventional is enabled');
            configManager.setOutputs({
                isConventional: true,
                suggestedTitles: [],
                originalTitle: currentTitle,
                actionTaken: 'skipped'
            });
            return;
        }
        // Initialize services
        const aiService = new ai_service_1.VercelAIService((0, config_1.createAIServiceConfig)(config));
        const githubService = new github_service_1.OctokitGitHubService({
            token: config.githubToken
        });
        // Check permissions if we're in auto mode
        if ((0, config_1.isAutoMode)(config)) {
            const hasPermission = await githubService.checkPermissions();
            if (!hasPermission) {
                (0, core_1.warning)('Insufficient permissions to update PR title automatically. Falling back to suggestion mode.');
                config.mode = 'suggest';
            }
        }
        // Get additional context for AI generation
        let changedFiles = [];
        try {
            changedFiles = await githubService.getChangedFiles(prNumber);
            (0, core_1.debug)(`Found ${changedFiles.length} changed files`);
        }
        catch (error) {
            (0, core_1.warning)(`Failed to get changed files: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        // Generate AI suggestions
        (0, core_1.info)('Generating AI-powered title suggestions...');
        const aiResponse = await aiService.generateTitle({
            originalTitle: currentTitle,
            changedFiles: changedFiles.slice(0, 20), // Limit to first 20 files to avoid token limits
            options: {
                includeScope: config.includeScope,
                preferredTypes: config.validationOptions.allowedTypes,
                maxLength: config.validationOptions.maxLength
            }
        });
        const suggestedTitles = aiResponse.suggestions;
        (0, core_1.info)(`Generated ${suggestedTitles.length} title suggestions`);
        if (suggestedTitles.length === 0) {
            (0, core_1.warning)('No title suggestions generated');
            configManager.setOutputs({
                isConventional,
                suggestedTitles: [],
                originalTitle: currentTitle,
                actionTaken: 'error',
                errorMessage: 'No title suggestions could be generated'
            });
            return;
        }
        // Log suggestions for debugging
        suggestedTitles.forEach((title, index) => {
            (0, core_1.debug)(`Suggestion ${index + 1}: ${title}`);
        });
        let actionTaken;
        if ((0, config_1.isAutoMode)(config)) {
            // Auto mode: Update the PR title with the best suggestion
            const bestSuggestion = suggestedTitles[0];
            try {
                await githubService.updatePRTitle(prNumber, bestSuggestion);
                (0, core_1.info)(`✅ Updated PR title to: "${bestSuggestion}"`);
                actionTaken = 'updated';
            }
            catch (error) {
                const errorMessage = `Failed to update PR title: ${error instanceof Error ? error.message : 'Unknown error'}`;
                (0, core_1.warning)(errorMessage);
                configManager.setOutputs({
                    isConventional,
                    suggestedTitles,
                    originalTitle: currentTitle,
                    actionTaken: 'error',
                    errorMessage
                });
                return;
            }
        }
        else {
            // Suggestion mode: Add a comment with suggestions
            const commentBody = formatSuggestionComment(currentTitle, suggestedTitles, aiResponse.reasoning, config.commentTemplate);
            try {
                await githubService.createComment(prNumber, commentBody);
                (0, core_1.info)(`💬 Added comment with ${suggestedTitles.length} title suggestions`);
                actionTaken = 'commented';
            }
            catch (error) {
                const errorMessage = `Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}`;
                (0, core_1.warning)(errorMessage);
                configManager.setOutputs({
                    isConventional,
                    suggestedTitles,
                    originalTitle: currentTitle,
                    actionTaken: 'error',
                    errorMessage
                });
                return;
            }
        }
        // Set outputs for other actions/steps
        configManager.setOutputs({
            isConventional,
            suggestedTitles,
            originalTitle: currentTitle,
            actionTaken
        });
        (0, core_1.info)(`🎉 Action completed successfully (${actionTaken})`);
    }
    catch (error) {
        if (error instanceof config_1.ConfigurationError) {
            const configManager = new config_1.ActionConfigManager();
            configManager.handleConfigurationError(error);
            return;
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        (0, core_1.setFailed)(`❌ Action failed: ${errorMessage}`);
        // Try to set error outputs if possible
        try {
            const configManager = new config_1.ActionConfigManager();
            configManager.setOutputs({
                isConventional: false,
                suggestedTitles: [],
                originalTitle: ((_d = github_1.context.payload.pull_request) === null || _d === void 0 ? void 0 : _d.title) || 'Unknown',
                actionTaken: 'error',
                errorMessage
            });
        }
        catch {
            // Ignore errors when setting outputs after failure
        }
    }
}
/**
 * Format the suggestion comment body
 */
function formatSuggestionComment(currentTitle, suggestions, reasoning, template) {
    if (template) {
        // Use custom template
        return template
            .replace(/\${currentTitle}/g, currentTitle)
            .replace(/\${suggestions}/g, suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n'))
            .replace(/\${reasoning}/g, reasoning || '');
    }
    // Use default template
    const lines = [
        '## 🤖 AI-Powered PR Title Suggestions',
        '',
        `The current PR title "${currentTitle}" doesn't follow the [Conventional Commits](https://conventionalcommits.org/) standard.`,
        '',
        '### Suggested titles:',
        ...suggestions.map((suggestion, index) => `${index + 1}. \`${suggestion}\``),
        ''
    ];
    if (reasoning) {
        lines.push('### Reasoning:');
        lines.push(reasoning);
        lines.push('');
    }
    lines.push('### How to apply:', '1. Click the "Edit" button on your PR title', '2. Copy one of the suggested titles above', '3. Save the changes', '', '_This comment was generated by [conventional-pr-title](https://github.com/overtrue/conventional-pr-title) action._');
    return lines.join('\n');
}
// Execute the action if this file is run directly
if (require.main === module) {
    run().catch(error => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map