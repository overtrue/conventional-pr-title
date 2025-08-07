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
var index_exports = {};
__export(index_exports, {
  ClaudeCodeLanguageModel: () => ClaudeCodeLanguageModel,
  claudeCode: () => claudeCode,
  createAPICallError: () => createAPICallError,
  createAuthenticationError: () => createAuthenticationError,
  createClaudeCode: () => createClaudeCode,
  createTimeoutError: () => createTimeoutError,
  getErrorMetadata: () => getErrorMetadata,
  isAuthenticationError: () => isAuthenticationError,
  isTimeoutError: () => isTimeoutError
});
module.exports = __toCommonJS(index_exports);

// src/claude-code-provider.ts
var import_provider3 = require("@ai-sdk/provider");

// src/claude-code-language-model.ts
var import_provider2 = require("@ai-sdk/provider");
var import_provider_utils = require("@ai-sdk/provider-utils");

// src/convert-to-claude-code-messages.ts
function convertToClaudeCodeMessages(prompt, mode = { type: "regular" }, jsonSchema) {
  const messages = [];
  const warnings = [];
  let systemPrompt;
  for (const message of prompt) {
    switch (message.role) {
      case "system":
        systemPrompt = message.content;
        break;
      case "user":
        if (typeof message.content === "string") {
          messages.push(message.content);
        } else {
          const textParts = message.content.filter((part) => part.type === "text").map((part) => part.text).join("\n");
          if (textParts) {
            messages.push(textParts);
          }
          const imageParts = message.content.filter((part) => part.type === "image");
          if (imageParts.length > 0) {
            warnings.push("Claude Code SDK does not support image inputs. Images will be ignored.");
          }
        }
        break;
      case "assistant": {
        let assistantContent = "";
        if (typeof message.content === "string") {
          assistantContent = message.content;
        } else {
          const textParts = message.content.filter((part) => part.type === "text").map((part) => part.text).join("\n");
          if (textParts) {
            assistantContent = textParts;
          }
          const toolCalls = message.content.filter((part) => part.type === "tool-call");
          if (toolCalls.length > 0) {
            assistantContent += `
[Tool calls made]`;
          }
        }
        messages.push(`Assistant: ${assistantContent}`);
        break;
      }
      case "tool":
        for (const tool of message.content) {
          const resultText = tool.output.type === "text" ? tool.output.value : JSON.stringify(tool.output.value);
          messages.push(`Tool Result (${tool.toolName}): ${resultText}`);
        }
        break;
    }
  }
  let finalPrompt = "";
  if (systemPrompt) {
    finalPrompt = systemPrompt;
  }
  if (messages.length === 0) {
    return { messagesPrompt: finalPrompt, systemPrompt };
  }
  const formattedMessages = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.startsWith("Assistant:") || msg.startsWith("Tool Result")) {
      formattedMessages.push(msg);
    } else {
      formattedMessages.push(`Human: ${msg}`);
    }
  }
  if (finalPrompt) {
    finalPrompt = finalPrompt + "\n\n" + formattedMessages.join("\n\n");
  } else {
    finalPrompt = formattedMessages.join("\n\n");
  }
  if (mode?.type === "object-json" && jsonSchema) {
    const schemaStr = JSON.stringify(jsonSchema, null, 2);
    finalPrompt = `CRITICAL: You MUST respond with ONLY a JSON object. NO other text, NO explanations, NO questions.

Your response MUST start with { and end with }

The JSON MUST match this EXACT schema:
${schemaStr}

Now, based on the following conversation, generate ONLY the JSON object with the exact fields specified above:

${finalPrompt}

Remember: Your ENTIRE response must be ONLY the JSON object, starting with { and ending with }`;
  }
  return {
    messagesPrompt: finalPrompt,
    systemPrompt,
    ...warnings.length > 0 && { warnings }
  };
}

