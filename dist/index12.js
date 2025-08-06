"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  createVertex: () => createVertex2,
  vertex: () => vertex
});
module.exports = __toCommonJS(src_exports);

// src/google-vertex-provider-node.ts
var import_provider_utils5 = require("@ai-sdk/provider-utils");

// src/google-vertex-auth-google-auth-library.ts
var import_google_auth_library = require("google-auth-library");
var authInstance = null;
var authOptions = null;
function getAuth(options) {
  if (!authInstance || options !== authOptions) {
    authInstance = new import_google_auth_library.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      ...options
    });
    authOptions = options;
  }
  return authInstance;
}
async function generateAuthToken(options) {
  const auth = getAuth(options || {});
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return (token == null ? void 0 : token.token) || null;
}

// src/google-vertex-provider.ts
var import_internal = require("@ai-sdk/google/internal");
var import_provider_utils4 = require("@ai-sdk/provider-utils");

// src/google-vertex-embedding-model.ts
var import_provider = require("@ai-sdk/provider");
var import_provider_utils2 = require("@ai-sdk/provider-utils");
var import_v43 = require("zod/v4");

// src/google-vertex-error.ts
var import_provider_utils = require("@ai-sdk/provider-utils");
var import_v4 = require("zod/v4");
var googleVertexErrorDataSchema = import_v4.z.object({
  error: import_v4.z.object({
    code: import_v4.z.number().nullable(),
    message: import_v4.z.string(),
    status: import_v4.z.string()
  })
});
var googleVertexFailedResponseHandler = (0, import_provider_utils.createJsonErrorResponseHandler)(
  {
    errorSchema: googleVertexErrorDataSchema,
    errorToMessage: (data) => data.error.message
  }
);

// src/google-vertex-embedding-options.ts
var import_v42 = require("zod/v4");
var googleVertexEmbeddingProviderOptions = import_v42.z.object({
  /**
   * Optional. Optional reduced dimension for the output embedding.
   * If set, excessive values in the output embedding are truncated from the end.
   */
  outputDimensionality: import_v42.z.number().optional(),
  /**
   * Optional. Specifies the task type for generating embeddings.
   * Supported task types:
   * - SEMANTIC_SIMILARITY: Optimized for text similarity.
   * - CLASSIFICATION: Optimized for text classification.
   * - CLUSTERING: Optimized for clustering texts based on similarity.
   * - RETRIEVAL_DOCUMENT: Optimized for document retrieval.
   * - RETRIEVAL_QUERY: Optimized for query-based retrieval.
   * - QUESTION_ANSWERING: Optimized for answering questions.
   * - FACT_VERIFICATION: Optimized for verifying factual information.
   * - CODE_RETRIEVAL_QUERY: Optimized for retrieving code blocks based on natural language queries.
   */
  taskType: import_v42.z.enum([
    "SEMANTIC_SIMILARITY",
    "CLASSIFICATION",
    "CLUSTERING",
    "RETRIEVAL_DOCUMENT",
    "RETRIEVAL_QUERY",
    "QUESTION_ANSWERING",
    "FACT_VERIFICATION",
    "CODE_RETRIEVAL_QUERY"
  ]).optional()
});

