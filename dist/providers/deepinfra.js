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
exports.DeepInfraProvider = void 0;
/**
 * DeepInfra Provider implementation
 */
class DeepInfraProvider {
    constructor() {
        this.name = 'deepinfra';
        this.defaultModel = 'meta-llama/Llama-2-7b-chat-hf';
        this.description = 'DeepInfra models';
    }
    async createModel(modelId, options = {}) {
        try {
            const { createDeepInfra } = await Promise.resolve().then(() => __importStar(require('@ai-sdk/deepinfra')));
            const config = {};
            if (options.apiKey || process.env.DEEPINFRA_API_KEY) {
                config.apiKey = options.apiKey || process.env.DEEPINFRA_API_KEY;
            }
            if (options.baseURL || process.env.DEEPINFRA_BASE_URL) {
                config.baseURL = options.baseURL || process.env.DEEPINFRA_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const deepinfraProvider = createDeepInfra(config);
            return deepinfraProvider(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create DeepInfra model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'DEEPINFRA_API_KEY',
            baseURL: 'DEEPINFRA_BASE_URL'
        };
    }
    isAvailable() {
        try {
            require.resolve('@ai-sdk/deepinfra');
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.DeepInfraProvider = DeepInfraProvider;
