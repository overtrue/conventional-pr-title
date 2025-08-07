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
  cerebras: () => cerebras,
  createCerebras: () => createCerebras
});
module.exports = __toCommonJS(src_exports);

// src/cerebras-provider.ts
var import_openai_compatible = require("@ai-sdk/openai-compatible");
var import_provider = require("@ai-sdk/provider");
var import_provider_utils = require("@ai-sdk/provider-utils");
var import_v4 = require("zod/v4");
var cerebrasErrorSchema = import_v4.z.object({
  message: import_v4.z.string(),
  type: import_v4.z.string(),
  param: import_v4.z.string(),
  code: import_v4.z.string()
});
var cerebrasErrorStructure = {
  errorSchema: cerebrasErrorSchema,
  errorToMessage: (data) => data.message
};
function createCerebras(options = {}) {
  var _a;
  const baseURL = (0, import_provider_utils.withoutTrailingSlash)(
    (_a = options.baseURL) != null ? _a : "https://api.cerebras.ai/v1"
  );
  const getHeaders = () => ({
    Authorization: `Bearer ${(0, import_provider_utils.loadApiKey)({
      apiKey: options.apiKey,
      environmentVariableName: "CEREBRAS_API_KEY",
      description: "Cerebras API key"
    })}`,
    ...options.headers
  });
  const createLanguageModel = (modelId) => {
    return new import_openai_compatible.OpenAICompatibleChatLanguageModel(modelId, {
      provider: `cerebras.chat`,
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      fetch: options.fetch,
      errorStructure: cerebrasErrorStructure
    });
  };
  const provider = (modelId) => createLanguageModel(modelId);
  provider.languageModel = createLanguageModel;
  provider.chat = createLanguageModel;
  provider.textEmbeddingModel = (modelId) => {
    throw new import_provider.NoSuchModelError({ modelId, modelType: "textEmbeddingModel" });
  };
  provider.imageModel = (modelId) => {
    throw new import_provider.NoSuchModelError({ modelId, modelType: "imageModel" });
  };
  return provider;
}
var cerebras = createCerebras();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cerebras,
  createCerebras
});
//# sourceMappingURL=index.js.map