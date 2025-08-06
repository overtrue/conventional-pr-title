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
  createPerplexity: () => createPerplexity,
  perplexity: () => perplexity
});
module.exports = __toCommonJS(src_exports);

// src/perplexity-provider.ts
var import_provider2 = require("@ai-sdk/provider");
var import_provider_utils3 = require("@ai-sdk/provider-utils");

// src/perplexity-language-model.ts
var import_provider_utils2 = require("@ai-sdk/provider-utils");
var import_v4 = require("zod/v4");

// src/convert-to-perplexity-messages.ts
var import_provider = require("@ai-sdk/provider");
var import_provider_utils = require("@ai-sdk/provider-utils");
function convertToPerplexityMessages(prompt) {
  const messages = [];
  for (const { role, content } of prompt) {
    switch (role) {
      case "system": {
        messages.push({ role: "system", content });
        break;
      }
      case "user":
      case "assistant": {
        const hasImage = content.some(
          (part) => part.type === "file" && part.mediaType.startsWith("image/")
        );
        const messageContent = content.map((part) => {
          var _a;
          switch (part.type) {
            case "text": {
              return {
                type: "text",
                text: part.text
              };
            }
            case "file": {
              return part.data instanceof URL ? {
                type: "image_url",
                image_url: {
                  url: part.data.toString()
                }
              } : {
                type: "image_url",
                image_url: {
                  url: `data:${(_a = part.mediaType) != null ? _a : "image/jpeg"};base64,${typeof part.data === "string" ? part.data : (0, import_provider_utils.convertUint8ArrayToBase64)(part.data)}`
                }
              };
            }
          }
        }).filter(Boolean);
        messages.push({
          role,
          content: hasImage ? messageContent : messageContent.filter((part) => part.type === "text").map((part) => part.text).join("")
        });
        break;
      }
      case "tool": {
        throw new import_provider.UnsupportedFunctionalityError({
          functionality: "Tool messages"
        });
      }
      default: {
        const _exhaustiveCheck = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }
  return messages;
}

// src/map-perplexity-finish-reason.ts
function mapPerplexityFinishReason(finishReason) {
  switch (finishReason) {
    case "stop":
    case "length":
      return finishReason;
    default:
      return "unknown";
  }
}

// src/perplexity-language-model.ts
var PerplexityLanguageModel = class {
  constructor(modelId, config) {
    this.specificationVersion = "v2";
    this.provider = "perplexity";
    this.supportedUrls = {
      // No URLs are supported.
    };
    this.modelId = modelId;
    this.config = config;
  }
  getArgs({
    prompt,
    maxOutputTokens,
    temperature,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
    stopSequences,
    responseFormat,
    seed,
    providerOptions
  }) {
    var _a;
    const warnings = [];
    if (topK != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "topK"
      });
    }
    if (stopSequences != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "stopSequences"
      });
    }
    if (seed != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "seed"
      });
    }
    return {
      args: {
        // model id:
        model: this.modelId,
        // standardized settings:
        frequency_penalty: frequencyPenalty,
        max_tokens: maxOutputTokens,
        presence_penalty: presencePenalty,
        temperature,
        top_k: topK,
        top_p: topP,
        // response format:
        response_format: (responseFormat == null ? void 0 : responseFormat.type) === "json" ? {
          type: "json_schema",
          json_schema: { schema: responseFormat.schema }
        } : void 0,
        // provider extensions
        ...(_a = providerOptions == null ? void 0 : providerOptions.perplexity) != null ? _a : {},
        // messages:
        messages: convertToPerplexityMessages(prompt)
      },
      warnings
    };
  }
  async doGenerate(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const { args: body, warnings } = this.getArgs(options);
    const {
      responseHeaders,
      value: response,
      rawValue: rawResponse
    } = await (0, import_provider_utils2.postJsonToApi)({
      url: `${this.config.baseURL}/chat/completions`,
      headers: (0, import_provider_utils2.combineHeaders)(this.config.headers(), options.headers),
      body,
      failedResponseHandler: (0, import_provider_utils2.createJsonErrorResponseHandler)({
        errorSchema: perplexityErrorSchema,
        errorToMessage
      }),
      successfulResponseHandler: (0, import_provider_utils2.createJsonResponseHandler)(
        perplexityResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const choice = response.choices[0];
    const content = [];
    const text = choice.message.content;
    if (text.length > 0) {
      content.push({ type: "text", text });
    }
    if (response.citations != null) {
      for (const url of response.citations) {
        content.push({
          type: "source",
          sourceType: "url",
          id: this.config.generateId(),
          url
        });
      }
    }
    return {
      content,
      finishReason: mapPerplexityFinishReason(choice.finish_reason),
      usage: {
        inputTokens: (_a = response.usage) == null ? void 0 : _a.prompt_tokens,
        outputTokens: (_b = response.usage) == null ? void 0 : _b.completion_tokens,
        totalTokens: (_d = (_c = response.usage) == null ? void 0 : _c.total_tokens) != null ? _d : void 0
      },
      request: { body },
      response: {
        ...getResponseMetadata(response),
        headers: responseHeaders,
        body: rawResponse
      },
      warnings,
      providerMetadata: {
        perplexity: {
          images: (_f = (_e = response.images) == null ? void 0 : _e.map((image) => ({
            imageUrl: image.image_url,
            originUrl: image.origin_url,
            height: image.height,
            width: image.width
          }))) != null ? _f : null,
          usage: {
            citationTokens: (_h = (_g = response.usage) == null ? void 0 : _g.citation_tokens) != null ? _h : null,
            numSearchQueries: (_j = (_i = response.usage) == null ? void 0 : _i.num_search_queries) != null ? _j : null
          }
        }
      }
    };
  }
  async doStream(options) {
    const { args, warnings } = this.getArgs(options);
    const body = { ...args, stream: true };
    const { responseHeaders, value: response } = await (0, import_provider_utils2.postJsonToApi)({
      url: `${this.config.baseURL}/chat/completions`,
      headers: (0, import_provider_utils2.combineHeaders)(this.config.headers(), options.headers),
      body,
      failedResponseHandler: (0, import_provider_utils2.createJsonErrorResponseHandler)({
        errorSchema: perplexityErrorSchema,
        errorToMessage
      }),
      successfulResponseHandler: (0, import_provider_utils2.createEventSourceResponseHandler)(
        perplexityChunkSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    let finishReason = "unknown";
    const usage = {
      inputTokens: void 0,
      outputTokens: void 0,
      totalTokens: void 0
    };
    const providerMetadata = {
      perplexity: {
        usage: {
          citationTokens: null,
          numSearchQueries: null
        },
        images: null
      }
    };
    let isFirstChunk = true;
    let isActive = false;
    const self = this;
    return {
      stream: response.pipeThrough(
        new TransformStream({
          start(controller) {
            controller.enqueue({ type: "stream-start", warnings });
          },
          transform(chunk, controller) {
            var _a, _b, _c;
            if (options.includeRawChunks) {
              controller.enqueue({ type: "raw", rawValue: chunk.rawValue });
            }
            if (!chunk.success) {
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            if (isFirstChunk) {
              controller.enqueue({
                type: "response-metadata",
                ...getResponseMetadata(value)
              });
              (_a = value.citations) == null ? void 0 : _a.forEach((url) => {
                controller.enqueue({
                  type: "source",
                  sourceType: "url",
                  id: self.config.generateId(),
                  url
                });
              });
              isFirstChunk = false;
            }
            if (value.usage != null) {
              usage.inputTokens = value.usage.prompt_tokens;
              usage.outputTokens = value.usage.completion_tokens;
              providerMetadata.perplexity.usage = {
                citationTokens: (_b = value.usage.citation_tokens) != null ? _b : null,
                numSearchQueries: (_c = value.usage.num_search_queries) != null ? _c : null
              };
            }
            if (value.images != null) {
              providerMetadata.perplexity.images = value.images.map((image) => ({
                imageUrl: image.image_url,
                originUrl: image.origin_url,
                height: image.height,
                width: image.width
              }));
            }
            const choice = value.choices[0];
            if ((choice == null ? void 0 : choice.finish_reason) != null) {
              finishReason = mapPerplexityFinishReason(choice.finish_reason);
            }
            if ((choice == null ? void 0 : choice.delta) == null) {
              return;
            }
            const delta = choice.delta;
            const textContent = delta.content;
            if (textContent != null) {
              if (!isActive) {
                controller.enqueue({ type: "text-start", id: "0" });
                isActive = true;
              }
              controller.enqueue({
                type: "text-delta",
                id: "0",
                delta: textContent
              });
            }
          },
          flush(controller) {
            if (isActive) {
              controller.enqueue({ type: "text-end", id: "0" });
            }
            controller.enqueue({
              type: "finish",
              finishReason,
              usage,
              providerMetadata
            });
          }
        })
      ),
      request: { body },
      response: { headers: responseHeaders }
    };
  }
};
function getResponseMetadata({
  id,
  model,
  created
}) {
  return {
    id,
    modelId: model,
    timestamp: new Date(created * 1e3)
  };
}
var perplexityUsageSchema = import_v4.z.object({
  prompt_tokens: import_v4.z.number(),
  completion_tokens: import_v4.z.number(),
  total_tokens: import_v4.z.number().nullish(),
  citation_tokens: import_v4.z.number().nullish(),
  num_search_queries: import_v4.z.number().nullish()
});
var perplexityImageSchema = import_v4.z.object({
  image_url: import_v4.z.string(),
  origin_url: import_v4.z.string(),
  height: import_v4.z.number(),
  width: import_v4.z.number()
});
var perplexityResponseSchema = import_v4.z.object({
  id: import_v4.z.string(),
  created: import_v4.z.number(),
  model: import_v4.z.string(),
  choices: import_v4.z.array(
    import_v4.z.object({
      message: import_v4.z.object({
        role: import_v4.z.literal("assistant"),
        content: import_v4.z.string()
      }),
      finish_reason: import_v4.z.string().nullish()
    })
  ),
  citations: import_v4.z.array(import_v4.z.string()).nullish(),
  images: import_v4.z.array(perplexityImageSchema).nullish(),
  usage: perplexityUsageSchema.nullish()
});
var perplexityChunkSchema = import_v4.z.object({
  id: import_v4.z.string(),
  created: import_v4.z.number(),
  model: import_v4.z.string(),
  choices: import_v4.z.array(
    import_v4.z.object({
      delta: import_v4.z.object({
        role: import_v4.z.literal("assistant"),
        content: import_v4.z.string()
      }),
      finish_reason: import_v4.z.string().nullish()
    })
  ),
  citations: import_v4.z.array(import_v4.z.string()).nullish(),
  images: import_v4.z.array(perplexityImageSchema).nullish(),
  usage: perplexityUsageSchema.nullish()
});
var perplexityErrorSchema = import_v4.z.object({
  error: import_v4.z.object({
    code: import_v4.z.number(),
    message: import_v4.z.string().nullish(),
    type: import_v4.z.string().nullish()
  })
});
var errorToMessage = (data) => {
  var _a, _b;
  return (_b = (_a = data.error.message) != null ? _a : data.error.type) != null ? _b : "unknown error";
};

// src/perplexity-provider.ts
function createPerplexity(options = {}) {
  const getHeaders = () => ({
    Authorization: `Bearer ${(0, import_provider_utils3.loadApiKey)({
      apiKey: options.apiKey,
      environmentVariableName: "PERPLEXITY_API_KEY",
      description: "Perplexity"
    })}`,
    ...options.headers
  });
  const createLanguageModel = (modelId) => {
    var _a;
    return new PerplexityLanguageModel(modelId, {
      baseURL: (0, import_provider_utils3.withoutTrailingSlash)(
        (_a = options.baseURL) != null ? _a : "https://api.perplexity.ai"
      ),
      headers: getHeaders,
      generateId: import_provider_utils3.generateId,
      fetch: options.fetch
    });
  };
  const provider = (modelId) => createLanguageModel(modelId);
  provider.languageModel = createLanguageModel;
  provider.textEmbeddingModel = (modelId) => {
    throw new import_provider2.NoSuchModelError({ modelId, modelType: "textEmbeddingModel" });
  };
  provider.imageModel = (modelId) => {
    throw new import_provider2.NoSuchModelError({ modelId, modelType: "imageModel" });
  };
  return provider;
}
var perplexity = createPerplexity();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createPerplexity,
  perplexity
});
//# sourceMappingURL=index.js.map