// src/extract-json.ts
var import_jsonc_parser = require("jsonc-parser");
function extractJson(text) {
  let content = text.trim();
  const fenceMatch = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(content);
  if (fenceMatch) {
    content = fenceMatch[1];
  }
  const varMatch = /^\s*(?:const|let|var)\s+\w+\s*=\s*([\s\S]*)/i.exec(content);
  if (varMatch) {
    content = varMatch[1];
    if (content.trim().endsWith(";")) {
      content = content.trim().slice(0, -1);
    }
  }
  const firstObj = content.indexOf("{");
  const firstArr = content.indexOf("[");
  if (firstObj === -1 && firstArr === -1) {
    return text;
  }
  const start = firstArr === -1 ? firstObj : firstObj === -1 ? firstArr : Math.min(firstObj, firstArr);
  content = content.slice(start);
  const tryParse = (value) => {
    const errors = [];
    try {
      const result = (0, import_jsonc_parser.parse)(value, errors, { allowTrailingComma: true });
      if (errors.length === 0) {
        return JSON.stringify(result, null, 2);
      }
    } catch {
    }
    return void 0;
  };
  const parsed = tryParse(content);
  if (parsed !== void 0) {
    return parsed;
  }
  const openChar = content[0];
  const closeChar = openChar === "{" ? "}" : "]";
  const closingPositions = [];
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === "\\") {
      escapeNext = true;
      continue;
    }
    if (char === '"' && !inString) {
      inString = true;
      continue;
    }
    if (char === '"' && inString) {
      inString = false;
      continue;
    }
    if (inString) continue;
    if (char === openChar) {
      depth++;
    } else if (char === closeChar) {
      depth--;
      if (depth === 0) {
        closingPositions.push(i + 1);
      }
    }
  }
  for (let i = closingPositions.length - 1; i >= 0; i--) {
    const attempt = tryParse(content.slice(0, closingPositions[i]));
    if (attempt !== void 0) {
      return attempt;
    }
  }
  const searchStart = Math.max(0, content.length - 1e3);
  for (let end = content.length - 1; end > searchStart; end--) {
    const attempt = tryParse(content.slice(0, end));
    if (attempt !== void 0) {
      return attempt;
    }
  }
  return text;
}

// src/errors.ts
var import_provider = require("@ai-sdk/provider");
function createAPICallError({
  message,
  code,
  exitCode,
  stderr,
  promptExcerpt,
  isRetryable = false
}) {
  const metadata = {
    code,
    exitCode,
    stderr,
    promptExcerpt
  };
  return new import_provider.APICallError({
    message,
    isRetryable,
    url: "claude-code-cli://command",
    requestBodyValues: promptExcerpt ? { prompt: promptExcerpt } : void 0,
    data: metadata
  });
}
function createAuthenticationError({
  message
}) {
  return new import_provider.LoadAPIKeyError({
    message: message || "Authentication failed. Please ensure Claude Code SDK is properly authenticated."
  });
}
function createTimeoutError({
  message,
  promptExcerpt,
  timeoutMs
}) {
  const metadata = {
    code: "TIMEOUT",
    promptExcerpt
  };
  return new import_provider.APICallError({
    message,
    isRetryable: true,
    url: "claude-code-cli://command",
    requestBodyValues: promptExcerpt ? { prompt: promptExcerpt } : void 0,
    data: timeoutMs !== void 0 ? { ...metadata, timeoutMs } : metadata
  });
}
function isAuthenticationError(error) {
  if (error instanceof import_provider.LoadAPIKeyError) return true;
  if (error instanceof import_provider.APICallError && error.data?.exitCode === 401) return true;
  return false;
}
function isTimeoutError(error) {
  if (error instanceof import_provider.APICallError && error.data?.code === "TIMEOUT") return true;
  return false;
}
function getErrorMetadata(error) {
  if (error instanceof import_provider.APICallError && error.data) {
    return error.data;
  }
  return void 0;
}

// src/map-claude-code-finish-reason.ts
function mapClaudeCodeFinishReason(subtype) {
  switch (subtype) {
    case "success":
      return "stop";
    case "error_max_turns":
      return "length";
    case "error_during_execution":
      return "error";
    default:
      return "stop";
  }
}

