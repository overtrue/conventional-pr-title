/**
 * Context extraction utilities
 * Handles gathering PR context information from GitHub API
 */
import { OctokitGitHubService } from './github-service';
import { PRContext } from './pr-processor';
export declare class PRContextExtractor {
    private readonly githubService;
    constructor(githubService: OctokitGitHubService);
    extractContext(prNumber: number, pullRequest: any): Promise<PRContext>;
    private extractDiffContent;
}
