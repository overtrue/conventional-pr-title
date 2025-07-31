"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VercelAIService = void 0;
exports.createAIService = createAIService;
exports.generateConventionalTitle = generateConventionalTitle;
exports.isAIServiceHealthy = isAIServiceHealthy;
const anthropic_1 = require("@ai-sdk/anthropic");
const azure_1 = require("@ai-sdk/azure");
const cohere_1 = require("@ai-sdk/cohere");
const google_1 = require("@ai-sdk/google");
const mistral_1 = require("@ai-sdk/mistral");
const openai_1 = require("@ai-sdk/openai");
const xai_1 = require("@ai-sdk/xai");
const ai_1 = require("ai");
const conventional_1 = require("./conventional");
class VercelAIService {
    constructor(config) {
        this.modelCache = new Map();
        this.config = {
            maxTokens: 500,
            temperature: 0.3,
            maxRetries: 3,
            debug: false,
            ...config
        };
    }
    debugLog(message, data) {
        if (!this.config.debug)
            return;
        const timestamp = new Date().toISOString();
        const prefix = `🤖 [AI-DEBUG ${timestamp}]`;
        if (data) {
            console.log(`${prefix} ${message}:`);
            console.log(JSON.stringify(data, null, 2));
        }
        else {
            console.log(`${prefix} ${message}`);
        }
    }
    errorLog(message, error) {
        if (!this.config.debug)
            return;
        const timestamp = new Date().toISOString();
        const prefix = `❌ [AI-ERROR ${timestamp}]`;
        console.error(`${prefix} ${message}`);
        if (error) {
            console.error(error);
        }
    }
    async generateTitle(request) {
        const maxRetries = this.config.maxRetries || 3;
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const prompt = this.buildPrompt(request);
                const systemMessage = this.buildSystemMessage(request.options);
                this.debugLog(`Attempt ${attempt + 1}/${maxRetries + 1}`);
                this.debugLog('System message', systemMessage);
                this.debugLog('User prompt', prompt);
                const result = await this.callAI(prompt, systemMessage);
                this.debugLog('Raw AI response', result.text);
                return this.parseResponse(result.text);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                this.errorLog(`Attempt ${attempt + 1} failed`, lastError);
                if (attempt < maxRetries) {
                    this.debugLog(`Retrying after error, attempt ${attempt + 2}...`);
                    await this.delay(Math.pow(2, attempt) * 1000);
                }
            }
        }
        throw new Error(`AI service failed after ${maxRetries + 1} attempts: ${(lastError === null || lastError === void 0 ? void 0 : lastError.message) || 'Unknown error'}`);
    }
    async isHealthy() {
        try {
            const testResult = await this.callAI('test', 'You are a test assistant. Reply with "OK".');
            return testResult.text.toLowerCase().includes('ok');
        }
        catch {
            return false;
        }
    }
    async callAI(prompt, systemMessage) {
        const model = this.getModel();
        return await (0, ai_1.generateText)({
            model,
            system: systemMessage,
            prompt,
            maxTokens: this.config.maxTokens,
            temperature: this.config.temperature
        });
    }
    getModel() {
        const { provider, model, apiKey, baseURL } = this.config;
        const cacheKey = `${provider}-${model}-${apiKey === null || apiKey === void 0 ? void 0 : apiKey.slice(0, 8)}`;
        if (this.modelCache.has(cacheKey)) {
            return this.modelCache.get(cacheKey);
        }
        const providerConfig = {};
        if (apiKey)
            providerConfig.apiKey = apiKey;
        if (baseURL)
            providerConfig.baseURL = baseURL;
        const hasConfig = Object.keys(providerConfig).length > 0;
        let modelInstance;
        switch (provider) {
            case 'openai':
                modelInstance = hasConfig
                    ? (0, openai_1.createOpenAI)(providerConfig)(model || 'gpt-4o-mini')
                    : (0, openai_1.openai)(model || 'gpt-4o-mini');
                break;
            case 'anthropic':
                modelInstance = hasConfig
                    ? (0, anthropic_1.createAnthropic)(providerConfig)(model || 'claude-3-5-sonnet-20241022')
                    : (0, anthropic_1.anthropic)(model || 'claude-3-5-sonnet-20241022');
                break;
            case 'google':
                modelInstance = hasConfig
                    ? (0, google_1.createGoogleGenerativeAI)(providerConfig)(model || 'gemini-1.5-flash')
                    : (0, google_1.google)(model || 'gemini-1.5-flash');
                break;
            case 'mistral':
                modelInstance = hasConfig
                    ? (0, mistral_1.createMistral)(providerConfig)(model || 'mistral-large-latest')
                    : (0, mistral_1.mistral)(model || 'mistral-large-latest');
                break;
            case 'xai':
                modelInstance = hasConfig
                    ? (0, xai_1.createXai)(providerConfig)(model || 'grok-beta')
                    : (0, xai_1.xai)(model || 'grok-beta');
                break;
            case 'cohere':
                modelInstance = hasConfig
                    ? (0, cohere_1.createCohere)(providerConfig)(model || 'command-r-plus')
                    : (0, cohere_1.cohere)(model || 'command-r-plus');
                break;
            case 'azure':
                modelInstance = hasConfig
                    ? (0, azure_1.createAzure)(providerConfig)(model || 'gpt-4o-mini')
                    : (0, azure_1.azure)(model || 'gpt-4o-mini');
                break;
            case 'vertex':
                modelInstance = hasConfig
                    ? (0, google_1.createGoogleGenerativeAI)(providerConfig)(model || 'gemini-1.5-flash')
                    : (0, google_1.google)(model || 'gemini-1.5-flash');
                break;
            case 'vercel':
            case 'deepseek':
            case 'cerebras':
            case 'groq':
                throw new Error(`${provider} provider not yet implemented in AI SDK`);
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
        this.modelCache.set(cacheKey, modelInstance);
        return modelInstance;
    }
    buildSystemMessage(options) {
        const allowedTypes = (options === null || options === void 0 ? void 0 : options.preferredTypes) || conventional_1.DEFAULT_TYPES;
        const maxLength = (options === null || options === void 0 ? void 0 : options.maxLength) || 72;
        const includeScope = (options === null || options === void 0 ? void 0 : options.includeScope) ? 'MUST include' : 'MAY include';
        const language = (options === null || options === void 0 ? void 0 : options.language) || 'English';
        return `You are an expert at creating Conventional Commits titles for Pull Requests.

Your task is to analyze a PR title and content, then suggest 1-3 improved titles that follow the Conventional Commits standard.

RULES:
1. Format: type(scope): description
2. Allowed types: ${allowedTypes.join(', ')}
3. Scope: ${includeScope} a scope in parentheses
4. Description: lowercase, no period, max ${maxLength} chars total
5. Be specific and descriptive
6. Focus on WHAT changed, not HOW
7. Respond in ${language}, but keep the conventional commit format in English

RESPONSE FORMAT:
Return a JSON object with:
{
  "suggestions": ["title1", "title2", "title3"],
  "reasoning": "explanation of why these titles are better (in ${language})",
  "confidence": 0.9
}

Only return valid JSON, no additional text.`;
    }
    buildPrompt(request) {
        const { originalTitle, prDescription, prBody, diffContent, changedFiles } = request;
        let prompt = `Original PR Title: "${originalTitle}"\n\n`;
        if (prDescription && prDescription.trim()) {
            prompt += `PR Description: ${prDescription.trim()}\n\n`;
        }
        if (prBody && prBody.trim()) {
            const body = prBody.slice(0, 1500);
            prompt += `PR Body: ${body}${prBody.length > 1500 ? '...' : ''}\n\n`;
        }
        if (diffContent && diffContent.trim()) {
            const diff = diffContent.slice(0, 2000);
            prompt += `Code Changes (diff):\n${diff}${diffContent.length > 2000 ? '...' : ''}\n\n`;
        }
        if (changedFiles && changedFiles.length > 0) {
            prompt += `Changed Files:\n${changedFiles
                .slice(0, 15)
                .map(f => `- ${f}`)
                .join('\n')}\n\n`;
        }
        prompt += 'Generate improved Conventional Commits titles for this PR.';
        return prompt;
    }
    parseResponse(text) {
        this.debugLog('parseResponse: raw text', text);
        try {
            // More aggressive cleaning - remove code blocks, extra whitespace, and common prefixes
            let cleanText = text
                .replace(/```json\s*|\s*```/gi, '') // Remove markdown code blocks
                .replace(/^[^{]*({.*})[^}]*$/s, '$1') // Extract JSON object from surrounding text
                .trim();
            // If no JSON object found, try to find it anywhere in the text
            if (!cleanText.startsWith('{')) {
                const jsonMatch = text.match(/{[\s\S]*}/);
                if (jsonMatch) {
                    cleanText = jsonMatch[0];
                }
            }
            this.debugLog('parseResponse: cleaned JSON string', cleanText);
            const parsed = JSON.parse(cleanText);
            this.debugLog('parseResponse: parsed JSON', parsed);
            return {
                suggestions: Array.isArray(parsed.suggestions)
                    ? parsed.suggestions
                    : [parsed.suggestions || 'feat: improve PR title'],
                reasoning: parsed.reasoning || 'AI generated suggestions based on PR content',
                confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8
            };
        }
        catch (error) {
            this.errorLog('parseResponse JSON parse error', error);
            this.errorLog('parseResponse: cleaned JSON string', text);
            const suggestions = this.extractSuggestionsFromText(text);
            return {
                suggestions,
                reasoning: 'AI response could not be parsed as JSON, extracted suggestions from text',
                confidence: 0.5
            };
        }
    }
    extractSuggestionsFromText(text) {
        const suggestions = [];
        // Look for lines that might be titles (contain : and start with word)
        const lines = text.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.match(/^[a-z0-9]+(\([^)]+\))?(!)?: .+$/i) &&
                trimmed.length <= 100) {
                suggestions.push(trimmed);
            }
        }
        return suggestions.length > 0 ? suggestions : ['feat: improve PR title'];
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.VercelAIService = VercelAIService;
// Factory function to create AI service based on environment
function createAIService(config) {
    const provider = ((config === null || config === void 0 ? void 0 : config.provider) ||
        process.env.AI_PROVIDER ||
        'openai');
    const providerApiKeys = {
        openai: process.env.OPENAI_API_KEY,
        anthropic: process.env.ANTHROPIC_API_KEY,
        google: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        mistral: process.env.MISTRAL_API_KEY,
        xai: process.env.XAI_API_KEY,
        cohere: process.env.COHERE_API_KEY,
        azure: process.env.AZURE_API_KEY,
        vercel: process.env.VERCEL_API_KEY,
        deepseek: process.env.DEEPSEEK_API_KEY,
        cerebras: process.env.CEREBRAS_API_KEY,
        groq: process.env.GROQ_API_KEY,
        vertex: process.env.GOOGLE_VERTEX_AI_API_KEY
    };
    const apiKey = (config === null || config === void 0 ? void 0 : config.apiKey) || providerApiKeys[provider];
    if (!apiKey) {
        const envVarName = `${provider.toUpperCase()}_API_KEY`;
        throw new Error(`API key required for ${provider}. Set ${envVarName} environment variable.`);
    }
    return new VercelAIService({
        provider,
        apiKey,
        ...config
    });
}
// Convenience functions
async function generateConventionalTitle(request, config) {
    const service = createAIService(config);
    return service.generateTitle(request);
}
async function isAIServiceHealthy(config) {
    try {
        const service = createAIService(config);
        return service.isHealthy();
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=ai-service.js.map