// src/validation.ts
var import_zod = require("zod");
var import_fs = require("fs");
var claudeCodeSettingsSchema = import_zod.z.object({
  pathToClaudeCodeExecutable: import_zod.z.string().optional(),
  customSystemPrompt: import_zod.z.string().optional(),
  appendSystemPrompt: import_zod.z.string().optional(),
  maxTurns: import_zod.z.number().int().min(1).max(100).optional(),
  maxThinkingTokens: import_zod.z.number().int().positive().max(1e5).optional(),
  cwd: import_zod.z.string().refine(
    (val) => {
      if (typeof process === "undefined" || !process.versions?.node) {
        return true;
      }
      return !val || (0, import_fs.existsSync)(val);
    },
    { message: "Working directory must exist" }
  ).optional(),
  executable: import_zod.z.enum(["bun", "deno", "node"]).optional(),
  executableArgs: import_zod.z.array(import_zod.z.string()).optional(),
  permissionMode: import_zod.z.enum(["default", "acceptEdits", "bypassPermissions", "plan"]).optional(),
  permissionPromptToolName: import_zod.z.string().optional(),
  continue: import_zod.z.boolean().optional(),
  resume: import_zod.z.string().optional(),
  allowedTools: import_zod.z.array(import_zod.z.string()).optional(),
  disallowedTools: import_zod.z.array(import_zod.z.string()).optional(),
  mcpServers: import_zod.z.record(import_zod.z.string(), import_zod.z.union([
    // McpStdioServerConfig
    import_zod.z.object({
      type: import_zod.z.literal("stdio").optional(),
      command: import_zod.z.string(),
      args: import_zod.z.array(import_zod.z.string()).optional(),
      env: import_zod.z.record(import_zod.z.string()).optional()
    }),
    // McpSSEServerConfig
    import_zod.z.object({
      type: import_zod.z.literal("sse"),
      url: import_zod.z.string(),
      headers: import_zod.z.record(import_zod.z.string()).optional()
    })
  ])).optional(),
  verbose: import_zod.z.boolean().optional(),
  logger: import_zod.z.union([
    import_zod.z.literal(false),
    import_zod.z.object({
      warn: import_zod.z.function().args(import_zod.z.string()).returns(import_zod.z.void()),
      error: import_zod.z.function().args(import_zod.z.string()).returns(import_zod.z.void())
    })
  ]).optional()
}).strict();
function validateModelId(modelId) {
  const knownModels = ["opus", "sonnet"];
  if (!modelId || modelId.trim() === "") {
    throw new Error("Model ID cannot be empty");
  }
  if (!knownModels.includes(modelId)) {
    return `Unknown model ID: '${modelId}'. Proceeding with custom model. Known models are: ${knownModels.join(", ")}`;
  }
  return void 0;
}
function validateSettings(settings) {
  const warnings = [];
  const errors = [];
  try {
    const result = claudeCodeSettingsSchema.safeParse(settings);
    if (!result.success) {
      result.error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors.push(`${path ? `${path}: ` : ""}${err.message}`);
      });
      return { valid: false, warnings, errors };
    }
    const validSettings = result.data;
    if (validSettings.maxTurns && validSettings.maxTurns > 20) {
      warnings.push(`High maxTurns value (${validSettings.maxTurns}) may lead to long-running conversations`);
    }
    if (validSettings.maxThinkingTokens && validSettings.maxThinkingTokens > 5e4) {
      warnings.push(`Very high maxThinkingTokens (${validSettings.maxThinkingTokens}) may increase response time`);
    }
    if (validSettings.allowedTools && validSettings.disallowedTools) {
      warnings.push("Both allowedTools and disallowedTools are specified. Only allowedTools will be used.");
    }
    const validateToolNames = (tools, type) => {
      tools.forEach((tool) => {
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*(\([^)]*\))?$/.test(tool) && !tool.startsWith("mcp__")) {
          warnings.push(`Unusual ${type} tool name format: '${tool}'`);
        }
      });
    };
    if (validSettings.allowedTools) {
      validateToolNames(validSettings.allowedTools, "allowed");
    }
    if (validSettings.disallowedTools) {
      validateToolNames(validSettings.disallowedTools, "disallowed");
    }
    return { valid: true, warnings, errors };
  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    return { valid: false, warnings, errors };
  }
}
function validatePrompt(prompt) {
  const MAX_PROMPT_LENGTH = 1e5;
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return `Very long prompt (${prompt.length} characters) may cause performance issues or timeouts`;
  }
  return void 0;
}
function validateSessionId(sessionId) {
  if (sessionId && !/^[a-zA-Z0-9-_]+$/.test(sessionId)) {
    return `Unusual session ID format. This may cause issues with session resumption.`;
  }
  return void 0;
}

