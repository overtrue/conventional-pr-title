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
exports.GoogleVertexProvider = void 0;
/**
 * Google Vertex AI Provider implementation
 */
class GoogleVertexProvider {
    constructor() {
        this.name = 'google-vertex';
        this.defaultModel = 'gemini-1.5-flash';
        this.description = 'Google Vertex AI models';
    }
    async createModel(modelId, options = {}) {
        try {
            const { createVertex } = await Promise.resolve().then(() => __importStar(require('@ai-sdk/google-vertex')));
            const config = {};
            if (options.apiKey || process.env.GOOGLE_VERTEX_API_KEY) {
                config.apiKey = options.apiKey || process.env.GOOGLE_VERTEX_API_KEY;
            }
            if (options.baseURL || process.env.GOOGLE_VERTEX_BASE_URL) {
                config.baseURL = options.baseURL || process.env.GOOGLE_VERTEX_BASE_URL;
            }
            if (options.projectId || process.env.GOOGLE_VERTEX_PROJECT_ID) {
                config.projectId = options.projectId || process.env.GOOGLE_VERTEX_PROJECT_ID;
            }
            if (options.location || process.env.GOOGLE_VERTEX_LOCATION) {
                config.location = options.location || process.env.GOOGLE_VERTEX_LOCATION;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const vertex = createVertex(config);
            return vertex(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create Google Vertex model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'GOOGLE_VERTEX_API_KEY',
            baseURL: 'GOOGLE_VERTEX_BASE_URL'
        };
    }
    isAvailable() {
        try {
            require.resolve('@ai-sdk/google-vertex');
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.GoogleVertexProvider = GoogleVertexProvider;
