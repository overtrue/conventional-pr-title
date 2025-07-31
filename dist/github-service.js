"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OctokitGitHubService = void 0;
exports.createGitHubService = createGitHubService;
exports.getPRInfoFromContext = getPRInfoFromContext;
exports.formatCommentWithMention = formatCommentWithMention;
exports.withRetry = withRetry;
const github_1 = require("@actions/github");
const github_2 = require("@actions/github");
class OctokitGitHubService {
    constructor(config) {
        this.octokit = (0, github_1.getOctokit)(config.token);
        // Use provided owner/repo or get from context
        this.owner = config.owner !== undefined ? config.owner : github_2.context.repo.owner;
        this.repo = config.repo !== undefined ? config.repo : github_2.context.repo.repo;
        if (!this.owner || !this.repo || this.owner === '' || this.repo === '') {
            throw new Error('GitHub repository owner and name must be provided or available in context');
        }
    }
    async getPRInfo(prNumber) {
        var _a;
        try {
            const { data: pr } = await this.octokit.rest.pulls.get({
                owner: this.owner,
                repo: this.repo,
                pull_number: prNumber
            });
            return {
                number: pr.number,
                title: pr.title,
                body: pr.body,
                author: ((_a = pr.user) === null || _a === void 0 ? void 0 : _a.login) || 'unknown',
                headRef: pr.head.ref,
                baseRef: pr.base.ref,
                labels: pr.labels.map(label => typeof label === 'string' ? label : label.name || ''),
                isDraft: pr.draft || false
            };
        }
        catch (error) {
            throw new Error(`Failed to get PR info: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async updatePRTitle(prNumber, newTitle) {
        try {
            await this.octokit.rest.pulls.update({
                owner: this.owner,
                repo: this.repo,
                pull_number: prNumber,
                title: newTitle
            });
        }
        catch (error) {
            throw new Error(`Failed to update PR title: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createComment(prNumber, body) {
        var _a;
        try {
            const { data: comment } = await this.octokit.rest.issues.createComment({
                owner: this.owner,
                repo: this.repo,
                issue_number: prNumber,
                body
            });
            return {
                id: comment.id,
                body: comment.body || '',
                author: ((_a = comment.user) === null || _a === void 0 ? void 0 : _a.login) || 'unknown',
                createdAt: comment.created_at
            };
        }
        catch (error) {
            throw new Error(`Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getChangedFiles(prNumber) {
        try {
            const { data: files } = await this.octokit.rest.pulls.listFiles({
                owner: this.owner,
                repo: this.repo,
                pull_number: prNumber
            });
            return files.map(file => file.filename);
        }
        catch (error) {
            throw new Error(`Failed to get changed files: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async checkPermissions() {
        try {
            // Try to get repository info to check read permissions
            await this.octokit.rest.repos.get({
                owner: this.owner,
                repo: this.repo
            });
            // Try to check if we have write permissions by getting the current user's permission level
            const { data: permission } = await this.octokit.rest.repos.getCollaboratorPermissionLevel({
                owner: this.owner,
                repo: this.repo,
                username: await this.getCurrentUser()
            });
            return ['admin', 'write'].includes(permission.permission);
        }
        catch (error) {
            console.warn('Permission check failed:', error);
            return false;
        }
    }
    async getCurrentUser() {
        try {
            const { data: user } = await this.octokit.rest.users.getAuthenticated();
            return user.login;
        }
        catch (error) {
            throw new Error(`Failed to get current user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.OctokitGitHubService = OctokitGitHubService;
// Utility functions for common operations
async function createGitHubService(token) {
    const githubToken = token || process.env.GITHUB_TOKEN;
    if (!githubToken) {
        throw new Error('GitHub token is required. Set GITHUB_TOKEN environment variable or provide token parameter.');
    }
    return new OctokitGitHubService({ token: githubToken });
}
async function getPRInfoFromContext() {
    var _a;
    if (github_2.context.eventName !== 'pull_request' &&
        github_2.context.eventName !== 'pull_request_target') {
        return null;
    }
    const prNumber = (_a = github_2.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number;
    if (!prNumber) {
        return null;
    }
    const service = await createGitHubService();
    return service.getPRInfo(prNumber);
}
// Utility function to format comment body with mentions
function formatCommentWithMention(author, suggestions, reasoning) {
    const suggestionsList = suggestions
        .map((suggestion, index) => `${index + 1}. \`${suggestion}\``)
        .join('\n');
    return `Hi @${author}! 👋

I noticed your PR title doesn't follow the [Conventional Commits](https://www.conventionalcommits.org/) standard. Here are some suggestions:

${suggestionsList}

**Reasoning:** ${reasoning}

Would you like me to update the title automatically, or would you prefer to update it yourself?

---
*This comment was generated by the Conventional PR Title Action*`;
}
// Retry wrapper for GitHub API calls
async function withRetry(operation, maxRetries = 3, delayMs = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            // Don't retry on authentication or permission errors
            if (lastError.message.includes('401') ||
                lastError.message.includes('403')) {
                throw lastError;
            }
            if (attempt === maxRetries) {
                throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError.message}`);
            }
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
        }
    }
    throw lastError;
}
//# sourceMappingURL=github-service.js.map