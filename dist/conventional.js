"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_OPTIONS = exports.DEFAULT_TYPES = void 0;
exports.parseConventionalCommit = parseConventionalCommit;
exports.validateTitle = validateTitle;
exports.generateSuggestions = generateSuggestions;
exports.isConventionalTitle = isConventionalTitle;
exports.DEFAULT_TYPES = [
    'feat', // A new feature
    'fix', // A bug fix
    'docs', // Documentation only changes
    'style', // Changes that do not affect the meaning of the code
    'refactor', // A code change that neither fixes a bug nor adds a feature
    'perf', // A code change that improves performance
    'test', // Adding missing tests or correcting existing tests
    'build', // Changes that affect the build system or external dependencies
    'ci', // Changes to our CI configuration files and scripts
    'chore', // Other changes that don't modify src or test files
    'revert' // Reverts a previous commit
];
exports.DEFAULT_OPTIONS = {
    allowedTypes: exports.DEFAULT_TYPES,
    requireScope: false,
    maxLength: 72,
    minDescriptionLength: 3
};
/**
 * Parse a conventional commit message
 * Format: type(scope)!: description
 */
function parseConventionalCommit(message) {
    // Regex pattern for conventional commits
    // Captures: type, scope (optional), breaking change (!), description
    const conventionalCommitRegex = /^([a-z0-9]+)(?:\(([^)]+)\))?(!)?: (.+)$/i;
    const match = message.trim().match(conventionalCommitRegex);
    if (!match) {
        return null;
    }
    const [, type, scope, breaking, description] = match;
    return {
        type: type.toLowerCase(),
        scope: scope === null || scope === void 0 ? void 0 : scope.trim(),
        breaking: !!breaking,
        description: description.trim(),
        body: undefined,
        footer: undefined
    };
}
/**
 * Validate a PR title against Conventional Commits standard
 */
function validateTitle(title, options = exports.DEFAULT_OPTIONS) {
    var _a;
    const opts = { ...exports.DEFAULT_OPTIONS, ...options };
    const errors = [];
    const suggestions = [];
    // Basic checks
    if (!title || title.trim().length === 0) {
        errors.push('Title cannot be empty');
        return { isValid: false, errors, suggestions };
    }
    const trimmedTitle = title.trim();
    // Length check
    if (opts.maxLength && trimmedTitle.length > opts.maxLength) {
        errors.push(`Title exceeds maximum length of ${opts.maxLength} characters`);
        suggestions.push(`Consider shortening the title to ${opts.maxLength} characters or less`);
    }
    // Parse the commit
    const parsed = parseConventionalCommit(trimmedTitle);
    if (!parsed) {
        errors.push('Title does not follow Conventional Commits format');
        suggestions.push('Use format: type(scope): description');
        suggestions.push(`Allowed types: ${(_a = opts.allowedTypes) === null || _a === void 0 ? void 0 : _a.join(', ')}`);
        return { isValid: false, errors, suggestions };
    }
    // Type validation
    if (opts.allowedTypes && !opts.allowedTypes.includes(parsed.type)) {
        errors.push(`Invalid commit type: ${parsed.type}`);
        suggestions.push(`Use one of the allowed types: ${opts.allowedTypes.join(', ')}`);
    }
    // Scope validation
    if (opts.requireScope && !parsed.scope) {
        errors.push('Scope is required but missing');
        suggestions.push('Add a scope in parentheses after the type: type(scope): description');
    }
    // Description validation
    if (opts.minDescriptionLength &&
        parsed.description.length < opts.minDescriptionLength) {
        errors.push(`Description is too short (minimum ${opts.minDescriptionLength} characters)`);
        suggestions.push('Provide a more descriptive title');
    }
    // Check for common issues
    if (parsed.description.endsWith('.')) {
        errors.push('Description should not end with a period');
        suggestions.push('Remove the trailing period from the description');
    }
    if (parsed.description[0] !== parsed.description[0].toLowerCase()) {
        errors.push('Description should start with a lowercase letter');
        suggestions.push('Start the description with a lowercase letter');
    }
    const isValid = errors.length === 0;
    return {
        isValid,
        errors,
        suggestions,
        parsed: isValid ? parsed : undefined
    };
}
/**
 * Generate suggestions for improving a non-conventional title
 */
function generateSuggestions(title, options = exports.DEFAULT_OPTIONS) {
    var _a;
    const suggestions = [];
    const opts = { ...exports.DEFAULT_OPTIONS, ...options };
    if (!title || title.trim().length === 0) {
        return ['Please provide a meaningful title'];
    }
    const trimmedTitle = title.trim().toLowerCase();
    // Suggest appropriate type based on keywords
    if (trimmedTitle.includes('fix') ||
        trimmedTitle.includes('bug') ||
        trimmedTitle.includes('error')) {
        suggestions.push('Consider using "fix:" prefix for bug fixes');
    }
    else if (trimmedTitle.includes('test') || trimmedTitle.includes('spec')) {
        suggestions.push('Consider using "test:" prefix for test-related changes');
    }
    else if (trimmedTitle.includes('doc') || trimmedTitle.includes('readme')) {
        suggestions.push('Consider using "docs:" prefix for documentation changes');
    }
    else if (trimmedTitle.includes('add') ||
        trimmedTitle.includes('implement') ||
        trimmedTitle.includes('create')) {
        suggestions.push('Consider using "feat:" prefix for new features');
    }
    else if (trimmedTitle.includes('update') ||
        trimmedTitle.includes('improve') ||
        trimmedTitle.includes('enhance')) {
        suggestions.push('Consider using "feat:" for enhancements or "refactor:" for code improvements');
    }
    else {
        suggestions.push(`Consider using one of these prefixes: ${(_a = opts.allowedTypes) === null || _a === void 0 ? void 0 : _a.slice(0, 5).join(', ')}`);
    }
    // Length suggestions
    if (opts.maxLength && title.length > opts.maxLength) {
        suggestions.push(`Shorten title to ${opts.maxLength} characters or less`);
    }
    return suggestions;
}
/**
 * Check if a title is already in conventional format
 */
function isConventionalTitle(title, options = exports.DEFAULT_OPTIONS) {
    return validateTitle(title, options).isValid;
}
//# sourceMappingURL=conventional.js.map