// src/google-vertex-embedding-model.ts
var GoogleVertexEmbeddingModel = class {
  constructor(modelId, config) {
    this.specificationVersion = "v2";
    this.maxEmbeddingsPerCall = 2048;
    this.supportsParallelCalls = true;
    this.modelId = modelId;
    this.config = config;
  }
  get provider() {
    return this.config.provider;
  }
  async doEmbed({
    values,
    headers,
    abortSignal,
    providerOptions
  }) {
    var _a;
    const googleOptions = (_a = await (0, import_provider_utils2.parseProviderOptions)({
      provider: "google",
      providerOptions,
      schema: googleVertexEmbeddingProviderOptions
    })) != null ? _a : {};
    if (values.length > this.maxEmbeddingsPerCall) {
      throw new import_provider.TooManyEmbeddingValuesForCallError({
        provider: this.provider,
        modelId: this.modelId,
        maxEmbeddingsPerCall: this.maxEmbeddingsPerCall,
        values
      });
    }
    const mergedHeaders = (0, import_provider_utils2.combineHeaders)(
      await (0, import_provider_utils2.resolve)(this.config.headers),
      headers
    );
    const url = `${this.config.baseURL}/models/${this.modelId}:predict`;
    const {
      responseHeaders,
      value: response,
      rawValue
    } = await (0, import_provider_utils2.postJsonToApi)({
      url,
      headers: mergedHeaders,
      body: {
        instances: values.map((value) => ({ content: value })),
        parameters: {
          outputDimensionality: googleOptions.outputDimensionality,
          taskType: googleOptions.taskType
        }
      },
      failedResponseHandler: googleVertexFailedResponseHandler,
      successfulResponseHandler: (0, import_provider_utils2.createJsonResponseHandler)(
        googleVertexTextEmbeddingResponseSchema
      ),
      abortSignal,
      fetch: this.config.fetch
    });
    return {
      embeddings: response.predictions.map(
        (prediction) => prediction.embeddings.values
      ),
      usage: {
        tokens: response.predictions.reduce(
          (tokenCount, prediction) => tokenCount + prediction.embeddings.statistics.token_count,
          0
        )
      },
      response: { headers: responseHeaders, body: rawValue }
    };
  }
};
var googleVertexTextEmbeddingResponseSchema = import_v43.z.object({
  predictions: import_v43.z.array(
    import_v43.z.object({
      embeddings: import_v43.z.object({
        values: import_v43.z.array(import_v43.z.number()),
        statistics: import_v43.z.object({
          token_count: import_v43.z.number()
        })
      })
    })
  )
});

// src/google-vertex-image-model.ts
var import_provider_utils3 = require("@ai-sdk/provider-utils");
var import_v44 = require("zod/v4");
var GoogleVertexImageModel = class {
  constructor(modelId, config) {
    this.modelId = modelId;
    this.config = config;
    this.specificationVersion = "v2";
    // https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/imagen-api#parameter_list
    this.maxImagesPerCall = 4;
  }
  get provider() {
    return this.config.provider;
  }
  async doGenerate({
    prompt,
    n,
    size,
    aspectRatio,
    seed,
    providerOptions,
    headers,
    abortSignal
  }) {
    var _a, _b, _c, _d, _e, _f, _g;
    const warnings = [];
    if (size != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "size",
        details: "This model does not support the `size` option. Use `aspectRatio` instead."
      });
    }
    const vertexImageOptions = await (0, import_provider_utils3.parseProviderOptions)({
      provider: "vertex",
      providerOptions,
      schema: vertexImageProviderOptionsSchema
    });
    const body = {
      instances: [{ prompt }],
      parameters: {
        sampleCount: n,
        ...aspectRatio != null ? { aspectRatio } : {},
        ...seed != null ? { seed } : {},
        ...vertexImageOptions != null ? vertexImageOptions : {}
      }
    };
    const currentDate = (_c = (_b = (_a = this.config._internal) == null ? void 0 : _a.currentDate) == null ? void 0 : _b.call(_a)) != null ? _c : /* @__PURE__ */ new Date();
    const { value: response, responseHeaders } = await (0, import_provider_utils3.postJsonToApi)({
      url: `${this.config.baseURL}/models/${this.modelId}:predict`,
      headers: (0, import_provider_utils3.combineHeaders)(await (0, import_provider_utils3.resolve)(this.config.headers), headers),
      body,
      failedResponseHandler: googleVertexFailedResponseHandler,
      successfulResponseHandler: (0, import_provider_utils3.createJsonResponseHandler)(
        vertexImageResponseSchema
      ),
      abortSignal,
      fetch: this.config.fetch
    });
    return {
      images: (_e = (_d = response.predictions) == null ? void 0 : _d.map(
        ({ bytesBase64Encoded }) => bytesBase64Encoded
      )) != null ? _e : [],
      warnings,
      response: {
        timestamp: currentDate,
        modelId: this.modelId,
        headers: responseHeaders
      },
      providerMetadata: {
        vertex: {
          images: (_g = (_f = response.predictions) == null ? void 0 : _f.map((prediction) => {
            const {
              // normalize revised prompt property
              prompt: revisedPrompt
            } = prediction;
            return { ...revisedPrompt != null && { revisedPrompt } };
          })) != null ? _g : []
        }
      }
    };
  }
};
var vertexImageResponseSchema = import_v44.z.object({
  predictions: import_v44.z.array(
    import_v44.z.object({
      bytesBase64Encoded: import_v44.z.string(),
      mimeType: import_v44.z.string(),
      prompt: import_v44.z.string().nullish()
    })
  ).nullish()
});
var vertexImageProviderOptionsSchema = import_v44.z.object({
  negativePrompt: import_v44.z.string().nullish(),
  personGeneration: import_v44.z.enum(["dont_allow", "allow_adult", "allow_all"]).nullish(),
  safetySetting: import_v44.z.enum([
    "block_low_and_above",
    "block_medium_and_above",
    "block_only_high",
    "block_none"
  ]).nullish(),
  addWatermark: import_v44.z.boolean().nullish(),
  storageUri: import_v44.z.string().nullish()
});

