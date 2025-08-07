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
  FireworksImageModel: () => FireworksImageModel,
  createFireworks: () => createFireworks,
  fireworks: () => fireworks
});
module.exports = __toCommonJS(src_exports);

// src/fireworks-image-model.ts
var import_provider_utils = require("@ai-sdk/provider-utils");
var modelToBackendConfig = {
  "accounts/fireworks/models/flux-1-dev-fp8": {
    urlFormat: "workflows"
  },
  "accounts/fireworks/models/flux-1-schnell-fp8": {
    urlFormat: "workflows"
  },
  "accounts/fireworks/models/playground-v2-5-1024px-aesthetic": {
    urlFormat: "image_generation",
    supportsSize: true
  },
  "accounts/fireworks/models/japanese-stable-diffusion-xl": {
    urlFormat: "image_generation",
    supportsSize: true
  },
  "accounts/fireworks/models/playground-v2-1024px-aesthetic": {
    urlFormat: "image_generation",
    supportsSize: true
  },
  "accounts/fireworks/models/stable-diffusion-xl-1024-v1-0": {
    urlFormat: "image_generation",
    supportsSize: true
  },
  "accounts/fireworks/models/SSD-1B": {
    urlFormat: "image_generation",
    supportsSize: true
  }
};
function getUrlForModel(baseUrl, modelId) {
  var _a;
  switch ((_a = modelToBackendConfig[modelId]) == null ? void 0 : _a.urlFormat) {
    case "image_generation":
      return `${baseUrl}/image_generation/${modelId}`;
    case "workflows":
    default:
      return `${baseUrl}/workflows/${modelId}/text_to_image`;
  }
}
var FireworksImageModel = class {
  constructor(modelId, config) {
    this.modelId = modelId;
    this.config = config;
    this.specificationVersion = "v2";
    this.maxImagesPerCall = 1;
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
    var _a, _b, _c, _d;
    const warnings = [];
    const backendConfig = modelToBackendConfig[this.modelId];
    if (!(backendConfig == null ? void 0 : backendConfig.supportsSize) && size != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "size",
        details: "This model does not support the `size` option. Use `aspectRatio` instead."
      });
    }
    if ((backendConfig == null ? void 0 : backendConfig.supportsSize) && aspectRatio != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "aspectRatio",
        details: "This model does not support the `aspectRatio` option."
      });
    }
    const splitSize = size == null ? void 0 : size.split("x");
    const currentDate = (_c = (_b = (_a = this.config._internal) == null ? void 0 : _a.currentDate) == null ? void 0 : _b.call(_a)) != null ? _c : /* @__PURE__ */ new Date();
    const { value: response, responseHeaders } = await (0, import_provider_utils.postJsonToApi)({
      url: getUrlForModel(this.config.baseURL, this.modelId),
      headers: (0, import_provider_utils.combineHeaders)(this.config.headers(), headers),
      body: {
        prompt,
        aspect_ratio: aspectRatio,
        seed,
        samples: n,
        ...splitSize && { width: splitSize[0], height: splitSize[1] },
        ...(_d = providerOptions.fireworks) != null ? _d : {}
      },
      failedResponseHandler: (0, import_provider_utils.createStatusCodeErrorResponseHandler)(),
      successfulResponseHandler: (0, import_provider_utils.createBinaryResponseHandler)(),
      abortSignal,
      fetch: this.config.fetch
    });
    return {
      images: [response],
      warnings,
      response: {
        timestamp: currentDate,
        modelId: this.modelId,
        headers: responseHeaders
      }
    };
  }
};

// src/fireworks-provider.ts
var import_openai_compatible = require("@ai-sdk/openai-compatible");
var import_provider_utils2 = require("@ai-sdk/provider-utils");
var import_v4 = require("zod/v4");
var fireworksErrorSchema = import_v4.z.object({
  error: import_v4.z.string()
});
var fireworksErrorStructure = {
  errorSchema: fireworksErrorSchema,
  errorToMessage: (data) => data.error
};
var defaultBaseURL = "https://api.fireworks.ai/inference/v1";
function createFireworks(options = {}) {
  var _a;
  const baseURL = (0, import_provider_utils2.withoutTrailingSlash)((_a = options.baseURL) != null ? _a : defaultBaseURL);
  const getHeaders = () => ({
    Authorization: `Bearer ${(0, import_provider_utils2.loadApiKey)({
      apiKey: options.apiKey,
      environmentVariableName: "FIREWORKS_API_KEY",
      description: "Fireworks API key"
    })}`,
    ...options.headers
  });
  const getCommonModelConfig = (modelType) => ({
    provider: `fireworks.${modelType}`,
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    fetch: options.fetch
  });
  const createChatModel = (modelId) => {
    return new import_openai_compatible.OpenAICompatibleChatLanguageModel(modelId, {
      ...getCommonModelConfig("chat"),
      errorStructure: fireworksErrorStructure
    });
  };
  const createCompletionModel = (modelId) => new import_openai_compatible.OpenAICompatibleCompletionLanguageModel(modelId, {
    ...getCommonModelConfig("completion"),
    errorStructure: fireworksErrorStructure
  });
  const createTextEmbeddingModel = (modelId) => new import_openai_compatible.OpenAICompatibleEmbeddingModel(modelId, {
    ...getCommonModelConfig("embedding"),
    errorStructure: fireworksErrorStructure
  });
  const createImageModel = (modelId) => new FireworksImageModel(modelId, {
    ...getCommonModelConfig("image"),
    baseURL: baseURL != null ? baseURL : defaultBaseURL
  });
  const provider = (modelId) => createChatModel(modelId);
  provider.completionModel = createCompletionModel;
  provider.chatModel = createChatModel;
  provider.languageModel = createChatModel;
  provider.textEmbeddingModel = createTextEmbeddingModel;
  provider.image = createImageModel;
  provider.imageModel = createImageModel;
  return provider;
}
var fireworks = createFireworks();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FireworksImageModel,
  createFireworks,
  fireworks
});
//# sourceMappingURL=index.js.map