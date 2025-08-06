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
  createTogetherAI: () => createTogetherAI,
  togetherai: () => togetherai
});
module.exports = __toCommonJS(src_exports);

// src/togetherai-provider.ts
var import_openai_compatible = require("@ai-sdk/openai-compatible");
var import_provider_utils2 = require("@ai-sdk/provider-utils");

// src/togetherai-image-model.ts
var import_provider_utils = require("@ai-sdk/provider-utils");
var import_v4 = require("zod/v4");
var TogetherAIImageModel = class {
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
    seed,
    providerOptions,
    headers,
    abortSignal
  }) {
    var _a, _b, _c, _d;
    const warnings = [];
    if (size != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "aspectRatio",
        details: "This model does not support the `aspectRatio` option. Use `size` instead."
      });
    }
    const currentDate = (_c = (_b = (_a = this.config._internal) == null ? void 0 : _a.currentDate) == null ? void 0 : _b.call(_a)) != null ? _c : /* @__PURE__ */ new Date();
    const splitSize = size == null ? void 0 : size.split("x");
    const { value: response, responseHeaders } = await (0, import_provider_utils.postJsonToApi)({
      url: `${this.config.baseURL}/images/generations`,
      headers: (0, import_provider_utils.combineHeaders)(this.config.headers(), headers),
      body: {
        model: this.modelId,
        prompt,
        seed,
        n,
        ...splitSize && {
          width: parseInt(splitSize[0]),
          height: parseInt(splitSize[1])
        },
        response_format: "base64",
        ...(_d = providerOptions.togetherai) != null ? _d : {}
      },
      failedResponseHandler: (0, import_provider_utils.createJsonErrorResponseHandler)({
        errorSchema: togetheraiErrorSchema,
        errorToMessage: (data) => data.error.message
      }),
      successfulResponseHandler: (0, import_provider_utils.createJsonResponseHandler)(
        togetheraiImageResponseSchema
      ),
      abortSignal,
      fetch: this.config.fetch
    });
    return {
      images: response.data.map((item) => item.b64_json),
      warnings,
      response: {
        timestamp: currentDate,
        modelId: this.modelId,
        headers: responseHeaders
      }
    };
  }
};
var togetheraiImageResponseSchema = import_v4.z.object({
  data: import_v4.z.array(
    import_v4.z.object({
      b64_json: import_v4.z.string()
    })
  )
});
var togetheraiErrorSchema = import_v4.z.object({
  error: import_v4.z.object({
    message: import_v4.z.string()
  })
});

// src/togetherai-provider.ts
function createTogetherAI(options = {}) {
  var _a;
  const baseURL = (0, import_provider_utils2.withoutTrailingSlash)(
    (_a = options.baseURL) != null ? _a : "https://api.together.xyz/v1/"
  );
  const getHeaders = () => ({
    Authorization: `Bearer ${(0, import_provider_utils2.loadApiKey)({
      apiKey: options.apiKey,
      environmentVariableName: "TOGETHER_AI_API_KEY",
      description: "TogetherAI"
    })}`,
    ...options.headers
  });
  const getCommonModelConfig = (modelType) => ({
    provider: `togetherai.${modelType}`,
    url: ({ path }) => `${baseURL}${path}`,
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
  const createImageModel = (modelId) => new TogetherAIImageModel(modelId, {
    ...getCommonModelConfig("image"),
    baseURL: baseURL != null ? baseURL : "https://api.together.xyz/v1/"
  });
  const provider = (modelId) => createChatModel(modelId);
  provider.completionModel = createCompletionModel;
  provider.languageModel = createChatModel;
  provider.chatModel = createChatModel;
  provider.textEmbeddingModel = createTextEmbeddingModel;
  provider.image = createImageModel;
  provider.imageModel = createImageModel;
  return provider;
}
var togetherai = createTogetherAI();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createTogetherAI,
  togetherai
});
//# sourceMappingURL=index.js.map