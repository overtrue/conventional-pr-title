export interface GitHubConfig {
    token: string;
    owner?: string;
    repo?: string;
}
export interface PRInfo {
    number: number;
    title: string;
    body: string | null;
    author: string;
    headRef: string;
    baseRef: string;
    changedFiles?: string[];
    labels: string[];
    isDraft: boolean;
}
export interface PRComment {
    id: number;
    body: string;
    author: string;
    createdAt: string;
}
export interface GitHubService {
    getPRInfo(prNumber: number): Promise<PRInfo>;
    updatePRTitle(prNumber: number, newTitle: string): Promise<void>;
    createComment(prNumber: number, body: string): Promise<PRComment>;
    getChangedFiles(prNumber: number): Promise<string[]>;
    checkPermissions(): Promise<boolean>;
}
export declare class OctokitGitHubService implements GitHubService {
    private _octokit;
    private owner;
    private repo;
    get octokit(): import("@octokit/core").Octokit & import("@octokit/plugin-rest-endpoint-methods/dist-types/types").Api & {
        paginate: import("@octokit/plugin-paginate-rest").PaginateInterface;
    };
    constructor(config: GitHubConfig);
    getPRInfo(prNumber: number): Promise<PRInfo>;
    updatePRTitle(prNumber: number, newTitle: string): Promise<void>;
    createComment(prNumber: number, body: string): Promise<PRComment>;
    getChangedFiles(prNumber: number): Promise<string[]>;
    checkPermissions(): Promise<boolean>;
}
export declare function createGitHubService(token?: string): Promise<GitHubService>;
export declare function getPRInfoFromContext(): Promise<PRInfo | null>;
export declare function formatCommentWithMention(author: string, suggestions: string[], reasoning: string): string;
export declare function withRetry<T>(operation: () => Promise<T>, maxRetries?: number, delayMs?: number): Promise<T>;