// src/logger.ts
var defaultLogger = {
  warn: (message) => console.warn(message),
  error: (message) => console.error(message)
};
var noopLogger = {
  warn: () => {
  },
  error: () => {
  }
};
function getLogger(logger) {
  if (logger === false) {
    return noopLogger;
  }
  if (logger === void 0) {
    return defaultLogger;
  }
  return logger;
}

// src/claude-code-language-model.ts
var import_claude_code = require("@anthropic-ai/claude-code");
var modelMap = {
  "opus": "opus",
  "sonnet": "sonnet"
};
var ClaudeCodeLanguageModel = class {
  specificationVersion = "v2";
  defaultObjectGenerationMode = "json";
  supportsImageUrls = false;
  supportedUrls = {};
  supportsStructuredOutputs = false;
  modelId;
  settings;
  sessionId;
  modelValidationWarning;
  settingsValidationWarnings;
  logger;
  constructor(options) {
    this.modelId = options.id;
    this.settings = options.settings ?? {};
    this.settingsValidationWarnings = options.settingsValidationWarnings ?? [];
    this.logger = getLogger(this.settings.logger);
    if (!this.modelId || typeof this.modelId !== "string" || this.modelId.trim() === "") {
      throw new import_provider2.NoSuchModelError({
        modelId: this.modelId,
        modelType: "languageModel"
      });
    }
    this.modelValidationWarning = validateModelId(this.modelId);
    if (this.modelValidationWarning) {
      this.logger.warn(`Claude Code Model: ${this.modelValidationWarning}`);
    }
  }
  get provider() {
    return "claude-code";
  }
  getModel() {
    const mapped = modelMap[this.modelId];
    return mapped ?? this.modelId;
  }
  generateAllWarnings(options, prompt) {
    const warnings = [];
    const unsupportedParams = [];
    if (options.temperature !== void 0) unsupportedParams.push("temperature");
    if (options.topP !== void 0) unsupportedParams.push("topP");
    if (options.topK !== void 0) unsupportedParams.push("topK");
    if (options.presencePenalty !== void 0) unsupportedParams.push("presencePenalty");
    if (options.frequencyPenalty !== void 0) unsupportedParams.push("frequencyPenalty");
    if (options.stopSequences !== void 0 && options.stopSequences.length > 0) unsupportedParams.push("stopSequences");
    if (options.seed !== void 0) unsupportedParams.push("seed");
    if (unsupportedParams.length > 0) {
      for (const param of unsupportedParams) {
        warnings.push({
          type: "unsupported-setting",
          setting: param,
          details: `Claude Code SDK does not support the ${param} parameter. It will be ignored.`
        });
      }
    }
    if (this.modelValidationWarning) {
      warnings.push({
        type: "other",
        message: this.modelValidationWarning
      });
    }
    this.settingsValidationWarnings.forEach((warning) => {
      warnings.push({
        type: "other",
        message: warning
      });
    });
    const promptWarning = validatePrompt(prompt);
    if (promptWarning) {
      warnings.push({
        type: "other",
        message: promptWarning
      });
    }
    return warnings;
  }
  createQueryOptions(abortController) {
    return {
      model: this.getModel(),
      abortController,
      resume: this.settings.resume ?? this.sessionId,
      pathToClaudeCodeExecutable: this.settings.pathToClaudeCodeExecutable,
      customSystemPrompt: this.settings.customSystemPrompt,
      appendSystemPrompt: this.settings.appendSystemPrompt,
      maxTurns: this.settings.maxTurns,
      maxThinkingTokens: this.settings.maxThinkingTokens,
      cwd: this.settings.cwd,
      executable: this.settings.executable,
      executableArgs: this.settings.executableArgs,
      permissionMode: this.settings.permissionMode,
      permissionPromptToolName: this.settings.permissionPromptToolName,
      continue: this.settings.continue,
      allowedTools: this.settings.allowedTools,
      disallowedTools: this.settings.disallowedTools,
      mcpServers: this.settings.mcpServers
    };
  }
  handleClaudeCodeError(error, messagesPrompt) {
    if (error instanceof import_claude_code.AbortError) {
      throw error;
    }
    const isErrorWithMessage = (err) => {
      return typeof err === "object" && err !== null && "message" in err;
    };
    const isErrorWithCode = (err) => {
      return typeof err === "object" && err !== null;
    };
    const authErrorPatterns = [
      "not logged in",
      "authentication",
      "unauthorized",
      "auth failed",
      "please login",
      "claude login"
    ];
    const errorMessage = isErrorWithMessage(error) && error.message ? error.message.toLowerCase() : "";
    const exitCode = isErrorWithCode(error) && typeof error.exitCode === "number" ? error.exitCode : void 0;
    const isAuthError = authErrorPatterns.some((pattern) => errorMessage.includes(pattern)) || exitCode === 401;
    if (isAuthError) {
      return createAuthenticationError({
        message: isErrorWithMessage(error) && error.message ? error.message : "Authentication failed. Please ensure Claude Code SDK is properly authenticated."
      });
    }
    const errorCode = isErrorWithCode(error) && typeof error.code === "string" ? error.code : "";
    if (errorCode === "ETIMEDOUT" || errorMessage.includes("timeout")) {
      return createTimeoutError({
        message: isErrorWithMessage(error) && error.message ? error.message : "Request timed out",
        promptExcerpt: messagesPrompt.substring(0, 200)
        // Don't specify timeoutMs since we don't know the actual timeout value
        // It's controlled by the consumer via AbortSignal
      });
    }
    const isRetryable = errorCode === "ENOENT" || errorCode === "ECONNREFUSED" || errorCode === "ETIMEDOUT" || errorCode === "ECONNRESET";
    return createAPICallError({
      message: isErrorWithMessage(error) && error.message ? error.message : "Claude Code SDK error",
      code: errorCode || void 0,
      exitCode,
      stderr: isErrorWithCode(error) && typeof error.stderr === "string" ? error.stderr : void 0,
      promptExcerpt: messagesPrompt.substring(0, 200),
      isRetryable
    });
  }
  setSessionId(sessionId) {
    this.sessionId = sessionId;
    const warning = validateSessionId(sessionId);
    if (warning) {
      this.logger.warn(`Claude Code Session: ${warning}`);
    }
  }
  validateJsonExtraction(originalText, extractedJson) {
    if (extractedJson === originalText) {
      return {
        valid: false,
        warning: {
          type: "other",
          message: "JSON extraction from model response may be incomplete or modified. The model may not have returned valid JSON."
        }
      };
    }
    try {
      JSON.parse(extractedJson);
      return { valid: true };
    } catch {
      return {
        valid: false,
        warning: {
          type: "other",
          message: "JSON extraction resulted in invalid JSON. The response may be malformed."
        }
      };
    }
  }
  async doGenerate(options) {
    const mode = options.responseFormat?.type === "json" ? { type: "object-json" } : { type: "regular" };
    const { messagesPrompt, warnings: messageWarnings } = convertToClaudeCodeMessages(
      options.prompt,
      mode,
      options.responseFormat?.type === "json" ? options.responseFormat.schema : void 0
    );
    const abortController = new AbortController();
    let abortListener;
    if (options.abortSignal) {
      abortListener = () => abortController.abort();
      options.abortSignal.addEventListener("abort", abortListener, { once: true });
    }
    const queryOptions = this.createQueryOptions(abortController);
    let text = "";
    let usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    let finishReason = "stop";
    let costUsd;
    let durationMs;
    let rawUsage;
    const warnings = this.generateAllWarnings(options, messagesPrompt);
    if (messageWarnings) {
      messageWarnings.forEach((warning) => {
        warnings.push({
          type: "other",
          message: warning
        });
      });
    }
    try {
      const response = (0, import_claude_code.query)({
        prompt: messagesPrompt,
        options: queryOptions
      });
      for await (const message of response) {
        if (message.type === "assistant") {
          text += message.message.content.map(
            (c) => c.type === "text" ? c.text : ""
          ).join("");
        } else if (message.type === "result") {
          this.setSessionId(message.session_id);
          costUsd = message.total_cost_usd;
          durationMs = message.duration_ms;
          if ("usage" in message) {
            rawUsage = message.usage;
            usage = {
              inputTokens: (message.usage.cache_creation_input_tokens ?? 0) + (message.usage.cache_read_input_tokens ?? 0) + (message.usage.input_tokens ?? 0),
              outputTokens: message.usage.output_tokens ?? 0,
              totalTokens: (message.usage.cache_creation_input_tokens ?? 0) + (message.usage.cache_read_input_tokens ?? 0) + (message.usage.input_tokens ?? 0) + (message.usage.output_tokens ?? 0)
            };
          }
          finishReason = mapClaudeCodeFinishReason(message.subtype);
        } else if (message.type === "system" && message.subtype === "init") {
          this.setSessionId(message.session_id);
        }
      }
    } catch (error) {
      if (error instanceof import_claude_code.AbortError) {
        throw options.abortSignal?.aborted ? options.abortSignal.reason : error;
      }
      throw this.handleClaudeCodeError(error, messagesPrompt);
    } finally {
      if (options.abortSignal && abortListener) {
        options.abortSignal.removeEventListener("abort", abortListener);
      }
    }
    if (options.responseFormat?.type === "json" && text) {
      const extracted = extractJson(text);
      const validation = this.validateJsonExtraction(text, extracted);
      if (!validation.valid && validation.warning) {
        warnings.push(validation.warning);
      }
      text = extracted;
    }
    return {
      content: [{ type: "text", text }],
      usage,
      finishReason,
      warnings,
      response: {
        id: (0, import_provider_utils.generateId)(),
        timestamp: /* @__PURE__ */ new Date(),
        modelId: this.modelId
      },
      request: {
        body: messagesPrompt
      },
      providerMetadata: {
        "claude-code": {
          ...this.sessionId !== void 0 && { sessionId: this.sessionId },
          ...costUsd !== void 0 && { costUsd },
          ...durationMs !== void 0 && { durationMs },
          ...rawUsage !== void 0 && { rawUsage }
        }
      }
    };
  }
  async doStream(options) {
    const mode = options.responseFormat?.type === "json" ? { type: "object-json" } : { type: "regular" };
    const { messagesPrompt, warnings: messageWarnings } = convertToClaudeCodeMessages(
      options.prompt,
      mode,
      options.responseFormat?.type === "json" ? options.responseFormat.schema : void 0
    );
    const abortController = new AbortController();
    let abortListener;
    if (options.abortSignal) {
      abortListener = () => abortController.abort();
      options.abortSignal.addEventListener("abort", abortListener, { once: true });
    }
    const queryOptions = this.createQueryOptions(abortController);
    const warnings = this.generateAllWarnings(options, messagesPrompt);
    if (messageWarnings) {
      messageWarnings.forEach((warning) => {
        warnings.push({
          type: "other",
          message: warning
        });
      });
    }
    const stream = new ReadableStream({
      start: async (controller) => {
        try {
          controller.enqueue({ type: "stream-start", warnings });
          const response = (0, import_claude_code.query)({
            prompt: messagesPrompt,
            options: queryOptions
          });
          let usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
          let accumulatedText = "";
          let textPartId;
          for await (const message of response) {
            if (message.type === "assistant") {
              const text = message.message.content.map((c) => c.type === "text" ? c.text : "").join("");
              if (text) {
                accumulatedText += text;
                if (options.responseFormat?.type !== "json") {
                  if (!textPartId) {
                    textPartId = (0, import_provider_utils.generateId)();
                    controller.enqueue({
                      type: "text-start",
                      id: textPartId
                    });
                  }
                  controller.enqueue({
                    type: "text-delta",
                    id: textPartId,
                    delta: text
                  });
                }
              }
            } else if (message.type === "result") {
              let rawUsage;
              if ("usage" in message) {
                rawUsage = message.usage;
                usage = {
                  inputTokens: (message.usage.cache_creation_input_tokens ?? 0) + (message.usage.cache_read_input_tokens ?? 0) + (message.usage.input_tokens ?? 0),
                  outputTokens: message.usage.output_tokens ?? 0,
                  totalTokens: (message.usage.cache_creation_input_tokens ?? 0) + (message.usage.cache_read_input_tokens ?? 0) + (message.usage.input_tokens ?? 0) + (message.usage.output_tokens ?? 0)
                };
              }
              const finishReason = mapClaudeCodeFinishReason(message.subtype);
              this.setSessionId(message.session_id);
              if (options.responseFormat?.type === "json" && accumulatedText) {
                const extractedJson = extractJson(accumulatedText);
                this.validateJsonExtraction(accumulatedText, extractedJson);
                const jsonTextId = (0, import_provider_utils.generateId)();
                controller.enqueue({
                  type: "text-start",
                  id: jsonTextId
                });
                controller.enqueue({
                  type: "text-delta",
                  id: jsonTextId,
                  delta: extractedJson
                });
                controller.enqueue({
                  type: "text-end",
                  id: jsonTextId
                });
              } else if (textPartId) {
                controller.enqueue({
                  type: "text-end",
                  id: textPartId
                });
              }
              controller.enqueue({
                type: "finish",
                finishReason,
                usage,
                providerMetadata: {
                  "claude-code": {
                    sessionId: message.session_id,
                    ...message.total_cost_usd !== void 0 && { costUsd: message.total_cost_usd },
                    ...message.duration_ms !== void 0 && { durationMs: message.duration_ms },
                    ...rawUsage !== void 0 && { rawUsage }
                  }
                }
              });
            } else if (message.type === "system" && message.subtype === "init") {
              this.setSessionId(message.session_id);
              controller.enqueue({
                type: "response-metadata",
                id: message.session_id,
                timestamp: /* @__PURE__ */ new Date(),
                modelId: this.modelId
              });
            }
          }
          controller.close();
        } catch (error) {
          let errorToEmit;
          if (error instanceof import_claude_code.AbortError) {
            errorToEmit = options.abortSignal?.aborted ? options.abortSignal.reason : error;
          } else {
            errorToEmit = this.handleClaudeCodeError(error, messagesPrompt);
          }
          controller.enqueue({
            type: "error",
            error: errorToEmit
          });
          controller.close();
        } finally {
          if (options.abortSignal && abortListener) {
            options.abortSignal.removeEventListener("abort", abortListener);
          }
        }
      },
      cancel: () => {
        if (options.abortSignal && abortListener) {
          options.abortSignal.removeEventListener("abort", abortListener);
        }
      }
    });
    return {
      stream,
      request: {
        body: messagesPrompt
      }
    };
  }
};

