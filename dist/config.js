"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configManager = exports.ActionConfigManager = exports.ConfigurationError = void 0;
exports.createAIServiceConfig = createAIServiceConfig;
exports.shouldSkipProcessing = shouldSkipProcessing;
exports.isAutoMode = isAutoMode;
exports.isSuggestionMode = isSuggestionMode;
exports.getModelInfo = getModelInfo;
exports.getProviderModels = getProviderModels;
exports.getRecommendedModels = getRecommendedModels;
exports.getDefaultModel = getDefaultModel;
exports.getAllSupportedProviders = getAllSupportedProviders;
exports.estimateTokenCost = estimateTokenCost;
const core_1 = require("@actions/core");
const supported_models_json_1 = __importDefault(require("./supported-models.json"));
class ConfigurationError extends Error {
    constructor(errors) {
        const message = `Configuration errors:\n${errors.map(e => `- ${e.field}: ${e.message}`).join('\n')}`;
        super(message);
        this.name = 'ConfigurationError';
        this.errors = errors;
    }
}
exports.ConfigurationError = ConfigurationError;
class ActionConfigManager {
    constructor() {
        this.config = null;
        this.errors = [];
    }
    /**
     * Parse and validate configuration from GitHub Actions inputs
     */
    parseConfig() {
        this.errors = [];
        try {
            // GitHub Configuration
            const githubToken = this.getRequiredInput('github-token', 'GitHub token is required for API access');
            // AI Service Configuration
            const aiProvider = this.parseAIProvider();
            const apiKey = this.getRequiredInput('api-key', 'API key is required for AI service');
            const model = (0, core_1.getInput)('model') || undefined;
            const temperature = this.parseNumber('temperature', 0.3, 0, 1);
            const maxTokens = this.parseNumber('max-tokens', 500, 1, 4000);
            // Operation Mode
            const mode = this.parseOperationMode();
            // Validation Rules
            const validationOptions = this.parseValidationOptions();
            // Customization
            const customPrompt = (0, core_1.getInput)('custom-prompt') || undefined;
            const includeScope = (0, core_1.getBooleanInput)('include-scope');
            // Behavior Control
            const skipIfConventional = (0, core_1.getBooleanInput)('skip-if-conventional');
            const commentTemplate = (0, core_1.getInput)('comment-template') || undefined;
            // If there are validation errors, throw them
            if (this.errors.length > 0) {
                throw new ConfigurationError(this.errors);
            }
            this.config = {
                githubToken,
                aiProvider,
                apiKey,
                model,
                temperature,
                maxTokens,
                mode,
                validationOptions,
                customPrompt,
                includeScope,
                skipIfConventional,
                commentTemplate
            };
            return this.config;
        }
        catch (error) {
            if (error instanceof ConfigurationError) {
                throw error;
            }
            throw new ConfigurationError([
                {
                    field: 'general',
                    message: `Failed to parse configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
                }
            ]);
        }
    }
    /**
     * Get the current configuration (must call parseConfig first)
     */
    getConfig() {
        if (!this.config) {
            throw new Error('Configuration not initialized. Call parseConfig() first.');
        }
        return this.config;
    }
    /**
     * Validate configuration and provide friendly error messages
     */
    validateConfig(config) {
        var _a;
        const errors = [];
        // Validate AI provider and model compatibility
        const providerModels = this.getProviderDefaultModels();
        if (config.model &&
            !this.isModelCompatibleWithProvider(config.aiProvider, config.model)) {
            errors.push({
                field: 'model',
                message: `Model '${config.model}' is not compatible with provider '${config.aiProvider}'`,
                suggestion: `Try using: ${(_a = providerModels[config.aiProvider]) === null || _a === void 0 ? void 0 : _a.slice(0, 3).join(', ')}`
            });
        }
        // Validate temperature range
        if (config.temperature < 0 || config.temperature > 1) {
            errors.push({
                field: 'temperature',
                message: 'Temperature must be between 0.0 and 1.0',
                suggestion: 'Use 0.3 for balanced creativity, 0.1 for consistent results, 0.7 for more creative output'
            });
        }
        // Validate validation options
        if (config.validationOptions.maxLength &&
            config.validationOptions.maxLength < 10) {
            errors.push({
                field: 'max-length',
                message: 'Maximum length should be at least 10 characters',
                suggestion: 'Use 50-100 characters for practical PR titles'
            });
        }
        if (config.validationOptions.allowedTypes &&
            config.validationOptions.allowedTypes.length === 0) {
            errors.push({
                field: 'allowed-types',
                message: 'At least one commit type must be allowed',
                suggestion: 'Include common types like: feat, fix, docs, refactor'
            });
        }
        return errors;
    }
    /**
     * Set GitHub Actions outputs based on results
     */
    setOutputs(result) {
        (0, core_1.setOutput)('is-conventional', result.isConventional.toString());
        (0, core_1.setOutput)('suggested-titles', JSON.stringify(result.suggestedTitles));
        (0, core_1.setOutput)('original-title', result.originalTitle);
        (0, core_1.setOutput)('action-taken', result.actionTaken);
        if (result.errorMessage) {
            (0, core_1.setOutput)('error-message', result.errorMessage);
        }
    }
    /**
     * Handle configuration errors with friendly messages
     */
    handleConfigurationError(error) {
        const friendlyMessage = this.formatConfigurationError(error);
        (0, core_1.setFailed)(friendlyMessage);
    }
    getRequiredInput(name, errorMessage) {
        const value = (0, core_1.getInput)(name);
        if (!value) {
            this.errors.push({
                field: name,
                message: errorMessage,
                suggestion: `Set the '${name}' input in your workflow file`
            });
            return '';
        }
        return value;
    }
    parseAIProvider() {
        const provider = (0, core_1.getInput)('ai-provider') || 'openai';
        const validProviders = [
            'openai',
            'anthropic',
            'google',
            'mistral',
            'xai',
            'cohere',
            'azure'
        ];
        if (!validProviders.includes(provider)) {
            this.errors.push({
                field: 'ai-provider',
                message: `Invalid AI provider: ${provider}`,
                suggestion: `Use one of: ${validProviders.join(', ')}`
            });
            return 'openai';
        }
        return provider;
    }
    parseOperationMode() {
        const mode = (0, core_1.getInput)('mode') || 'suggest';
        if (mode !== 'auto' && mode !== 'suggest') {
            this.errors.push({
                field: 'mode',
                message: `Invalid operation mode: ${mode}`,
                suggestion: 'Use "auto" to update titles automatically or "suggest" to add comments'
            });
            return 'suggest';
        }
        return mode;
    }
    parseNumber(inputName, defaultValue, min, max) {
        const input = (0, core_1.getInput)(inputName);
        if (!input)
            return defaultValue;
        const value = parseFloat(input);
        if (isNaN(value)) {
            this.errors.push({
                field: inputName,
                message: `Invalid number: ${input}`,
                suggestion: `Use a numeric value${min !== undefined && max !== undefined ? ` between ${min} and ${max}` : ''}`
            });
            return defaultValue;
        }
        if (min !== undefined && value < min) {
            this.errors.push({
                field: inputName,
                message: `Value ${value} is below minimum ${min}`,
                suggestion: `Use a value >= ${min}`
            });
            return defaultValue;
        }
        if (max !== undefined && value > max) {
            this.errors.push({
                field: inputName,
                message: `Value ${value} is above maximum ${max}`,
                suggestion: `Use a value <= ${max}`
            });
            return defaultValue;
        }
        return value;
    }
    parseValidationOptions() {
        const allowedTypesInput = (0, core_1.getInput)('allowed-types');
        const allowedTypes = allowedTypesInput
            ? allowedTypesInput
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0)
            : undefined;
        return {
            allowedTypes,
            requireScope: (0, core_1.getBooleanInput)('require-scope'),
            maxLength: this.parseNumber('max-length', 72, 10, 200),
            minDescriptionLength: this.parseNumber('min-description-length', 3, 1, 50)
        };
    }
    getProviderDefaultModels() {
        const providerModels = {
            openai: [],
            anthropic: [],
            google: [],
            mistral: [],
            xai: [],
            cohere: [],
            azure: [],
            vercel: [],
            deepseek: [],
            cerebras: [],
            groq: [],
            vertex: []
        };
        // Populate from the supportedModels JSON
        Object.entries(supported_models_json_1.default).forEach(([provider, models]) => {
            if (provider === 'metadata')
                return;
            const providerKey = provider;
            if (providerModels[providerKey]) {
                providerModels[providerKey] = Object.keys(models).filter(modelId => {
                    const model = models[modelId];
                    return model.supported;
                });
            }
        });
        return providerModels;
    }
    isModelCompatibleWithProvider(provider, model) {
        // Check if model exists in the provider's supported models
        const providerModels = supported_models_json_1.default[provider];
        if (providerModels &&
            providerModels[model] &&
            providerModels[model].supported) {
            return true;
        }
        // Fallback to pattern matching for custom models
        const patterns = {
            openai: [/^gpt-/, /^text-/, /^davinci-/, /^o1-/, /^o3-/, /^o4-/],
            anthropic: [/^claude-/],
            google: [/^gemini-/, /^palm-/],
            mistral: [/^mistral-/, /^codestral-/, /^pixtral-/],
            xai: [/^grok-/],
            cohere: [/^command-/, /^embed-/],
            azure: [/^gpt-/, /^text-/],
            vercel: [/^v0-/],
            deepseek: [/^deepseek-/],
            cerebras: [/^llama/, /^meta-/],
            groq: [/^llama/, /^mixtral/, /^gemma/, /^meta-/],
            vertex: [/^gemini-/, /^palm-/]
        };
        const providerPatterns = patterns[provider] || [];
        return providerPatterns.some(pattern => pattern.test(model));
    }
    formatConfigurationError(error) {
        const lines = ['❌ Configuration Error', ''];
        error.errors.forEach(configError => {
            lines.push(`🔸 **${configError.field}**: ${configError.message}`);
            if (configError.suggestion) {
                lines.push(`   💡 Suggestion: ${configError.suggestion}`);
            }
            lines.push('');
        });
        lines.push('📚 For more information, visit: https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions');
        return lines.join('\n');
    }
}
exports.ActionConfigManager = ActionConfigManager;
// Singleton instance for easy access
exports.configManager = new ActionConfigManager();
// Utility functions for common operations
function createAIServiceConfig(config) {
    return {
        provider: config.aiProvider,
        apiKey: config.apiKey,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens
    };
}
function shouldSkipProcessing(config, isConventional) {
    return config.skipIfConventional && isConventional;
}
function isAutoMode(config) {
    return config.mode === 'auto';
}
function isSuggestionMode(config) {
    return config.mode === 'suggest';
}
// Model information utilities
function getModelInfo(provider, modelId) {
    const providerModels = supported_models_json_1.default[provider];
    return (providerModels === null || providerModels === void 0 ? void 0 : providerModels[modelId]) || null;
}
function getProviderModels(provider) {
    const providerModels = supported_models_json_1.default[provider];
    if (!providerModels)
        return [];
    return Object.values(providerModels).filter(model => model.supported);
}
function getRecommendedModels(provider) {
    return getProviderModels(provider).filter(model => model.recommended);
}
function getDefaultModel(provider) {
    const models = getProviderModels(provider);
    return (models.find(model => model.default) ||
        models.find(model => model.recommended) ||
        models[0] ||
        null);
}
function getAllSupportedProviders() {
    return Object.keys(supported_models_json_1.default).filter(key => key !== 'metadata');
}
function estimateTokenCost(provider, modelId, inputTokens, outputTokens) {
    const modelInfo = getModelInfo(provider, modelId);
    if (!modelInfo)
        return null;
    const inputCost = (inputTokens / 1000000) * modelInfo.cost_per_1m_tokens.input;
    const outputCost = (outputTokens / 1000000) * modelInfo.cost_per_1m_tokens.output;
    return {
        input: inputCost,
        output: outputCost,
        total: inputCost + outputCost
    };
}
//# sourceMappingURL=config.js.map