"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
/**
 * OpenAI Provider implementation
 */
class OpenAIProvider {
    constructor() {
        this.name = 'openai';
        this.defaultModel = 'gpt-4o-mini';
        this.description = 'OpenAI GPT models';
    }
    async createModel(modelId, options = {}) {
        try {
            const { createOpenAI } = await Promise.resolve().then(() => __importStar(require('@ai-sdk/openai')));
            const config = {};
            if (options.apiKey || process.env.OPENAI_API_KEY) {
                config.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
            }
            if (options.baseURL || process.env.OPENAI_BASE_URL) {
                config.baseURL = options.baseURL || process.env.OPENAI_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const openai = createOpenAI(config);
            return openai(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create OpenAI model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'OPENAI_API_KEY',
            baseURL: 'OPENAI_BASE_URL'
        };
    }
    isAvailable() {
        try {
            require.resolve('@ai-sdk/openai');
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.OpenAIProvider = OpenAIProvider;