// src/google-vertex-provider.ts
function createVertex(options = {}) {
  const loadVertexProject = () => (0, import_provider_utils4.loadSetting)({
    settingValue: options.project,
    settingName: "project",
    environmentVariableName: "GOOGLE_VERTEX_PROJECT",
    description: "Google Vertex project"
  });
  const loadVertexLocation = () => (0, import_provider_utils4.loadSetting)({
    settingValue: options.location,
    settingName: "location",
    environmentVariableName: "GOOGLE_VERTEX_LOCATION",
    description: "Google Vertex location"
  });
  const loadBaseURL = () => {
    var _a;
    const region = loadVertexLocation();
    const project = loadVertexProject();
    const baseHost = `${region === "global" ? "" : region + "-"}aiplatform.googleapis.com`;
    return (_a = (0, import_provider_utils4.withoutTrailingSlash)(options.baseURL)) != null ? _a : `https://${baseHost}/v1/projects/${project}/locations/${region}/publishers/google`;
  };
  const createConfig = (name) => {
    var _a;
    return {
      provider: `google.vertex.${name}`,
      headers: (_a = options.headers) != null ? _a : {},
      fetch: options.fetch,
      baseURL: loadBaseURL()
    };
  };
  const createChatModel = (modelId) => {
    var _a;
    return new import_internal.GoogleGenerativeAILanguageModel(modelId, {
      ...createConfig("chat"),
      generateId: (_a = options.generateId) != null ? _a : import_provider_utils4.generateId,
      supportedUrls: () => ({
        "*": [
          // HTTP URLs:
          /^https?:\/\/.*$/,
          // Google Cloud Storage URLs:
          /^gs:\/\/.*$/
        ]
      })
    });
  };
  const createEmbeddingModel = (modelId) => new GoogleVertexEmbeddingModel(modelId, createConfig("embedding"));
  const createImageModel = (modelId) => new GoogleVertexImageModel(modelId, createConfig("image"));
  const provider = function(modelId) {
    if (new.target) {
      throw new Error(
        "The Google Vertex AI model function cannot be called with the new keyword."
      );
    }
    return createChatModel(modelId);
  };
  provider.languageModel = createChatModel;
  provider.textEmbeddingModel = createEmbeddingModel;
  provider.image = createImageModel;
  provider.imageModel = createImageModel;
  return provider;
}

// src/google-vertex-provider-node.ts
function createVertex2(options = {}) {
  return createVertex({
    ...options,
    headers: async () => ({
      Authorization: `Bearer ${await generateAuthToken(
        options.googleAuthOptions
      )}`,
      ...await (0, import_provider_utils5.resolve)(options.headers)
    })
  });
}
var vertex = createVertex2();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createVertex,
  vertex
});
//# sourceMappingURL=index.js.map