// src/claude-code-provider.ts
function createClaudeCode(options = {}) {
  const logger = getLogger(options.defaultSettings?.logger);
  if (options.defaultSettings) {
    const validation = validateSettings(options.defaultSettings);
    if (!validation.valid) {
      throw new Error(`Invalid default settings: ${validation.errors.join(", ")}`);
    }
    if (validation.warnings.length > 0) {
      validation.warnings.forEach((warning) => logger.warn(`Claude Code Provider: ${warning}`));
    }
  }
  const createModel = (modelId, settings = {}) => {
    const mergedSettings = {
      ...options.defaultSettings,
      ...settings
    };
    const validation = validateSettings(mergedSettings);
    if (!validation.valid) {
      throw new Error(`Invalid settings: ${validation.errors.join(", ")}`);
    }
    return new ClaudeCodeLanguageModel({
      id: modelId,
      settings: mergedSettings,
      settingsValidationWarnings: validation.warnings
    });
  };
  const provider = function(modelId, settings) {
    if (new.target) {
      throw new Error(
        "The Claude Code model function cannot be called with the new keyword."
      );
    }
    return createModel(modelId, settings);
  };
  provider.languageModel = createModel;
  provider.chat = createModel;
  provider.textEmbeddingModel = (modelId) => {
    throw new import_provider3.NoSuchModelError({
      modelId,
      modelType: "textEmbeddingModel"
    });
  };
  provider.imageModel = (modelId) => {
    throw new import_provider3.NoSuchModelError({
      modelId,
      modelType: "imageModel"
    });
  };
  return provider;
}
var claudeCode = createClaudeCode();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ClaudeCodeLanguageModel,
  claudeCode,
  createAPICallError,
  createAuthenticationError,
  createClaudeCode,
  createTimeoutError,
  getErrorMetadata,
  isAuthenticationError,
  isTimeoutError
});
//# sourceMappingURL=index.cjs.map