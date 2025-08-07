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
  cohere: () => cohere,
  createCohere: () => createCohere
});
module.exports = __toCommonJS(src_exports);

// src/cohere-provider.ts
var import_provider4 = require("@ai-sdk/provider");
var import_provider_utils4 = require("@ai-sdk/provider-utils");

// src/cohere-chat-language-model.ts
var import_provider_utils2 = require("@ai-sdk/provider-utils");
var import_v42 = require("zod/v4");

// src/cohere-error.ts
var import_provider_utils = require("@ai-sdk/provider-utils");
var import_v4 = require("zod/v4");
var cohereErrorDataSchema = import_v4.z.object({
  message: import_v4.z.string()
});
var cohereFailedResponseHandler = (0, import_provider_utils.createJsonErrorResponseHandler)({
  errorSchema: cohereErrorDataSchema,
  errorToMessage: (data) => data.message
});

// src/convert-to-cohere-chat-prompt.ts
var import_provider = require("@ai-sdk/provider");
function convertToCohereChatPrompt(prompt) {
  const messages = [];
  const documents = [];
  const warnings = [];
  for (const { role, content } of prompt) {
    switch (role) {
      case "system": {
        messages.push({ role: "system", content });
        break;
      }
      case "user": {
        messages.push({
          role: "user",
          content: content.map((part) => {
            var _a;
            switch (part.type) {
              case "text": {
                return part.text;
              }
              case "file": {
                let textContent;
                if (typeof part.data === "string") {
                  textContent = part.data;
                } else if (part.data instanceof Uint8Array) {
                  if (!(((_a = part.mediaType) == null ? void 0 : _a.startsWith("text/")) || part.mediaType === "application/json")) {
                    throw new import_provider.UnsupportedFunctionalityError({
                      functionality: `document media type: ${part.mediaType}`,
                      message: `Media type '${part.mediaType}' is not supported. Supported media types are: text/* and application/json.`
                    });
                  }
                  textContent = new TextDecoder().decode(part.data);
                } else {
                  throw new import_provider.UnsupportedFunctionalityError({
                    functionality: "File URL data",
                    message: "URLs should be downloaded by the AI SDK and not reach this point. This indicates a configuration issue."
                  });
                }
                documents.push({
                  data: {
                    text: textContent,
                    title: part.filename
                  }
                });
                return "";
              }
            }
          }).join("")
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
          content: toolCalls.length > 0 ? void 0 : text,
          tool_calls: toolCalls.length > 0 ? toolCalls : void 0,
          tool_plan: void 0
        });
        break;
      }
      case "tool": {
        messages.push(
          ...content.map((toolResult) => {
            const output = toolResult.output;
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
            return {
              role: "tool",
              content: contentValue,
              tool_call_id: toolResult.toolCallId
            };
          })
        );
        break;
      }
      default: {
        const _exhaustiveCheck = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }
  return { messages, documents, warnings };
}

// src/map-cohere-finish-reason.ts
function mapCohereFinishReason(finishReason) {
  switch (finishReason) {
    case "COMPLETE":
    case "STOP_SEQUENCE":
      return "stop";
    case "MAX_TOKENS":
      return "length";
    case "ERROR":
      return "error";
    case "TOOL_CALL":
      return "tool-calls";
    default:
      return "unknown";
  }
}

// src/cohere-prepare-tools.ts
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
  const cohereTools = [];
  for (const tool of tools) {
    if (tool.type === "provider-defined") {
      toolWarnings.push({ type: "unsupported-tool", tool });
    } else {
      cohereTools.push({
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
    return { tools: cohereTools, toolChoice: void 0, toolWarnings };
  }
  const type = toolChoice.type;
  switch (type) {
    case "auto":
      return { tools: cohereTools, toolChoice: void 0, toolWarnings };
    case "none":
      return { tools: cohereTools, toolChoice: "NONE", toolWarnings };
    case "required":
      return { tools: cohereTools, toolChoice: "REQUIRED", toolWarnings };
    case "tool":
      return {
        tools: cohereTools.filter(
          (tool) => tool.function.name === toolChoice.toolName
        ),
        toolChoice: "REQUIRED",
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

// src/cohere-chat-language-model.ts
var CohereChatLanguageModel = class {
  constructor(modelId, config) {
    this.specificationVersion = "v2";
    this.supportedUrls = {
      // No URLs are supported.
    };
    this.modelId = modelId;
    this.config = config;
  }
  get provider() {
    return this.config.provider;
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
    tools,
    toolChoice
  }) {
    const {
      messages: chatPrompt,
      documents: cohereDocuments,
      warnings: promptWarnings
    } = convertToCohereChatPrompt(prompt);
    const {
      tools: cohereTools,
      toolChoice: cohereToolChoice,
      toolWarnings
    } = prepareTools({ tools, toolChoice });
    return {
      args: {
        // model id:
        model: this.modelId,
        // standardized settings:
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        max_tokens: maxOutputTokens,
        temperature,
        p: topP,
        k: topK,
        seed,
        stop_sequences: stopSequences,
        // response format:
        response_format: (responseFormat == null ? void 0 : responseFormat.type) === "json" ? { type: "json_object", json_schema: responseFormat.schema } : void 0,
        // messages:
        messages: chatPrompt,
        // tools:
        tools: cohereTools,
        tool_choice: cohereToolChoice,
        // documents for RAG:
        ...cohereDocuments.length > 0 && { documents: cohereDocuments }
      },
      warnings: [...toolWarnings, ...promptWarnings]
    };
  }
  async doGenerate(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const { args, warnings } = this.getArgs(options);
    const {
      responseHeaders,
      value: response,
      rawValue: rawResponse
    } = await (0, import_provider_utils2.postJsonToApi)({
      url: `${this.config.baseURL}/chat`,
      headers: (0, import_provider_utils2.combineHeaders)(this.config.headers(), options.headers),
      body: args,
      failedResponseHandler: cohereFailedResponseHandler,
      successfulResponseHandler: (0, import_provider_utils2.createJsonResponseHandler)(
        cohereChatResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const content = [];
    if (((_b = (_a = response.message.content) == null ? void 0 : _a[0]) == null ? void 0 : _b.text) != null && ((_d = (_c = response.message.content) == null ? void 0 : _c[0]) == null ? void 0 : _d.text.length) > 0) {
      content.push({ type: "text", text: response.message.content[0].text });
    }
    for (const citation of (_e = response.message.citations) != null ? _e : []) {
      content.push({
        type: "source",
        sourceType: "document",
        id: this.config.generateId(),
        mediaType: "text/plain",
        title: ((_g = (_f = citation.sources[0]) == null ? void 0 : _f.document) == null ? void 0 : _g.title) || "Document",
        providerMetadata: {
          cohere: {
            start: citation.start,
            end: citation.end,
            text: citation.text,
            sources: citation.sources,
            ...citation.type && { citationType: citation.type }
          }
        }
      });
    }
    for (const toolCall of (_h = response.message.tool_calls) != null ? _h : []) {
      content.push({
        type: "tool-call",
        toolCallId: toolCall.id,
        toolName: toolCall.function.name,
        // Cohere sometimes returns `null` for tool call arguments for tools
        // defined as having no arguments.
        input: toolCall.function.arguments.replace(/^null$/, "{}")
      });
    }
    return {
      content,
      finishReason: mapCohereFinishReason(response.finish_reason),
      usage: {
        inputTokens: response.usage.tokens.input_tokens,
        outputTokens: response.usage.tokens.output_tokens,
        totalTokens: response.usage.tokens.input_tokens + response.usage.tokens.output_tokens
      },
      request: { body: args },
      response: {
        // TODO timestamp, model id
        id: (_i = response.generation_id) != null ? _i : void 0,
        headers: responseHeaders,
        body: rawResponse
      },
      warnings
    };
  }
  async doStream(options) {
    const { args, warnings } = this.getArgs(options);
    const { responseHeaders, value: response } = await (0, import_provider_utils2.postJsonToApi)({
      url: `${this.config.baseURL}/chat`,
      headers: (0, import_provider_utils2.combineHeaders)(this.config.headers(), options.headers),
      body: { ...args, stream: true },
      failedResponseHandler: cohereFailedResponseHandler,
      successfulResponseHandler: (0, import_provider_utils2.createEventSourceResponseHandler)(
        cohereChatChunkSchema
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
    let pendingToolCall = null;
    return {
      stream: response.pipeThrough(
        new TransformStream({
          start(controller) {
            controller.enqueue({ type: "stream-start", warnings });
          },
          transform(chunk, controller) {
            var _a, _b;
            if (options.includeRawChunks) {
              controller.enqueue({ type: "raw", rawValue: chunk.rawValue });
            }
            if (!chunk.success) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            const type = value.type;
            switch (type) {
              case "content-start": {
                controller.enqueue({
                  type: "text-start",
                  id: String(value.index)
                });
                return;
              }
              case "content-delta": {
                controller.enqueue({
                  type: "text-delta",
                  id: String(value.index),
                  delta: value.delta.message.content.text
                });
                return;
              }
              case "content-end": {
                controller.enqueue({
                  type: "text-end",
                  id: String(value.index)
                });
                return;
              }
              case "tool-call-start": {
                const toolId = value.delta.message.tool_calls.id;
                const toolName = value.delta.message.tool_calls.function.name;
                const initialArgs = value.delta.message.tool_calls.function.arguments;
                pendingToolCall = {
                  id: toolId,
                  name: toolName,
                  arguments: initialArgs,
                  hasFinished: false
                };
                controller.enqueue({
                  type: "tool-input-start",
                  id: toolId,
                  toolName
                });
                if (initialArgs.length > 0) {
                  controller.enqueue({
                    type: "tool-input-delta",
                    id: toolId,
                    delta: initialArgs
                  });
                }
                return;
              }
              case "tool-call-delta": {
                if (pendingToolCall && !pendingToolCall.hasFinished) {
                  const argsDelta = value.delta.message.tool_calls.function.arguments;
                  pendingToolCall.arguments += argsDelta;
                  controller.enqueue({
                    type: "tool-input-delta",
                    id: pendingToolCall.id,
                    delta: argsDelta
                  });
                }
                return;
              }
              case "tool-call-end": {
                if (pendingToolCall && !pendingToolCall.hasFinished) {
                  controller.enqueue({
                    type: "tool-input-end",
                    id: pendingToolCall.id
                  });
                  controller.enqueue({
                    type: "tool-call",
                    toolCallId: pendingToolCall.id,
                    toolName: pendingToolCall.name,
                    input: JSON.stringify(
                      JSON.parse(((_a = pendingToolCall.arguments) == null ? void 0 : _a.trim()) || "{}")
                    )
                  });
                  pendingToolCall.hasFinished = true;
                  pendingToolCall = null;
                }
                return;
              }
              case "message-start": {
                controller.enqueue({
                  type: "response-metadata",
                  id: (_b = value.id) != null ? _b : void 0
                });
                return;
              }
              case "message-end": {
                finishReason = mapCohereFinishReason(value.delta.finish_reason);
                const tokens = value.delta.usage.tokens;
                usage.inputTokens = tokens.input_tokens;
                usage.outputTokens = tokens.output_tokens;
                usage.totalTokens = tokens.input_tokens + tokens.output_tokens;
                return;
              }
              default: {
                return;
              }
            }
          },
          flush(controller) {
            controller.enqueue({
              type: "finish",
              finishReason,
              usage
            });
          }
        })
      ),
      request: { body: { ...args, stream: true } },
      response: { headers: responseHeaders }
    };
  }
};
var cohereChatResponseSchema = import_v42.z.object({
  generation_id: import_v42.z.string().nullish(),
  message: import_v42.z.object({
    role: import_v42.z.string(),
    content: import_v42.z.array(
      import_v42.z.object({
        type: import_v42.z.string(),
        text: import_v42.z.string()
      })
    ).nullish(),
    tool_plan: import_v42.z.string().nullish(),
    tool_calls: import_v42.z.array(
      import_v42.z.object({
        id: import_v42.z.string(),
        type: import_v42.z.literal("function"),
        function: import_v42.z.object({
          name: import_v42.z.string(),
          arguments: import_v42.z.string()
        })
      })
    ).nullish(),
    citations: import_v42.z.array(
      import_v42.z.object({
        start: import_v42.z.number(),
        end: import_v42.z.number(),
        text: import_v42.z.string(),
        sources: import_v42.z.array(
          import_v42.z.object({
            type: import_v42.z.string().optional(),
            id: import_v42.z.string().optional(),
            document: import_v42.z.object({
              id: import_v42.z.string().optional(),
              text: import_v42.z.string(),
              title: import_v42.z.string()
            })
          })
        ),
        type: import_v42.z.string().optional()
      })
    ).nullish()
  }),
  finish_reason: import_v42.z.string(),
  usage: import_v42.z.object({
    billed_units: import_v42.z.object({
      input_tokens: import_v42.z.number(),
      output_tokens: import_v42.z.number()
    }),
    tokens: import_v42.z.object({
      input_tokens: import_v42.z.number(),
      output_tokens: import_v42.z.number()
    })
  })
});
var cohereChatChunkSchema = import_v42.z.discriminatedUnion("type", [
  import_v42.z.object({
    type: import_v42.z.literal("citation-start")
  }),
  import_v42.z.object({
    type: import_v42.z.literal("citation-end")
  }),
  import_v42.z.object({
    type: import_v42.z.literal("content-start"),
    index: import_v42.z.number()
  }),
  import_v42.z.object({
    type: import_v42.z.literal("content-delta"),
    index: import_v42.z.number(),
    delta: import_v42.z.object({
      message: import_v42.z.object({
        content: import_v42.z.object({
          text: import_v42.z.string()
        })
      })
    })
  }),
  import_v42.z.object({
    type: import_v42.z.literal("content-end"),
    index: import_v42.z.number()
  }),
  import_v42.z.object({
    type: import_v42.z.literal("message-start"),
    id: import_v42.z.string().nullish()
  }),
  import_v42.z.object({
    type: import_v42.z.literal("message-end"),
    delta: import_v42.z.object({
      finish_reason: import_v42.z.string(),
      usage: import_v42.z.object({
        tokens: import_v42.z.object({
          input_tokens: import_v42.z.number(),
          output_tokens: import_v42.z.number()
        })
      })
    })
  }),
  // https://docs.cohere.com/v2/docs/streaming#tool-use-stream-events-for-tool-calling
  import_v42.z.object({
    type: import_v42.z.literal("tool-plan-delta"),
    delta: import_v42.z.object({
      message: import_v42.z.object({
        tool_plan: import_v42.z.string()
      })
    })
  }),
  import_v42.z.object({
    type: import_v42.z.literal("tool-call-start"),
    delta: import_v42.z.object({
      message: import_v42.z.object({
        tool_calls: import_v42.z.object({
          id: import_v42.z.string(),
          type: import_v42.z.literal("function"),
          function: import_v42.z.object({
            name: import_v42.z.string(),
            arguments: import_v42.z.string()
          })
        })
      })
    })
  }),
  // A single tool call's `arguments` stream in chunks and must be accumulated
  // in a string and so the full tool object info can only be parsed once we see
  // `tool-call-end`.
  import_v42.z.object({
    type: import_v42.z.literal("tool-call-delta"),
    delta: import_v42.z.object({
      message: import_v42.z.object({
        tool_calls: import_v42.z.object({
          function: import_v42.z.object({
            arguments: import_v42.z.string()
          })
        })
      })
    })
  }),
  import_v42.z.object({
    type: import_v42.z.literal("tool-call-end")
  })
]);

// src/cohere-embedding-model.ts
var import_provider3 = require("@ai-sdk/provider");
var import_provider_utils3 = require("@ai-sdk/provider-utils");
var import_v44 = require("zod/v4");

// src/cohere-embedding-options.ts
var import_v43 = require("zod/v4");
var cohereEmbeddingOptions = import_v43.z.object({
  /**
   * Specifies the type of input passed to the model. Default is `search_query`.
   *
   * - "search_document": Used for embeddings stored in a vector database for search use-cases.
   * - "search_query": Used for embeddings of search queries run against a vector DB to find relevant documents.
   * - "classification": Used for embeddings passed through a text classifier.
   * - "clustering": Used for embeddings run through a clustering algorithm.
   */
  inputType: import_v43.z.enum(["search_document", "search_query", "classification", "clustering"]).optional(),
  /**
   * Specifies how the API will handle inputs longer than the maximum token length.
   * Default is `END`.
   *
   * - "NONE": If selected, when the input exceeds the maximum input token length will return an error.
   * - "START": Will discard the start of the input until the remaining input is exactly the maximum input token length for the model.
   * - "END": Will discard the end of the input until the remaining input is exactly the maximum input token length for the model.
   */
  truncate: import_v43.z.enum(["NONE", "START", "END"]).optional()
});

// src/cohere-embedding-model.ts
var CohereEmbeddingModel = class {
  constructor(modelId, config) {
    this.specificationVersion = "v2";
    this.maxEmbeddingsPerCall = 96;
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
    const embeddingOptions = await (0, import_provider_utils3.parseProviderOptions)({
      provider: "cohere",
      providerOptions,
      schema: cohereEmbeddingOptions
    });
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
      url: `${this.config.baseURL}/embed`,
      headers: (0, import_provider_utils3.combineHeaders)(this.config.headers(), headers),
      body: {
        model: this.modelId,
        // The AI SDK only supports 'float' embeddings which are also the only ones
        // the Cohere API docs state are supported for all models.
        // https://docs.cohere.com/v2/reference/embed#request.body.embedding_types
        embedding_types: ["float"],
        texts: values,
        input_type: (_a = embeddingOptions == null ? void 0 : embeddingOptions.inputType) != null ? _a : "search_query",
        truncate: embeddingOptions == null ? void 0 : embeddingOptions.truncate
      },
      failedResponseHandler: cohereFailedResponseHandler,
      successfulResponseHandler: (0, import_provider_utils3.createJsonResponseHandler)(
        cohereTextEmbeddingResponseSchema
      ),
      abortSignal,
      fetch: this.config.fetch
    });
    return {
      embeddings: response.embeddings.float,
      usage: { tokens: response.meta.billed_units.input_tokens },
      response: { headers: responseHeaders, body: rawValue }
    };
  }
};
var cohereTextEmbeddingResponseSchema = import_v44.z.object({
  embeddings: import_v44.z.object({
    float: import_v44.z.array(import_v44.z.array(import_v44.z.number()))
  }),
  meta: import_v44.z.object({
    billed_units: import_v44.z.object({
      input_tokens: import_v44.z.number()
    })
  })
});

// src/cohere-provider.ts
function createCohere(options = {}) {
  var _a;
  const baseURL = (_a = (0, import_provider_utils4.withoutTrailingSlash)(options.baseURL)) != null ? _a : "https://api.cohere.com/v2";
  const getHeaders = () => ({
    Authorization: `Bearer ${(0, import_provider_utils4.loadApiKey)({
      apiKey: options.apiKey,
      environmentVariableName: "COHERE_API_KEY",
      description: "Cohere"
    })}`,
    ...options.headers
  });
  const createChatModel = (modelId) => {
    var _a2;
    return new CohereChatLanguageModel(modelId, {
      provider: "cohere.chat",
      baseURL,
      headers: getHeaders,
      fetch: options.fetch,
      generateId: (_a2 = options.generateId) != null ? _a2 : import_provider_utils4.generateId
    });
  };
  const createTextEmbeddingModel = (modelId) => new CohereEmbeddingModel(modelId, {
    provider: "cohere.textEmbedding",
    baseURL,
    headers: getHeaders,
    fetch: options.fetch
  });
  const provider = function(modelId) {
    if (new.target) {
      throw new Error(
        "The Cohere model function cannot be called with the new keyword."
      );
    }
    return createChatModel(modelId);
  };
  provider.languageModel = createChatModel;
  provider.embedding = createTextEmbeddingModel;
  provider.textEmbeddingModel = createTextEmbeddingModel;
  provider.imageModel = (modelId) => {
    throw new import_provider4.NoSuchModelError({ modelId, modelType: "imageModel" });
  };
  return provider;
}
var cohere = createCohere();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cohere,
  createCohere
});
//# sourceMappingURL=index.js.map