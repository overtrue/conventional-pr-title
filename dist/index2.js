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
  createDeepInfra: () => createDeepInfra,
  deepinfra: () => deepinfra
});
module.exports = __toCommonJS(src_exports);

// src/deepinfra-provider.ts
var import_openai_compatible = require("@ai-sdk/openai-compatible");
var import_provider_utils2 = require("@ai-sdk/provider-utils");

// src/deepinfra-image-model.ts
var import_provider_utils = require("@ai-sdk/provider-utils");
var import_v4 = require("zod/v4");
var DeepInfraImageModel = class {
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
    const splitSize = size == null ? void 0 : size.split("x");
    const currentDate = (_c = (_b = (_a = this.config._internal) == null ? void 0 : _a.currentDate) == null ? void 0 : _b.call(_a)) != null ? _c : /* @__PURE__ */ new Date();
    const { value: response, responseHeaders } = await (0, import_provider_utils.postJsonToApi)({
      url: `${this.config.baseURL}/${this.modelId}`,
      headers: (0, import_provider_utils.combineHeaders)(this.config.headers(), headers),
      body: {
        prompt,
        num_images: n,
        ...aspectRatio && { aspect_ratio: aspectRatio },
        ...splitSize && { width: splitSize[0], height: splitSize[1] },
        ...seed != null && { seed },
        ...(_d = providerOptions.deepinfra) != null ? _d : {}
      },
      failedResponseHandler: (0, import_provider_utils.createJsonErrorResponseHandler)({
        errorSchema: deepInfraErrorSchema,
        errorToMessage: (error) => error.detail.error
      }),
      successfulResponseHandler: (0, import_provider_utils.createJsonResponseHandler)(
        deepInfraImageResponseSchema
      ),
      abortSignal,
      fetch: this.config.fetch
    });
    return {
      images: response.images.map(
        (image) => image.replace(/^data:image\/\w+;base64,/, "")
      ),
      warnings,
      response: {
        timestamp: currentDate,
        modelId: this.modelId,
        headers: responseHeaders
      }
    };
  }
};
var deepInfraErrorSchema = import_v4.z.object({
  detail: import_v4.z.object({
    error: import_v4.z.string()
  })
});
var deepInfraImageResponseSchema = import_v4.z.object({
  images: import_v4.z.array(import_v4.z.string())
});

// src/deepinfra-provider.ts
function createDeepInfra(options = {}) {
  var _a;
  const baseURL = (0, import_provider_utils2.withoutTrailingSlash)(
    (_a = options.baseURL) != null ? _a : "https://api.deepinfra.com/v1"
  );
  const getHeaders = () => ({
    Authorization: `Bearer ${(0, import_provider_utils2.loadApiKey)({
      apiKey: options.apiKey,
      environmentVariableName: "DEEPINFRA_API_KEY",
      description: "DeepInfra's API key"
    })}`,
    ...options.headers
  });
  const getCommonModelConfig = (modelType) => ({
    provider: `deepinfra.${modelType}`,
    url: ({ path }) => `${baseURL}/openai${path}`,
    headers: getHeaders,
    fetch: options.fetch
  });
  const createChatModel = (modelId) => {
    return new import_openai_compatible.OpenAICompatibleChatLanguageModel(
      modelId,
      getCommonModelConfig("chat")
    );
  };
  const createCompletionModel = (modelId) => new import_openai_compatible.OpenAICompatibleCompletionLanguageModel(
    modelId,
    getCommonModelConfig("completion")
  );
  const createTextEmbeddingModel = (modelId) => new import_openai_compatible.OpenAICompatibleEmbeddingModel(
    modelId,
    getCommonModelConfig("embedding")
  );
  const createImageModel = (modelId) => new DeepInfraImageModel(modelId, {
    ...getCommonModelConfig("image"),
    baseURL: baseURL ? `${baseURL}/inference` : "https://api.deepinfra.com/v1/inference"
  });
  const provider = (modelId) => createChatModel(modelId);
  provider.completionModel = createCompletionModel;
  provider.chatModel = createChatModel;
  provider.image = createImageModel;
  provider.imageModel = createImageModel;
  provider.languageModel = createChatModel;
  provider.textEmbeddingModel = createTextEmbeddingModel;
  return provider;
}
var deepinfra = createDeepInfra();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createDeepInfra,
  deepinfra
});
//# sourceMappingURL=index.js.map