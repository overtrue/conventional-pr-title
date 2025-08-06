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
exports.AmazonBedrockProvider = void 0;
/**
 * Amazon Bedrock Provider implementation
 */
class AmazonBedrockProvider {
    constructor() {
        this.name = 'amazon-bedrock';
        this.defaultModel = 'anthropic.claude-3-haiku-20240307-v1:0';
        this.description = 'Amazon Bedrock models';
    }
    async createModel(modelId, options = {}) {
        try {
            const { createAmazonBedrock } = await Promise.resolve().then(() => __importStar(require('@ai-sdk/amazon-bedrock')));
            const config = {};
            if (options.apiKey || process.env.AMAZON_BEDROCK_API_KEY) {
                config.apiKey = options.apiKey || process.env.AMAZON_BEDROCK_API_KEY;
            }
            if (options.baseURL || process.env.AMAZON_BEDROCK_BASE_URL) {
                config.baseURL = options.baseURL || process.env.AMAZON_BEDROCK_BASE_URL;
            }
            if (options.region || process.env.AWS_REGION) {
                config.region = options.region || process.env.AWS_REGION;
            }
            if (options.accessKeyId || process.env.AWS_ACCESS_KEY_ID) {
                config.accessKeyId = options.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
            }
            if (options.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY) {
                config.secretAccessKey = options.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const bedrockProvider = createAmazonBedrock(config);
            return bedrockProvider(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create Amazon Bedrock model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'AMAZON_BEDROCK_API_KEY',
            baseURL: 'AMAZON_BEDROCK_BASE_URL'
        };
    }
    isAvailable() {
        try {
            require.resolve('@ai-sdk/amazon-bedrock');
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.AmazonBedrockProvider = AmazonBedrockProvider;
