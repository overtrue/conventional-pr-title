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
  createMistral: () => createMistral,
  mistral: () => mistral
});
module.exports = __toCommonJS(src_exports);

// src/mistral-provider.ts
var import_provider4 = require("@ai-sdk/provider");
var import_provider_utils4 = require("@ai-sdk/provider-utils");

// src/mistral-chat-language-model.ts
var import_provider_utils2 = require("@ai-sdk/provider-utils");
var import_v43 = require("zod/v4");

// src/convert-to-mistral-chat-messages.ts
var import_provider = require("@ai-sdk/provider");
function convertToMistralChatMessages(prompt) {
  const messages = [];
  for (let i = 0; i < prompt.length; i++) {
    const { role, content } = prompt[i];
    const isLastMessage = i === prompt.length - 1;
    switch (role) {
      case "system": {
        messages.push({ role: "system", content });
        break;
      }
      case "user": {
        messages.push({
          role: "user",
          content: content.map((part) => {
            switch (part.type) {
              case "text": {
                return { type: "text", text: part.text };
              }
              case "file": {
                if (part.mediaType.startsWith("image/")) {
                  const mediaType = part.mediaType === "image/*" ? "image/jpeg" : part.mediaType;
                  return {
                    type: "image_url",
                    image_url: part.data instanceof URL ? part.data.toString() : `data:${mediaType};base64,${part.data}`
                  };
                } else if (part.mediaType === "application/pdf") {
                  return {
                    type: "document_url",
                    document_url: part.data.toString()
                  };
                } else {
                  throw new import_provider.UnsupportedFunctionalityError({
                    functionality: "Only images and PDF file parts are supported"
                  });
                }
              }
            }
          })
        });
        break;
      }
      case "assistant": {
        let text = "";
        const toolCalls = [];
        for (const part of content) {
          switch (part.type) {
            case "text": {
              text += part.text;
              break;
            }
            case "tool-call": {
              toolCalls.push({
                id: part.toolCallId,
                type: "function",
                function: {
                  name: part.toolName,
                  arguments: JSON.stringify(part.input)
                }
              });
              break;
            }
          }
        }
        messages.push({
          role: "assistant",
          content: text,
          prefix: isLastMessage ? true : void 0,
          tool_calls: toolCalls.length > 0 ? toolCalls : void 0
        });
        break;
      }
      case "tool": {
        for (const toolResponse of content) {
          const output = toolResponse.output;
          let contentValue;
          switch (output.type) {
            case "text":
            case "error-text":
              contentValue = output.value;
              break;
            case "content":
            case "json":
            case "error-json":
              contentValue = JSON.stringify(output.value);
              break;
          }
          messages.push({
            role: "tool",
            name: toolResponse.toolName,
            tool_call_id: toolResponse.toolCallId,
            content: contentValue
          });
        }
        break;
      }
      default: {
        const _exhaustiveCheck = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }
  return messages;
}

// src/get-response-metadata.ts
function getResponseMetadata({
  id,
  model,
  created
}) {
  return {
    id: id != null ? id : void 0,
    modelId: model != null ? model : void 0,
    timestamp: created != null ? new Date(created * 1e3) : void 0
  };
}

// src/map-mistral-finish-reason.ts
function mapMistralFinishReason(finishReason) {
  switch (finishReason) {
    case "stop":
      return "stop";
    case "length":
    case "model_length":
      return "length";
    case "tool_calls":
      return "tool-calls";
    default:
      return "unknown";
  }
}

// src/mistral-chat-options.ts
var import_v4 = require("zod/v4");
var mistralProviderOptions = import_v4.z.object({
  /**
  Whether to inject a safety prompt before all conversations.
  
  Defaults to `false`.
     */
  safePrompt: import_v4.z.boolean().optional(),
  documentImageLimit: import_v4.z.number().optional(),
  documentPageLimit: import_v4.z.number().optional()
});

// src/mistral-error.ts
var import_provider_utils = require("@ai-sdk/provider-utils");
var import_v42 = require("zod/v4");
var mistralErrorDataSchema = import_v42.z.object({
  object: import_v42.z.literal("error"),
  message: import_v42.z.string(),
  type: import_v42.z.string(),
  param: import_v42.z.string().nullable(),
  code: import_v42.z.string().nullable()
});
var mistralFailedResponseHandler = (0, import_provider_utils.createJsonErrorResponseHandler)({
  errorSchema: mistralErrorDataSchema,
  errorToMessage: (data) => data.message
});

// src/mistral-prepare-tools.ts
var import_provider2 = require("@ai-sdk/provider");
function prepareTools({
  tools,
  toolChoice
}) {
  tools = (tools == null ? void 0 : tools.length) ? tools : void 0;
  const toolWarnings = [];
  if (tools == null) {
    return { tools: void 0, toolChoice: void 0, toolWarnings };
  }
  const mistralTools = [];
  for (const tool of tools) {
    if (tool.type === "provider-defined") {
      toolWarnings.push({ type: "unsupported-tool", tool });
    } else {
      mistralTools.push({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema
        }
      });
    }
  }
  if (toolChoice == null) {
    return { tools: mistralTools, toolChoice: void 0, toolWarnings };
  }
  const type = toolChoice.type;
  switch (type) {
    case "auto":
    case "none":
      return { tools: mistralTools, toolChoice: type, toolWarnings };
    case "required":
      return { tools: mistralTools, toolChoice: "any", toolWarnings };
    case "tool":
      return {
        tools: mistralTools.filter(
          (tool) => tool.function.name === toolChoice.toolName
        ),
        toolChoice: "any",
        toolWarnings
      };
    default: {
      const _exhaustiveCheck = type;
      throw new import_provider2.UnsupportedFunctionalityError({
        functionality: `tool choice type: ${_exhaustiveCheck}`
      });
    }
  }
}

// src/mistral-chat-language-model.ts
var MistralChatLanguageModel = class {
  constructor(modelId, config) {
    this.specificationVersion = "v2";
    this.supportedUrls = {
      "application/pdf": [/^https:\/\/.*$/]
    };
    this.modelId = modelId;
    this.config = config;
  }
  get provider() {
    return this.config.provider;
  }
  async getArgs({
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
    providerOptions,
    tools,
    toolChoice
  }) {
    var _a;
    const warnings = [];
    const options = (_a = await (0, import_provider_utils2.parseProviderOptions)({
      provider: "mistral",
      providerOptions,
      schema: mistralProviderOptions
    })) != null ? _a : {};
    if (topK != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "topK"
      });
    }
    if (frequencyPenalty != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "frequencyPenalty"
      });
    }
    if (presencePenalty != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "presencePenalty"
      });
    }
    if (stopSequences != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "stopSequences"
      });
    }
    if (responseFormat != null && responseFormat.type === "json" && responseFormat.schema != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "responseFormat",
        details: "JSON response format schema is not supported"
      });
    }
    const baseArgs = {
      // model id:
      model: this.modelId,
      // model specific settings:
      safe_prompt: options.safePrompt,
      // standardized settings:
      max_tokens: maxOutputTokens,
      temperature,
      top_p: topP,
      random_seed: seed,
      // response format:
      response_format: (responseFormat == null ? void 0 : responseFormat.type) === "json" ? { type: "json_object" } : void 0,
      // mistral-specific provider options:
      document_image_limit: options.documentImageLimit,
      document_page_limit: options.documentPageLimit,
      // messages:
      messages: convertToMistralChatMessages(prompt)
    };
    const {
      tools: mistralTools,
      toolChoice: mistralToolChoice,
      toolWarnings
    } = prepareTools({
      tools,
      toolChoice
    });
    return {
      args: {
        ...baseArgs,
        tools: mistralTools,
        tool_choice: mistralToolChoice
      },
      warnings: [...warnings, ...toolWarnings]
    };
  }
  async doGenerate(options) {
    const { args: body, warnings } = await this.getArgs(options);
    const {
      responseHeaders,
      value: response,
      rawValue: rawResponse
    } = await (0, import_provider_utils2.postJsonToApi)({
      url: `${this.config.baseURL}/chat/completions`,
      headers: (0, import_provider_utils2.combineHeaders)(this.config.headers(), options.headers),
      body,
      failedResponseHandler: mistralFailedResponseHandler,
      successfulResponseHandler: (0, import_provider_utils2.createJsonResponseHandler)(
        mistralChatResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const choice = response.choices[0];
    const content = [];
    let text = extractTextContent(choice.message.content);
    const lastMessage = body.messages[body.messages.length - 1];
    if (lastMessage.role === "assistant" && (text == null ? void 0 : text.startsWith(lastMessage.content))) {
      text = text.slice(lastMessage.content.length);
    }
    if (text != null && text.length > 0) {
      content.push({ type: "text", text });
    }
    if (choice.message.tool_calls != null) {
      for (const toolCall of choice.message.tool_calls) {
        content.push({
          type: "tool-call",
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          input: toolCall.function.arguments
        });
      }
    }
    return {
      content,
      finishReason: mapMistralFinishReason(choice.finish_reason),
      usage: {
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      },
      request: { body },
      response: {
        ...getResponseMetadata(response),
        headers: responseHeaders,
        body: rawResponse
      },
      warnings
    };
  }
  async doStream(options) {
    const { args, warnings } = await this.getArgs(options);
    const body = { ...args, stream: true };
    const { responseHeaders, value: response } = await (0, import_provider_utils2.postJsonToApi)({
      url: `${this.config.baseURL}/chat/completions`,
      headers: (0, import_provider_utils2.combineHeaders)(this.config.headers(), options.headers),
      body,
      failedResponseHandler: mistralFailedResponseHandler,
      successfulResponseHandler: (0, import_provider_utils2.createEventSourceResponseHandler)(
        mistralChatChunkSchema
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
    let isFirstChunk = true;
    let activeText = false;
    return {
      stream: response.pipeThrough(
        new TransformStream({
          start(controller) {
            controller.enqueue({ type: "stream-start", warnings });
          },
          transform(chunk, controller) {
            if (options.includeRawChunks) {
              controller.enqueue({ type: "raw", rawValue: chunk.rawValue });
            }
            if (!chunk.success) {
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            if (isFirstChunk) {
              isFirstChunk = false;
              controller.enqueue({
                type: "response-metadata",
                ...getResponseMetadata(value)
              });
            }
            if (value.usage != null) {
              usage.inputTokens = value.usage.prompt_tokens;
              usage.outputTokens = value.usage.completion_tokens;
              usage.totalTokens = value.usage.total_tokens;
            }
            const choice = value.choices[0];
            const delta = choice.delta;
            const textContent = extractTextContent(delta.content);
            if (textContent != null && textContent.length > 0) {
              if (!activeText) {
                controller.enqueue({ type: "text-start", id: "0" });
                activeText = true;
              }
              controller.enqueue({
                type: "text-delta",
                id: "0",
                delta: textContent
              });
            }
            if ((delta == null ? void 0 : delta.tool_calls) != null) {
              for (const toolCall of delta.tool_calls) {
                const toolCallId = toolCall.id;
                const toolName = toolCall.function.name;
                const input = toolCall.function.arguments;
                controller.enqueue({
                  type: "tool-input-start",
                  id: toolCallId,
                  toolName
                });
                controller.enqueue({
                  type: "tool-input-delta",
                  id: toolCallId,
                  delta: input
                });
                controller.enqueue({
                  type: "tool-input-end",
                  id: toolCallId
                });
                controller.enqueue({
                  type: "tool-call",
                  toolCallId,
                  toolName,
                  input
                });
              }
            }
            if (choice.finish_reason != null) {
              finishReason = mapMistralFinishReason(choice.finish_reason);
            }
          },
          flush(controller) {
            if (activeText) {
              controller.enqueue({ type: "text-end", id: "0" });
            }
            controller.enqueue({
              type: "finish",
              finishReason,
              usage
            });
          }
        })
      ),
      request: { body },
      response: { headers: responseHeaders }
    };
  }
};
function extractTextContent(content) {
  if (typeof content === "string") {
    return content;
  }
  if (content == null) {
    return void 0;
  }
  const textContent = [];
  for (const chunk of content) {
    const { type } = chunk;
    switch (type) {
      case "text":
        textContent.push(chunk.text);
        break;
      case "image_url":
      case "reference":
        break;
      default: {
        const _exhaustiveCheck = type;
        throw new Error(`Unsupported type: ${_exhaustiveCheck}`);
      }
    }
  }
  return textContent.length ? textContent.join("") : void 0;
}
var mistralContentSchema = import_v43.z.union([
  import_v43.z.string(),
  import_v43.z.array(
    import_v43.z.discriminatedUnion("type", [
      import_v43.z.object({
        type: import_v43.z.literal("text"),
        text: import_v43.z.string()
      }),
      import_v43.z.object({
        type: import_v43.z.literal("image_url"),
        image_url: import_v43.z.union([
          import_v43.z.string(),
          import_v43.z.object({
            url: import_v43.z.string(),
            detail: import_v43.z.string().nullable()
          })
        ])
      }),
      import_v43.z.object({
        type: import_v43.z.literal("reference"),
        reference_ids: import_v43.z.array(import_v43.z.number())
      })
    ])
  )
]).nullish();
var mistralUsageSchema = import_v43.z.object({
  prompt_tokens: import_v43.z.number(),
  completion_tokens: import_v43.z.number(),
  total_tokens: import_v43.z.number()
});
var mistralChatResponseSchema = import_v43.z.object({
  id: import_v43.z.string().nullish(),
  created: import_v43.z.number().nullish(),
  model: import_v43.z.string().nullish(),
  choices: import_v43.z.array(
    import_v43.z.object({
      message: import_v43.z.object({
        role: import_v43.z.literal("assistant"),
        content: mistralContentSchema,
        tool_calls: import_v43.z.array(
          import_v43.z.object({
            id: import_v43.z.string(),
            function: import_v43.z.object({ name: import_v43.z.string(), arguments: import_v43.z.string() })
          })
        ).nullish()
      }),
      index: import_v43.z.number(),
      finish_reason: import_v43.z.string().nullish()
    })
  ),
  object: import_v43.z.literal("chat.completion"),
  usage: mistralUsageSchema
});
var mistralChatChunkSchema = import_v43.z.object({
  id: import_v43.z.string().nullish(),
  created: import_v43.z.number().nullish(),
  model: import_v43.z.string().nullish(),
  choices: import_v43.z.array(
    import_v43.z.object({
      delta: import_v43.z.object({
        role: import_v43.z.enum(["assistant"]).optional(),
        content: mistralContentSchema,
        tool_calls: import_v43.z.array(
          import_v43.z.object({
            id: import_v43.z.string(),
            function: import_v43.z.object({ name: import_v43.z.string(), arguments: import_v43.z.string() })
          })
        ).nullish()
      }),
      finish_reason: import_v43.z.string().nullish(),
      index: import_v43.z.number()
    })
  ),
  usage: mistralUsageSchema.nullish()
});

// src/mistral-embedding-model.ts
var import_provider3 = require("@ai-sdk/provider");
var import_provider_utils3 = require("@ai-sdk/provider-utils");
var import_v44 = require("zod/v4");
var MistralEmbeddingModel = class {
  constructor(modelId, config) {
    this.specificationVersion = "v2";
    this.maxEmbeddingsPerCall = 32;
    this.supportsParallelCalls = false;
    this.modelId = modelId;
    this.config = config;
  }
  get provider() {
    return this.config.provider;
  }
  async doEmbed({
    values,
    abortSignal,
    headers
  }) {
    if (values.length > this.maxEmbeddingsPerCall) {
      throw new import_provider3.TooManyEmbeddingValuesForCallError({
        provider: this.provider,
        modelId: this.modelId,
        maxEmbeddingsPerCall: this.maxEmbeddingsPerCall,
        values
      });
    }
    const {
      responseHeaders,
      value: response,
      rawValue
    } = await (0, import_provider_utils3.postJsonToApi)({
      url: `${this.config.baseURL}/embeddings`,
      headers: (0, import_provider_utils3.combineHeaders)(this.config.headers(), headers),
      body: {
        model: this.modelId,
        input: values,
        encoding_format: "float"
      },
      failedResponseHandler: mistralFailedResponseHandler,
      successfulResponseHandler: (0, import_provider_utils3.createJsonResponseHandler)(
        MistralTextEmbeddingResponseSchema
      ),
      abortSignal,
      fetch: this.config.fetch
    });
    return {
      embeddings: response.data.map((item) => item.embedding),
      usage: response.usage ? { tokens: response.usage.prompt_tokens } : void 0,
      response: { headers: responseHeaders, body: rawValue }
    };
  }
};
var MistralTextEmbeddingResponseSchema = import_v44.z.object({
  data: import_v44.z.array(import_v44.z.object({ embedding: import_v44.z.array(import_v44.z.number()) })),
  usage: import_v44.z.object({ prompt_tokens: import_v44.z.number() }).nullish()
});

// src/mistral-provider.ts
function createMistral(options = {}) {
  var _a;
  const baseURL = (_a = (0, import_provider_utils4.withoutTrailingSlash)(options.baseURL)) != null ? _a : "https://api.mistral.ai/v1";
  const getHeaders = () => ({
    Authorization: `Bearer ${(0, import_provider_utils4.loadApiKey)({
      apiKey: options.apiKey,
      environmentVariableName: "MISTRAL_API_KEY",
      description: "Mistral"
    })}`,
    ...options.headers
  });
  const createChatModel = (modelId) => new MistralChatLanguageModel(modelId, {
    provider: "mistral.chat",
    baseURL,
    headers: getHeaders,
    fetch: options.fetch
  });
  const createEmbeddingModel = (modelId) => new MistralEmbeddingModel(modelId, {
    provider: "mistral.embedding",
    baseURL,
    headers: getHeaders,
    fetch: options.fetch
  });
  const provider = function(modelId) {
    if (new.target) {
      throw new Error(
        "The Mistral model function cannot be called with the new keyword."
      );
    }
    return createChatModel(modelId);
  };
  provider.languageModel = createChatModel;
  provider.chat = createChatModel;
  provider.embedding = createEmbeddingModel;
  provider.textEmbedding = createEmbeddingModel;
  provider.textEmbeddingModel = createEmbeddingModel;
  provider.imageModel = (modelId) => {
    throw new import_provider4.NoSuchModelError({ modelId, modelType: "imageModel" });
  };
  return provider;
}
var mistral = createMistral();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createMistral,
  mistral
});
//# sourceMappingURL=index.js.map