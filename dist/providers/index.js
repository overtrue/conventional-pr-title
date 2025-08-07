import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createAzure } from '@ai-sdk/azure';
import { createClaudeCode } from 'ai-sdk-provider-claude-code';
import { createCohere } from '@ai-sdk/cohere';
import { createVertex } from '@ai-sdk/google-vertex';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { createXai } from '@ai-sdk/xai';

/**
 * Amazon Bedrock Provider implementation
 */
class AmazonBedrockProvider {
    constructor() {
        this.name = 'amazon-bedrock';
        this.defaultModel = 'anthropic.claude-3-haiku-20240307-v1:0';
        this.description = 'Amazon Bedrock models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.AMAZON_BEDROCK_API_KEY) {
                config.apiKey = options.apiKey || process.env.AMAZON_BEDROCK_API_KEY;
            }
            if (options.baseURL || process.env.AMAZON_BEDROCK_BASE_URL) {
                config.baseURL = options.baseURL || process.env.AMAZON_BEDROCK_BASE_URL;
            }
            if (options.region || process.env.AWS_REGION) {
                config.region = options.region || process.env.AWS_REGION;
            }
            if (options.accessKeyId || process.env.AWS_ACCESS_KEY_ID) {
                config.accessKeyId = options.accessKeyId || process.env.AWS_ACCESS_KEY_ID;
            }
            if (options.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY) {
                config.secretAccessKey = options.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const bedrockProvider = createAmazonBedrock(config);
            return bedrockProvider(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create Amazon Bedrock model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'AMAZON_BEDROCK_API_KEY',
            baseURL: 'AMAZON_BEDROCK_BASE_URL'
        };
    }
}

/**
 * Anthropic Provider implementation
 */
class AnthropicProvider {
    constructor() {
        this.name = 'anthropic';
        this.defaultModel = 'claude-3-5-haiku-20241022';
        this.description = 'Anthropic Claude models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.ANTHROPIC_API_KEY) {
                config.apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
            }
            if (options.baseURL || process.env.ANTHROPIC_BASE_URL) {
                config.baseURL = options.baseURL || process.env.ANTHROPIC_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const anthropic = createAnthropic(config);
            return anthropic(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create Anthropic model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'ANTHROPIC_API_KEY',
            baseURL: 'ANTHROPIC_BASE_URL'
        };
    }
}

/**
 * Azure OpenAI Provider implementation
 */
class AzureProvider {
    constructor() {
        this.name = 'azure';
        this.defaultModel = 'gpt-4o-mini';
        this.description = 'Azure OpenAI models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.AZURE_OPENAI_API_KEY) {
                config.apiKey = options.apiKey || process.env.AZURE_OPENAI_API_KEY;
            }
            if (options.baseURL || process.env.AZURE_OPENAI_ENDPOINT) {
                config.baseURL = options.baseURL || process.env.AZURE_OPENAI_ENDPOINT;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const azure = createAzure(config);
            return azure(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create Azure model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'AZURE_OPENAI_API_KEY',
            baseURL: 'AZURE_OPENAI_ENDPOINT'
        };
    }
}

// src/errors/ai-sdk-error.ts
var marker$1 = "vercel.ai.error";
var symbol$1 = Symbol.for(marker$1);
var _a$1;
var _AISDKError$1 = class _AISDKError extends Error {
  /**
   * Creates an AI SDK Error.
   *
   * @param {Object} params - The parameters for creating the error.
   * @param {string} params.name - The name of the error.
   * @param {string} params.message - The error message.
   * @param {unknown} [params.cause] - The underlying cause of the error.
   */
  constructor({
    name: name14,
    message,
    cause
  }) {
    super(message);
    this[_a$1] = true;
    this.name = name14;
    this.cause = cause;
  }
  /**
   * Checks if the given error is an AI SDK Error.
   * @param {unknown} error - The error to check.
   * @returns {boolean} True if the error is an AI SDK Error, false otherwise.
   */
  static isInstance(error) {
    return _AISDKError.hasMarker(error, marker$1);
  }
  static hasMarker(error, marker15) {
    const markerSymbol = Symbol.for(marker15);
    return error != null && typeof error === "object" && markerSymbol in error && typeof error[markerSymbol] === "boolean" && error[markerSymbol] === true;
  }
};
_a$1 = symbol$1;
var AISDKError$1 = _AISDKError$1;

// src/errors/api-call-error.ts
var name$1 = "AI_APICallError";
var marker2$1 = `vercel.ai.error.${name$1}`;
var symbol2$1 = Symbol.for(marker2$1);
var _a2$1;
var APICallError$1 = class APICallError extends AISDKError$1 {
  constructor({
    message,
    url,
    requestBodyValues,
    statusCode,
    responseHeaders,
    responseBody,
    cause,
    isRetryable = statusCode != null && (statusCode === 408 || // request timeout
    statusCode === 409 || // conflict
    statusCode === 429 || // too many requests
    statusCode >= 500),
    // server error
    data
  }) {
    super({ name: name$1, message, cause });
    this[_a2$1] = true;
    this.url = url;
    this.requestBodyValues = requestBodyValues;
    this.statusCode = statusCode;
    this.responseHeaders = responseHeaders;
    this.responseBody = responseBody;
    this.isRetryable = isRetryable;
    this.data = data;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker2$1);
  }
};
_a2$1 = symbol2$1;

// src/errors/empty-response-body-error.ts
var name2$1 = "AI_EmptyResponseBodyError";
var marker3$1 = `vercel.ai.error.${name2$1}`;
var symbol3$1 = Symbol.for(marker3$1);
var _a3$1;
var EmptyResponseBodyError$1 = class EmptyResponseBodyError extends AISDKError$1 {
  // used in isInstance
  constructor({ message = "Empty response body" } = {}) {
    super({ name: name2$1, message });
    this[_a3$1] = true;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker3$1);
  }
};
_a3$1 = symbol3$1;

// src/errors/get-error-message.ts
function getErrorMessage$1(error) {
  if (error == null) {
    return "unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

// src/errors/invalid-argument-error.ts
var name3$1 = "AI_InvalidArgumentError";
var marker4$1 = `vercel.ai.error.${name3$1}`;
var symbol4$1 = Symbol.for(marker4$1);
var _a4$1;
var InvalidArgumentError$1 = class InvalidArgumentError extends AISDKError$1 {
  constructor({
    message,
    cause,
    argument
  }) {
    super({ name: name3$1, message, cause });
    this[_a4$1] = true;
    this.argument = argument;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker4$1);
  }
};
_a4$1 = symbol4$1;

// src/errors/invalid-prompt-error.ts
var name4$1 = "AI_InvalidPromptError";
var marker5$1 = `vercel.ai.error.${name4$1}`;
var symbol5$1 = Symbol.for(marker5$1);
var _a5$1;
var InvalidPromptError$1 = class InvalidPromptError extends AISDKError$1 {
  constructor({
    prompt,
    message,
    cause
  }) {
    super({ name: name4$1, message: `Invalid prompt: ${message}`, cause });
    this[_a5$1] = true;
    this.prompt = prompt;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker5$1);
  }
};
_a5$1 = symbol5$1;

// src/errors/invalid-response-data-error.ts
var name5$1 = "AI_InvalidResponseDataError";
var marker6$1 = `vercel.ai.error.${name5$1}`;
var symbol6$1 = Symbol.for(marker6$1);
var _a6$1;
var InvalidResponseDataError$1 = class InvalidResponseDataError extends AISDKError$1 {
  constructor({
    data,
    message = `Invalid response data: ${JSON.stringify(data)}.`
  }) {
    super({ name: name5$1, message });
    this[_a6$1] = true;
    this.data = data;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker6$1);
  }
};
_a6$1 = symbol6$1;

// src/errors/json-parse-error.ts
var name6$1 = "AI_JSONParseError";
var marker7$1 = `vercel.ai.error.${name6$1}`;
var symbol7$1 = Symbol.for(marker7$1);
var _a7$1;
var JSONParseError$1 = class JSONParseError extends AISDKError$1 {
  constructor({ text, cause }) {
    super({
      name: name6$1,
      message: `JSON parsing failed: Text: ${text}.
Error message: ${getErrorMessage$1(cause)}`,
      cause
    });
    this[_a7$1] = true;
    this.text = text;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker7$1);
  }
};
_a7$1 = symbol7$1;

// src/errors/load-api-key-error.ts
var name7$1 = "AI_LoadAPIKeyError";
var marker8$1 = `vercel.ai.error.${name7$1}`;
var symbol8$1 = Symbol.for(marker8$1);
var _a8$1;
var LoadAPIKeyError$1 = class LoadAPIKeyError extends AISDKError$1 {
  // used in isInstance
  constructor({ message }) {
    super({ name: name7$1, message });
    this[_a8$1] = true;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker8$1);
  }
};
_a8$1 = symbol8$1;

// src/errors/no-such-model-error.ts
var name10 = "AI_NoSuchModelError";
var marker11 = `vercel.ai.error.${name10}`;
var symbol11 = Symbol.for(marker11);
var _a11;
var NoSuchModelError = class extends AISDKError$1 {
  constructor({
    errorName = name10,
    modelId,
    modelType,
    message = `No such ${modelType}: ${modelId}`
  }) {
    super({ name: errorName, message });
    this[_a11] = true;
    this.modelId = modelId;
    this.modelType = modelType;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker11);
  }
};
_a11 = symbol11;

// src/errors/too-many-embedding-values-for-call-error.ts
var name11 = "AI_TooManyEmbeddingValuesForCallError";
var marker12 = `vercel.ai.error.${name11}`;
var symbol12 = Symbol.for(marker12);
var _a12;
var TooManyEmbeddingValuesForCallError = class extends AISDKError$1 {
  constructor(options) {
    super({
      name: name11,
      message: `Too many values for a single embedding call. The ${options.provider} model "${options.modelId}" can only embed up to ${options.maxEmbeddingsPerCall} values per call, but ${options.values.length} values were provided.`
    });
    this[_a12] = true;
    this.provider = options.provider;
    this.modelId = options.modelId;
    this.maxEmbeddingsPerCall = options.maxEmbeddingsPerCall;
    this.values = options.values;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker12);
  }
};
_a12 = symbol12;

// src/errors/type-validation-error.ts
var name12$1 = "AI_TypeValidationError";
var marker13$1 = `vercel.ai.error.${name12$1}`;
var symbol13$1 = Symbol.for(marker13$1);
var _a13$1;
var _TypeValidationError$1 = class _TypeValidationError extends AISDKError$1 {
  constructor({ value, cause }) {
    super({
      name: name12$1,
      message: `Type validation failed: Value: ${JSON.stringify(value)}.
Error message: ${getErrorMessage$1(cause)}`,
      cause
    });
    this[_a13$1] = true;
    this.value = value;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker13$1);
  }
  /**
   * Wraps an error into a TypeValidationError.
   * If the cause is already a TypeValidationError with the same value, it returns the cause.
   * Otherwise, it creates a new TypeValidationError.
   *
   * @param {Object} params - The parameters for wrapping the error.
   * @param {unknown} params.value - The value that failed validation.
   * @param {unknown} params.cause - The original error or cause of the validation failure.
   * @returns {TypeValidationError} A TypeValidationError instance.
   */
  static wrap({
    value,
    cause
  }) {
    return _TypeValidationError.isInstance(cause) && cause.value === value ? cause : new _TypeValidationError({ value, cause });
  }
};
_a13$1 = symbol13$1;
var TypeValidationError$1 = _TypeValidationError$1;

// src/errors/unsupported-functionality-error.ts
var name13$1 = "AI_UnsupportedFunctionalityError";
var marker14$1 = `vercel.ai.error.${name13$1}`;
var symbol14$1 = Symbol.for(marker14$1);
var _a14$1;
var UnsupportedFunctionalityError$1 = class UnsupportedFunctionalityError extends AISDKError$1 {
  constructor({
    functionality,
    message = `'${functionality}' functionality not supported.`
  }) {
    super({ name: name13$1, message });
    this[_a14$1] = true;
    this.functionality = functionality;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker14$1);
  }
};
_a14$1 = symbol14$1;

let ParseError$1 = class ParseError extends Error {
  constructor(message, options) {
    super(message), this.name = "ParseError", this.type = options.type, this.field = options.field, this.value = options.value, this.line = options.line;
  }
};
function noop$1(_arg) {
}
function createParser$1(callbacks) {
  if (typeof callbacks == "function")
    throw new TypeError(
      "`callbacks` must be an object, got a function instead. Did you mean `{onEvent: fn}`?"
    );
  const { onEvent = noop$1, onError = noop$1, onRetry = noop$1, onComment } = callbacks;
  let incompleteLine = "", isFirstChunk = true, id, data = "", eventType = "";
  function feed(newChunk) {
    const chunk = isFirstChunk ? newChunk.replace(/^\xEF\xBB\xBF/, "") : newChunk, [complete, incomplete] = splitLines$1(`${incompleteLine}${chunk}`);
    for (const line of complete)
      parseLine(line);
    incompleteLine = incomplete, isFirstChunk = false;
  }
  function parseLine(line) {
    if (line === "") {
      dispatchEvent();
      return;
    }
    if (line.startsWith(":")) {
      onComment && onComment(line.slice(line.startsWith(": ") ? 2 : 1));
      return;
    }
    const fieldSeparatorIndex = line.indexOf(":");
    if (fieldSeparatorIndex !== -1) {
      const field = line.slice(0, fieldSeparatorIndex), offset = line[fieldSeparatorIndex + 1] === " " ? 2 : 1, value = line.slice(fieldSeparatorIndex + offset);
      processField(field, value, line);
      return;
    }
    processField(line, "", line);
  }
  function processField(field, value, line) {
    switch (field) {
      case "event":
        eventType = value;
        break;
      case "data":
        data = `${data}${value}
`;
        break;
      case "id":
        id = value.includes("\0") ? void 0 : value;
        break;
      case "retry":
        /^\d+$/.test(value) ? onRetry(parseInt(value, 10)) : onError(
          new ParseError$1(`Invalid \`retry\` value: "${value}"`, {
            type: "invalid-retry",
            value,
            line
          })
        );
        break;
      default:
        onError(
          new ParseError$1(
            `Unknown field "${field.length > 20 ? `${field.slice(0, 20)}\u2026` : field}"`,
            { type: "unknown-field", field, value, line }
          )
        );
        break;
    }
  }
  function dispatchEvent() {
    data.length > 0 && onEvent({
      id,
      event: eventType || void 0,
      // If the data buffer's last character is a U+000A LINE FEED (LF) character,
      // then remove the last character from the data buffer.
      data: data.endsWith(`
`) ? data.slice(0, -1) : data
    }), id = void 0, data = "", eventType = "";
  }
  function reset(options = {}) {
    incompleteLine && options.consume && parseLine(incompleteLine), isFirstChunk = true, id = void 0, data = "", eventType = "", incompleteLine = "";
  }
  return { feed, reset };
}
function splitLines$1(chunk) {
  const lines = [];
  let incompleteLine = "", searchIndex = 0;
  for (; searchIndex < chunk.length; ) {
    const crIndex = chunk.indexOf("\r", searchIndex), lfIndex = chunk.indexOf(`
`, searchIndex);
    let lineEnd = -1;
    if (crIndex !== -1 && lfIndex !== -1 ? lineEnd = Math.min(crIndex, lfIndex) : crIndex !== -1 ? lineEnd = crIndex : lfIndex !== -1 && (lineEnd = lfIndex), lineEnd === -1) {
      incompleteLine = chunk.slice(searchIndex);
      break;
    } else {
      const line = chunk.slice(searchIndex, lineEnd);
      lines.push(line), searchIndex = lineEnd + 1, chunk[searchIndex - 1] === "\r" && chunk[searchIndex] === `
` && searchIndex++;
    }
  }
  return [lines, incompleteLine];
}

let EventSourceParserStream$1 = class EventSourceParserStream extends TransformStream {
  constructor({ onError, onRetry, onComment } = {}) {
    let parser;
    super({
      start(controller) {
        parser = createParser$1({
          onEvent: (event) => {
            controller.enqueue(event);
          },
          onError(error) {
            onError === "terminate" ? controller.error(error) : typeof onError == "function" && onError(error);
          },
          onRetry,
          onComment
        });
      },
      transform(chunk) {
        parser.feed(chunk);
      }
    });
  }
};

/** A special constant with type `never` */
function $constructor(name, initializer, params) {
    function init(inst, def) {
        var _a;
        Object.defineProperty(inst, "_zod", {
            value: inst._zod ?? {},
            enumerable: false,
        });
        (_a = inst._zod).traits ?? (_a.traits = new Set());
        inst._zod.traits.add(name);
        initializer(inst, def);
        // support prototype modifications
        for (const k in _.prototype) {
            if (!(k in inst))
                Object.defineProperty(inst, k, { value: _.prototype[k].bind(inst) });
        }
        inst._zod.constr = _;
        inst._zod.def = def;
    }
    // doesn't work if Parent has a constructor with arguments
    const Parent = params?.Parent ?? Object;
    class Definition extends Parent {
    }
    Object.defineProperty(Definition, "name", { value: name });
    function _(def) {
        var _a;
        const inst = params?.Parent ? new Definition() : this;
        init(inst, def);
        (_a = inst._zod).deferred ?? (_a.deferred = []);
        for (const fn of inst._zod.deferred) {
            fn();
        }
        return inst;
    }
    Object.defineProperty(_, "init", { value: init });
    Object.defineProperty(_, Symbol.hasInstance, {
        value: (inst) => {
            if (params?.Parent && inst instanceof params.Parent)
                return true;
            return inst?._zod?.traits?.has(name);
        },
    });
    Object.defineProperty(_, "name", { value: name });
    return _;
}
class $ZodAsyncError extends Error {
    constructor() {
        super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
    }
}
const globalConfig = {};
function config(newConfig) {
    return globalConfig;
}

// functions
function getEnumValues(entries) {
    const numericValues = Object.values(entries).filter((v) => typeof v === "number");
    const values = Object.entries(entries)
        .filter(([k, _]) => numericValues.indexOf(+k) === -1)
        .map(([_, v]) => v);
    return values;
}
function jsonStringifyReplacer(_, value) {
    if (typeof value === "bigint")
        return value.toString();
    return value;
}
function cached(getter) {
    return {
        get value() {
            {
                const value = getter();
                Object.defineProperty(this, "value", { value });
                return value;
            }
        },
    };
}
function nullish(input) {
    return input === null || input === undefined;
}
function cleanRegex(source) {
    const start = source.startsWith("^") ? 1 : 0;
    const end = source.endsWith("$") ? source.length - 1 : source.length;
    return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
    const valDecCount = (val.toString().split(".")[1] || "").length;
    const stepDecCount = (step.toString().split(".")[1] || "").length;
    const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
    const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
    const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
    return (valInt % stepInt) / 10 ** decCount;
}
function defineLazy(object, key, getter) {
    Object.defineProperty(object, key, {
        get() {
            {
                const value = getter();
                object[key] = value;
                return value;
            }
        },
        set(v) {
            Object.defineProperty(object, key, {
                value: v,
                // configurable: true,
            });
            // object[key] = v;
        },
        configurable: true,
    });
}
function assignProp(target, prop, value) {
    Object.defineProperty(target, prop, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
    });
}
function esc(str) {
    return JSON.stringify(str);
}
const captureStackTrace = Error.captureStackTrace
    ? Error.captureStackTrace
    : (..._args) => { };
function isObject(data) {
    return typeof data === "object" && data !== null && !Array.isArray(data);
}
const allowsEval = cached(() => {
    if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
        return false;
    }
    try {
        const F = Function;
        new F("");
        return true;
    }
    catch (_) {
        return false;
    }
});
function isPlainObject(o) {
    if (isObject(o) === false)
        return false;
    // modified constructor
    const ctor = o.constructor;
    if (ctor === undefined)
        return true;
    // modified prototype
    const prot = ctor.prototype;
    if (isObject(prot) === false)
        return false;
    // ctor doesn't have static `isPrototypeOf`
    if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
        return false;
    }
    return true;
}
const propertyKeyTypes = new Set(["string", "number", "symbol"]);
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
// zod-specific utils
function clone(inst, def, params) {
    const cl = new inst._zod.constr(def ?? inst._zod.def);
    if (!def || params?.parent)
        cl._zod.parent = inst;
    return cl;
}
function normalizeParams(_params) {
    const params = _params;
    if (!params)
        return {};
    if (typeof params === "string")
        return { error: () => params };
    if (params?.message !== undefined) {
        if (params?.error !== undefined)
            throw new Error("Cannot specify both `message` and `error` params");
        params.error = params.message;
    }
    delete params.message;
    if (typeof params.error === "string")
        return { ...params, error: () => params.error };
    return params;
}
function optionalKeys(shape) {
    return Object.keys(shape).filter((k) => {
        return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
    });
}
const NUMBER_FORMAT_RANGES = {
    safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    int32: [-2147483648, 2147483647],
    uint32: [0, 4294967295],
    float32: [-34028234663852886e22, 3.4028234663852886e38],
    float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
};
function pick(schema, mask) {
    const newShape = {};
    const currDef = schema._zod.def; //.shape;
    for (const key in mask) {
        if (!(key in currDef.shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
            continue;
        // pick key
        newShape[key] = currDef.shape[key];
    }
    return clone(schema, {
        ...schema._zod.def,
        shape: newShape,
        checks: [],
    });
}
function omit(schema, mask) {
    const newShape = { ...schema._zod.def.shape };
    const currDef = schema._zod.def; //.shape;
    for (const key in mask) {
        if (!(key in currDef.shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
        }
        if (!mask[key])
            continue;
        delete newShape[key];
    }
    return clone(schema, {
        ...schema._zod.def,
        shape: newShape,
        checks: [],
    });
}
function extend(schema, shape) {
    if (!isPlainObject(shape)) {
        throw new Error("Invalid input to extend: expected a plain object");
    }
    const def = {
        ...schema._zod.def,
        get shape() {
            const _shape = { ...schema._zod.def.shape, ...shape };
            assignProp(this, "shape", _shape); // self-caching
            return _shape;
        },
        checks: [], // delete existing checks
    };
    return clone(schema, def);
}
function merge(a, b) {
    return clone(a, {
        ...a._zod.def,
        get shape() {
            const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
            assignProp(this, "shape", _shape); // self-caching
            return _shape;
        },
        catchall: b._zod.def.catchall,
        checks: [], // delete existing checks
    });
}
function partial(Class, schema, mask) {
    const oldShape = schema._zod.def.shape;
    const shape = { ...oldShape };
    if (mask) {
        for (const key in mask) {
            if (!(key in oldShape)) {
                throw new Error(`Unrecognized key: "${key}"`);
            }
            if (!mask[key])
                continue;
            // if (oldShape[key]!._zod.optin === "optional") continue;
            shape[key] = Class
                ? new Class({
                    type: "optional",
                    innerType: oldShape[key],
                })
                : oldShape[key];
        }
    }
    else {
        for (const key in oldShape) {
            // if (oldShape[key]!._zod.optin === "optional") continue;
            shape[key] = Class
                ? new Class({
                    type: "optional",
                    innerType: oldShape[key],
                })
                : oldShape[key];
        }
    }
    return clone(schema, {
        ...schema._zod.def,
        shape,
        checks: [],
    });
}
function required(Class, schema, mask) {
    const oldShape = schema._zod.def.shape;
    const shape = { ...oldShape };
    if (mask) {
        for (const key in mask) {
            if (!(key in shape)) {
                throw new Error(`Unrecognized key: "${key}"`);
            }
            if (!mask[key])
                continue;
            // overwrite with non-optional
            shape[key] = new Class({
                type: "nonoptional",
                innerType: oldShape[key],
            });
        }
    }
    else {
        for (const key in oldShape) {
            // overwrite with non-optional
            shape[key] = new Class({
                type: "nonoptional",
                innerType: oldShape[key],
            });
        }
    }
    return clone(schema, {
        ...schema._zod.def,
        shape,
        // optional: [],
        checks: [],
    });
}
function aborted(x, startIndex = 0) {
    for (let i = startIndex; i < x.issues.length; i++) {
        if (x.issues[i]?.continue !== true)
            return true;
    }
    return false;
}
function prefixIssues(path, issues) {
    return issues.map((iss) => {
        var _a;
        (_a = iss).path ?? (_a.path = []);
        iss.path.unshift(path);
        return iss;
    });
}
function unwrapMessage(message) {
    return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config) {
    const full = { ...iss, path: iss.path ?? [] };
    // for backwards compatibility
    if (!iss.message) {
        const message = unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ??
            unwrapMessage(ctx?.error?.(iss)) ??
            unwrapMessage(config.customError?.(iss)) ??
            unwrapMessage(config.localeError?.(iss)) ??
            "Invalid input";
        full.message = message;
    }
    // delete (full as any).def;
    delete full.inst;
    delete full.continue;
    if (!ctx?.reportInput) {
        delete full.input;
    }
    return full;
}
function getLengthableOrigin(input) {
    if (Array.isArray(input))
        return "array";
    if (typeof input === "string")
        return "string";
    return "unknown";
}
function issue(...args) {
    const [iss, input, inst] = args;
    if (typeof iss === "string") {
        return {
            message: iss,
            code: "custom",
            input,
            inst,
        };
    }
    return { ...iss };
}

const initializer$1 = (inst, def) => {
    inst.name = "$ZodError";
    Object.defineProperty(inst, "_zod", {
        value: inst._zod,
        enumerable: false,
    });
    Object.defineProperty(inst, "issues", {
        value: def,
        enumerable: false,
    });
    Object.defineProperty(inst, "message", {
        get() {
            return JSON.stringify(def, jsonStringifyReplacer, 2);
        },
        enumerable: true,
        // configurable: false,
    });
    Object.defineProperty(inst, "toString", {
        value: () => inst.message,
        enumerable: false,
    });
};
const $ZodError = $constructor("$ZodError", initializer$1);
const $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
function flattenError(error, mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of error.issues) {
        if (sub.path.length > 0) {
            fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
            fieldErrors[sub.path[0]].push(mapper(sub));
        }
        else {
            formErrors.push(mapper(sub));
        }
    }
    return { formErrors, fieldErrors };
}
function formatError(error, _mapper) {
    const mapper = _mapper ||
        function (issue) {
            return issue.message;
        };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
        for (const issue of error.issues) {
            if (issue.code === "invalid_union" && issue.errors.length) {
                issue.errors.map((issues) => processError({ issues }));
            }
            else if (issue.code === "invalid_key") {
                processError({ issues: issue.issues });
            }
            else if (issue.code === "invalid_element") {
                processError({ issues: issue.issues });
            }
            else if (issue.path.length === 0) {
                fieldErrors._errors.push(mapper(issue));
            }
            else {
                let curr = fieldErrors;
                let i = 0;
                while (i < issue.path.length) {
                    const el = issue.path[i];
                    const terminal = i === issue.path.length - 1;
                    if (!terminal) {
                        curr[el] = curr[el] || { _errors: [] };
                    }
                    else {
                        curr[el] = curr[el] || { _errors: [] };
                        curr[el]._errors.push(mapper(issue));
                    }
                    curr = curr[el];
                    i++;
                }
            }
        }
    };
    processError(error);
    return fieldErrors;
}

const _parse$2 = (_Err) => (schema, value, _ctx, _params) => {
    const ctx = _ctx ? Object.assign(_ctx, { async: false }) : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
        throw new $ZodAsyncError();
    }
    if (result.issues.length) {
        const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
        captureStackTrace(e, _params?.callee);
        throw e;
    }
    return result.value;
};
const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
    const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise)
        result = await result;
    if (result.issues.length) {
        const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
        captureStackTrace(e, params?.callee);
        throw e;
    }
    return result.value;
};
const _safeParse = (_Err) => (schema, value, _ctx) => {
    const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
        throw new $ZodAsyncError();
    }
    return result.issues.length
        ? {
            success: false,
            error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config()))),
        }
        : { success: true, data: result.value };
};
const safeParse$1 = /* @__PURE__*/ _safeParse($ZodRealError);
const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
    const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise)
        result = await result;
    return result.issues.length
        ? {
            success: false,
            error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config()))),
        }
        : { success: true, data: result.value };
};
const safeParseAsync$1 = /* @__PURE__*/ _safeParseAsync($ZodRealError);

const cuid = /^[cC][^\s-]{8,}$/;
const cuid2 = /^[0-9a-z]+$/;
const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
const xid = /^[0-9a-vA-V]{20}$/;
const ksuid = /^[A-Za-z0-9]{27}$/;
const nanoid = /^[a-zA-Z0-9_-]{21}$/;
/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
/** Returns a regex for validating an RFC 4122 UUID.
 *
 * @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
const uuid = (version) => {
    if (!version)
        return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/;
    return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
/** Practical email validation */
const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
// from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
const _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
function emoji() {
    return new RegExp(_emoji$1, "u");
}
const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/;
const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
// https://stackoverflow.com/questions/7860392/determine-if-string-is-in-base64-using-javascript
const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
const base64url = /^[A-Za-z0-9_-]*$/;
// based on https://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address
// export const hostname: RegExp =
//   /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;
const hostname = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/;
// https://blog.stevenlevithan.com/archives/validate-phone-number#r4-3 (regex sans spaces)
const e164 = /^\+(?:[0-9]){6,14}[0-9]$/;
// const dateSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
const date$1 = /*@__PURE__*/ new RegExp(`^${dateSource}$`);
function timeSource(args) {
    const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
    const regex = typeof args.precision === "number"
        ? args.precision === -1
            ? `${hhmm}`
            : args.precision === 0
                ? `${hhmm}:[0-5]\\d`
                : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}`
        : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
    return regex;
}
function time$1(args) {
    return new RegExp(`^${timeSource(args)}$`);
}
// Adapted from https://stackoverflow.com/a/3143231
function datetime$1(args) {
    const time = timeSource({ precision: args.precision });
    const opts = ["Z"];
    if (args.local)
        opts.push("");
    if (args.offset)
        opts.push(`([+-]\\d{2}:\\d{2})`);
    const timeRegex = `${time}(?:${opts.join("|")})`;
    return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
const string$1 = (params) => {
    const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
    return new RegExp(`^${regex}$`);
};
const integer = /^\d+$/;
const number$1 = /^-?\d+(?:\.\d+)?/i;
const boolean$1 = /true|false/i;
// regex for string with no uppercase letters
const lowercase = /^[^A-Z]*$/;
// regex for string with no lowercase letters
const uppercase = /^[^a-z]*$/;

// import { $ZodType } from "./schemas.js";
const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
    var _a;
    inst._zod ?? (inst._zod = {});
    inst._zod.def = def;
    (_a = inst._zod).onattach ?? (_a.onattach = []);
});
const numericOriginMap = {
    number: "number",
    bigint: "bigint",
    object: "date",
};
const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
    $ZodCheck.init(inst, def);
    const origin = numericOriginMap[typeof def.value];
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
        if (def.value < curr) {
            if (def.inclusive)
                bag.maximum = def.value;
            else
                bag.exclusiveMaximum = def.value;
        }
    });
    inst._zod.check = (payload) => {
        if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
            return;
        }
        payload.issues.push({
            origin,
            code: "too_big",
            maximum: def.value,
            input: payload.value,
            inclusive: def.inclusive,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
    $ZodCheck.init(inst, def);
    const origin = numericOriginMap[typeof def.value];
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
        if (def.value > curr) {
            if (def.inclusive)
                bag.minimum = def.value;
            else
                bag.exclusiveMinimum = def.value;
        }
    });
    inst._zod.check = (payload) => {
        if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
            return;
        }
        payload.issues.push({
            origin,
            code: "too_small",
            minimum: def.value,
            input: payload.value,
            inclusive: def.inclusive,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckMultipleOf = 
/*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
    $ZodCheck.init(inst, def);
    inst._zod.onattach.push((inst) => {
        var _a;
        (_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
    });
    inst._zod.check = (payload) => {
        if (typeof payload.value !== typeof def.value)
            throw new Error("Cannot mix number and bigint in multiple_of check.");
        const isMultiple = typeof payload.value === "bigint"
            ? payload.value % def.value === BigInt(0)
            : floatSafeRemainder(payload.value, def.value) === 0;
        if (isMultiple)
            return;
        payload.issues.push({
            origin: typeof payload.value,
            code: "not_multiple_of",
            divisor: def.value,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
    $ZodCheck.init(inst, def); // no format checks
    def.format = def.format || "float64";
    const isInt = def.format?.includes("int");
    const origin = isInt ? "int" : "number";
    const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.format = def.format;
        bag.minimum = minimum;
        bag.maximum = maximum;
        if (isInt)
            bag.pattern = integer;
    });
    inst._zod.check = (payload) => {
        const input = payload.value;
        if (isInt) {
            if (!Number.isInteger(input)) {
                // invalid_format issue
                // payload.issues.push({
                //   expected: def.format,
                //   format: def.format,
                //   code: "invalid_format",
                //   input,
                //   inst,
                // });
                // invalid_type issue
                payload.issues.push({
                    expected: origin,
                    format: def.format,
                    code: "invalid_type",
                    input,
                    inst,
                });
                return;
                // not_multiple_of issue
                // payload.issues.push({
                //   code: "not_multiple_of",
                //   origin: "number",
                //   input,
                //   inst,
                //   divisor: 1,
                // });
            }
            if (!Number.isSafeInteger(input)) {
                if (input > 0) {
                    // too_big
                    payload.issues.push({
                        input,
                        code: "too_big",
                        maximum: Number.MAX_SAFE_INTEGER,
                        note: "Integers must be within the safe integer range.",
                        inst,
                        origin,
                        continue: !def.abort,
                    });
                }
                else {
                    // too_small
                    payload.issues.push({
                        input,
                        code: "too_small",
                        minimum: Number.MIN_SAFE_INTEGER,
                        note: "Integers must be within the safe integer range.",
                        inst,
                        origin,
                        continue: !def.abort,
                    });
                }
                return;
            }
        }
        if (input < minimum) {
            payload.issues.push({
                origin: "number",
                input,
                code: "too_small",
                minimum,
                inclusive: true,
                inst,
                continue: !def.abort,
            });
        }
        if (input > maximum) {
            payload.issues.push({
                origin: "number",
                input,
                code: "too_big",
                maximum,
                inst,
            });
        }
    };
});
const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
    var _a;
    $ZodCheck.init(inst, def);
    (_a = inst._zod.def).when ?? (_a.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.length !== undefined;
    });
    inst._zod.onattach.push((inst) => {
        const curr = (inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY);
        if (def.maximum < curr)
            inst._zod.bag.maximum = def.maximum;
    });
    inst._zod.check = (payload) => {
        const input = payload.value;
        const length = input.length;
        if (length <= def.maximum)
            return;
        const origin = getLengthableOrigin(input);
        payload.issues.push({
            origin,
            code: "too_big",
            maximum: def.maximum,
            inclusive: true,
            input,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
    var _a;
    $ZodCheck.init(inst, def);
    (_a = inst._zod.def).when ?? (_a.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.length !== undefined;
    });
    inst._zod.onattach.push((inst) => {
        const curr = (inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY);
        if (def.minimum > curr)
            inst._zod.bag.minimum = def.minimum;
    });
    inst._zod.check = (payload) => {
        const input = payload.value;
        const length = input.length;
        if (length >= def.minimum)
            return;
        const origin = getLengthableOrigin(input);
        payload.issues.push({
            origin,
            code: "too_small",
            minimum: def.minimum,
            inclusive: true,
            input,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
    var _a;
    $ZodCheck.init(inst, def);
    (_a = inst._zod.def).when ?? (_a.when = (payload) => {
        const val = payload.value;
        return !nullish(val) && val.length !== undefined;
    });
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.minimum = def.length;
        bag.maximum = def.length;
        bag.length = def.length;
    });
    inst._zod.check = (payload) => {
        const input = payload.value;
        const length = input.length;
        if (length === def.length)
            return;
        const origin = getLengthableOrigin(input);
        const tooBig = length > def.length;
        payload.issues.push({
            origin,
            ...(tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length }),
            inclusive: true,
            exact: true,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
    var _a, _b;
    $ZodCheck.init(inst, def);
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.format = def.format;
        if (def.pattern) {
            bag.patterns ?? (bag.patterns = new Set());
            bag.patterns.add(def.pattern);
        }
    });
    if (def.pattern)
        (_a = inst._zod).check ?? (_a.check = (payload) => {
            def.pattern.lastIndex = 0;
            if (def.pattern.test(payload.value))
                return;
            payload.issues.push({
                origin: "string",
                code: "invalid_format",
                format: def.format,
                input: payload.value,
                ...(def.pattern ? { pattern: def.pattern.toString() } : {}),
                inst,
                continue: !def.abort,
            });
        });
    else
        (_b = inst._zod).check ?? (_b.check = () => { });
});
const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
    $ZodCheckStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        def.pattern.lastIndex = 0;
        if (def.pattern.test(payload.value))
            return;
        payload.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "regex",
            input: payload.value,
            pattern: def.pattern.toString(),
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
    def.pattern ?? (def.pattern = lowercase);
    $ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
    def.pattern ?? (def.pattern = uppercase);
    $ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
    $ZodCheck.init(inst, def);
    const escapedRegex = escapeRegex(def.includes);
    const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
    def.pattern = pattern;
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.patterns ?? (bag.patterns = new Set());
        bag.patterns.add(pattern);
    });
    inst._zod.check = (payload) => {
        if (payload.value.includes(def.includes, def.position))
            return;
        payload.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "includes",
            includes: def.includes,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
    $ZodCheck.init(inst, def);
    const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
    def.pattern ?? (def.pattern = pattern);
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.patterns ?? (bag.patterns = new Set());
        bag.patterns.add(pattern);
    });
    inst._zod.check = (payload) => {
        if (payload.value.startsWith(def.prefix))
            return;
        payload.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "starts_with",
            prefix: def.prefix,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
    $ZodCheck.init(inst, def);
    const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
    def.pattern ?? (def.pattern = pattern);
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.patterns ?? (bag.patterns = new Set());
        bag.patterns.add(pattern);
    });
    inst._zod.check = (payload) => {
        if (payload.value.endsWith(def.suffix))
            return;
        payload.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "ends_with",
            suffix: def.suffix,
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
    $ZodCheck.init(inst, def);
    inst._zod.check = (payload) => {
        payload.value = def.tx(payload.value);
    };
});

class Doc {
    constructor(args = []) {
        this.content = [];
        this.indent = 0;
        if (this)
            this.args = args;
    }
    indented(fn) {
        this.indent += 1;
        fn(this);
        this.indent -= 1;
    }
    write(arg) {
        if (typeof arg === "function") {
            arg(this, { execution: "sync" });
            arg(this, { execution: "async" });
            return;
        }
        const content = arg;
        const lines = content.split("\n").filter((x) => x);
        const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
        const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
        for (const line of dedented) {
            this.content.push(line);
        }
    }
    compile() {
        const F = Function;
        const args = this?.args;
        const content = this?.content ?? [``];
        const lines = [...content.map((x) => `  ${x}`)];
        // console.log(lines.join("\n"));
        return new F(...args, lines.join("\n"));
    }
}

const version = {
    major: 4,
    minor: 0,
    patch: 0,
};

const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
    var _a;
    inst ?? (inst = {});
    inst._zod.def = def; // set _def property
    inst._zod.bag = inst._zod.bag || {}; // initialize _bag object
    inst._zod.version = version;
    const checks = [...(inst._zod.def.checks ?? [])];
    // if inst is itself a checks.$ZodCheck, run it as a check
    if (inst._zod.traits.has("$ZodCheck")) {
        checks.unshift(inst);
    }
    //
    for (const ch of checks) {
        for (const fn of ch._zod.onattach) {
            fn(inst);
        }
    }
    if (checks.length === 0) {
        // deferred initializer
        // inst._zod.parse is not yet defined
        (_a = inst._zod).deferred ?? (_a.deferred = []);
        inst._zod.deferred?.push(() => {
            inst._zod.run = inst._zod.parse;
        });
    }
    else {
        const runChecks = (payload, checks, ctx) => {
            let isAborted = aborted(payload);
            let asyncResult;
            for (const ch of checks) {
                if (ch._zod.def.when) {
                    const shouldRun = ch._zod.def.when(payload);
                    if (!shouldRun)
                        continue;
                }
                else if (isAborted) {
                    continue;
                }
                const currLen = payload.issues.length;
                const _ = ch._zod.check(payload);
                if (_ instanceof Promise && ctx?.async === false) {
                    throw new $ZodAsyncError();
                }
                if (asyncResult || _ instanceof Promise) {
                    asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
                        await _;
                        const nextLen = payload.issues.length;
                        if (nextLen === currLen)
                            return;
                        if (!isAborted)
                            isAborted = aborted(payload, currLen);
                    });
                }
                else {
                    const nextLen = payload.issues.length;
                    if (nextLen === currLen)
                        continue;
                    if (!isAborted)
                        isAborted = aborted(payload, currLen);
                }
            }
            if (asyncResult) {
                return asyncResult.then(() => {
                    return payload;
                });
            }
            return payload;
        };
        inst._zod.run = (payload, ctx) => {
            const result = inst._zod.parse(payload, ctx);
            if (result instanceof Promise) {
                if (ctx.async === false)
                    throw new $ZodAsyncError();
                return result.then((result) => runChecks(result, checks, ctx));
            }
            return runChecks(result, checks, ctx);
        };
    }
    inst["~standard"] = {
        validate: (value) => {
            try {
                const r = safeParse$1(inst, value);
                return r.success ? { value: r.data } : { issues: r.error?.issues };
            }
            catch (_) {
                return safeParseAsync$1(inst, value).then((r) => (r.success ? { value: r.data } : { issues: r.error?.issues }));
            }
        },
        vendor: "zod",
        version: 1,
    };
});
const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = [...(inst?._zod.bag?.patterns ?? [])].pop() ?? string$1(inst._zod.bag);
    inst._zod.parse = (payload, _) => {
        if (def.coerce)
            try {
                payload.value = String(payload.value);
            }
            catch (_) { }
        if (typeof payload.value === "string")
            return payload;
        payload.issues.push({
            expected: "string",
            code: "invalid_type",
            input: payload.value,
            inst,
        });
        return payload;
    };
});
const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
    // check initialization must come first
    $ZodCheckStringFormat.init(inst, def);
    $ZodString.init(inst, def);
});
const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
    def.pattern ?? (def.pattern = guid);
    $ZodStringFormat.init(inst, def);
});
const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
    if (def.version) {
        const versionMap = {
            v1: 1,
            v2: 2,
            v3: 3,
            v4: 4,
            v5: 5,
            v6: 6,
            v7: 7,
            v8: 8,
        };
        const v = versionMap[def.version];
        if (v === undefined)
            throw new Error(`Invalid UUID version: "${def.version}"`);
        def.pattern ?? (def.pattern = uuid(v));
    }
    else
        def.pattern ?? (def.pattern = uuid());
    $ZodStringFormat.init(inst, def);
});
const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
    def.pattern ?? (def.pattern = email);
    $ZodStringFormat.init(inst, def);
});
const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        try {
            const orig = payload.value;
            const url = new URL(orig);
            const href = url.href;
            if (def.hostname) {
                def.hostname.lastIndex = 0;
                if (!def.hostname.test(url.hostname)) {
                    payload.issues.push({
                        code: "invalid_format",
                        format: "url",
                        note: "Invalid hostname",
                        pattern: hostname.source,
                        input: payload.value,
                        inst,
                        continue: !def.abort,
                    });
                }
            }
            if (def.protocol) {
                def.protocol.lastIndex = 0;
                if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) {
                    payload.issues.push({
                        code: "invalid_format",
                        format: "url",
                        note: "Invalid protocol",
                        pattern: def.protocol.source,
                        input: payload.value,
                        inst,
                        continue: !def.abort,
                    });
                }
            }
            // payload.value = url.href;
            if (!orig.endsWith("/") && href.endsWith("/")) {
                payload.value = href.slice(0, -1);
            }
            else {
                payload.value = href;
            }
            return;
        }
        catch (_) {
            payload.issues.push({
                code: "invalid_format",
                format: "url",
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        }
    };
});
const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
    def.pattern ?? (def.pattern = emoji());
    $ZodStringFormat.init(inst, def);
});
const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
    def.pattern ?? (def.pattern = nanoid);
    $ZodStringFormat.init(inst, def);
});
const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
    def.pattern ?? (def.pattern = cuid);
    $ZodStringFormat.init(inst, def);
});
const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
    def.pattern ?? (def.pattern = cuid2);
    $ZodStringFormat.init(inst, def);
});
const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
    def.pattern ?? (def.pattern = ulid);
    $ZodStringFormat.init(inst, def);
});
const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
    def.pattern ?? (def.pattern = xid);
    $ZodStringFormat.init(inst, def);
});
const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
    def.pattern ?? (def.pattern = ksuid);
    $ZodStringFormat.init(inst, def);
});
const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
    def.pattern ?? (def.pattern = datetime$1(def));
    $ZodStringFormat.init(inst, def);
});
const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
    def.pattern ?? (def.pattern = date$1);
    $ZodStringFormat.init(inst, def);
});
const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
    def.pattern ?? (def.pattern = time$1(def));
    $ZodStringFormat.init(inst, def);
});
const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
    def.pattern ?? (def.pattern = duration$1);
    $ZodStringFormat.init(inst, def);
});
const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
    def.pattern ?? (def.pattern = ipv4);
    $ZodStringFormat.init(inst, def);
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.format = `ipv4`;
    });
});
const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
    def.pattern ?? (def.pattern = ipv6);
    $ZodStringFormat.init(inst, def);
    inst._zod.onattach.push((inst) => {
        const bag = inst._zod.bag;
        bag.format = `ipv6`;
    });
    inst._zod.check = (payload) => {
        try {
            new URL(`http://[${payload.value}]`);
            // return;
        }
        catch {
            payload.issues.push({
                code: "invalid_format",
                format: "ipv6",
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        }
    };
});
const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
    def.pattern ?? (def.pattern = cidrv4);
    $ZodStringFormat.init(inst, def);
});
const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
    def.pattern ?? (def.pattern = cidrv6); // not used for validation
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        const [address, prefix] = payload.value.split("/");
        try {
            if (!prefix)
                throw new Error();
            const prefixNum = Number(prefix);
            if (`${prefixNum}` !== prefix)
                throw new Error();
            if (prefixNum < 0 || prefixNum > 128)
                throw new Error();
            new URL(`http://[${address}]`);
        }
        catch {
            payload.issues.push({
                code: "invalid_format",
                format: "cidrv6",
                input: payload.value,
                inst,
                continue: !def.abort,
            });
        }
    };
});
//////////////////////////////   ZodBase64   //////////////////////////////
function isValidBase64(data) {
    if (data === "")
        return true;
    if (data.length % 4 !== 0)
        return false;
    try {
        atob(data);
        return true;
    }
    catch {
        return false;
    }
}
const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
    def.pattern ?? (def.pattern = base64);
    $ZodStringFormat.init(inst, def);
    inst._zod.onattach.push((inst) => {
        inst._zod.bag.contentEncoding = "base64";
    });
    inst._zod.check = (payload) => {
        if (isValidBase64(payload.value))
            return;
        payload.issues.push({
            code: "invalid_format",
            format: "base64",
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
//////////////////////////////   ZodBase64   //////////////////////////////
function isValidBase64URL(data) {
    if (!base64url.test(data))
        return false;
    const base64 = data.replace(/[-_]/g, (c) => (c === "-" ? "+" : "/"));
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return isValidBase64(padded);
}
const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
    def.pattern ?? (def.pattern = base64url);
    $ZodStringFormat.init(inst, def);
    inst._zod.onattach.push((inst) => {
        inst._zod.bag.contentEncoding = "base64url";
    });
    inst._zod.check = (payload) => {
        if (isValidBase64URL(payload.value))
            return;
        payload.issues.push({
            code: "invalid_format",
            format: "base64url",
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
    def.pattern ?? (def.pattern = e164);
    $ZodStringFormat.init(inst, def);
});
//////////////////////////////   ZodJWT   //////////////////////////////
function isValidJWT(token, algorithm = null) {
    try {
        const tokensParts = token.split(".");
        if (tokensParts.length !== 3)
            return false;
        const [header] = tokensParts;
        if (!header)
            return false;
        const parsedHeader = JSON.parse(atob(header));
        if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
            return false;
        if (!parsedHeader.alg)
            return false;
        if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
            return false;
        return true;
    }
    catch {
        return false;
    }
}
const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
    $ZodStringFormat.init(inst, def);
    inst._zod.check = (payload) => {
        if (isValidJWT(payload.value, def.alg))
            return;
        payload.issues.push({
            code: "invalid_format",
            format: "jwt",
            input: payload.value,
            inst,
            continue: !def.abort,
        });
    };
});
const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = inst._zod.bag.pattern ?? number$1;
    inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
            try {
                payload.value = Number(payload.value);
            }
            catch (_) { }
        const input = payload.value;
        if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
            return payload;
        }
        const received = typeof input === "number"
            ? Number.isNaN(input)
                ? "NaN"
                : !Number.isFinite(input)
                    ? "Infinity"
                    : undefined
            : undefined;
        payload.issues.push({
            expected: "number",
            code: "invalid_type",
            input,
            inst,
            ...(received ? { received } : {}),
        });
        return payload;
    };
});
const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
    $ZodCheckNumberFormat.init(inst, def);
    $ZodNumber.init(inst, def); // no format checksp
});
const $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = boolean$1;
    inst._zod.parse = (payload, _ctx) => {
        if (def.coerce)
            try {
                payload.value = Boolean(payload.value);
            }
            catch (_) { }
        const input = payload.value;
        if (typeof input === "boolean")
            return payload;
        payload.issues.push({
            expected: "boolean",
            code: "invalid_type",
            input,
            inst,
        });
        return payload;
    };
});
const $ZodAny = /*@__PURE__*/ $constructor("$ZodAny", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload) => payload;
});
const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload) => payload;
});
const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
        payload.issues.push({
            expected: "never",
            code: "invalid_type",
            input: payload.value,
            inst,
        });
        return payload;
    };
});
function handleArrayResult(result, final, index) {
    if (result.issues.length) {
        final.issues.push(...prefixIssues(index, result.issues));
    }
    final.value[index] = result.value;
}
const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!Array.isArray(input)) {
            payload.issues.push({
                expected: "array",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        }
        payload.value = Array(input.length);
        const proms = [];
        for (let i = 0; i < input.length; i++) {
            const item = input[i];
            const result = def.element._zod.run({
                value: item,
                issues: [],
            }, ctx);
            if (result instanceof Promise) {
                proms.push(result.then((result) => handleArrayResult(result, payload, i)));
            }
            else {
                handleArrayResult(result, payload, i);
            }
        }
        if (proms.length) {
            return Promise.all(proms).then(() => payload);
        }
        return payload; //handleArrayResultsAsync(parseResults, final);
    };
});
function handleObjectResult(result, final, key) {
    // if(isOptional)
    if (result.issues.length) {
        final.issues.push(...prefixIssues(key, result.issues));
    }
    final.value[key] = result.value;
}
function handleOptionalObjectResult(result, final, key, input) {
    if (result.issues.length) {
        // validation failed against value schema
        if (input[key] === undefined) {
            // if input was undefined, ignore the error
            if (key in input) {
                final.value[key] = undefined;
            }
            else {
                final.value[key] = result.value;
            }
        }
        else {
            final.issues.push(...prefixIssues(key, result.issues));
        }
    }
    else if (result.value === undefined) {
        // validation returned `undefined`
        if (key in input)
            final.value[key] = undefined;
    }
    else {
        // non-undefined value
        final.value[key] = result.value;
    }
}
const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
    // requires cast because technically $ZodObject doesn't extend
    $ZodType.init(inst, def);
    const _normalized = cached(() => {
        const keys = Object.keys(def.shape);
        for (const k of keys) {
            if (!(def.shape[k] instanceof $ZodType)) {
                throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
            }
        }
        const okeys = optionalKeys(def.shape);
        return {
            shape: def.shape,
            keys,
            keySet: new Set(keys),
            numKeys: keys.length,
            optionalKeys: new Set(okeys),
        };
    });
    defineLazy(inst._zod, "propValues", () => {
        const shape = def.shape;
        const propValues = {};
        for (const key in shape) {
            const field = shape[key]._zod;
            if (field.values) {
                propValues[key] ?? (propValues[key] = new Set());
                for (const v of field.values)
                    propValues[key].add(v);
            }
        }
        return propValues;
    });
    const generateFastpass = (shape) => {
        const doc = new Doc(["shape", "payload", "ctx"]);
        const normalized = _normalized.value;
        const parseStr = (key) => {
            const k = esc(key);
            return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
        };
        doc.write(`const input = payload.value;`);
        const ids = Object.create(null);
        let counter = 0;
        for (const key of normalized.keys) {
            ids[key] = `key_${counter++}`;
        }
        // A: preserve key order {
        doc.write(`const newResult = {}`);
        for (const key of normalized.keys) {
            if (normalized.optionalKeys.has(key)) {
                const id = ids[key];
                doc.write(`const ${id} = ${parseStr(key)};`);
                const k = esc(key);
                doc.write(`
        if (${id}.issues.length) {
          if (input[${k}] === undefined) {
            if (${k} in input) {
              newResult[${k}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${id}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${k}, ...iss.path] : [${k}],
              }))
            );
          }
        } else if (${id}.value === undefined) {
          if (${k} in input) newResult[${k}] = undefined;
        } else {
          newResult[${k}] = ${id}.value;
        }
        `);
            }
            else {
                const id = ids[key];
                //  const id = ids[key];
                doc.write(`const ${id} = ${parseStr(key)};`);
                doc.write(`
          if (${id}.issues.length) payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${esc(key)}, ...iss.path] : [${esc(key)}]
          })));`);
                doc.write(`newResult[${esc(key)}] = ${id}.value`);
            }
        }
        doc.write(`payload.value = newResult;`);
        doc.write(`return payload;`);
        const fn = doc.compile();
        return (payload, ctx) => fn(shape, payload, ctx);
    };
    let fastpass;
    const isObject$1 = isObject;
    const jit = !globalConfig.jitless;
    const allowsEval$1 = allowsEval;
    const fastEnabled = jit && allowsEval$1.value; // && !def.catchall;
    const catchall = def.catchall;
    let value;
    inst._zod.parse = (payload, ctx) => {
        value ?? (value = _normalized.value);
        const input = payload.value;
        if (!isObject$1(input)) {
            payload.issues.push({
                expected: "object",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        }
        const proms = [];
        if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
            // always synchronous
            if (!fastpass)
                fastpass = generateFastpass(def.shape);
            payload = fastpass(payload, ctx);
        }
        else {
            payload.value = {};
            const shape = value.shape;
            for (const key of value.keys) {
                const el = shape[key];
                // do not add omitted optional keys
                // if (!(key in input)) {
                //   if (optionalKeys.has(key)) continue;
                //   payload.issues.push({
                //     code: "invalid_type",
                //     path: [key],
                //     expected: "nonoptional",
                //     note: `Missing required key: "${key}"`,
                //     input,
                //     inst,
                //   });
                // }
                const r = el._zod.run({ value: input[key], issues: [] }, ctx);
                const isOptional = el._zod.optin === "optional" && el._zod.optout === "optional";
                if (r instanceof Promise) {
                    proms.push(r.then((r) => isOptional ? handleOptionalObjectResult(r, payload, key, input) : handleObjectResult(r, payload, key)));
                }
                else if (isOptional) {
                    handleOptionalObjectResult(r, payload, key, input);
                }
                else {
                    handleObjectResult(r, payload, key);
                }
            }
        }
        if (!catchall) {
            // return payload;
            return proms.length ? Promise.all(proms).then(() => payload) : payload;
        }
        const unrecognized = [];
        // iterate over input keys
        const keySet = value.keySet;
        const _catchall = catchall._zod;
        const t = _catchall.def.type;
        for (const key of Object.keys(input)) {
            if (keySet.has(key))
                continue;
            if (t === "never") {
                unrecognized.push(key);
                continue;
            }
            const r = _catchall.run({ value: input[key], issues: [] }, ctx);
            if (r instanceof Promise) {
                proms.push(r.then((r) => handleObjectResult(r, payload, key)));
            }
            else {
                handleObjectResult(r, payload, key);
            }
        }
        if (unrecognized.length) {
            payload.issues.push({
                code: "unrecognized_keys",
                keys: unrecognized,
                input,
                inst,
            });
        }
        if (!proms.length)
            return payload;
        return Promise.all(proms).then(() => {
            return payload;
        });
    };
});
function handleUnionResults(results, final, inst, ctx) {
    for (const result of results) {
        if (result.issues.length === 0) {
            final.value = result.value;
            return final;
        }
    }
    final.issues.push({
        code: "invalid_union",
        input: final.value,
        inst,
        errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config()))),
    });
    return final;
}
const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : undefined);
    defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : undefined);
    defineLazy(inst._zod, "values", () => {
        if (def.options.every((o) => o._zod.values)) {
            return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
        }
        return undefined;
    });
    defineLazy(inst._zod, "pattern", () => {
        if (def.options.every((o) => o._zod.pattern)) {
            const patterns = def.options.map((o) => o._zod.pattern);
            return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
        }
        return undefined;
    });
    inst._zod.parse = (payload, ctx) => {
        let async = false;
        const results = [];
        for (const option of def.options) {
            const result = option._zod.run({
                value: payload.value,
                issues: [],
            }, ctx);
            if (result instanceof Promise) {
                results.push(result);
                async = true;
            }
            else {
                if (result.issues.length === 0)
                    return result;
                results.push(result);
            }
        }
        if (!async)
            return handleUnionResults(results, payload, inst, ctx);
        return Promise.all(results).then((results) => {
            return handleUnionResults(results, payload, inst, ctx);
        });
    };
});
const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        const left = def.left._zod.run({ value: input, issues: [] }, ctx);
        const right = def.right._zod.run({ value: input, issues: [] }, ctx);
        const async = left instanceof Promise || right instanceof Promise;
        if (async) {
            return Promise.all([left, right]).then(([left, right]) => {
                return handleIntersectionResults(payload, left, right);
            });
        }
        return handleIntersectionResults(payload, left, right);
    };
});
function mergeValues(a, b) {
    // const aType = parse.t(a);
    // const bType = parse.t(b);
    if (a === b) {
        return { valid: true, data: a };
    }
    if (a instanceof Date && b instanceof Date && +a === +b) {
        return { valid: true, data: a };
    }
    if (isPlainObject(a) && isPlainObject(b)) {
        const bKeys = Object.keys(b);
        const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
        const newObj = { ...a, ...b };
        for (const key of sharedKeys) {
            const sharedValue = mergeValues(a[key], b[key]);
            if (!sharedValue.valid) {
                return {
                    valid: false,
                    mergeErrorPath: [key, ...sharedValue.mergeErrorPath],
                };
            }
            newObj[key] = sharedValue.data;
        }
        return { valid: true, data: newObj };
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
            return { valid: false, mergeErrorPath: [] };
        }
        const newArray = [];
        for (let index = 0; index < a.length; index++) {
            const itemA = a[index];
            const itemB = b[index];
            const sharedValue = mergeValues(itemA, itemB);
            if (!sharedValue.valid) {
                return {
                    valid: false,
                    mergeErrorPath: [index, ...sharedValue.mergeErrorPath],
                };
            }
            newArray.push(sharedValue.data);
        }
        return { valid: true, data: newArray };
    }
    return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
    if (left.issues.length) {
        result.issues.push(...left.issues);
    }
    if (right.issues.length) {
        result.issues.push(...right.issues);
    }
    if (aborted(result))
        return result;
    const merged = mergeValues(left.value, right.value);
    if (!merged.valid) {
        throw new Error(`Unmergable intersection. Error path: ` + `${JSON.stringify(merged.mergeErrorPath)}`);
    }
    result.value = merged.data;
    return result;
}
const $ZodRecord = /*@__PURE__*/ $constructor("$ZodRecord", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
        const input = payload.value;
        if (!isPlainObject(input)) {
            payload.issues.push({
                expected: "record",
                code: "invalid_type",
                input,
                inst,
            });
            return payload;
        }
        const proms = [];
        if (def.keyType._zod.values) {
            const values = def.keyType._zod.values;
            payload.value = {};
            for (const key of values) {
                if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
                    const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
                    if (result instanceof Promise) {
                        proms.push(result.then((result) => {
                            if (result.issues.length) {
                                payload.issues.push(...prefixIssues(key, result.issues));
                            }
                            payload.value[key] = result.value;
                        }));
                    }
                    else {
                        if (result.issues.length) {
                            payload.issues.push(...prefixIssues(key, result.issues));
                        }
                        payload.value[key] = result.value;
                    }
                }
            }
            let unrecognized;
            for (const key in input) {
                if (!values.has(key)) {
                    unrecognized = unrecognized ?? [];
                    unrecognized.push(key);
                }
            }
            if (unrecognized && unrecognized.length > 0) {
                payload.issues.push({
                    code: "unrecognized_keys",
                    input,
                    inst,
                    keys: unrecognized,
                });
            }
        }
        else {
            payload.value = {};
            for (const key of Reflect.ownKeys(input)) {
                if (key === "__proto__")
                    continue;
                const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
                if (keyResult instanceof Promise) {
                    throw new Error("Async schemas not supported in object keys currently");
                }
                if (keyResult.issues.length) {
                    payload.issues.push({
                        origin: "record",
                        code: "invalid_key",
                        issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                        input: key,
                        path: [key],
                        inst,
                    });
                    payload.value[keyResult.value] = keyResult.value;
                    continue;
                }
                const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
                if (result instanceof Promise) {
                    proms.push(result.then((result) => {
                        if (result.issues.length) {
                            payload.issues.push(...prefixIssues(key, result.issues));
                        }
                        payload.value[keyResult.value] = result.value;
                    }));
                }
                else {
                    if (result.issues.length) {
                        payload.issues.push(...prefixIssues(key, result.issues));
                    }
                    payload.value[keyResult.value] = result.value;
                }
            }
        }
        if (proms.length) {
            return Promise.all(proms).then(() => payload);
        }
        return payload;
    };
});
const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
    $ZodType.init(inst, def);
    const values = getEnumValues(def.entries);
    inst._zod.values = new Set(values);
    inst._zod.pattern = new RegExp(`^(${values
        .filter((k) => propertyKeyTypes.has(typeof k))
        .map((o) => (typeof o === "string" ? escapeRegex(o) : o.toString()))
        .join("|")})$`);
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (inst._zod.values.has(input)) {
            return payload;
        }
        payload.issues.push({
            code: "invalid_value",
            values,
            input,
            inst,
        });
        return payload;
    };
});
const $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.values = new Set(def.values);
    inst._zod.pattern = new RegExp(`^(${def.values
        .map((o) => (typeof o === "string" ? escapeRegex(o) : o ? o.toString() : String(o)))
        .join("|")})$`);
    inst._zod.parse = (payload, _ctx) => {
        const input = payload.value;
        if (inst._zod.values.has(input)) {
            return payload;
        }
        payload.issues.push({
            code: "invalid_value",
            values: def.values,
            input,
            inst,
        });
        return payload;
    };
});
const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
        const _out = def.transform(payload.value, payload);
        if (_ctx.async) {
            const output = _out instanceof Promise ? _out : Promise.resolve(_out);
            return output.then((output) => {
                payload.value = output;
                return payload;
            });
        }
        if (_out instanceof Promise) {
            throw new $ZodAsyncError();
        }
        payload.value = _out;
        return payload;
    };
});
const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.optin = "optional";
    inst._zod.optout = "optional";
    defineLazy(inst._zod, "values", () => {
        return def.innerType._zod.values ? new Set([...def.innerType._zod.values, undefined]) : undefined;
    });
    defineLazy(inst._zod, "pattern", () => {
        const pattern = def.innerType._zod.pattern;
        return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : undefined;
    });
    inst._zod.parse = (payload, ctx) => {
        if (def.innerType._zod.optin === "optional") {
            return def.innerType._zod.run(payload, ctx);
        }
        if (payload.value === undefined) {
            return payload;
        }
        return def.innerType._zod.run(payload, ctx);
    };
});
const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
    defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
    defineLazy(inst._zod, "pattern", () => {
        const pattern = def.innerType._zod.pattern;
        return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : undefined;
    });
    defineLazy(inst._zod, "values", () => {
        return def.innerType._zod.values ? new Set([...def.innerType._zod.values, null]) : undefined;
    });
    inst._zod.parse = (payload, ctx) => {
        if (payload.value === null)
            return payload;
        return def.innerType._zod.run(payload, ctx);
    };
});
const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
    $ZodType.init(inst, def);
    // inst._zod.qin = "true";
    inst._zod.optin = "optional";
    defineLazy(inst._zod, "values", () => def.innerType._zod.values);
    inst._zod.parse = (payload, ctx) => {
        if (payload.value === undefined) {
            payload.value = def.defaultValue;
            /**
             * $ZodDefault always returns the default value immediately.
             * It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
            return payload;
        }
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
            return result.then((result) => handleDefaultResult(result, def));
        }
        return handleDefaultResult(result, def);
    };
});
function handleDefaultResult(payload, def) {
    if (payload.value === undefined) {
        payload.value = def.defaultValue;
    }
    return payload;
}
const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.optin = "optional";
    defineLazy(inst._zod, "values", () => def.innerType._zod.values);
    inst._zod.parse = (payload, ctx) => {
        if (payload.value === undefined) {
            payload.value = def.defaultValue;
        }
        return def.innerType._zod.run(payload, ctx);
    };
});
const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "values", () => {
        const v = def.innerType._zod.values;
        return v ? new Set([...v].filter((x) => x !== undefined)) : undefined;
    });
    inst._zod.parse = (payload, ctx) => {
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
            return result.then((result) => handleNonOptionalResult(result, inst));
        }
        return handleNonOptionalResult(result, inst);
    };
});
function handleNonOptionalResult(payload, inst) {
    if (!payload.issues.length && payload.value === undefined) {
        payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: payload.value,
            inst,
        });
    }
    return payload;
}
const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.optin = "optional";
    defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
    defineLazy(inst._zod, "values", () => def.innerType._zod.values);
    inst._zod.parse = (payload, ctx) => {
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
            return result.then((result) => {
                payload.value = result.value;
                if (result.issues.length) {
                    payload.value = def.catchValue({
                        ...payload,
                        error: {
                            issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                        },
                        input: payload.value,
                    });
                    payload.issues = [];
                }
                return payload;
            });
        }
        payload.value = result.value;
        if (result.issues.length) {
            payload.value = def.catchValue({
                ...payload,
                error: {
                    issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                },
                input: payload.value,
            });
            payload.issues = [];
        }
        return payload;
    };
});
const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "values", () => def.in._zod.values);
    defineLazy(inst._zod, "optin", () => def.in._zod.optin);
    defineLazy(inst._zod, "optout", () => def.out._zod.optout);
    inst._zod.parse = (payload, ctx) => {
        const left = def.in._zod.run(payload, ctx);
        if (left instanceof Promise) {
            return left.then((left) => handlePipeResult(left, def, ctx));
        }
        return handlePipeResult(left, def, ctx);
    };
});
function handlePipeResult(left, def, ctx) {
    if (aborted(left)) {
        return left;
    }
    return def.out._zod.run({ value: left.value, issues: left.issues }, ctx);
}
const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
    defineLazy(inst._zod, "values", () => def.innerType._zod.values);
    defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
    defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
    inst._zod.parse = (payload, ctx) => {
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise) {
            return result.then(handleReadonlyResult);
        }
        return handleReadonlyResult(result);
    };
});
function handleReadonlyResult(payload) {
    payload.value = Object.freeze(payload.value);
    return payload;
}
const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
    $ZodCheck.init(inst, def);
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _) => {
        return payload;
    };
    inst._zod.check = (payload) => {
        const input = payload.value;
        const r = def.fn(input);
        if (r instanceof Promise) {
            return r.then((r) => handleRefineResult(r, payload, input, inst));
        }
        handleRefineResult(r, payload, input, inst);
        return;
    };
});
function handleRefineResult(result, payload, input, inst) {
    if (!result) {
        const _iss = {
            code: "custom",
            input,
            inst, // incorporates params.error into issue reporting
            path: [...(inst._zod.def.path ?? [])], // incorporates params.error into issue reporting
            continue: !inst._zod.def.abort,
            // params: inst._zod.def.params,
        };
        if (inst._zod.def.params)
            _iss.params = inst._zod.def.params;
        payload.issues.push(issue(_iss));
    }
}

class $ZodRegistry {
    constructor() {
        this._map = new Map();
        this._idmap = new Map();
    }
    add(schema, ..._meta) {
        const meta = _meta[0];
        this._map.set(schema, meta);
        if (meta && typeof meta === "object" && "id" in meta) {
            if (this._idmap.has(meta.id)) {
                throw new Error(`ID ${meta.id} already exists in the registry`);
            }
            this._idmap.set(meta.id, schema);
        }
        return this;
    }
    clear() {
        this._map = new Map();
        this._idmap = new Map();
        return this;
    }
    remove(schema) {
        const meta = this._map.get(schema);
        if (meta && typeof meta === "object" && "id" in meta) {
            this._idmap.delete(meta.id);
        }
        this._map.delete(schema);
        return this;
    }
    get(schema) {
        // return this._map.get(schema) as any;
        // inherit metadata
        const p = schema._zod.parent;
        if (p) {
            const pm = { ...(this.get(p) ?? {}) };
            delete pm.id; // do not inherit id
            return { ...pm, ...this._map.get(schema) };
        }
        return this._map.get(schema);
    }
    has(schema) {
        return this._map.has(schema);
    }
}
// registries
function registry() {
    return new $ZodRegistry();
}
const globalRegistry = /*@__PURE__*/ registry();

function _string(Class, params) {
    return new Class({
        type: "string",
        ...normalizeParams(params),
    });
}
function _email(Class, params) {
    return new Class({
        type: "string",
        format: "email",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _guid(Class, params) {
    return new Class({
        type: "string",
        format: "guid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _uuid(Class, params) {
    return new Class({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _uuidv4(Class, params) {
    return new Class({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        version: "v4",
        ...normalizeParams(params),
    });
}
function _uuidv6(Class, params) {
    return new Class({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        version: "v6",
        ...normalizeParams(params),
    });
}
function _uuidv7(Class, params) {
    return new Class({
        type: "string",
        format: "uuid",
        check: "string_format",
        abort: false,
        version: "v7",
        ...normalizeParams(params),
    });
}
function _url(Class, params) {
    return new Class({
        type: "string",
        format: "url",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _emoji(Class, params) {
    return new Class({
        type: "string",
        format: "emoji",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _nanoid(Class, params) {
    return new Class({
        type: "string",
        format: "nanoid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _cuid(Class, params) {
    return new Class({
        type: "string",
        format: "cuid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _cuid2(Class, params) {
    return new Class({
        type: "string",
        format: "cuid2",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _ulid(Class, params) {
    return new Class({
        type: "string",
        format: "ulid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _xid(Class, params) {
    return new Class({
        type: "string",
        format: "xid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _ksuid(Class, params) {
    return new Class({
        type: "string",
        format: "ksuid",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _ipv4(Class, params) {
    return new Class({
        type: "string",
        format: "ipv4",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _ipv6(Class, params) {
    return new Class({
        type: "string",
        format: "ipv6",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _cidrv4(Class, params) {
    return new Class({
        type: "string",
        format: "cidrv4",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _cidrv6(Class, params) {
    return new Class({
        type: "string",
        format: "cidrv6",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _base64(Class, params) {
    return new Class({
        type: "string",
        format: "base64",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _base64url(Class, params) {
    return new Class({
        type: "string",
        format: "base64url",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _e164(Class, params) {
    return new Class({
        type: "string",
        format: "e164",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _jwt(Class, params) {
    return new Class({
        type: "string",
        format: "jwt",
        check: "string_format",
        abort: false,
        ...normalizeParams(params),
    });
}
function _isoDateTime(Class, params) {
    return new Class({
        type: "string",
        format: "datetime",
        check: "string_format",
        offset: false,
        local: false,
        precision: null,
        ...normalizeParams(params),
    });
}
function _isoDate(Class, params) {
    return new Class({
        type: "string",
        format: "date",
        check: "string_format",
        ...normalizeParams(params),
    });
}
function _isoTime(Class, params) {
    return new Class({
        type: "string",
        format: "time",
        check: "string_format",
        precision: null,
        ...normalizeParams(params),
    });
}
function _isoDuration(Class, params) {
    return new Class({
        type: "string",
        format: "duration",
        check: "string_format",
        ...normalizeParams(params),
    });
}
function _number(Class, params) {
    return new Class({
        type: "number",
        checks: [],
        ...normalizeParams(params),
    });
}
function _int(Class, params) {
    return new Class({
        type: "number",
        check: "number_format",
        abort: false,
        format: "safeint",
        ...normalizeParams(params),
    });
}
function _boolean(Class, params) {
    return new Class({
        type: "boolean",
        ...normalizeParams(params),
    });
}
function _any(Class) {
    return new Class({
        type: "any",
    });
}
function _unknown(Class) {
    return new Class({
        type: "unknown",
    });
}
function _never(Class, params) {
    return new Class({
        type: "never",
        ...normalizeParams(params),
    });
}
function _lt(value, params) {
    return new $ZodCheckLessThan({
        check: "less_than",
        ...normalizeParams(params),
        value,
        inclusive: false,
    });
}
function _lte(value, params) {
    return new $ZodCheckLessThan({
        check: "less_than",
        ...normalizeParams(params),
        value,
        inclusive: true,
    });
}
function _gt(value, params) {
    return new $ZodCheckGreaterThan({
        check: "greater_than",
        ...normalizeParams(params),
        value,
        inclusive: false,
    });
}
function _gte(value, params) {
    return new $ZodCheckGreaterThan({
        check: "greater_than",
        ...normalizeParams(params),
        value,
        inclusive: true,
    });
}
function _multipleOf(value, params) {
    return new $ZodCheckMultipleOf({
        check: "multiple_of",
        ...normalizeParams(params),
        value,
    });
}
function _maxLength(maximum, params) {
    const ch = new $ZodCheckMaxLength({
        check: "max_length",
        ...normalizeParams(params),
        maximum,
    });
    return ch;
}
function _minLength(minimum, params) {
    return new $ZodCheckMinLength({
        check: "min_length",
        ...normalizeParams(params),
        minimum,
    });
}
function _length(length, params) {
    return new $ZodCheckLengthEquals({
        check: "length_equals",
        ...normalizeParams(params),
        length,
    });
}
function _regex(pattern, params) {
    return new $ZodCheckRegex({
        check: "string_format",
        format: "regex",
        ...normalizeParams(params),
        pattern,
    });
}
function _lowercase(params) {
    return new $ZodCheckLowerCase({
        check: "string_format",
        format: "lowercase",
        ...normalizeParams(params),
    });
}
function _uppercase(params) {
    return new $ZodCheckUpperCase({
        check: "string_format",
        format: "uppercase",
        ...normalizeParams(params),
    });
}
function _includes(includes, params) {
    return new $ZodCheckIncludes({
        check: "string_format",
        format: "includes",
        ...normalizeParams(params),
        includes,
    });
}
function _startsWith(prefix, params) {
    return new $ZodCheckStartsWith({
        check: "string_format",
        format: "starts_with",
        ...normalizeParams(params),
        prefix,
    });
}
function _endsWith(suffix, params) {
    return new $ZodCheckEndsWith({
        check: "string_format",
        format: "ends_with",
        ...normalizeParams(params),
        suffix,
    });
}
function _overwrite(tx) {
    return new $ZodCheckOverwrite({
        check: "overwrite",
        tx,
    });
}
// normalize
function _normalize(form) {
    return _overwrite((input) => input.normalize(form));
}
// trim
function _trim() {
    return _overwrite((input) => input.trim());
}
// toLowerCase
function _toLowerCase() {
    return _overwrite((input) => input.toLowerCase());
}
// toUpperCase
function _toUpperCase() {
    return _overwrite((input) => input.toUpperCase());
}
function _array(Class, element, params) {
    return new Class({
        type: "array",
        element,
        // get element() {
        //   return element;
        // },
        ...normalizeParams(params),
    });
}
// export function _refine<T>(
//   Class: util.SchemaClass<schemas.$ZodCustom>,
//   fn: (arg: NoInfer<T>) => util.MaybeAsync<unknown>,
//   _params: string | $ZodCustomParams = {}
// ): checks.$ZodCheck<T> {
//   return _custom(Class, fn, _params);
// }
// same as _custom but defaults to abort:false
function _refine(Class, fn, _params) {
    const schema = new Class({
        type: "custom",
        check: "custom",
        fn: fn,
        ...normalizeParams(_params),
    });
    return schema;
}

const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
    $ZodISODateTime.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function datetime(params) {
    return _isoDateTime(ZodISODateTime, params);
}
const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
    $ZodISODate.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function date(params) {
    return _isoDate(ZodISODate, params);
}
const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
    $ZodISOTime.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function time(params) {
    return _isoTime(ZodISOTime, params);
}
const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
    $ZodISODuration.init(inst, def);
    ZodStringFormat.init(inst, def);
});
function duration(params) {
    return _isoDuration(ZodISODuration, params);
}

const initializer = (inst, issues) => {
    $ZodError.init(inst, issues);
    inst.name = "ZodError";
    Object.defineProperties(inst, {
        format: {
            value: (mapper) => formatError(inst, mapper),
            // enumerable: false,
        },
        flatten: {
            value: (mapper) => flattenError(inst, mapper),
            // enumerable: false,
        },
        addIssue: {
            value: (issue) => inst.issues.push(issue),
            // enumerable: false,
        },
        addIssues: {
            value: (issues) => inst.issues.push(...issues),
            // enumerable: false,
        },
        isEmpty: {
            get() {
                return inst.issues.length === 0;
            },
            // enumerable: false,
        },
    });
    // Object.defineProperty(inst, "isEmpty", {
    //   get() {
    //     return inst.issues.length === 0;
    //   },
    // });
};
const ZodRealError = $constructor("ZodError", initializer, {
    Parent: Error,
});
// /** @deprecated Use `z.core.$ZodErrorMapCtx` instead. */
// export type ErrorMapCtx = core.$ZodErrorMapCtx;

const parse = /* @__PURE__ */ _parse$2(ZodRealError);
const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);

const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
    $ZodType.init(inst, def);
    inst.def = def;
    Object.defineProperty(inst, "_def", { value: def });
    // base methods
    inst.check = (...checks) => {
        return inst.clone({
            ...def,
            checks: [
                ...(def.checks ?? []),
                ...checks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch),
            ],
        }
        // { parent: true }
        );
    };
    inst.clone = (def, params) => clone(inst, def, params);
    inst.brand = () => inst;
    inst.register = ((reg, meta) => {
        reg.add(inst, meta);
        return inst;
    });
    // parsing
    inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
    inst.safeParse = (data, params) => safeParse(inst, data, params);
    inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
    inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
    inst.spa = inst.safeParseAsync;
    // refinements
    inst.refine = (check, params) => inst.check(refine(check, params));
    inst.superRefine = (refinement) => inst.check(superRefine(refinement));
    inst.overwrite = (fn) => inst.check(_overwrite(fn));
    // wrappers
    inst.optional = () => optional(inst);
    inst.nullable = () => nullable(inst);
    inst.nullish = () => optional(nullable(inst));
    inst.nonoptional = (params) => nonoptional(inst, params);
    inst.array = () => array(inst);
    inst.or = (arg) => union([inst, arg]);
    inst.and = (arg) => intersection(inst, arg);
    inst.transform = (tx) => pipe(inst, transform(tx));
    inst.default = (def) => _default(inst, def);
    inst.prefault = (def) => prefault(inst, def);
    // inst.coalesce = (def, params) => coalesce(inst, def, params);
    inst.catch = (params) => _catch(inst, params);
    inst.pipe = (target) => pipe(inst, target);
    inst.readonly = () => readonly(inst);
    // meta
    inst.describe = (description) => {
        const cl = inst.clone();
        globalRegistry.add(cl, { description });
        return cl;
    };
    Object.defineProperty(inst, "description", {
        get() {
            return globalRegistry.get(inst)?.description;
        },
        configurable: true,
    });
    inst.meta = (...args) => {
        if (args.length === 0) {
            return globalRegistry.get(inst);
        }
        const cl = inst.clone();
        globalRegistry.add(cl, args[0]);
        return cl;
    };
    // helpers
    inst.isOptional = () => inst.safeParse(undefined).success;
    inst.isNullable = () => inst.safeParse(null).success;
    return inst;
});
/** @internal */
const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
    $ZodString.init(inst, def);
    ZodType.init(inst, def);
    const bag = inst._zod.bag;
    inst.format = bag.format ?? null;
    inst.minLength = bag.minimum ?? null;
    inst.maxLength = bag.maximum ?? null;
    // validations
    inst.regex = (...args) => inst.check(_regex(...args));
    inst.includes = (...args) => inst.check(_includes(...args));
    inst.startsWith = (...args) => inst.check(_startsWith(...args));
    inst.endsWith = (...args) => inst.check(_endsWith(...args));
    inst.min = (...args) => inst.check(_minLength(...args));
    inst.max = (...args) => inst.check(_maxLength(...args));
    inst.length = (...args) => inst.check(_length(...args));
    inst.nonempty = (...args) => inst.check(_minLength(1, ...args));
    inst.lowercase = (params) => inst.check(_lowercase(params));
    inst.uppercase = (params) => inst.check(_uppercase(params));
    // transforms
    inst.trim = () => inst.check(_trim());
    inst.normalize = (...args) => inst.check(_normalize(...args));
    inst.toLowerCase = () => inst.check(_toLowerCase());
    inst.toUpperCase = () => inst.check(_toUpperCase());
});
const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
    $ZodString.init(inst, def);
    _ZodString.init(inst, def);
    inst.email = (params) => inst.check(_email(ZodEmail, params));
    inst.url = (params) => inst.check(_url(ZodURL, params));
    inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
    inst.emoji = (params) => inst.check(_emoji(ZodEmoji, params));
    inst.guid = (params) => inst.check(_guid(ZodGUID, params));
    inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
    inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
    inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
    inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
    inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
    inst.guid = (params) => inst.check(_guid(ZodGUID, params));
    inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
    inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
    inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
    inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
    inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
    inst.xid = (params) => inst.check(_xid(ZodXID, params));
    inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
    inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
    inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
    inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
    inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
    inst.e164 = (params) => inst.check(_e164(ZodE164, params));
    // iso
    inst.datetime = (params) => inst.check(datetime(params));
    inst.date = (params) => inst.check(date(params));
    inst.time = (params) => inst.check(time(params));
    inst.duration = (params) => inst.check(duration(params));
});
function string(params) {
    return _string(ZodString, params);
}
const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
    $ZodStringFormat.init(inst, def);
    _ZodString.init(inst, def);
});
const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodEmail.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodGUID.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodUUID.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodURL.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodEmoji.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodNanoID.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodCUID.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodCUID2.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodULID.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodXID.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodKSUID.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodIPv4.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodIPv6.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
    $ZodCIDRv4.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
    $ZodCIDRv6.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodBase64.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodBase64URL.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodE164.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
    // ZodStringFormat.init(inst, def);
    $ZodJWT.init(inst, def);
    ZodStringFormat.init(inst, def);
});
const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
    $ZodNumber.init(inst, def);
    ZodType.init(inst, def);
    inst.gt = (value, params) => inst.check(_gt(value, params));
    inst.gte = (value, params) => inst.check(_gte(value, params));
    inst.min = (value, params) => inst.check(_gte(value, params));
    inst.lt = (value, params) => inst.check(_lt(value, params));
    inst.lte = (value, params) => inst.check(_lte(value, params));
    inst.max = (value, params) => inst.check(_lte(value, params));
    inst.int = (params) => inst.check(int(params));
    inst.safe = (params) => inst.check(int(params));
    inst.positive = (params) => inst.check(_gt(0, params));
    inst.nonnegative = (params) => inst.check(_gte(0, params));
    inst.negative = (params) => inst.check(_lt(0, params));
    inst.nonpositive = (params) => inst.check(_lte(0, params));
    inst.multipleOf = (value, params) => inst.check(_multipleOf(value, params));
    inst.step = (value, params) => inst.check(_multipleOf(value, params));
    // inst.finite = (params) => inst.check(core.finite(params));
    inst.finite = () => inst;
    const bag = inst._zod.bag;
    inst.minValue =
        Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
    inst.maxValue =
        Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
    inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? 0.5);
    inst.isFinite = true;
    inst.format = bag.format ?? null;
});
function number(params) {
    return _number(ZodNumber, params);
}
const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
    $ZodNumberFormat.init(inst, def);
    ZodNumber.init(inst, def);
});
function int(params) {
    return _int(ZodNumberFormat, params);
}
const ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
    $ZodBoolean.init(inst, def);
    ZodType.init(inst, def);
});
function boolean(params) {
    return _boolean(ZodBoolean, params);
}
const ZodAny = /*@__PURE__*/ $constructor("ZodAny", (inst, def) => {
    $ZodAny.init(inst, def);
    ZodType.init(inst, def);
});
function any() {
    return _any(ZodAny);
}
const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
    $ZodUnknown.init(inst, def);
    ZodType.init(inst, def);
});
function unknown() {
    return _unknown(ZodUnknown);
}
const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
    $ZodNever.init(inst, def);
    ZodType.init(inst, def);
});
function never(params) {
    return _never(ZodNever, params);
}
const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
    $ZodArray.init(inst, def);
    ZodType.init(inst, def);
    inst.element = def.element;
    inst.min = (minLength, params) => inst.check(_minLength(minLength, params));
    inst.nonempty = (params) => inst.check(_minLength(1, params));
    inst.max = (maxLength, params) => inst.check(_maxLength(maxLength, params));
    inst.length = (len, params) => inst.check(_length(len, params));
    inst.unwrap = () => inst.element;
});
function array(element, params) {
    return _array(ZodArray, element, params);
}
const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
    $ZodObject.init(inst, def);
    ZodType.init(inst, def);
    defineLazy(inst, "shape", () => def.shape);
    inst.keyof = () => _enum(Object.keys(inst._zod.def.shape));
    inst.catchall = (catchall) => inst.clone({ ...inst._zod.def, catchall: catchall });
    inst.passthrough = () => inst.clone({ ...inst._zod.def, catchall: unknown() });
    // inst.nonstrict = () => inst.clone({ ...inst._zod.def, catchall: api.unknown() });
    inst.loose = () => inst.clone({ ...inst._zod.def, catchall: unknown() });
    inst.strict = () => inst.clone({ ...inst._zod.def, catchall: never() });
    inst.strip = () => inst.clone({ ...inst._zod.def, catchall: undefined });
    inst.extend = (incoming) => {
        return extend(inst, incoming);
    };
    inst.merge = (other) => merge(inst, other);
    inst.pick = (mask) => pick(inst, mask);
    inst.omit = (mask) => omit(inst, mask);
    inst.partial = (...args) => partial(ZodOptional, inst, args[0]);
    inst.required = (...args) => required(ZodNonOptional, inst, args[0]);
});
function object(shape, params) {
    const def = {
        type: "object",
        get shape() {
            assignProp(this, "shape", { ...shape });
            return this.shape;
        },
        ...normalizeParams(params),
    };
    return new ZodObject(def);
}
const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
    $ZodUnion.init(inst, def);
    ZodType.init(inst, def);
    inst.options = def.options;
});
function union(options, params) {
    return new ZodUnion({
        type: "union",
        options: options,
        ...normalizeParams(params),
    });
}
const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
    $ZodIntersection.init(inst, def);
    ZodType.init(inst, def);
});
function intersection(left, right) {
    return new ZodIntersection({
        type: "intersection",
        left: left,
        right: right,
    });
}
const ZodRecord = /*@__PURE__*/ $constructor("ZodRecord", (inst, def) => {
    $ZodRecord.init(inst, def);
    ZodType.init(inst, def);
    inst.keyType = def.keyType;
    inst.valueType = def.valueType;
});
function record(keyType, valueType, params) {
    return new ZodRecord({
        type: "record",
        keyType,
        valueType: valueType,
        ...normalizeParams(params),
    });
}
const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
    $ZodEnum.init(inst, def);
    ZodType.init(inst, def);
    inst.enum = def.entries;
    inst.options = Object.values(def.entries);
    const keys = new Set(Object.keys(def.entries));
    inst.extract = (values, params) => {
        const newEntries = {};
        for (const value of values) {
            if (keys.has(value)) {
                newEntries[value] = def.entries[value];
            }
            else
                throw new Error(`Key ${value} not found in enum`);
        }
        return new ZodEnum({
            ...def,
            checks: [],
            ...normalizeParams(params),
            entries: newEntries,
        });
    };
    inst.exclude = (values, params) => {
        const newEntries = { ...def.entries };
        for (const value of values) {
            if (keys.has(value)) {
                delete newEntries[value];
            }
            else
                throw new Error(`Key ${value} not found in enum`);
        }
        return new ZodEnum({
            ...def,
            checks: [],
            ...normalizeParams(params),
            entries: newEntries,
        });
    };
});
function _enum(values, params) {
    const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
    return new ZodEnum({
        type: "enum",
        entries,
        ...normalizeParams(params),
    });
}
const ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
    $ZodLiteral.init(inst, def);
    ZodType.init(inst, def);
    inst.values = new Set(def.values);
    Object.defineProperty(inst, "value", {
        get() {
            if (def.values.length > 1) {
                throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
            }
            return def.values[0];
        },
    });
});
function literal(value, params) {
    return new ZodLiteral({
        type: "literal",
        values: Array.isArray(value) ? value : [value],
        ...normalizeParams(params),
    });
}
const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
    $ZodTransform.init(inst, def);
    ZodType.init(inst, def);
    inst._zod.parse = (payload, _ctx) => {
        payload.addIssue = (issue$1) => {
            if (typeof issue$1 === "string") {
                payload.issues.push(issue(issue$1, payload.value, def));
            }
            else {
                // for Zod 3 backwards compatibility
                const _issue = issue$1;
                if (_issue.fatal)
                    _issue.continue = false;
                _issue.code ?? (_issue.code = "custom");
                _issue.input ?? (_issue.input = payload.value);
                _issue.inst ?? (_issue.inst = inst);
                _issue.continue ?? (_issue.continue = true);
                payload.issues.push(issue(_issue));
            }
        };
        const output = def.transform(payload.value, payload);
        if (output instanceof Promise) {
            return output.then((output) => {
                payload.value = output;
                return payload;
            });
        }
        payload.value = output;
        return payload;
    };
});
function transform(fn) {
    return new ZodTransform({
        type: "transform",
        transform: fn,
    });
}
const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
    $ZodOptional.init(inst, def);
    ZodType.init(inst, def);
    inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
    return new ZodOptional({
        type: "optional",
        innerType: innerType,
    });
}
const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
    $ZodNullable.init(inst, def);
    ZodType.init(inst, def);
    inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
    return new ZodNullable({
        type: "nullable",
        innerType: innerType,
    });
}
const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
    $ZodDefault.init(inst, def);
    ZodType.init(inst, def);
    inst.unwrap = () => inst._zod.def.innerType;
    inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
    return new ZodDefault({
        type: "default",
        innerType: innerType,
        get defaultValue() {
            return typeof defaultValue === "function" ? defaultValue() : defaultValue;
        },
    });
}
const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
    $ZodPrefault.init(inst, def);
    ZodType.init(inst, def);
    inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
    return new ZodPrefault({
        type: "prefault",
        innerType: innerType,
        get defaultValue() {
            return typeof defaultValue === "function" ? defaultValue() : defaultValue;
        },
    });
}
const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
    $ZodNonOptional.init(inst, def);
    ZodType.init(inst, def);
    inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
    return new ZodNonOptional({
        type: "nonoptional",
        innerType: innerType,
        ...normalizeParams(params),
    });
}
const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
    $ZodCatch.init(inst, def);
    ZodType.init(inst, def);
    inst.unwrap = () => inst._zod.def.innerType;
    inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
    return new ZodCatch({
        type: "catch",
        innerType: innerType,
        catchValue: (typeof catchValue === "function" ? catchValue : () => catchValue),
    });
}
const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
    $ZodPipe.init(inst, def);
    ZodType.init(inst, def);
    inst.in = def.in;
    inst.out = def.out;
});
function pipe(in_, out) {
    return new ZodPipe({
        type: "pipe",
        in: in_,
        out: out,
        // ...util.normalizeParams(params),
    });
}
const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
    $ZodReadonly.init(inst, def);
    ZodType.init(inst, def);
});
function readonly(innerType) {
    return new ZodReadonly({
        type: "readonly",
        innerType: innerType,
    });
}
const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
    $ZodCustom.init(inst, def);
    ZodType.init(inst, def);
});
// custom checks
function check(fn) {
    const ch = new $ZodCheck({
        check: "custom",
        // ...util.normalizeParams(params),
    });
    ch._zod.check = fn;
    return ch;
}
function refine(fn, _params = {}) {
    return _refine(ZodCustom, fn, _params);
}
// superRefine
function superRefine(fn) {
    const ch = check((payload) => {
        payload.addIssue = (issue$1) => {
            if (typeof issue$1 === "string") {
                payload.issues.push(issue(issue$1, payload.value, ch._zod.def));
            }
            else {
                // for Zod 3 backwards compatibility
                const _issue = issue$1;
                if (_issue.fatal)
                    _issue.continue = false;
                _issue.code ?? (_issue.code = "custom");
                _issue.input ?? (_issue.input = payload.value);
                _issue.inst ?? (_issue.inst = ch);
                _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
                payload.issues.push(issue(_issue));
            }
        };
        return fn(payload.value, payload);
    });
    return ch;
}

new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");

// src/combine-headers.ts
function combineHeaders$1(...headers) {
  return headers.reduce(
    (combinedHeaders, currentHeaders) => ({
      ...combinedHeaders,
      ...currentHeaders != null ? currentHeaders : {}
    }),
    {}
  );
}

// src/extract-response-headers.ts
function extractResponseHeaders$1(response) {
  return Object.fromEntries([...response.headers]);
}
var createIdGenerator$1 = ({
  prefix,
  size = 16,
  alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  separator = "-"
} = {}) => {
  const generator = () => {
    const alphabetLength = alphabet.length;
    const chars = new Array(size);
    for (let i = 0; i < size; i++) {
      chars[i] = alphabet[Math.random() * alphabetLength | 0];
    }
    return chars.join("");
  };
  if (prefix == null) {
    return generator;
  }
  if (alphabet.includes(separator)) {
    throw new InvalidArgumentError$1({
      argument: "separator",
      message: `The separator "${separator}" must not be part of the alphabet "${alphabet}".`
    });
  }
  return () => `${prefix}${separator}${generator()}`;
};
var generateId$1 = createIdGenerator$1();

// src/is-abort-error.ts
function isAbortError$1(error) {
  return (error instanceof Error || error instanceof DOMException) && (error.name === "AbortError" || error.name === "ResponseAborted" || // Next.js
  error.name === "TimeoutError");
}

// src/handle-fetch-error.ts
var FETCH_FAILED_ERROR_MESSAGES$1 = ["fetch failed", "failed to fetch"];
function handleFetchError$1({
  error,
  url,
  requestBodyValues
}) {
  if (isAbortError$1(error)) {
    return error;
  }
  if (error instanceof TypeError && FETCH_FAILED_ERROR_MESSAGES$1.includes(error.message.toLowerCase())) {
    const cause = error.cause;
    if (cause != null) {
      return new APICallError$1({
        message: `Cannot connect to API: ${cause.message}`,
        cause,
        url,
        requestBodyValues,
        isRetryable: true
        // retry when network error
      });
    }
  }
  return error;
}

// src/remove-undefined-entries.ts
function removeUndefinedEntries$1(record) {
  return Object.fromEntries(
    Object.entries(record).filter(([_key, value]) => value != null)
  );
}
function loadApiKey$1({
  apiKey,
  environmentVariableName,
  apiKeyParameterName = "apiKey",
  description
}) {
  if (typeof apiKey === "string") {
    return apiKey;
  }
  if (apiKey != null) {
    throw new LoadAPIKeyError$1({
      message: `${description} API key must be a string.`
    });
  }
  if (typeof process === "undefined") {
    throw new LoadAPIKeyError$1({
      message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter. Environment variables is not supported in this environment.`
    });
  }
  apiKey = process.env[environmentVariableName];
  if (apiKey == null) {
    throw new LoadAPIKeyError$1({
      message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter or the ${environmentVariableName} environment variable.`
    });
  }
  if (typeof apiKey !== "string") {
    throw new LoadAPIKeyError$1({
      message: `${description} API key must be a string. The value of the ${environmentVariableName} environment variable is not a string.`
    });
  }
  return apiKey;
}

// src/secure-json-parse.ts
var suspectProtoRx$1 = /"__proto__"\s*:/;
var suspectConstructorRx$1 = /"constructor"\s*:/;
function _parse$1(text) {
  const obj = JSON.parse(text);
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (suspectProtoRx$1.test(text) === false && suspectConstructorRx$1.test(text) === false) {
    return obj;
  }
  return filter$1(obj);
}
function filter$1(obj) {
  let next = [obj];
  while (next.length) {
    const nodes = next;
    next = [];
    for (const node of nodes) {
      if (Object.prototype.hasOwnProperty.call(node, "__proto__")) {
        throw new SyntaxError("Object contains forbidden prototype property");
      }
      if (Object.prototype.hasOwnProperty.call(node, "constructor") && Object.prototype.hasOwnProperty.call(node.constructor, "prototype")) {
        throw new SyntaxError("Object contains forbidden prototype property");
      }
      for (const key in node) {
        const value = node[key];
        if (value && typeof value === "object") {
          next.push(value);
        }
      }
    }
  }
  return obj;
}
function secureJsonParse$1(text) {
  const { stackTraceLimit } = Error;
  Error.stackTraceLimit = 0;
  try {
    return _parse$1(text);
  } finally {
    Error.stackTraceLimit = stackTraceLimit;
  }
}
var validatorSymbol$1 = Symbol.for("vercel.ai.validator");
function validator$1(validate) {
  return { [validatorSymbol$1]: true, validate };
}
function isValidator$1(value) {
  return typeof value === "object" && value !== null && validatorSymbol$1 in value && value[validatorSymbol$1] === true && "validate" in value;
}
function asValidator$1(value) {
  return isValidator$1(value) ? value : standardSchemaValidator$1(value);
}
function standardSchemaValidator$1(standardSchema) {
  return validator$1(async (value) => {
    const result = await standardSchema["~standard"].validate(value);
    return result.issues == null ? { success: true, value: result.value } : {
      success: false,
      error: new TypeValidationError$1({
        value,
        cause: result.issues
      })
    };
  });
}

// src/validate-types.ts
async function validateTypes$1({
  value,
  schema
}) {
  const result = await safeValidateTypes$1({ value, schema });
  if (!result.success) {
    throw TypeValidationError$1.wrap({ value, cause: result.error });
  }
  return result.value;
}
async function safeValidateTypes$1({
  value,
  schema
}) {
  const validator2 = asValidator$1(schema);
  try {
    if (validator2.validate == null) {
      return { success: true, value, rawValue: value };
    }
    const result = await validator2.validate(value);
    if (result.success) {
      return { success: true, value: result.value, rawValue: value };
    }
    return {
      success: false,
      error: TypeValidationError$1.wrap({ value, cause: result.error }),
      rawValue: value
    };
  } catch (error) {
    return {
      success: false,
      error: TypeValidationError$1.wrap({ value, cause: error }),
      rawValue: value
    };
  }
}

// src/parse-json.ts
async function parseJSON$1({
  text,
  schema
}) {
  try {
    const value = secureJsonParse$1(text);
    if (schema == null) {
      return value;
    }
    return validateTypes$1({ value, schema });
  } catch (error) {
    if (JSONParseError$1.isInstance(error) || TypeValidationError$1.isInstance(error)) {
      throw error;
    }
    throw new JSONParseError$1({ text, cause: error });
  }
}
async function safeParseJSON$1({
  text,
  schema
}) {
  try {
    const value = secureJsonParse$1(text);
    if (schema == null) {
      return { success: true, value, rawValue: value };
    }
    return await safeValidateTypes$1({ value, schema });
  } catch (error) {
    return {
      success: false,
      error: JSONParseError$1.isInstance(error) ? error : new JSONParseError$1({ text, cause: error }),
      rawValue: void 0
    };
  }
}
function isParsableJson$1(input) {
  try {
    secureJsonParse$1(input);
    return true;
  } catch (e) {
    return false;
  }
}
function parseJsonEventStream$1({
  stream,
  schema
}) {
  return stream.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream$1()).pipeThrough(
    new TransformStream({
      async transform({ data }, controller) {
        if (data === "[DONE]") {
          return;
        }
        controller.enqueue(await safeParseJSON$1({ text: data, schema }));
      }
    })
  );
}
async function parseProviderOptions({
  provider,
  providerOptions,
  schema
}) {
  if ((providerOptions == null ? void 0 : providerOptions[provider]) == null) {
    return void 0;
  }
  const parsedProviderOptions = await safeValidateTypes$1({
    value: providerOptions[provider],
    schema
  });
  if (!parsedProviderOptions.success) {
    throw new InvalidArgumentError$1({
      argument: "providerOptions",
      message: `invalid ${provider} provider options`,
      cause: parsedProviderOptions.error
    });
  }
  return parsedProviderOptions.value;
}
var getOriginalFetch2$1 = () => globalThis.fetch;
var postJsonToApi$1 = async ({
  url,
  headers,
  body,
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
  fetch
}) => postToApi$1({
  url,
  headers: {
    "Content-Type": "application/json",
    ...headers
  },
  body: {
    content: JSON.stringify(body),
    values: body
  },
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
  fetch
});
var postFormDataToApi = async ({
  url,
  headers,
  formData,
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
  fetch
}) => postToApi$1({
  url,
  headers,
  body: {
    content: formData,
    values: Object.fromEntries(formData.entries())
  },
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
  fetch
});
var postToApi$1 = async ({
  url,
  headers = {},
  body,
  successfulResponseHandler,
  failedResponseHandler,
  abortSignal,
  fetch = getOriginalFetch2$1()
}) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: removeUndefinedEntries$1(headers),
      body: body.content,
      signal: abortSignal
    });
    const responseHeaders = extractResponseHeaders$1(response);
    if (!response.ok) {
      let errorInformation;
      try {
        errorInformation = await failedResponseHandler({
          response,
          url,
          requestBodyValues: body.values
        });
      } catch (error) {
        if (isAbortError$1(error) || APICallError$1.isInstance(error)) {
          throw error;
        }
        throw new APICallError$1({
          message: "Failed to process error response",
          cause: error,
          statusCode: response.status,
          url,
          responseHeaders,
          requestBodyValues: body.values
        });
      }
      throw errorInformation.value;
    }
    try {
      return await successfulResponseHandler({
        response,
        url,
        requestBodyValues: body.values
      });
    } catch (error) {
      if (error instanceof Error) {
        if (isAbortError$1(error) || APICallError$1.isInstance(error)) {
          throw error;
        }
      }
      throw new APICallError$1({
        message: "Failed to process successful response",
        cause: error,
        statusCode: response.status,
        url,
        responseHeaders,
        requestBodyValues: body.values
      });
    }
  } catch (error) {
    throw handleFetchError$1({ error, url, requestBodyValues: body.values });
  }
};
var createJsonErrorResponseHandler$1 = ({
  errorSchema,
  errorToMessage,
  isRetryable
}) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const responseHeaders = extractResponseHeaders$1(response);
  if (responseBody.trim() === "") {
    return {
      responseHeaders,
      value: new APICallError$1({
        message: response.statusText,
        url,
        requestBodyValues,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        isRetryable: isRetryable == null ? void 0 : isRetryable(response)
      })
    };
  }
  try {
    const parsedError = await parseJSON$1({
      text: responseBody,
      schema: errorSchema
    });
    return {
      responseHeaders,
      value: new APICallError$1({
        message: errorToMessage(parsedError),
        url,
        requestBodyValues,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        data: parsedError,
        isRetryable: isRetryable == null ? void 0 : isRetryable(response, parsedError)
      })
    };
  } catch (parseError) {
    return {
      responseHeaders,
      value: new APICallError$1({
        message: response.statusText,
        url,
        requestBodyValues,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        isRetryable: isRetryable == null ? void 0 : isRetryable(response)
      })
    };
  }
};
var createEventSourceResponseHandler$1 = (chunkSchema) => async ({ response }) => {
  const responseHeaders = extractResponseHeaders$1(response);
  if (response.body == null) {
    throw new EmptyResponseBodyError$1({});
  }
  return {
    responseHeaders,
    value: parseJsonEventStream$1({
      stream: response.body,
      schema: chunkSchema
    })
  };
};
var createJsonResponseHandler$1 = (responseSchema) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedResult = await safeParseJSON$1({
    text: responseBody,
    schema: responseSchema
  });
  const responseHeaders = extractResponseHeaders$1(response);
  if (!parsedResult.success) {
    throw new APICallError$1({
      message: "Invalid JSON response",
      cause: parsedResult.error,
      statusCode: response.status,
      responseHeaders,
      responseBody,
      url,
      requestBodyValues
    });
  }
  return {
    responseHeaders,
    value: parsedResult.value,
    rawValue: parsedResult.rawValue
  };
};
var createBinaryResponseHandler = () => async ({ response, url, requestBodyValues }) => {
  const responseHeaders = extractResponseHeaders$1(response);
  if (!response.body) {
    throw new APICallError$1({
      message: "Response body is empty",
      url,
      requestBodyValues,
      statusCode: response.status,
      responseHeaders,
      responseBody: void 0
    });
  }
  try {
    const buffer = await response.arrayBuffer();
    return {
      responseHeaders,
      value: new Uint8Array(buffer)
    };
  } catch (error) {
    throw new APICallError$1({
      message: "Failed to read response as array buffer",
      url,
      requestBodyValues,
      statusCode: response.status,
      responseHeaders,
      responseBody: void 0,
      cause: error
    });
  }
};
var createStatusCodeErrorResponseHandler = () => async ({ response, url, requestBodyValues }) => {
  const responseHeaders = extractResponseHeaders$1(response);
  const responseBody = await response.text();
  return {
    responseHeaders,
    value: new APICallError$1({
      message: response.statusText,
      url,
      requestBodyValues,
      statusCode: response.status,
      responseHeaders,
      responseBody
    })
  };
};

// src/uint8-utils.ts
var { btoa: btoa$1, atob: atob$1 } = globalThis;
function convertBase64ToUint8Array(base64String) {
  const base64Url = base64String.replace(/-/g, "+").replace(/_/g, "/");
  const latin1string = atob$1(base64Url);
  return Uint8Array.from(latin1string, (byte) => byte.codePointAt(0));
}
function convertUint8ArrayToBase64$1(array) {
  let latin1string = "";
  for (let i = 0; i < array.length; i++) {
    latin1string += String.fromCodePoint(array[i]);
  }
  return btoa$1(latin1string);
}

// src/without-trailing-slash.ts
function withoutTrailingSlash$1(url) {
  return url == null ? void 0 : url.replace(/\/$/, "");
}

// src/openai-compatible-chat-language-model.ts
function getOpenAIMetadata(message) {
  var _a, _b;
  return (_b = (_a = message == null ? void 0 : message.providerOptions) == null ? void 0 : _a.openaiCompatible) != null ? _b : {};
}
function convertToOpenAICompatibleChatMessages(prompt) {
  const messages = [];
  for (const { role, content, ...message } of prompt) {
    const metadata = getOpenAIMetadata({ ...message });
    switch (role) {
      case "system": {
        messages.push({ role: "system", content, ...metadata });
        break;
      }
      case "user": {
        if (content.length === 1 && content[0].type === "text") {
          messages.push({
            role: "user",
            content: content[0].text,
            ...getOpenAIMetadata(content[0])
          });
          break;
        }
        messages.push({
          role: "user",
          content: content.map((part) => {
            const partMetadata = getOpenAIMetadata(part);
            switch (part.type) {
              case "text": {
                return { type: "text", text: part.text, ...partMetadata };
              }
              case "file": {
                if (part.mediaType.startsWith("image/")) {
                  const mediaType = part.mediaType === "image/*" ? "image/jpeg" : part.mediaType;
                  return {
                    type: "image_url",
                    image_url: {
                      url: part.data instanceof URL ? part.data.toString() : `data:${mediaType};base64,${part.data}`
                    },
                    ...partMetadata
                  };
                } else {
                  throw new UnsupportedFunctionalityError$1({
                    functionality: `file part media type ${part.mediaType}`
                  });
                }
              }
            }
          }),
          ...metadata
        });
        break;
      }
      case "assistant": {
        let text = "";
        const toolCalls = [];
        for (const part of content) {
          const partMetadata = getOpenAIMetadata(part);
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
                },
                ...partMetadata
              });
              break;
            }
          }
        }
        messages.push({
          role: "assistant",
          content: text,
          tool_calls: toolCalls.length > 0 ? toolCalls : void 0,
          ...metadata
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
          const toolResponseMetadata = getOpenAIMetadata(toolResponse);
          messages.push({
            role: "tool",
            tool_call_id: toolResponse.toolCallId,
            content: contentValue,
            ...toolResponseMetadata
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
function getResponseMetadata$2({
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

// src/map-openai-compatible-finish-reason.ts
function mapOpenAICompatibleFinishReason(finishReason) {
  switch (finishReason) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "content_filter":
      return "content-filter";
    case "function_call":
    case "tool_calls":
      return "tool-calls";
    default:
      return "unknown";
  }
}
var openaiCompatibleProviderOptions = object({
  /**
   * A unique identifier representing your end-user, which can help the provider to
   * monitor and detect abuse.
   */
  user: string().optional(),
  /**
   * Reasoning effort for reasoning models. Defaults to `medium`.
   */
  reasoningEffort: string().optional()
});
var openaiCompatibleErrorDataSchema = object({
  error: object({
    message: string(),
    // The additional information below is handled loosely to support
    // OpenAI-compatible providers that have slightly different error
    // responses:
    type: string().nullish(),
    param: any().nullish(),
    code: union([string(), number()]).nullish()
  })
});
var defaultOpenAICompatibleErrorStructure = {
  errorSchema: openaiCompatibleErrorDataSchema,
  errorToMessage: (data) => data.error.message
};
function prepareTools$1({
  tools,
  toolChoice
}) {
  tools = (tools == null ? void 0 : tools.length) ? tools : void 0;
  const toolWarnings = [];
  if (tools == null) {
    return { tools: void 0, toolChoice: void 0, toolWarnings };
  }
  const openaiCompatTools = [];
  for (const tool of tools) {
    if (tool.type === "provider-defined") {
      toolWarnings.push({ type: "unsupported-tool", tool });
    } else {
      openaiCompatTools.push({
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
    return { tools: openaiCompatTools, toolChoice: void 0, toolWarnings };
  }
  const type = toolChoice.type;
  switch (type) {
    case "auto":
    case "none":
    case "required":
      return { tools: openaiCompatTools, toolChoice: type, toolWarnings };
    case "tool":
      return {
        tools: openaiCompatTools,
        toolChoice: {
          type: "function",
          function: { name: toolChoice.toolName }
        },
        toolWarnings
      };
    default: {
      const _exhaustiveCheck = type;
      throw new UnsupportedFunctionalityError$1({
        functionality: `tool choice type: ${_exhaustiveCheck}`
      });
    }
  }
}

// src/openai-compatible-chat-language-model.ts
var OpenAICompatibleChatLanguageModel = class {
  // type inferred via constructor
  constructor(modelId, config) {
    this.specificationVersion = "v2";
    var _a, _b;
    this.modelId = modelId;
    this.config = config;
    const errorStructure = (_a = config.errorStructure) != null ? _a : defaultOpenAICompatibleErrorStructure;
    this.chunkSchema = createOpenAICompatibleChatChunkSchema(
      errorStructure.errorSchema
    );
    this.failedResponseHandler = createJsonErrorResponseHandler$1(errorStructure);
    this.supportsStructuredOutputs = (_b = config.supportsStructuredOutputs) != null ? _b : false;
  }
  get provider() {
    return this.config.provider;
  }
  get providerOptionsName() {
    return this.config.provider.split(".")[0].trim();
  }
  get supportedUrls() {
    var _a, _b, _c;
    return (_c = (_b = (_a = this.config).supportedUrls) == null ? void 0 : _b.call(_a)) != null ? _c : {};
  }
  async getArgs({
    prompt,
    maxOutputTokens,
    temperature,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
    providerOptions,
    stopSequences,
    responseFormat,
    seed,
    toolChoice,
    tools
  }) {
    var _a, _b, _c;
    const warnings = [];
    const compatibleOptions = Object.assign(
      (_a = await parseProviderOptions({
        provider: "openai-compatible",
        providerOptions,
        schema: openaiCompatibleProviderOptions
      })) != null ? _a : {},
      (_b = await parseProviderOptions({
        provider: this.providerOptionsName,
        providerOptions,
        schema: openaiCompatibleProviderOptions
      })) != null ? _b : {}
    );
    if (topK != null) {
      warnings.push({ type: "unsupported-setting", setting: "topK" });
    }
    if ((responseFormat == null ? void 0 : responseFormat.type) === "json" && responseFormat.schema != null && !this.supportsStructuredOutputs) {
      warnings.push({
        type: "unsupported-setting",
        setting: "responseFormat",
        details: "JSON response format schema is only supported with structuredOutputs"
      });
    }
    const {
      tools: openaiTools,
      toolChoice: openaiToolChoice,
      toolWarnings
    } = prepareTools$1({
      tools,
      toolChoice
    });
    return {
      args: {
        // model id:
        model: this.modelId,
        // model specific settings:
        user: compatibleOptions.user,
        // standardized settings:
        max_tokens: maxOutputTokens,
        temperature,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        response_format: (responseFormat == null ? void 0 : responseFormat.type) === "json" ? this.supportsStructuredOutputs === true && responseFormat.schema != null ? {
          type: "json_schema",
          json_schema: {
            schema: responseFormat.schema,
            name: (_c = responseFormat.name) != null ? _c : "response",
            description: responseFormat.description
          }
        } : { type: "json_object" } : void 0,
        stop: stopSequences,
        seed,
        ...providerOptions == null ? void 0 : providerOptions[this.providerOptionsName],
        reasoning_effort: compatibleOptions.reasoningEffort,
        // messages:
        messages: convertToOpenAICompatibleChatMessages(prompt),
        // tools:
        tools: openaiTools,
        tool_choice: openaiToolChoice
      },
      warnings: [...warnings, ...toolWarnings]
    };
  }
  async doGenerate(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
    const { args, warnings } = await this.getArgs({ ...options });
    const body = JSON.stringify(args);
    const {
      responseHeaders,
      value: responseBody,
      rawValue: rawResponse
    } = await postJsonToApi$1({
      url: this.config.url({
        path: "/chat/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders$1(this.config.headers(), options.headers),
      body: args,
      failedResponseHandler: this.failedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler$1(
        OpenAICompatibleChatResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const choice = responseBody.choices[0];
    const content = [];
    const text = choice.message.content;
    if (text != null && text.length > 0) {
      content.push({ type: "text", text });
    }
    const reasoning = choice.message.reasoning_content;
    if (reasoning != null && reasoning.length > 0) {
      content.push({
        type: "reasoning",
        text: reasoning
      });
    }
    if (choice.message.tool_calls != null) {
      for (const toolCall of choice.message.tool_calls) {
        content.push({
          type: "tool-call",
          toolCallId: (_a = toolCall.id) != null ? _a : generateId$1(),
          toolName: toolCall.function.name,
          input: toolCall.function.arguments
        });
      }
    }
    const providerMetadata = {
      [this.providerOptionsName]: {},
      ...await ((_c = (_b = this.config.metadataExtractor) == null ? void 0 : _b.extractMetadata) == null ? void 0 : _c.call(_b, {
        parsedBody: rawResponse
      }))
    };
    const completionTokenDetails = (_d = responseBody.usage) == null ? void 0 : _d.completion_tokens_details;
    if ((completionTokenDetails == null ? void 0 : completionTokenDetails.accepted_prediction_tokens) != null) {
      providerMetadata[this.providerOptionsName].acceptedPredictionTokens = completionTokenDetails == null ? void 0 : completionTokenDetails.accepted_prediction_tokens;
    }
    if ((completionTokenDetails == null ? void 0 : completionTokenDetails.rejected_prediction_tokens) != null) {
      providerMetadata[this.providerOptionsName].rejectedPredictionTokens = completionTokenDetails == null ? void 0 : completionTokenDetails.rejected_prediction_tokens;
    }
    return {
      content,
      finishReason: mapOpenAICompatibleFinishReason(choice.finish_reason),
      usage: {
        inputTokens: (_f = (_e = responseBody.usage) == null ? void 0 : _e.prompt_tokens) != null ? _f : void 0,
        outputTokens: (_h = (_g = responseBody.usage) == null ? void 0 : _g.completion_tokens) != null ? _h : void 0,
        totalTokens: (_j = (_i = responseBody.usage) == null ? void 0 : _i.total_tokens) != null ? _j : void 0,
        reasoningTokens: (_m = (_l = (_k = responseBody.usage) == null ? void 0 : _k.completion_tokens_details) == null ? void 0 : _l.reasoning_tokens) != null ? _m : void 0,
        cachedInputTokens: (_p = (_o = (_n = responseBody.usage) == null ? void 0 : _n.prompt_tokens_details) == null ? void 0 : _o.cached_tokens) != null ? _p : void 0
      },
      providerMetadata,
      request: { body },
      response: {
        ...getResponseMetadata$2(responseBody),
        headers: responseHeaders,
        body: rawResponse
      },
      warnings
    };
  }
  async doStream(options) {
    var _a;
    const { args, warnings } = await this.getArgs({ ...options });
    const body = {
      ...args,
      stream: true,
      // only include stream_options when in strict compatibility mode:
      stream_options: this.config.includeUsage ? { include_usage: true } : void 0
    };
    const metadataExtractor = (_a = this.config.metadataExtractor) == null ? void 0 : _a.createStreamExtractor();
    const { responseHeaders, value: response } = await postJsonToApi$1({
      url: this.config.url({
        path: "/chat/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders$1(this.config.headers(), options.headers),
      body,
      failedResponseHandler: this.failedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler$1(
        this.chunkSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const toolCalls = [];
    let finishReason = "unknown";
    const usage = {
      completionTokens: void 0,
      completionTokensDetails: {
        reasoningTokens: void 0,
        acceptedPredictionTokens: void 0,
        rejectedPredictionTokens: void 0
      },
      promptTokens: void 0,
      promptTokensDetails: {
        cachedTokens: void 0
      },
      totalTokens: void 0
    };
    let isFirstChunk = true;
    const providerOptionsName = this.providerOptionsName;
    let isActiveReasoning = false;
    let isActiveText = false;
    return {
      stream: response.pipeThrough(
        new TransformStream({
          start(controller) {
            controller.enqueue({ type: "stream-start", warnings });
          },
          // TODO we lost type safety on Chunk, most likely due to the error schema. MUST FIX
          transform(chunk, controller) {
            var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
            if (options.includeRawChunks) {
              controller.enqueue({ type: "raw", rawValue: chunk.rawValue });
            }
            if (!chunk.success) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            metadataExtractor == null ? void 0 : metadataExtractor.processChunk(chunk.rawValue);
            if ("error" in value) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: value.error.message });
              return;
            }
            if (isFirstChunk) {
              isFirstChunk = false;
              controller.enqueue({
                type: "response-metadata",
                ...getResponseMetadata$2(value)
              });
            }
            if (value.usage != null) {
              const {
                prompt_tokens,
                completion_tokens,
                total_tokens,
                prompt_tokens_details,
                completion_tokens_details
              } = value.usage;
              usage.promptTokens = prompt_tokens != null ? prompt_tokens : void 0;
              usage.completionTokens = completion_tokens != null ? completion_tokens : void 0;
              usage.totalTokens = total_tokens != null ? total_tokens : void 0;
              if ((completion_tokens_details == null ? void 0 : completion_tokens_details.reasoning_tokens) != null) {
                usage.completionTokensDetails.reasoningTokens = completion_tokens_details == null ? void 0 : completion_tokens_details.reasoning_tokens;
              }
              if ((completion_tokens_details == null ? void 0 : completion_tokens_details.accepted_prediction_tokens) != null) {
                usage.completionTokensDetails.acceptedPredictionTokens = completion_tokens_details == null ? void 0 : completion_tokens_details.accepted_prediction_tokens;
              }
              if ((completion_tokens_details == null ? void 0 : completion_tokens_details.rejected_prediction_tokens) != null) {
                usage.completionTokensDetails.rejectedPredictionTokens = completion_tokens_details == null ? void 0 : completion_tokens_details.rejected_prediction_tokens;
              }
              if ((prompt_tokens_details == null ? void 0 : prompt_tokens_details.cached_tokens) != null) {
                usage.promptTokensDetails.cachedTokens = prompt_tokens_details == null ? void 0 : prompt_tokens_details.cached_tokens;
              }
            }
            const choice = value.choices[0];
            if ((choice == null ? void 0 : choice.finish_reason) != null) {
              finishReason = mapOpenAICompatibleFinishReason(
                choice.finish_reason
              );
            }
            if ((choice == null ? void 0 : choice.delta) == null) {
              return;
            }
            const delta = choice.delta;
            if (delta.reasoning_content) {
              if (!isActiveReasoning) {
                controller.enqueue({
                  type: "reasoning-start",
                  id: "reasoning-0"
                });
                isActiveReasoning = true;
              }
              controller.enqueue({
                type: "reasoning-delta",
                id: "reasoning-0",
                delta: delta.reasoning_content
              });
            }
            if (delta.content) {
              if (!isActiveText) {
                controller.enqueue({ type: "text-start", id: "txt-0" });
                isActiveText = true;
              }
              controller.enqueue({
                type: "text-delta",
                id: "txt-0",
                delta: delta.content
              });
            }
            if (delta.tool_calls != null) {
              for (const toolCallDelta of delta.tool_calls) {
                const index = toolCallDelta.index;
                if (toolCalls[index] == null) {
                  if (toolCallDelta.id == null) {
                    throw new InvalidResponseDataError$1({
                      data: toolCallDelta,
                      message: `Expected 'id' to be a string.`
                    });
                  }
                  if (((_a2 = toolCallDelta.function) == null ? void 0 : _a2.name) == null) {
                    throw new InvalidResponseDataError$1({
                      data: toolCallDelta,
                      message: `Expected 'function.name' to be a string.`
                    });
                  }
                  controller.enqueue({
                    type: "tool-input-start",
                    id: toolCallDelta.id,
                    toolName: toolCallDelta.function.name
                  });
                  toolCalls[index] = {
                    id: toolCallDelta.id,
                    type: "function",
                    function: {
                      name: toolCallDelta.function.name,
                      arguments: (_b = toolCallDelta.function.arguments) != null ? _b : ""
                    },
                    hasFinished: false
                  };
                  const toolCall2 = toolCalls[index];
                  if (((_c = toolCall2.function) == null ? void 0 : _c.name) != null && ((_d = toolCall2.function) == null ? void 0 : _d.arguments) != null) {
                    if (toolCall2.function.arguments.length > 0) {
                      controller.enqueue({
                        type: "tool-input-start",
                        id: toolCall2.id,
                        toolName: toolCall2.function.name
                      });
                    }
                    if (isParsableJson$1(toolCall2.function.arguments)) {
                      controller.enqueue({
                        type: "tool-input-end",
                        id: toolCall2.id
                      });
                      controller.enqueue({
                        type: "tool-call",
                        toolCallId: (_e = toolCall2.id) != null ? _e : generateId$1(),
                        toolName: toolCall2.function.name,
                        input: toolCall2.function.arguments
                      });
                      toolCall2.hasFinished = true;
                    }
                  }
                  continue;
                }
                const toolCall = toolCalls[index];
                if (toolCall.hasFinished) {
                  continue;
                }
                if (((_f = toolCallDelta.function) == null ? void 0 : _f.arguments) != null) {
                  toolCall.function.arguments += (_h = (_g = toolCallDelta.function) == null ? void 0 : _g.arguments) != null ? _h : "";
                }
                controller.enqueue({
                  type: "tool-input-delta",
                  id: toolCall.id,
                  delta: (_i = toolCallDelta.function.arguments) != null ? _i : ""
                });
                if (((_j = toolCall.function) == null ? void 0 : _j.name) != null && ((_k = toolCall.function) == null ? void 0 : _k.arguments) != null && isParsableJson$1(toolCall.function.arguments)) {
                  controller.enqueue({
                    type: "tool-input-end",
                    id: toolCall.id
                  });
                  controller.enqueue({
                    type: "tool-call",
                    toolCallId: (_l = toolCall.id) != null ? _l : generateId$1(),
                    toolName: toolCall.function.name,
                    input: toolCall.function.arguments
                  });
                  toolCall.hasFinished = true;
                }
              }
            }
          },
          flush(controller) {
            var _a2, _b, _c, _d, _e, _f;
            if (isActiveReasoning) {
              controller.enqueue({ type: "reasoning-end", id: "reasoning-0" });
            }
            if (isActiveText) {
              controller.enqueue({ type: "text-end", id: "txt-0" });
            }
            for (const toolCall of toolCalls.filter(
              (toolCall2) => !toolCall2.hasFinished
            )) {
              controller.enqueue({
                type: "tool-input-end",
                id: toolCall.id
              });
              controller.enqueue({
                type: "tool-call",
                toolCallId: (_a2 = toolCall.id) != null ? _a2 : generateId$1(),
                toolName: toolCall.function.name,
                input: toolCall.function.arguments
              });
            }
            const providerMetadata = {
              [providerOptionsName]: {},
              ...metadataExtractor == null ? void 0 : metadataExtractor.buildMetadata()
            };
            if (usage.completionTokensDetails.acceptedPredictionTokens != null) {
              providerMetadata[providerOptionsName].acceptedPredictionTokens = usage.completionTokensDetails.acceptedPredictionTokens;
            }
            if (usage.completionTokensDetails.rejectedPredictionTokens != null) {
              providerMetadata[providerOptionsName].rejectedPredictionTokens = usage.completionTokensDetails.rejectedPredictionTokens;
            }
            controller.enqueue({
              type: "finish",
              finishReason,
              usage: {
                inputTokens: (_b = usage.promptTokens) != null ? _b : void 0,
                outputTokens: (_c = usage.completionTokens) != null ? _c : void 0,
                totalTokens: (_d = usage.totalTokens) != null ? _d : void 0,
                reasoningTokens: (_e = usage.completionTokensDetails.reasoningTokens) != null ? _e : void 0,
                cachedInputTokens: (_f = usage.promptTokensDetails.cachedTokens) != null ? _f : void 0
              },
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
var openaiCompatibleTokenUsageSchema = object({
  prompt_tokens: number().nullish(),
  completion_tokens: number().nullish(),
  total_tokens: number().nullish(),
  prompt_tokens_details: object({
    cached_tokens: number().nullish()
  }).nullish(),
  completion_tokens_details: object({
    reasoning_tokens: number().nullish(),
    accepted_prediction_tokens: number().nullish(),
    rejected_prediction_tokens: number().nullish()
  }).nullish()
}).nullish();
var OpenAICompatibleChatResponseSchema = object({
  id: string().nullish(),
  created: number().nullish(),
  model: string().nullish(),
  choices: array(
    object({
      message: object({
        role: literal("assistant").nullish(),
        content: string().nullish(),
        reasoning_content: string().nullish(),
        tool_calls: array(
          object({
            id: string().nullish(),
            function: object({
              name: string(),
              arguments: string()
            })
          })
        ).nullish()
      }),
      finish_reason: string().nullish()
    })
  ),
  usage: openaiCompatibleTokenUsageSchema
});
var createOpenAICompatibleChatChunkSchema = (errorSchema) => union([
  object({
    id: string().nullish(),
    created: number().nullish(),
    model: string().nullish(),
    choices: array(
      object({
        delta: object({
          role: _enum(["assistant"]).nullish(),
          content: string().nullish(),
          reasoning_content: string().nullish(),
          tool_calls: array(
            object({
              index: number(),
              id: string().nullish(),
              function: object({
                name: string().nullish(),
                arguments: string().nullish()
              })
            })
          ).nullish()
        }).nullish(),
        finish_reason: string().nullish()
      })
    ),
    usage: openaiCompatibleTokenUsageSchema
  }),
  errorSchema
]);
function convertToOpenAICompatibleCompletionPrompt({
  prompt,
  user = "user",
  assistant = "assistant"
}) {
  let text = "";
  if (prompt[0].role === "system") {
    text += `${prompt[0].content}

`;
    prompt = prompt.slice(1);
  }
  for (const { role, content } of prompt) {
    switch (role) {
      case "system": {
        throw new InvalidPromptError$1({
          message: "Unexpected system message in prompt: ${content}",
          prompt
        });
      }
      case "user": {
        const userMessage = content.map((part) => {
          switch (part.type) {
            case "text": {
              return part.text;
            }
          }
        }).filter(Boolean).join("");
        text += `${user}:
${userMessage}

`;
        break;
      }
      case "assistant": {
        const assistantMessage = content.map((part) => {
          switch (part.type) {
            case "text": {
              return part.text;
            }
            case "tool-call": {
              throw new UnsupportedFunctionalityError$1({
                functionality: "tool-call messages"
              });
            }
          }
        }).join("");
        text += `${assistant}:
${assistantMessage}

`;
        break;
      }
      case "tool": {
        throw new UnsupportedFunctionalityError$1({
          functionality: "tool messages"
        });
      }
      default: {
        const _exhaustiveCheck = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }
  text += `${assistant}:
`;
  return {
    prompt: text,
    stopSequences: [`
${user}:`]
  };
}
var openaiCompatibleCompletionProviderOptions = object({
  /**
   * Echo back the prompt in addition to the completion.
   */
  echo: boolean().optional(),
  /**
   * Modify the likelihood of specified tokens appearing in the completion.
   *
   * Accepts a JSON object that maps tokens (specified by their token ID in
   * the GPT tokenizer) to an associated bias value from -100 to 100.
   */
  logitBias: record(string(), number()).optional(),
  /**
   * The suffix that comes after a completion of inserted text.
   */
  suffix: string().optional(),
  /**
   * A unique identifier representing your end-user, which can help providers to
   * monitor and detect abuse.
   */
  user: string().optional()
});

// src/openai-compatible-completion-language-model.ts
var OpenAICompatibleCompletionLanguageModel = class {
  // type inferred via constructor
  constructor(modelId, config) {
    this.specificationVersion = "v2";
    var _a;
    this.modelId = modelId;
    this.config = config;
    const errorStructure = (_a = config.errorStructure) != null ? _a : defaultOpenAICompatibleErrorStructure;
    this.chunkSchema = createOpenAICompatibleCompletionChunkSchema(
      errorStructure.errorSchema
    );
    this.failedResponseHandler = createJsonErrorResponseHandler$1(errorStructure);
  }
  get provider() {
    return this.config.provider;
  }
  get providerOptionsName() {
    return this.config.provider.split(".")[0].trim();
  }
  get supportedUrls() {
    var _a, _b, _c;
    return (_c = (_b = (_a = this.config).supportedUrls) == null ? void 0 : _b.call(_a)) != null ? _c : {};
  }
  async getArgs({
    prompt,
    maxOutputTokens,
    temperature,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
    stopSequences: userStopSequences,
    responseFormat,
    seed,
    providerOptions,
    tools,
    toolChoice
  }) {
    var _a;
    const warnings = [];
    const completionOptions = (_a = await parseProviderOptions({
      provider: this.providerOptionsName,
      providerOptions,
      schema: openaiCompatibleCompletionProviderOptions
    })) != null ? _a : {};
    if (topK != null) {
      warnings.push({ type: "unsupported-setting", setting: "topK" });
    }
    if (tools == null ? void 0 : tools.length) {
      warnings.push({ type: "unsupported-setting", setting: "tools" });
    }
    if (toolChoice != null) {
      warnings.push({ type: "unsupported-setting", setting: "toolChoice" });
    }
    if (responseFormat != null && responseFormat.type !== "text") {
      warnings.push({
        type: "unsupported-setting",
        setting: "responseFormat",
        details: "JSON response format is not supported."
      });
    }
    const { prompt: completionPrompt, stopSequences } = convertToOpenAICompatibleCompletionPrompt({ prompt });
    const stop = [...stopSequences != null ? stopSequences : [], ...userStopSequences != null ? userStopSequences : []];
    return {
      args: {
        // model id:
        model: this.modelId,
        // model specific settings:
        echo: completionOptions.echo,
        logit_bias: completionOptions.logitBias,
        suffix: completionOptions.suffix,
        user: completionOptions.user,
        // standardized settings:
        max_tokens: maxOutputTokens,
        temperature,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        seed,
        ...providerOptions == null ? void 0 : providerOptions[this.providerOptionsName],
        // prompt:
        prompt: completionPrompt,
        // stop sequences:
        stop: stop.length > 0 ? stop : void 0
      },
      warnings
    };
  }
  async doGenerate(options) {
    var _a, _b, _c, _d, _e, _f;
    const { args, warnings } = await this.getArgs(options);
    const {
      responseHeaders,
      value: response,
      rawValue: rawResponse
    } = await postJsonToApi$1({
      url: this.config.url({
        path: "/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders$1(this.config.headers(), options.headers),
      body: args,
      failedResponseHandler: this.failedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler$1(
        openaiCompatibleCompletionResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const choice = response.choices[0];
    const content = [];
    if (choice.text != null && choice.text.length > 0) {
      content.push({ type: "text", text: choice.text });
    }
    return {
      content,
      usage: {
        inputTokens: (_b = (_a = response.usage) == null ? void 0 : _a.prompt_tokens) != null ? _b : void 0,
        outputTokens: (_d = (_c = response.usage) == null ? void 0 : _c.completion_tokens) != null ? _d : void 0,
        totalTokens: (_f = (_e = response.usage) == null ? void 0 : _e.total_tokens) != null ? _f : void 0
      },
      finishReason: mapOpenAICompatibleFinishReason(choice.finish_reason),
      request: { body: args },
      response: {
        ...getResponseMetadata$2(response),
        headers: responseHeaders,
        body: rawResponse
      },
      warnings
    };
  }
  async doStream(options) {
    const { args, warnings } = await this.getArgs(options);
    const body = {
      ...args,
      stream: true,
      // only include stream_options when in strict compatibility mode:
      stream_options: this.config.includeUsage ? { include_usage: true } : void 0
    };
    const { responseHeaders, value: response } = await postJsonToApi$1({
      url: this.config.url({
        path: "/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders$1(this.config.headers(), options.headers),
      body,
      failedResponseHandler: this.failedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler$1(
        this.chunkSchema
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
              finishReason = "error";
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            if ("error" in value) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: value.error });
              return;
            }
            if (isFirstChunk) {
              isFirstChunk = false;
              controller.enqueue({
                type: "response-metadata",
                ...getResponseMetadata$2(value)
              });
              controller.enqueue({
                type: "text-start",
                id: "0"
              });
            }
            if (value.usage != null) {
              usage.inputTokens = (_a = value.usage.prompt_tokens) != null ? _a : void 0;
              usage.outputTokens = (_b = value.usage.completion_tokens) != null ? _b : void 0;
              usage.totalTokens = (_c = value.usage.total_tokens) != null ? _c : void 0;
            }
            const choice = value.choices[0];
            if ((choice == null ? void 0 : choice.finish_reason) != null) {
              finishReason = mapOpenAICompatibleFinishReason(
                choice.finish_reason
              );
            }
            if ((choice == null ? void 0 : choice.text) != null) {
              controller.enqueue({
                type: "text-delta",
                id: "0",
                delta: choice.text
              });
            }
          },
          flush(controller) {
            if (!isFirstChunk) {
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
var usageSchema = object({
  prompt_tokens: number(),
  completion_tokens: number(),
  total_tokens: number()
});
var openaiCompatibleCompletionResponseSchema = object({
  id: string().nullish(),
  created: number().nullish(),
  model: string().nullish(),
  choices: array(
    object({
      text: string(),
      finish_reason: string()
    })
  ),
  usage: usageSchema.nullish()
});
var createOpenAICompatibleCompletionChunkSchema = (errorSchema) => union([
  object({
    id: string().nullish(),
    created: number().nullish(),
    model: string().nullish(),
    choices: array(
      object({
        text: string(),
        finish_reason: string().nullish(),
        index: number()
      })
    ),
    usage: usageSchema.nullish()
  }),
  errorSchema
]);
var openaiCompatibleEmbeddingProviderOptions = object({
  /**
   * The number of dimensions the resulting output embeddings should have.
   * Only supported in text-embedding-3 and later models.
   */
  dimensions: number().optional(),
  /**
   * A unique identifier representing your end-user, which can help providers to
   * monitor and detect abuse.
   */
  user: string().optional()
});

// src/openai-compatible-embedding-model.ts
var OpenAICompatibleEmbeddingModel = class {
  constructor(modelId, config) {
    this.specificationVersion = "v2";
    this.modelId = modelId;
    this.config = config;
  }
  get provider() {
    return this.config.provider;
  }
  get maxEmbeddingsPerCall() {
    var _a;
    return (_a = this.config.maxEmbeddingsPerCall) != null ? _a : 2048;
  }
  get supportsParallelCalls() {
    var _a;
    return (_a = this.config.supportsParallelCalls) != null ? _a : true;
  }
  get providerOptionsName() {
    return this.config.provider.split(".")[0].trim();
  }
  async doEmbed({
    values,
    headers,
    abortSignal,
    providerOptions
  }) {
    var _a, _b, _c;
    const compatibleOptions = Object.assign(
      (_a = await parseProviderOptions({
        provider: "openai-compatible",
        providerOptions,
        schema: openaiCompatibleEmbeddingProviderOptions
      })) != null ? _a : {},
      (_b = await parseProviderOptions({
        provider: this.providerOptionsName,
        providerOptions,
        schema: openaiCompatibleEmbeddingProviderOptions
      })) != null ? _b : {}
    );
    if (values.length > this.maxEmbeddingsPerCall) {
      throw new TooManyEmbeddingValuesForCallError({
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
    } = await postJsonToApi$1({
      url: this.config.url({
        path: "/embeddings",
        modelId: this.modelId
      }),
      headers: combineHeaders$1(this.config.headers(), headers),
      body: {
        model: this.modelId,
        input: values,
        encoding_format: "float",
        dimensions: compatibleOptions.dimensions,
        user: compatibleOptions.user
      },
      failedResponseHandler: createJsonErrorResponseHandler$1(
        (_c = this.config.errorStructure) != null ? _c : defaultOpenAICompatibleErrorStructure
      ),
      successfulResponseHandler: createJsonResponseHandler$1(
        openaiTextEmbeddingResponseSchema
      ),
      abortSignal,
      fetch: this.config.fetch
    });
    return {
      embeddings: response.data.map((item) => item.embedding),
      usage: response.usage ? { tokens: response.usage.prompt_tokens } : void 0,
      providerMetadata: response.providerMetadata,
      response: { headers: responseHeaders, body: rawValue }
    };
  }
};
var openaiTextEmbeddingResponseSchema = object({
  data: array(object({ embedding: array(number()) })),
  usage: object({ prompt_tokens: number() }).nullish(),
  providerMetadata: record(string(), record(string(), any())).optional()
});
object({
  data: array(object({ b64_json: string() }))
});

// src/cerebras-provider.ts
var cerebrasErrorSchema = object({
  message: string(),
  type: string(),
  param: string(),
  code: string()
});
var cerebrasErrorStructure = {
  errorSchema: cerebrasErrorSchema,
  errorToMessage: (data) => data.message
};
function createCerebras(options = {}) {
  var _a;
  const baseURL = withoutTrailingSlash$1(
    (_a = options.baseURL) != null ? _a : "https://api.cerebras.ai/v1"
  );
  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey$1({
      apiKey: options.apiKey,
      environmentVariableName: "CEREBRAS_API_KEY",
      description: "Cerebras API key"
    })}`,
    ...options.headers
  });
  const createLanguageModel = (modelId) => {
    return new OpenAICompatibleChatLanguageModel(modelId, {
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
    throw new NoSuchModelError({ modelId, modelType: "textEmbeddingModel" });
  };
  provider.imageModel = (modelId) => {
    throw new NoSuchModelError({ modelId, modelType: "imageModel" });
  };
  return provider;
}
createCerebras();

/**
 * Cerebras Provider implementation
 */
class CerebrasProvider {
    constructor() {
        this.name = 'cerebras';
        this.defaultModel = 'llama3.1-8b';
        this.description = 'Cerebras models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.CEREBRAS_API_KEY) {
                config.apiKey = options.apiKey || process.env.CEREBRAS_API_KEY;
            }
            if (options.baseURL || process.env.CEREBRAS_BASE_URL) {
                config.baseURL = options.baseURL || process.env.CEREBRAS_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const cerebrasProvider = createCerebras(config);
            return cerebrasProvider(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create Cerebras model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'CEREBRAS_API_KEY',
            baseURL: 'CEREBRAS_BASE_URL'
        };
    }
}

/**
 * Claude Code Provider implementation
 */
class ClaudeCodeProvider {
    constructor() {
        this.name = 'claude-code';
        this.defaultModel = 'sonnet';
        this.description = 'Claude Code SDK/CLI';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.CLAUDE_CODE_API_KEY) {
                config.apiKey = options.apiKey || process.env.CLAUDE_CODE_API_KEY;
            }
            if (options.baseURL || process.env.CLAUDE_CODE_BASE_URL) {
                config.baseURL = options.baseURL || process.env.CLAUDE_CODE_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const claudeCodeProvider = createClaudeCode(config);
            return claudeCodeProvider(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create Claude Code model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'CLAUDE_CODE_API_KEY',
            baseURL: 'CLAUDE_CODE_BASE_URL'
        };
    }
}

/**
 * Cohere Provider implementation
 */
class CohereProvider {
    constructor() {
        this.name = 'cohere';
        this.defaultModel = 'command-r-plus';
        this.description = 'Cohere models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.COHERE_API_KEY) {
                config.apiKey = options.apiKey || process.env.COHERE_API_KEY;
            }
            if (options.baseURL || process.env.COHERE_BASE_URL) {
                config.baseURL = options.baseURL || process.env.COHERE_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const cohere = createCohere(config);
            return cohere(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create Cohere model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'COHERE_API_KEY',
            baseURL: 'COHERE_BASE_URL'
        };
    }
}

// src/deepinfra-provider.ts
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
    const { value: response, responseHeaders } = await postJsonToApi$1({
      url: `${this.config.baseURL}/${this.modelId}`,
      headers: combineHeaders$1(this.config.headers(), headers),
      body: {
        prompt,
        num_images: n,
        ...aspectRatio && { aspect_ratio: aspectRatio },
        ...splitSize && { width: splitSize[0], height: splitSize[1] },
        ...seed != null && { seed },
        ...(_d = providerOptions.deepinfra) != null ? _d : {}
      },
      failedResponseHandler: createJsonErrorResponseHandler$1({
        errorSchema: deepInfraErrorSchema,
        errorToMessage: (error) => error.detail.error
      }),
      successfulResponseHandler: createJsonResponseHandler$1(
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
var deepInfraErrorSchema = object({
  detail: object({
    error: string()
  })
});
var deepInfraImageResponseSchema = object({
  images: array(string())
});

// src/deepinfra-provider.ts
function createDeepInfra(options = {}) {
  var _a;
  const baseURL = withoutTrailingSlash$1(
    (_a = options.baseURL) != null ? _a : "https://api.deepinfra.com/v1"
  );
  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey$1({
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
    return new OpenAICompatibleChatLanguageModel(
      modelId,
      getCommonModelConfig("chat")
    );
  };
  const createCompletionModel = (modelId) => new OpenAICompatibleCompletionLanguageModel(
    modelId,
    getCommonModelConfig("completion")
  );
  const createTextEmbeddingModel = (modelId) => new OpenAICompatibleEmbeddingModel(
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
createDeepInfra();

/**
 * DeepInfra Provider implementation
 */
class DeepInfraProvider {
    constructor() {
        this.name = 'deepinfra';
        this.defaultModel = 'meta-llama/Llama-2-7b-chat-hf';
        this.description = 'DeepInfra models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.DEEPINFRA_API_KEY) {
                config.apiKey = options.apiKey || process.env.DEEPINFRA_API_KEY;
            }
            if (options.baseURL || process.env.DEEPINFRA_BASE_URL) {
                config.baseURL = options.baseURL || process.env.DEEPINFRA_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const deepinfraProvider = createDeepInfra(config);
            return deepinfraProvider(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create DeepInfra model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'DEEPINFRA_API_KEY',
            baseURL: 'DEEPINFRA_BASE_URL'
        };
    }
}

// src/deepseek-provider.ts
var buildDeepseekMetadata = (usage) => {
  var _a, _b;
  return usage == null ? void 0 : {
    deepseek: {
      promptCacheHitTokens: (_a = usage.prompt_cache_hit_tokens) != null ? _a : NaN,
      promptCacheMissTokens: (_b = usage.prompt_cache_miss_tokens) != null ? _b : NaN
    }
  };
};
var deepSeekMetadataExtractor = {
  extractMetadata: async ({ parsedBody }) => {
    const parsed = await safeValidateTypes$1({
      value: parsedBody,
      schema: deepSeekResponseSchema
    });
    return !parsed.success || parsed.value.usage == null ? void 0 : buildDeepseekMetadata(parsed.value.usage);
  },
  createStreamExtractor: () => {
    let usage;
    return {
      processChunk: async (chunk) => {
        var _a, _b;
        const parsed = await safeValidateTypes$1({
          value: chunk,
          schema: deepSeekStreamChunkSchema
        });
        if (parsed.success && ((_b = (_a = parsed.value.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.finish_reason) === "stop" && parsed.value.usage) {
          usage = parsed.value.usage;
        }
      },
      buildMetadata: () => buildDeepseekMetadata(usage)
    };
  }
};
var deepSeekUsageSchema = object({
  prompt_cache_hit_tokens: number().nullish(),
  prompt_cache_miss_tokens: number().nullish()
});
var deepSeekResponseSchema = object({
  usage: deepSeekUsageSchema.nullish()
});
var deepSeekStreamChunkSchema = object({
  choices: array(
    object({
      finish_reason: string().nullish()
    })
  ).nullish(),
  usage: deepSeekUsageSchema.nullish()
});

// src/deepseek-provider.ts
function createDeepSeek(options = {}) {
  var _a;
  const baseURL = withoutTrailingSlash$1(
    (_a = options.baseURL) != null ? _a : "https://api.deepseek.com/v1"
  );
  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey$1({
      apiKey: options.apiKey,
      environmentVariableName: "DEEPSEEK_API_KEY",
      description: "DeepSeek API key"
    })}`,
    ...options.headers
  });
  const createLanguageModel = (modelId) => {
    return new OpenAICompatibleChatLanguageModel(modelId, {
      provider: `deepseek.chat`,
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      fetch: options.fetch,
      metadataExtractor: deepSeekMetadataExtractor
    });
  };
  const provider = (modelId) => createLanguageModel(modelId);
  provider.languageModel = createLanguageModel;
  provider.chat = createLanguageModel;
  provider.textEmbeddingModel = (modelId) => {
    throw new NoSuchModelError({ modelId, modelType: "textEmbeddingModel" });
  };
  provider.imageModel = (modelId) => {
    throw new NoSuchModelError({ modelId, modelType: "imageModel" });
  };
  return provider;
}
createDeepSeek();

/**
 * DeepSeek Provider implementation
 */
class DeepSeekProvider {
    constructor() {
        this.name = 'deepseek';
        this.defaultModel = 'deepseek-chat';
        this.description = 'DeepSeek models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.DEEPSEEK_API_KEY) {
                config.apiKey = options.apiKey || process.env.DEEPSEEK_API_KEY;
            }
            if (options.baseURL || process.env.DEEPSEEK_BASE_URL) {
                config.baseURL = options.baseURL || process.env.DEEPSEEK_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const deepseekProvider = createDeepSeek(config);
            return deepseekProvider(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create DeepSeek model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'DEEPSEEK_API_KEY',
            baseURL: 'DEEPSEEK_BASE_URL'
        };
    }
}

// src/fireworks-image-model.ts
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
    const { value: response, responseHeaders } = await postJsonToApi$1({
      url: getUrlForModel(this.config.baseURL, this.modelId),
      headers: combineHeaders$1(this.config.headers(), headers),
      body: {
        prompt,
        aspect_ratio: aspectRatio,
        seed,
        samples: n,
        ...splitSize && { width: splitSize[0], height: splitSize[1] },
        ...(_d = providerOptions.fireworks) != null ? _d : {}
      },
      failedResponseHandler: createStatusCodeErrorResponseHandler(),
      successfulResponseHandler: createBinaryResponseHandler(),
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
var fireworksErrorSchema = object({
  error: string()
});
var fireworksErrorStructure = {
  errorSchema: fireworksErrorSchema,
  errorToMessage: (data) => data.error
};
var defaultBaseURL = "https://api.fireworks.ai/inference/v1";
function createFireworks(options = {}) {
  var _a;
  const baseURL = withoutTrailingSlash$1((_a = options.baseURL) != null ? _a : defaultBaseURL);
  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey$1({
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
    return new OpenAICompatibleChatLanguageModel(modelId, {
      ...getCommonModelConfig("chat"),
      errorStructure: fireworksErrorStructure
    });
  };
  const createCompletionModel = (modelId) => new OpenAICompatibleCompletionLanguageModel(modelId, {
    ...getCommonModelConfig("completion"),
    errorStructure: fireworksErrorStructure
  });
  const createTextEmbeddingModel = (modelId) => new OpenAICompatibleEmbeddingModel(modelId, {
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
createFireworks();

/**
 * Fireworks Provider implementation
 */
class FireworksProvider {
    constructor() {
        this.name = 'fireworks';
        this.defaultModel = 'accounts/fireworks/models/llama-v3p1-8b-instruct';
        this.description = 'Fireworks models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.FIREWORKS_API_KEY) {
                config.apiKey = options.apiKey || process.env.FIREWORKS_API_KEY;
            }
            if (options.baseURL || process.env.FIREWORKS_BASE_URL) {
                config.baseURL = options.baseURL || process.env.FIREWORKS_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const fireworksProvider = createFireworks(config);
            return fireworksProvider(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create Fireworks model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'FIREWORKS_API_KEY',
            baseURL: 'FIREWORKS_BASE_URL'
        };
    }
}

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
}

/**
 * Google Provider implementation
 */
class GoogleProvider {
    constructor() {
        this.name = 'google';
        this.defaultModel = 'gemini-1.5-flash';
        this.description = 'Google Gemini models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
                config.apiKey = options.apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
            }
            const google = createGoogleGenerativeAI(config);
            return google(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create Google model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'GOOGLE_GENERATIVE_AI_API_KEY',
            baseURL: 'GOOGLE_GENERATIVE_AI_BASE_URL'
        };
    }
}

// src/groq-provider.ts
function convertToGroqChatMessages(prompt) {
  const messages = [];
  for (const { role, content } of prompt) {
    switch (role) {
      case "system": {
        messages.push({ role: "system", content });
        break;
      }
      case "user": {
        if (content.length === 1 && content[0].type === "text") {
          messages.push({ role: "user", content: content[0].text });
          break;
        }
        messages.push({
          role: "user",
          content: content.map((part) => {
            switch (part.type) {
              case "text": {
                return { type: "text", text: part.text };
              }
              case "file": {
                if (!part.mediaType.startsWith("image/")) {
                  throw new UnsupportedFunctionalityError$1({
                    functionality: "Non-image file content parts"
                  });
                }
                const mediaType = part.mediaType === "image/*" ? "image/jpeg" : part.mediaType;
                return {
                  type: "image_url",
                  image_url: {
                    url: part.data instanceof URL ? part.data.toString() : `data:${mediaType};base64,${part.data}`
                  }
                };
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
function getResponseMetadata$1({
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
var groqProviderOptions = object({
  reasoningFormat: _enum(["parsed", "raw", "hidden"]).optional(),
  reasoningEffort: _enum(["none", "default"]).optional(),
  /**
   * Whether to enable parallel function calling during tool use. Default to true.
   */
  parallelToolCalls: boolean().optional(),
  /**
   * A unique identifier representing your end-user, which can help OpenAI to
   * monitor and detect abuse. Learn more.
   */
  user: string().optional(),
  /**
   * Whether to use structured outputs.
   *
   * @default true
   */
  structuredOutputs: boolean().optional()
});
var groqErrorDataSchema = object({
  error: object({
    message: string(),
    type: string()
  })
});
var groqFailedResponseHandler = createJsonErrorResponseHandler$1({
  errorSchema: groqErrorDataSchema,
  errorToMessage: (data) => data.error.message
});
function prepareTools({
  tools,
  toolChoice
}) {
  tools = (tools == null ? void 0 : tools.length) ? tools : void 0;
  const toolWarnings = [];
  if (tools == null) {
    return { tools: void 0, toolChoice: void 0, toolWarnings };
  }
  const groqTools = [];
  for (const tool of tools) {
    if (tool.type === "provider-defined") {
      toolWarnings.push({ type: "unsupported-tool", tool });
    } else {
      groqTools.push({
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
    return { tools: groqTools, toolChoice: void 0, toolWarnings };
  }
  const type = toolChoice.type;
  switch (type) {
    case "auto":
    case "none":
    case "required":
      return { tools: groqTools, toolChoice: type, toolWarnings };
    case "tool":
      return {
        tools: groqTools,
        toolChoice: {
          type: "function",
          function: {
            name: toolChoice.toolName
          }
        },
        toolWarnings
      };
    default: {
      const _exhaustiveCheck = type;
      throw new UnsupportedFunctionalityError$1({
        functionality: `tool choice type: ${_exhaustiveCheck}`
      });
    }
  }
}

// src/map-groq-finish-reason.ts
function mapGroqFinishReason(finishReason) {
  switch (finishReason) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "content_filter":
      return "content-filter";
    case "function_call":
    case "tool_calls":
      return "tool-calls";
    default:
      return "unknown";
  }
}

// src/groq-chat-language-model.ts
var GroqChatLanguageModel = class {
  constructor(modelId, config) {
    this.specificationVersion = "v2";
    this.supportedUrls = {
      "image/*": [/^https?:\/\/.*$/]
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
    stream,
    tools,
    toolChoice,
    providerOptions
  }) {
    var _a, _b;
    const warnings = [];
    const groqOptions = await parseProviderOptions({
      provider: "groq",
      providerOptions,
      schema: groqProviderOptions
    });
    const structuredOutputs = (_a = groqOptions == null ? void 0 : groqOptions.structuredOutputs) != null ? _a : true;
    if (topK != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "topK"
      });
    }
    if ((responseFormat == null ? void 0 : responseFormat.type) === "json" && responseFormat.schema != null && !structuredOutputs) {
      warnings.push({
        type: "unsupported-setting",
        setting: "responseFormat",
        details: "JSON response format schema is only supported with structuredOutputs"
      });
    }
    const {
      tools: groqTools,
      toolChoice: groqToolChoice,
      toolWarnings
    } = prepareTools({ tools, toolChoice });
    return {
      args: {
        // model id:
        model: this.modelId,
        // model specific settings:
        user: groqOptions == null ? void 0 : groqOptions.user,
        parallel_tool_calls: groqOptions == null ? void 0 : groqOptions.parallelToolCalls,
        // standardized settings:
        max_tokens: maxOutputTokens,
        temperature,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        stop: stopSequences,
        seed,
        // response format:
        response_format: (responseFormat == null ? void 0 : responseFormat.type) === "json" ? structuredOutputs && responseFormat.schema != null ? {
          type: "json_schema",
          json_schema: {
            schema: responseFormat.schema,
            name: (_b = responseFormat.name) != null ? _b : "response",
            description: responseFormat.description
          }
        } : { type: "json_object" } : void 0,
        // provider options:
        reasoning_format: groqOptions == null ? void 0 : groqOptions.reasoningFormat,
        reasoning_effort: groqOptions == null ? void 0 : groqOptions.reasoningEffort,
        // messages:
        messages: convertToGroqChatMessages(prompt),
        // tools:
        tools: groqTools,
        tool_choice: groqToolChoice
      },
      warnings: [...warnings, ...toolWarnings]
    };
  }
  async doGenerate(options) {
    var _a, _b, _c, _d, _e, _f, _g;
    const { args, warnings } = await this.getArgs({
      ...options,
      stream: false
    });
    const body = JSON.stringify(args);
    const {
      responseHeaders,
      value: response,
      rawValue: rawResponse
    } = await postJsonToApi$1({
      url: this.config.url({
        path: "/chat/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders$1(this.config.headers(), options.headers),
      body: args,
      failedResponseHandler: groqFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler$1(
        groqChatResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const choice = response.choices[0];
    const content = [];
    const text = choice.message.content;
    if (text != null && text.length > 0) {
      content.push({ type: "text", text });
    }
    const reasoning = choice.message.reasoning;
    if (reasoning != null && reasoning.length > 0) {
      content.push({
        type: "reasoning",
        text: reasoning
      });
    }
    if (choice.message.tool_calls != null) {
      for (const toolCall of choice.message.tool_calls) {
        content.push({
          type: "tool-call",
          toolCallId: (_a = toolCall.id) != null ? _a : generateId$1(),
          toolName: toolCall.function.name,
          input: toolCall.function.arguments
        });
      }
    }
    return {
      content,
      finishReason: mapGroqFinishReason(choice.finish_reason),
      usage: {
        inputTokens: (_c = (_b = response.usage) == null ? void 0 : _b.prompt_tokens) != null ? _c : void 0,
        outputTokens: (_e = (_d = response.usage) == null ? void 0 : _d.completion_tokens) != null ? _e : void 0,
        totalTokens: (_g = (_f = response.usage) == null ? void 0 : _f.total_tokens) != null ? _g : void 0
      },
      response: {
        ...getResponseMetadata$1(response),
        headers: responseHeaders,
        body: rawResponse
      },
      warnings,
      request: { body }
    };
  }
  async doStream(options) {
    const { args, warnings } = await this.getArgs({ ...options, stream: true });
    const body = JSON.stringify({ ...args, stream: true });
    const { responseHeaders, value: response } = await postJsonToApi$1({
      url: this.config.url({
        path: "/chat/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders$1(this.config.headers(), options.headers),
      body: {
        ...args,
        stream: true
      },
      failedResponseHandler: groqFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler$1(groqChatChunkSchema),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const toolCalls = [];
    let finishReason = "unknown";
    const usage = {
      inputTokens: void 0,
      outputTokens: void 0,
      totalTokens: void 0
    };
    let isFirstChunk = true;
    let isActiveText = false;
    let isActiveReasoning = false;
    return {
      stream: response.pipeThrough(
        new TransformStream({
          start(controller) {
            controller.enqueue({ type: "stream-start", warnings });
          },
          transform(chunk, controller) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
            if (options.includeRawChunks) {
              controller.enqueue({ type: "raw", rawValue: chunk.rawValue });
            }
            if (!chunk.success) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            if ("error" in value) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: value.error });
              return;
            }
            if (isFirstChunk) {
              isFirstChunk = false;
              controller.enqueue({
                type: "response-metadata",
                ...getResponseMetadata$1(value)
              });
            }
            if (((_a = value.x_groq) == null ? void 0 : _a.usage) != null) {
              usage.inputTokens = (_b = value.x_groq.usage.prompt_tokens) != null ? _b : void 0;
              usage.outputTokens = (_c = value.x_groq.usage.completion_tokens) != null ? _c : void 0;
              usage.totalTokens = (_d = value.x_groq.usage.total_tokens) != null ? _d : void 0;
            }
            const choice = value.choices[0];
            if ((choice == null ? void 0 : choice.finish_reason) != null) {
              finishReason = mapGroqFinishReason(choice.finish_reason);
            }
            if ((choice == null ? void 0 : choice.delta) == null) {
              return;
            }
            const delta = choice.delta;
            if (delta.reasoning != null && delta.reasoning.length > 0) {
              if (!isActiveReasoning) {
                controller.enqueue({
                  type: "reasoning-start",
                  id: "reasoning-0"
                });
                isActiveReasoning = true;
              }
              controller.enqueue({
                type: "reasoning-delta",
                id: "reasoning-0",
                delta: delta.reasoning
              });
            }
            if (delta.content != null && delta.content.length > 0) {
              if (!isActiveText) {
                controller.enqueue({ type: "text-start", id: "txt-0" });
                isActiveText = true;
              }
              controller.enqueue({
                type: "text-delta",
                id: "txt-0",
                delta: delta.content
              });
            }
            if (delta.tool_calls != null) {
              for (const toolCallDelta of delta.tool_calls) {
                const index = toolCallDelta.index;
                if (toolCalls[index] == null) {
                  if (toolCallDelta.type !== "function") {
                    throw new InvalidResponseDataError$1({
                      data: toolCallDelta,
                      message: `Expected 'function' type.`
                    });
                  }
                  if (toolCallDelta.id == null) {
                    throw new InvalidResponseDataError$1({
                      data: toolCallDelta,
                      message: `Expected 'id' to be a string.`
                    });
                  }
                  if (((_e = toolCallDelta.function) == null ? void 0 : _e.name) == null) {
                    throw new InvalidResponseDataError$1({
                      data: toolCallDelta,
                      message: `Expected 'function.name' to be a string.`
                    });
                  }
                  controller.enqueue({
                    type: "tool-input-start",
                    id: toolCallDelta.id,
                    toolName: toolCallDelta.function.name
                  });
                  toolCalls[index] = {
                    id: toolCallDelta.id,
                    type: "function",
                    function: {
                      name: toolCallDelta.function.name,
                      arguments: (_f = toolCallDelta.function.arguments) != null ? _f : ""
                    },
                    hasFinished: false
                  };
                  const toolCall2 = toolCalls[index];
                  if (((_g = toolCall2.function) == null ? void 0 : _g.name) != null && ((_h = toolCall2.function) == null ? void 0 : _h.arguments) != null) {
                    if (toolCall2.function.arguments.length > 0) {
                      controller.enqueue({
                        type: "tool-input-delta",
                        id: toolCall2.id,
                        delta: toolCall2.function.arguments
                      });
                    }
                    if (isParsableJson$1(toolCall2.function.arguments)) {
                      controller.enqueue({
                        type: "tool-input-end",
                        id: toolCall2.id
                      });
                      controller.enqueue({
                        type: "tool-call",
                        toolCallId: (_i = toolCall2.id) != null ? _i : generateId$1(),
                        toolName: toolCall2.function.name,
                        input: toolCall2.function.arguments
                      });
                      toolCall2.hasFinished = true;
                    }
                  }
                  continue;
                }
                const toolCall = toolCalls[index];
                if (toolCall.hasFinished) {
                  continue;
                }
                if (((_j = toolCallDelta.function) == null ? void 0 : _j.arguments) != null) {
                  toolCall.function.arguments += (_l = (_k = toolCallDelta.function) == null ? void 0 : _k.arguments) != null ? _l : "";
                }
                controller.enqueue({
                  type: "tool-input-delta",
                  id: toolCall.id,
                  delta: (_m = toolCallDelta.function.arguments) != null ? _m : ""
                });
                if (((_n = toolCall.function) == null ? void 0 : _n.name) != null && ((_o = toolCall.function) == null ? void 0 : _o.arguments) != null && isParsableJson$1(toolCall.function.arguments)) {
                  controller.enqueue({
                    type: "tool-input-end",
                    id: toolCall.id
                  });
                  controller.enqueue({
                    type: "tool-call",
                    toolCallId: (_p = toolCall.id) != null ? _p : generateId$1(),
                    toolName: toolCall.function.name,
                    input: toolCall.function.arguments
                  });
                  toolCall.hasFinished = true;
                }
              }
            }
          },
          flush(controller) {
            if (isActiveReasoning) {
              controller.enqueue({ type: "reasoning-end", id: "reasoning-0" });
            }
            if (isActiveText) {
              controller.enqueue({ type: "text-end", id: "txt-0" });
            }
            controller.enqueue({
              type: "finish",
              finishReason,
              usage,
              ...{}
            });
          }
        })
      ),
      request: { body },
      response: { headers: responseHeaders }
    };
  }
};
var groqChatResponseSchema = object({
  id: string().nullish(),
  created: number().nullish(),
  model: string().nullish(),
  choices: array(
    object({
      message: object({
        content: string().nullish(),
        reasoning: string().nullish(),
        tool_calls: array(
          object({
            id: string().nullish(),
            type: literal("function"),
            function: object({
              name: string(),
              arguments: string()
            })
          })
        ).nullish()
      }),
      index: number(),
      finish_reason: string().nullish()
    })
  ),
  usage: object({
    prompt_tokens: number().nullish(),
    completion_tokens: number().nullish(),
    total_tokens: number().nullish()
  }).nullish()
});
var groqChatChunkSchema = union([
  object({
    id: string().nullish(),
    created: number().nullish(),
    model: string().nullish(),
    choices: array(
      object({
        delta: object({
          content: string().nullish(),
          reasoning: string().nullish(),
          tool_calls: array(
            object({
              index: number(),
              id: string().nullish(),
              type: literal("function").optional(),
              function: object({
                name: string().nullish(),
                arguments: string().nullish()
              })
            })
          ).nullish()
        }).nullish(),
        finish_reason: string().nullable().optional(),
        index: number()
      })
    ),
    x_groq: object({
      usage: object({
        prompt_tokens: number().nullish(),
        completion_tokens: number().nullish(),
        total_tokens: number().nullish()
      }).nullish()
    }).nullish()
  }),
  groqErrorDataSchema
]);
var groqProviderOptionsSchema = object({
  language: string().nullish(),
  prompt: string().nullish(),
  responseFormat: string().nullish(),
  temperature: number().min(0).max(1).nullish(),
  timestampGranularities: array(string()).nullish()
});
var GroqTranscriptionModel = class {
  constructor(modelId, config) {
    this.modelId = modelId;
    this.config = config;
    this.specificationVersion = "v2";
  }
  get provider() {
    return this.config.provider;
  }
  async getArgs({
    audio,
    mediaType,
    providerOptions
  }) {
    var _a, _b, _c, _d, _e;
    const warnings = [];
    const groqOptions = await parseProviderOptions({
      provider: "groq",
      providerOptions,
      schema: groqProviderOptionsSchema
    });
    const formData = new FormData();
    const blob = audio instanceof Uint8Array ? new Blob([audio]) : new Blob([convertBase64ToUint8Array(audio)]);
    formData.append("model", this.modelId);
    formData.append("file", new File([blob], "audio", { type: mediaType }));
    if (groqOptions) {
      const transcriptionModelOptions = {
        language: (_a = groqOptions.language) != null ? _a : void 0,
        prompt: (_b = groqOptions.prompt) != null ? _b : void 0,
        response_format: (_c = groqOptions.responseFormat) != null ? _c : void 0,
        temperature: (_d = groqOptions.temperature) != null ? _d : void 0,
        timestamp_granularities: (_e = groqOptions.timestampGranularities) != null ? _e : void 0
      };
      for (const key in transcriptionModelOptions) {
        const value = transcriptionModelOptions[key];
        if (value !== void 0) {
          formData.append(key, String(value));
        }
      }
    }
    return {
      formData,
      warnings
    };
  }
  async doGenerate(options) {
    var _a, _b, _c, _d, _e;
    const currentDate = (_c = (_b = (_a = this.config._internal) == null ? void 0 : _a.currentDate) == null ? void 0 : _b.call(_a)) != null ? _c : /* @__PURE__ */ new Date();
    const { formData, warnings } = await this.getArgs(options);
    const {
      value: response,
      responseHeaders,
      rawValue: rawResponse
    } = await postFormDataToApi({
      url: this.config.url({
        path: "/audio/transcriptions",
        modelId: this.modelId
      }),
      headers: combineHeaders$1(this.config.headers(), options.headers),
      formData,
      failedResponseHandler: groqFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler$1(
        groqTranscriptionResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    return {
      text: response.text,
      segments: (_e = (_d = response.segments) == null ? void 0 : _d.map((segment) => ({
        text: segment.text,
        startSecond: segment.start,
        endSecond: segment.end
      }))) != null ? _e : [],
      language: response.language,
      durationInSeconds: response.duration,
      warnings,
      response: {
        timestamp: currentDate,
        modelId: this.modelId,
        headers: responseHeaders,
        body: rawResponse
      }
    };
  }
};
var groqTranscriptionResponseSchema = object({
  task: string(),
  language: string(),
  duration: number(),
  text: string(),
  segments: array(
    object({
      id: number(),
      seek: number(),
      start: number(),
      end: number(),
      text: string(),
      tokens: array(number()),
      temperature: number(),
      avg_logprob: number(),
      compression_ratio: number(),
      no_speech_prob: number()
    })
  ),
  x_groq: object({
    id: string()
  })
});

// src/groq-provider.ts
function createGroq(options = {}) {
  var _a;
  const baseURL = (_a = withoutTrailingSlash$1(options.baseURL)) != null ? _a : "https://api.groq.com/openai/v1";
  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey$1({
      apiKey: options.apiKey,
      environmentVariableName: "GROQ_API_KEY",
      description: "Groq"
    })}`,
    ...options.headers
  });
  const createChatModel = (modelId) => new GroqChatLanguageModel(modelId, {
    provider: "groq.chat",
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    fetch: options.fetch
  });
  const createLanguageModel = (modelId) => {
    if (new.target) {
      throw new Error(
        "The Groq model function cannot be called with the new keyword."
      );
    }
    return createChatModel(modelId);
  };
  const createTranscriptionModel = (modelId) => {
    return new GroqTranscriptionModel(modelId, {
      provider: "groq.transcription",
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      fetch: options.fetch
    });
  };
  const provider = function(modelId) {
    return createLanguageModel(modelId);
  };
  provider.languageModel = createLanguageModel;
  provider.chat = createChatModel;
  provider.textEmbeddingModel = (modelId) => {
    throw new NoSuchModelError({ modelId, modelType: "textEmbeddingModel" });
  };
  provider.imageModel = (modelId) => {
    throw new NoSuchModelError({ modelId, modelType: "imageModel" });
  };
  provider.transcription = createTranscriptionModel;
  return provider;
}
createGroq();

/**
 * Groq Provider implementation
 */
class GroqProvider {
    constructor() {
        this.name = 'groq';
        this.defaultModel = 'llama-3.1-8b-instant';
        this.description = 'Groq models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.GROQ_API_KEY) {
                config.apiKey = options.apiKey || process.env.GROQ_API_KEY;
            }
            if (options.baseURL || process.env.GROQ_BASE_URL) {
                config.baseURL = options.baseURL || process.env.GROQ_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const groqProvider = createGroq(config);
            return groqProvider(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create Groq model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'GROQ_API_KEY',
            baseURL: 'GROQ_BASE_URL'
        };
    }
}

/**
 * Mistral Provider implementation
 */
class MistralProvider {
    constructor() {
        this.name = 'mistral';
        this.defaultModel = 'mistral-small-latest';
        this.description = 'Mistral AI models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.MISTRAL_API_KEY) {
                config.apiKey = options.apiKey || process.env.MISTRAL_API_KEY;
            }
            if (options.baseURL || process.env.MISTRAL_BASE_URL) {
                config.baseURL = options.baseURL || process.env.MISTRAL_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const mistral = createMistral(config);
            return mistral(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create Mistral model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'MISTRAL_API_KEY',
            baseURL: 'MISTRAL_BASE_URL'
        };
    }
}

/**
 * OpenAI Provider implementation
 */
class OpenAIProvider {
    constructor() {
        this.name = 'openai';
        this.defaultModel = 'gpt-4o-mini';
        this.description = 'OpenAI GPT models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.OPENAI_API_KEY) {
                config.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
            }
            if (options.baseURL || process.env.OPENAI_BASE_URL) {
                config.baseURL = options.baseURL || process.env.OPENAI_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const openai = createOpenAI(config);
            return openai(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create OpenAI model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'OPENAI_API_KEY',
            baseURL: 'OPENAI_BASE_URL'
        };
    }
}

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// node_modules/.pnpm/@ai-sdk+provider@2.0.0-beta.1/node_modules/@ai-sdk/provider/dist/index.mjs
var marker = "vercel.ai.error";
var symbol = Symbol.for(marker);
var _a;
var _AISDKError = class _AISDKError2 extends Error {
  /**
   * Creates an AI SDK Error.
   *
   * @param {Object} params - The parameters for creating the error.
   * @param {string} params.name - The name of the error.
   * @param {string} params.message - The error message.
   * @param {unknown} [params.cause] - The underlying cause of the error.
   */
  constructor({
    name: name14,
    message,
    cause
  }) {
    super(message);
    this[_a] = true;
    this.name = name14;
    this.cause = cause;
  }
  /**
   * Checks if the given error is an AI SDK Error.
   * @param {unknown} error - The error to check.
   * @returns {boolean} True if the error is an AI SDK Error, false otherwise.
   */
  static isInstance(error) {
    return _AISDKError2.hasMarker(error, marker);
  }
  static hasMarker(error, marker15) {
    const markerSymbol = Symbol.for(marker15);
    return error != null && typeof error === "object" && markerSymbol in error && typeof error[markerSymbol] === "boolean" && error[markerSymbol] === true;
  }
};
_a = symbol;
var AISDKError = _AISDKError;
var name = "AI_APICallError";
var marker2 = `vercel.ai.error.${name}`;
var symbol2 = Symbol.for(marker2);
var _a2;
var APICallError = class extends AISDKError {
  constructor({
    message,
    url,
    requestBodyValues,
    statusCode,
    responseHeaders,
    responseBody,
    cause,
    isRetryable = statusCode != null && (statusCode === 408 || // request timeout
    statusCode === 409 || // conflict
    statusCode === 429 || // too many requests
    statusCode >= 500),
    // server error
    data
  }) {
    super({ name, message, cause });
    this[_a2] = true;
    this.url = url;
    this.requestBodyValues = requestBodyValues;
    this.statusCode = statusCode;
    this.responseHeaders = responseHeaders;
    this.responseBody = responseBody;
    this.isRetryable = isRetryable;
    this.data = data;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker2);
  }
};
_a2 = symbol2;
var name2 = "AI_EmptyResponseBodyError";
var marker3 = `vercel.ai.error.${name2}`;
var symbol3 = Symbol.for(marker3);
var _a3;
var EmptyResponseBodyError = class extends AISDKError {
  // used in isInstance
  constructor({ message = "Empty response body" } = {}) {
    super({ name: name2, message });
    this[_a3] = true;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker3);
  }
};
_a3 = symbol3;
function getErrorMessage(error) {
  if (error == null) {
    return "unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}
var name3 = "AI_InvalidArgumentError";
var marker4 = `vercel.ai.error.${name3}`;
var symbol4 = Symbol.for(marker4);
var _a4;
var InvalidArgumentError = class extends AISDKError {
  constructor({
    message,
    cause,
    argument
  }) {
    super({ name: name3, message, cause });
    this[_a4] = true;
    this.argument = argument;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker4);
  }
};
_a4 = symbol4;
var name4 = "AI_InvalidPromptError";
var marker5 = `vercel.ai.error.${name4}`;
var symbol5 = Symbol.for(marker5);
var _a5;
var InvalidPromptError = class extends AISDKError {
  constructor({
    prompt,
    message,
    cause
  }) {
    super({ name: name4, message: `Invalid prompt: ${message}`, cause });
    this[_a5] = true;
    this.prompt = prompt;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker5);
  }
};
_a5 = symbol5;
var name5 = "AI_InvalidResponseDataError";
var marker6 = `vercel.ai.error.${name5}`;
var symbol6 = Symbol.for(marker6);
var _a6;
var InvalidResponseDataError = class extends AISDKError {
  constructor({
    data,
    message = `Invalid response data: ${JSON.stringify(data)}.`
  }) {
    super({ name: name5, message });
    this[_a6] = true;
    this.data = data;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker6);
  }
};
_a6 = symbol6;
var name6 = "AI_JSONParseError";
var marker7 = `vercel.ai.error.${name6}`;
var symbol7 = Symbol.for(marker7);
var _a7;
var JSONParseError = class extends AISDKError {
  constructor({ text, cause }) {
    super({
      name: name6,
      message: `JSON parsing failed: Text: ${text}.
Error message: ${getErrorMessage(cause)}`,
      cause
    });
    this[_a7] = true;
    this.text = text;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker7);
  }
};
_a7 = symbol7;
var name7 = "AI_LoadAPIKeyError";
var marker8 = `vercel.ai.error.${name7}`;
var symbol8 = Symbol.for(marker8);
var _a8;
var LoadAPIKeyError = class extends AISDKError {
  // used in isInstance
  constructor({ message }) {
    super({ name: name7, message });
    this[_a8] = true;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker8);
  }
};
_a8 = symbol8;
var name12 = "AI_TypeValidationError";
var marker13 = `vercel.ai.error.${name12}`;
var symbol13 = Symbol.for(marker13);
var _a13;
var _TypeValidationError = class _TypeValidationError2 extends AISDKError {
  constructor({ value, cause }) {
    super({
      name: name12,
      message: `Type validation failed: Value: ${JSON.stringify(value)}.
Error message: ${getErrorMessage(cause)}`,
      cause
    });
    this[_a13] = true;
    this.value = value;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker13);
  }
  /**
   * Wraps an error into a TypeValidationError.
   * If the cause is already a TypeValidationError with the same value, it returns the cause.
   * Otherwise, it creates a new TypeValidationError.
   *
   * @param {Object} params - The parameters for wrapping the error.
   * @param {unknown} params.value - The value that failed validation.
   * @param {unknown} params.cause - The original error or cause of the validation failure.
   * @returns {TypeValidationError} A TypeValidationError instance.
   */
  static wrap({
    value,
    cause
  }) {
    return _TypeValidationError2.isInstance(cause) && cause.value === value ? cause : new _TypeValidationError2({ value, cause });
  }
};
_a13 = symbol13;
var TypeValidationError = _TypeValidationError;
var name13 = "AI_UnsupportedFunctionalityError";
var marker14 = `vercel.ai.error.${name13}`;
var symbol14 = Symbol.for(marker14);
var _a14;
var UnsupportedFunctionalityError = class extends AISDKError {
  constructor({
    functionality,
    message = `'${functionality}' functionality not supported.`
  }) {
    super({ name: name13, message });
    this[_a14] = true;
    this.functionality = functionality;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker14);
  }
};
_a14 = symbol14;

// node_modules/.pnpm/eventsource-parser@3.0.3/node_modules/eventsource-parser/dist/index.js
var ParseError = class extends Error {
  constructor(message, options) {
    super(message), this.name = "ParseError", this.type = options.type, this.field = options.field, this.value = options.value, this.line = options.line;
  }
};
function noop(_arg) {
}
function createParser(callbacks) {
  if (typeof callbacks == "function")
    throw new TypeError(
      "`callbacks` must be an object, got a function instead. Did you mean `{onEvent: fn}`?"
    );
  const { onEvent = noop, onError = noop, onRetry = noop, onComment } = callbacks;
  let incompleteLine = "", isFirstChunk = true, id, data = "", eventType = "";
  function feed(newChunk) {
    const chunk = isFirstChunk ? newChunk.replace(/^\xEF\xBB\xBF/, "") : newChunk, [complete, incomplete] = splitLines(`${incompleteLine}${chunk}`);
    for (const line of complete)
      parseLine(line);
    incompleteLine = incomplete, isFirstChunk = false;
  }
  function parseLine(line) {
    if (line === "") {
      dispatchEvent();
      return;
    }
    if (line.startsWith(":")) {
      onComment && onComment(line.slice(line.startsWith(": ") ? 2 : 1));
      return;
    }
    const fieldSeparatorIndex = line.indexOf(":");
    if (fieldSeparatorIndex !== -1) {
      const field = line.slice(0, fieldSeparatorIndex), offset = line[fieldSeparatorIndex + 1] === " " ? 2 : 1, value = line.slice(fieldSeparatorIndex + offset);
      processField(field, value, line);
      return;
    }
    processField(line, "", line);
  }
  function processField(field, value, line) {
    switch (field) {
      case "event":
        eventType = value;
        break;
      case "data":
        data = `${data}${value}
`;
        break;
      case "id":
        id = value.includes("\0") ? void 0 : value;
        break;
      case "retry":
        /^\d+$/.test(value) ? onRetry(parseInt(value, 10)) : onError(
          new ParseError(`Invalid \`retry\` value: "${value}"`, {
            type: "invalid-retry",
            value,
            line
          })
        );
        break;
      default:
        onError(
          new ParseError(
            `Unknown field "${field.length > 20 ? `${field.slice(0, 20)}\u2026` : field}"`,
            { type: "unknown-field", field, value, line }
          )
        );
        break;
    }
  }
  function dispatchEvent() {
    data.length > 0 && onEvent({
      id,
      event: eventType || void 0,
      // If the data buffer's last character is a U+000A LINE FEED (LF) character,
      // then remove the last character from the data buffer.
      data: data.endsWith(`
`) ? data.slice(0, -1) : data
    }), id = void 0, data = "", eventType = "";
  }
  function reset(options = {}) {
    incompleteLine && options.consume && parseLine(incompleteLine), isFirstChunk = true, id = void 0, data = "", eventType = "", incompleteLine = "";
  }
  return { feed, reset };
}
function splitLines(chunk) {
  const lines = [];
  let incompleteLine = "", searchIndex = 0;
  for (; searchIndex < chunk.length; ) {
    const crIndex = chunk.indexOf("\r", searchIndex), lfIndex = chunk.indexOf(`
`, searchIndex);
    let lineEnd = -1;
    if (crIndex !== -1 && lfIndex !== -1 ? lineEnd = Math.min(crIndex, lfIndex) : crIndex !== -1 ? lineEnd = crIndex : lfIndex !== -1 && (lineEnd = lfIndex), lineEnd === -1) {
      incompleteLine = chunk.slice(searchIndex);
      break;
    } else {
      const line = chunk.slice(searchIndex, lineEnd);
      lines.push(line), searchIndex = lineEnd + 1, chunk[searchIndex - 1] === "\r" && chunk[searchIndex] === `
` && searchIndex++;
    }
  }
  return [lines, incompleteLine];
}

// node_modules/.pnpm/eventsource-parser@3.0.3/node_modules/eventsource-parser/dist/stream.js
var EventSourceParserStream = class extends TransformStream {
  constructor({ onError, onRetry, onComment } = {}) {
    let parser;
    super({
      start(controller) {
        parser = createParser({
          onEvent: (event) => {
            controller.enqueue(event);
          },
          onError(error) {
            onError === "terminate" ? controller.error(error) : typeof onError == "function" && onError(error);
          },
          onRetry,
          onComment
        });
      },
      transform(chunk) {
        parser.feed(chunk);
      }
    });
  }
};

// node_modules/.pnpm/zod-to-json-schema@3.24.5_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/string.js
new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");

// node_modules/.pnpm/@ai-sdk+provider-utils@3.0.0-beta.5_zod@3.25.76/node_modules/@ai-sdk/provider-utils/dist/index.mjs
function combineHeaders(...headers) {
  return headers.reduce(
    (combinedHeaders, currentHeaders) => __spreadValues(__spreadValues({}, combinedHeaders), currentHeaders != null ? currentHeaders : {}),
    {}
  );
}
function extractResponseHeaders(response) {
  return Object.fromEntries([...response.headers]);
}
var createIdGenerator = ({
  prefix,
  size = 16,
  alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  separator = "-"
} = {}) => {
  const generator = () => {
    const alphabetLength = alphabet.length;
    const chars = new Array(size);
    for (let i = 0; i < size; i++) {
      chars[i] = alphabet[Math.random() * alphabetLength | 0];
    }
    return chars.join("");
  };
  if (prefix == null) {
    return generator;
  }
  if (alphabet.includes(separator)) {
    throw new InvalidArgumentError({
      argument: "separator",
      message: `The separator "${separator}" must not be part of the alphabet "${alphabet}".`
    });
  }
  return () => `${prefix}${separator}${generator()}`;
};
var generateId = createIdGenerator();
function isAbortError(error) {
  return error instanceof Error && (error.name === "AbortError" || error.name === "ResponseAborted" || // Next.js
  error.name === "TimeoutError");
}
var FETCH_FAILED_ERROR_MESSAGES = ["fetch failed", "failed to fetch"];
function handleFetchError({
  error,
  url,
  requestBodyValues
}) {
  if (isAbortError(error)) {
    return error;
  }
  if (error instanceof TypeError && FETCH_FAILED_ERROR_MESSAGES.includes(error.message.toLowerCase())) {
    const cause = error.cause;
    if (cause != null) {
      return new APICallError({
        message: `Cannot connect to API: ${cause.message}`,
        cause,
        url,
        requestBodyValues,
        isRetryable: true
        // retry when network error
      });
    }
  }
  return error;
}
function removeUndefinedEntries(record) {
  return Object.fromEntries(
    Object.entries(record).filter(([_key, value]) => value != null)
  );
}
function loadApiKey({
  apiKey,
  environmentVariableName,
  apiKeyParameterName = "apiKey",
  description
}) {
  if (typeof apiKey === "string") {
    return apiKey;
  }
  if (apiKey != null) {
    throw new LoadAPIKeyError({
      message: `${description} API key must be a string.`
    });
  }
  if (typeof process === "undefined") {
    throw new LoadAPIKeyError({
      message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter. Environment variables is not supported in this environment.`
    });
  }
  apiKey = process.env[environmentVariableName];
  if (apiKey == null) {
    throw new LoadAPIKeyError({
      message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter or the ${environmentVariableName} environment variable.`
    });
  }
  if (typeof apiKey !== "string") {
    throw new LoadAPIKeyError({
      message: `${description} API key must be a string. The value of the ${environmentVariableName} environment variable is not a string.`
    });
  }
  return apiKey;
}
var suspectProtoRx = /"__proto__"\s*:/;
var suspectConstructorRx = /"constructor"\s*:/;
function _parse(text) {
  const obj = JSON.parse(text);
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (suspectProtoRx.test(text) === false && suspectConstructorRx.test(text) === false) {
    return obj;
  }
  return filter(obj);
}
function filter(obj) {
  let next = [obj];
  while (next.length) {
    const nodes = next;
    next = [];
    for (const node of nodes) {
      if (Object.prototype.hasOwnProperty.call(node, "__proto__")) {
        throw new SyntaxError("Object contains forbidden prototype property");
      }
      if (Object.prototype.hasOwnProperty.call(node, "constructor") && Object.prototype.hasOwnProperty.call(node.constructor, "prototype")) {
        throw new SyntaxError("Object contains forbidden prototype property");
      }
      for (const key in node) {
        const value = node[key];
        if (value && typeof value === "object") {
          next.push(value);
        }
      }
    }
  }
  return obj;
}
function secureJsonParse(text) {
  const { stackTraceLimit } = Error;
  Error.stackTraceLimit = 0;
  try {
    return _parse(text);
  } finally {
    Error.stackTraceLimit = stackTraceLimit;
  }
}
var validatorSymbol = Symbol.for("vercel.ai.validator");
function validator(validate) {
  return { [validatorSymbol]: true, validate };
}
function isValidator(value) {
  return typeof value === "object" && value !== null && validatorSymbol in value && value[validatorSymbol] === true && "validate" in value;
}
function asValidator(value) {
  return isValidator(value) ? value : standardSchemaValidator(value);
}
function standardSchemaValidator(standardSchema) {
  return validator(async (value) => {
    const result = await standardSchema["~standard"].validate(value);
    return result.issues == null ? { success: true, value: result.value } : {
      success: false,
      error: new TypeValidationError({
        value,
        cause: result.issues
      })
    };
  });
}
async function validateTypes({
  value,
  schema
}) {
  const result = await safeValidateTypes({ value, schema });
  if (!result.success) {
    throw TypeValidationError.wrap({ value, cause: result.error });
  }
  return result.value;
}
async function safeValidateTypes({
  value,
  schema
}) {
  const validator2 = asValidator(schema);
  try {
    if (validator2.validate == null) {
      return { success: true, value, rawValue: value };
    }
    const result = await validator2.validate(value);
    if (result.success) {
      return { success: true, value: result.value, rawValue: value };
    }
    return {
      success: false,
      error: TypeValidationError.wrap({ value, cause: result.error }),
      rawValue: value
    };
  } catch (error) {
    return {
      success: false,
      error: TypeValidationError.wrap({ value, cause: error }),
      rawValue: value
    };
  }
}
async function parseJSON({
  text,
  schema
}) {
  try {
    const value = secureJsonParse(text);
    if (schema == null) {
      return value;
    }
    return validateTypes({ value, schema });
  } catch (error) {
    if (JSONParseError.isInstance(error) || TypeValidationError.isInstance(error)) {
      throw error;
    }
    throw new JSONParseError({ text, cause: error });
  }
}
async function safeParseJSON({
  text,
  schema
}) {
  try {
    const value = secureJsonParse(text);
    if (schema == null) {
      return { success: true, value, rawValue: value };
    }
    return await safeValidateTypes({ value, schema });
  } catch (error) {
    return {
      success: false,
      error: JSONParseError.isInstance(error) ? error : new JSONParseError({ text, cause: error }),
      rawValue: void 0
    };
  }
}
function isParsableJson(input) {
  try {
    secureJsonParse(input);
    return true;
  } catch (e) {
    return false;
  }
}
function parseJsonEventStream({
  stream,
  schema
}) {
  return stream.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream()).pipeThrough(
    new TransformStream({
      async transform({ data }, controller) {
        if (data === "[DONE]") {
          return;
        }
        controller.enqueue(await safeParseJSON({ text: data, schema }));
      }
    })
  );
}
var getOriginalFetch2 = () => globalThis.fetch;
var postJsonToApi = async ({
  url,
  headers,
  body,
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
  fetch
}) => postToApi({
  url,
  headers: __spreadValues({
    "Content-Type": "application/json"
  }, headers),
  body: {
    content: JSON.stringify(body),
    values: body
  },
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
  fetch
});
var postToApi = async ({
  url,
  headers = {},
  body,
  successfulResponseHandler,
  failedResponseHandler,
  abortSignal,
  fetch = getOriginalFetch2()
}) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: removeUndefinedEntries(headers),
      body: body.content,
      signal: abortSignal
    });
    const responseHeaders = extractResponseHeaders(response);
    if (!response.ok) {
      let errorInformation;
      try {
        errorInformation = await failedResponseHandler({
          response,
          url,
          requestBodyValues: body.values
        });
      } catch (error) {
        if (isAbortError(error) || APICallError.isInstance(error)) {
          throw error;
        }
        throw new APICallError({
          message: "Failed to process error response",
          cause: error,
          statusCode: response.status,
          url,
          responseHeaders,
          requestBodyValues: body.values
        });
      }
      throw errorInformation.value;
    }
    try {
      return await successfulResponseHandler({
        response,
        url,
        requestBodyValues: body.values
      });
    } catch (error) {
      if (error instanceof Error) {
        if (isAbortError(error) || APICallError.isInstance(error)) {
          throw error;
        }
      }
      throw new APICallError({
        message: "Failed to process successful response",
        cause: error,
        statusCode: response.status,
        url,
        responseHeaders,
        requestBodyValues: body.values
      });
    }
  } catch (error) {
    throw handleFetchError({ error, url, requestBodyValues: body.values });
  }
};
var createJsonErrorResponseHandler = ({
  errorSchema,
  errorToMessage,
  isRetryable
}) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const responseHeaders = extractResponseHeaders(response);
  if (responseBody.trim() === "") {
    return {
      responseHeaders,
      value: new APICallError({
        message: response.statusText,
        url,
        requestBodyValues,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        isRetryable: isRetryable == null ? void 0 : isRetryable(response)
      })
    };
  }
  try {
    const parsedError = await parseJSON({
      text: responseBody,
      schema: errorSchema
    });
    return {
      responseHeaders,
      value: new APICallError({
        message: errorToMessage(parsedError),
        url,
        requestBodyValues,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        data: parsedError,
        isRetryable: isRetryable == null ? void 0 : isRetryable(response, parsedError)
      })
    };
  } catch (parseError) {
    return {
      responseHeaders,
      value: new APICallError({
        message: response.statusText,
        url,
        requestBodyValues,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        isRetryable: isRetryable == null ? void 0 : isRetryable(response)
      })
    };
  }
};
var createEventSourceResponseHandler = (chunkSchema) => async ({ response }) => {
  const responseHeaders = extractResponseHeaders(response);
  if (response.body == null) {
    throw new EmptyResponseBodyError({});
  }
  return {
    responseHeaders,
    value: parseJsonEventStream({
      stream: response.body,
      schema: chunkSchema
    })
  };
};
var createJsonResponseHandler = (responseSchema) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedResult = await safeParseJSON({
    text: responseBody,
    schema: responseSchema
  });
  const responseHeaders = extractResponseHeaders(response);
  if (!parsedResult.success) {
    throw new APICallError({
      message: "Invalid JSON response",
      cause: parsedResult.error,
      statusCode: response.status,
      responseHeaders,
      responseBody,
      url,
      requestBodyValues
    });
  }
  return {
    responseHeaders,
    value: parsedResult.value,
    rawValue: parsedResult.rawValue
  };
};
var { btoa} = globalThis;
function convertUint8ArrayToBase64(array) {
  let latin1string = "";
  for (let i = 0; i < array.length; i++) {
    latin1string += String.fromCodePoint(array[i]);
  }
  return btoa(latin1string);
}
function withoutTrailingSlash(url) {
  return url == null ? void 0 : url.replace(/\/$/, "");
}
var ReasoningDetailSummarySchema = object({
  type: literal("reasoning.summary" /* Summary */),
  summary: string()
});
var ReasoningDetailEncryptedSchema = object({
  type: literal("reasoning.encrypted" /* Encrypted */),
  data: string()
});
var ReasoningDetailTextSchema = object({
  type: literal("reasoning.text" /* Text */),
  text: string().nullish(),
  signature: string().nullish()
});
var ReasoningDetailUnionSchema = union([
  ReasoningDetailSummarySchema,
  ReasoningDetailEncryptedSchema,
  ReasoningDetailTextSchema
]);
var ReasoningDetailsWithUnknownSchema = union([
  ReasoningDetailUnionSchema,
  unknown().transform(() => null)
]);
var ReasoningDetailArraySchema = array(ReasoningDetailsWithUnknownSchema).transform((d) => d.filter((d2) => !!d2));
var OpenRouterErrorResponseSchema = object({
  error: object({
    code: union([string(), number()]).nullable().optional().default(null),
    message: string(),
    type: string().nullable().optional().default(null),
    param: any().nullable().optional().default(null)
  })
});
var openrouterFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: OpenRouterErrorResponseSchema,
  errorToMessage: (data) => data.error.message
});

// src/utils/map-finish-reason.ts
function mapOpenRouterFinishReason(finishReason) {
  switch (finishReason) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "content_filter":
      return "content-filter";
    case "function_call":
    case "tool_calls":
      return "tool-calls";
    default:
      return "unknown";
  }
}

// src/chat/is-url.ts
function isUrl({
  url,
  protocols
}) {
  try {
    const urlObj = new URL(url);
    return protocols.has(urlObj.protocol);
  } catch (_) {
    return false;
  }
}

// src/chat/file-url-utils.ts
function getFileUrl({
  part,
  defaultMediaType
}) {
  var _a15, _b;
  if (part.data instanceof Uint8Array) {
    const base64 = convertUint8ArrayToBase64(part.data);
    return `data:${(_a15 = part.mediaType) != null ? _a15 : defaultMediaType};base64,${base64}`;
  }
  const stringUrl = part.data.toString();
  if (isUrl({
    url: stringUrl,
    protocols: /* @__PURE__ */ new Set(["http:", "https:"])
  })) {
    return stringUrl;
  }
  return stringUrl.startsWith("data:") ? stringUrl : `data:${(_b = part.mediaType) != null ? _b : defaultMediaType};base64,${stringUrl}`;
}

// src/chat/convert-to-openrouter-chat-messages.ts
function getCacheControl(providerMetadata) {
  var _a15, _b, _c;
  const anthropic = providerMetadata == null ? void 0 : providerMetadata.anthropic;
  const openrouter2 = providerMetadata == null ? void 0 : providerMetadata.openrouter;
  return (_c = (_b = (_a15 = openrouter2 == null ? void 0 : openrouter2.cacheControl) != null ? _a15 : openrouter2 == null ? void 0 : openrouter2.cache_control) != null ? _b : anthropic == null ? void 0 : anthropic.cacheControl) != null ? _c : anthropic == null ? void 0 : anthropic.cache_control;
}
function convertToOpenRouterChatMessages(prompt) {
  var _a15, _b, _c;
  const messages = [];
  for (const { role, content, providerOptions } of prompt) {
    switch (role) {
      case "system": {
        messages.push({
          role: "system",
          content,
          cache_control: getCacheControl(providerOptions)
        });
        break;
      }
      case "user": {
        if (content.length === 1 && ((_a15 = content[0]) == null ? void 0 : _a15.type) === "text") {
          const cacheControl = (_b = getCacheControl(providerOptions)) != null ? _b : getCacheControl(content[0].providerOptions);
          const contentWithCacheControl = cacheControl ? [
            {
              type: "text",
              text: content[0].text,
              cache_control: cacheControl
            }
          ] : content[0].text;
          messages.push({
            role: "user",
            content: contentWithCacheControl
          });
          break;
        }
        const messageCacheControl = getCacheControl(providerOptions);
        const contentParts = content.map(
          (part) => {
            var _a16, _b2, _c2, _d, _e, _f;
            const cacheControl = (_a16 = getCacheControl(part.providerOptions)) != null ? _a16 : messageCacheControl;
            switch (part.type) {
              case "text":
                return {
                  type: "text",
                  text: part.text,
                  // For text parts, only use part-specific cache control
                  cache_control: cacheControl
                };
              case "file": {
                if ((_b2 = part.mediaType) == null ? void 0 : _b2.startsWith("image/")) {
                  const url = getFileUrl({
                    part,
                    defaultMediaType: "image/jpeg"
                  });
                  return {
                    type: "image_url",
                    image_url: {
                      url
                    },
                    // For image parts, use part-specific or message-level cache control
                    cache_control: cacheControl
                  };
                }
                const fileName = String(
                  (_f = (_e = (_d = (_c2 = part.providerOptions) == null ? void 0 : _c2.openrouter) == null ? void 0 : _d.filename) != null ? _e : part.filename) != null ? _f : ""
                );
                const fileData = getFileUrl({
                  part,
                  defaultMediaType: "application/pdf"
                });
                if (isUrl({
                  url: fileData,
                  protocols: /* @__PURE__ */ new Set(["http:", "https:"])
                })) {
                  return {
                    type: "file",
                    file: {
                      filename: fileName,
                      file_data: fileData
                    }
                  };
                }
                return {
                  type: "file",
                  file: {
                    filename: fileName,
                    file_data: fileData
                  },
                  cache_control: cacheControl
                };
              }
              default: {
                return {
                  type: "text",
                  text: "",
                  cache_control: cacheControl
                };
              }
            }
          }
        );
        messages.push({
          role: "user",
          content: contentParts
        });
        break;
      }
      case "assistant": {
        let text = "";
        let reasoning = "";
        const reasoningDetails = [];
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
            case "reasoning": {
              reasoning += part.text;
              reasoningDetails.push({
                type: "reasoning.text" /* Text */,
                text: part.text
              });
              break;
            }
          }
        }
        messages.push({
          role: "assistant",
          content: text,
          tool_calls: toolCalls.length > 0 ? toolCalls : void 0,
          reasoning: reasoning || void 0,
          reasoning_details: reasoningDetails.length > 0 ? reasoningDetails : void 0,
          cache_control: getCacheControl(providerOptions)
        });
        break;
      }
      case "tool": {
        for (const toolResponse of content) {
          const content2 = getToolResultContent(toolResponse);
          messages.push({
            role: "tool",
            tool_call_id: toolResponse.toolCallId,
            content: content2,
            cache_control: (_c = getCacheControl(providerOptions)) != null ? _c : getCacheControl(toolResponse.providerOptions)
          });
        }
        break;
      }
    }
  }
  return messages;
}
function getToolResultContent(input) {
  return input.output.type === "text" ? input.output.value : JSON.stringify(input.output.value);
}
union([
  literal("auto"),
  literal("none"),
  literal("required"),
  object({
    type: literal("function"),
    function: object({
      name: string()
    })
  })
]);
function getChatCompletionToolChoice(toolChoice) {
  switch (toolChoice.type) {
    case "auto":
    case "none":
    case "required":
      return toolChoice.type;
    case "tool": {
      return {
        type: "function",
        function: { name: toolChoice.toolName }
      };
    }
    default: {
      throw new Error(`Invalid tool choice type: ${toolChoice}`);
    }
  }
}
var OpenRouterChatCompletionBaseResponseSchema = object({
  id: string().optional(),
  model: string().optional(),
  usage: object({
    prompt_tokens: number(),
    prompt_tokens_details: object({
      cached_tokens: number()
    }).nullish(),
    completion_tokens: number(),
    completion_tokens_details: object({
      reasoning_tokens: number()
    }).nullish(),
    total_tokens: number(),
    cost: number().optional(),
    cost_details: object({
      upstream_inference_cost: number().nullish()
    }).nullish()
  }).nullish()
});
var OpenRouterNonStreamChatCompletionResponseSchema = OpenRouterChatCompletionBaseResponseSchema.extend({
  choices: array(
    object({
      message: object({
        role: literal("assistant"),
        content: string().nullable().optional(),
        reasoning: string().nullable().optional(),
        reasoning_details: ReasoningDetailArraySchema.nullish(),
        tool_calls: array(
          object({
            id: string().optional().nullable(),
            type: literal("function"),
            function: object({
              name: string(),
              arguments: string()
            })
          })
        ).optional()
      }),
      index: number().nullish(),
      logprobs: object({
        content: array(
          object({
            token: string(),
            logprob: number(),
            top_logprobs: array(
              object({
                token: string(),
                logprob: number()
              })
            )
          })
        ).nullable()
      }).nullable().optional(),
      finish_reason: string().optional().nullable()
    })
  )
});
var OpenRouterStreamChatCompletionChunkSchema = union([
  OpenRouterChatCompletionBaseResponseSchema.extend({
    choices: array(
      object({
        delta: object({
          role: _enum(["assistant"]).optional(),
          content: string().nullish(),
          reasoning: string().nullish().optional(),
          reasoning_details: ReasoningDetailArraySchema.nullish(),
          tool_calls: array(
            object({
              index: number().nullish(),
              id: string().nullish(),
              type: literal("function").optional(),
              function: object({
                name: string().nullish(),
                arguments: string().nullish()
              })
            })
          ).nullish()
        }).nullish(),
        logprobs: object({
          content: array(
            object({
              token: string(),
              logprob: number(),
              top_logprobs: array(
                object({
                  token: string(),
                  logprob: number()
                })
              )
            })
          ).nullable()
        }).nullish(),
        finish_reason: string().nullable().optional(),
        index: number().nullish()
      })
    )
  }),
  OpenRouterErrorResponseSchema
]);

// src/chat/index.ts
var OpenRouterChatLanguageModel = class {
  constructor(modelId, settings, config) {
    this.specificationVersion = "v2";
    this.provider = "openrouter";
    this.defaultObjectGenerationMode = "tool";
    this.supportedUrls = {
      "image/*": [
        /^data:image\/[a-zA-Z]+;base64,/,
        /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i
      ],
      // 'text/*': [/^data:text\//, /^https?:\/\/.+$/],
      "application/*": [/^data:application\//, /^https?:\/\/.+$/]
    };
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }
  getArgs({
    prompt,
    maxOutputTokens,
    temperature,
    topP,
    frequencyPenalty,
    presencePenalty,
    seed,
    stopSequences,
    responseFormat,
    topK,
    tools,
    toolChoice
  }) {
    var _a15;
    const baseArgs = __spreadValues(__spreadValues({
      // model id:
      model: this.modelId,
      models: this.settings.models,
      // model specific settings:
      logit_bias: this.settings.logitBias,
      logprobs: this.settings.logprobs === true || typeof this.settings.logprobs === "number" ? true : void 0,
      top_logprobs: typeof this.settings.logprobs === "number" ? this.settings.logprobs : typeof this.settings.logprobs === "boolean" ? this.settings.logprobs ? 0 : void 0 : void 0,
      user: this.settings.user,
      parallel_tool_calls: this.settings.parallelToolCalls,
      // standardized settings:
      max_tokens: maxOutputTokens,
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      seed,
      stop: stopSequences,
      response_format: responseFormat,
      top_k: topK,
      // messages:
      messages: convertToOpenRouterChatMessages(prompt),
      // OpenRouter specific settings:
      include_reasoning: this.settings.includeReasoning,
      reasoning: this.settings.reasoning,
      usage: this.settings.usage
    }, this.config.extraBody), this.settings.extraBody);
    if ((responseFormat == null ? void 0 : responseFormat.type) === "json" && responseFormat.schema != null) {
      return __spreadProps(__spreadValues({}, baseArgs), {
        response_format: {
          type: "json_schema",
          json_schema: __spreadValues({
            schema: responseFormat.schema,
            strict: true,
            name: (_a15 = responseFormat.name) != null ? _a15 : "response"
          }, responseFormat.description && {
            description: responseFormat.description
          })
        }
      });
    }
    if (tools && tools.length > 0) {
      const mappedTools = tools.filter((tool) => tool.type === "function").map((tool) => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.type,
          parameters: tool.inputSchema
        }
      }));
      return __spreadProps(__spreadValues({}, baseArgs), {
        tools: mappedTools,
        tool_choice: toolChoice ? getChatCompletionToolChoice(toolChoice) : void 0
      });
    }
    return baseArgs;
  }
  async doGenerate(options) {
    var _a15, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    const providerOptions = options.providerOptions || {};
    const openrouterOptions = providerOptions.openrouter || {};
    const args = __spreadValues(__spreadValues({}, this.getArgs(options)), openrouterOptions);
    const { value: response, responseHeaders } = await postJsonToApi({
      url: this.config.url({
        path: "/chat/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: args,
      failedResponseHandler: openrouterFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        OpenRouterNonStreamChatCompletionResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const choice = response.choices[0];
    if (!choice) {
      throw new Error("No choice in response");
    }
    const usageInfo = response.usage ? {
      inputTokens: (_a15 = response.usage.prompt_tokens) != null ? _a15 : 0,
      outputTokens: (_b = response.usage.completion_tokens) != null ? _b : 0,
      totalTokens: ((_c = response.usage.prompt_tokens) != null ? _c : 0) + ((_d = response.usage.completion_tokens) != null ? _d : 0),
      reasoningTokens: (_f = (_e = response.usage.completion_tokens_details) == null ? void 0 : _e.reasoning_tokens) != null ? _f : 0,
      cachedInputTokens: (_h = (_g = response.usage.prompt_tokens_details) == null ? void 0 : _g.cached_tokens) != null ? _h : 0
    } : {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      reasoningTokens: 0,
      cachedInputTokens: 0
    };
    const reasoningDetails = (_i = choice.message.reasoning_details) != null ? _i : [];
    const reasoning = reasoningDetails.length > 0 ? reasoningDetails.map((detail) => {
      switch (detail.type) {
        case "reasoning.text" /* Text */: {
          if (detail.text) {
            return {
              type: "reasoning",
              text: detail.text
            };
          }
          break;
        }
        case "reasoning.summary" /* Summary */: {
          if (detail.summary) {
            return {
              type: "reasoning",
              text: detail.summary
            };
          }
          break;
        }
        case "reasoning.encrypted" /* Encrypted */: {
          if (detail.data) {
            return {
              type: "reasoning",
              text: "[REDACTED]"
            };
          }
          break;
        }
      }
      return null;
    }).filter((p) => p !== null) : choice.message.reasoning ? [
      {
        type: "reasoning",
        text: choice.message.reasoning
      }
    ] : [];
    const content = [];
    content.push(...reasoning);
    if (choice.message.content) {
      content.push({
        type: "text",
        text: choice.message.content
      });
    }
    if (choice.message.tool_calls) {
      for (const toolCall of choice.message.tool_calls) {
        content.push({
          type: "tool-call",
          toolCallId: (_j = toolCall.id) != null ? _j : generateId(),
          toolName: toolCall.function.name,
          input: toolCall.function.arguments
        });
      }
    }
    return {
      content,
      finishReason: mapOpenRouterFinishReason(choice.finish_reason),
      usage: usageInfo,
      warnings: [],
      providerMetadata: {
        openrouter: {
          usage: {
            promptTokens: (_k = usageInfo.inputTokens) != null ? _k : 0,
            completionTokens: (_l = usageInfo.outputTokens) != null ? _l : 0,
            totalTokens: (_m = usageInfo.totalTokens) != null ? _m : 0,
            cost: (_n = response.usage) == null ? void 0 : _n.cost,
            promptTokensDetails: {
              cachedTokens: (_q = (_p = (_o = response.usage) == null ? void 0 : _o.prompt_tokens_details) == null ? void 0 : _p.cached_tokens) != null ? _q : 0
            },
            completionTokensDetails: {
              reasoningTokens: (_t = (_s = (_r = response.usage) == null ? void 0 : _r.completion_tokens_details) == null ? void 0 : _s.reasoning_tokens) != null ? _t : 0
            },
            costDetails: {
              upstreamInferenceCost: (_w = (_v = (_u = response.usage) == null ? void 0 : _u.cost_details) == null ? void 0 : _v.upstream_inference_cost) != null ? _w : 0
            }
          }
        }
      },
      request: { body: args },
      response: {
        id: response.id,
        modelId: response.model,
        headers: responseHeaders
      }
    };
  }
  async doStream(options) {
    var _a15;
    const providerOptions = options.providerOptions || {};
    const openrouterOptions = providerOptions.openrouter || {};
    const args = __spreadValues(__spreadValues({}, this.getArgs(options)), openrouterOptions);
    const { value: response, responseHeaders } = await postJsonToApi({
      url: this.config.url({
        path: "/chat/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: __spreadProps(__spreadValues({}, args), {
        stream: true,
        // only include stream_options when in strict compatibility mode:
        stream_options: this.config.compatibility === "strict" ? __spreadValues({
          include_usage: true
        }, ((_a15 = this.settings.usage) == null ? void 0 : _a15.include) ? { include_usage: true } : {}) : void 0
      }),
      failedResponseHandler: openrouterFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(
        OpenRouterStreamChatCompletionChunkSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const toolCalls = [];
    let finishReason = "other";
    const usage = {
      inputTokens: Number.NaN,
      outputTokens: Number.NaN,
      totalTokens: Number.NaN,
      reasoningTokens: Number.NaN,
      cachedInputTokens: Number.NaN
    };
    const openrouterUsage = {};
    let textStarted = false;
    let reasoningStarted = false;
    let textId;
    let reasoningId;
    let openrouterResponseId;
    return {
      stream: response.pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            var _a16, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
            if (!chunk.success) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            if ("error" in value) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: value.error });
              return;
            }
            if (value.id) {
              openrouterResponseId = value.id;
              controller.enqueue({
                type: "response-metadata",
                id: value.id
              });
            }
            if (value.model) {
              controller.enqueue({
                type: "response-metadata",
                modelId: value.model
              });
            }
            if (value.usage != null) {
              usage.inputTokens = value.usage.prompt_tokens;
              usage.outputTokens = value.usage.completion_tokens;
              usage.totalTokens = value.usage.prompt_tokens + value.usage.completion_tokens;
              openrouterUsage.promptTokens = value.usage.prompt_tokens;
              if (value.usage.prompt_tokens_details) {
                const cachedInputTokens = (_a16 = value.usage.prompt_tokens_details.cached_tokens) != null ? _a16 : 0;
                usage.cachedInputTokens = cachedInputTokens;
                openrouterUsage.promptTokensDetails = {
                  cachedTokens: cachedInputTokens
                };
              }
              openrouterUsage.completionTokens = value.usage.completion_tokens;
              if (value.usage.completion_tokens_details) {
                const reasoningTokens = (_b = value.usage.completion_tokens_details.reasoning_tokens) != null ? _b : 0;
                usage.reasoningTokens = reasoningTokens;
                openrouterUsage.completionTokensDetails = {
                  reasoningTokens
                };
              }
              openrouterUsage.cost = value.usage.cost;
              openrouterUsage.totalTokens = value.usage.total_tokens;
            }
            const choice = value.choices[0];
            if ((choice == null ? void 0 : choice.finish_reason) != null) {
              finishReason = mapOpenRouterFinishReason(choice.finish_reason);
            }
            if ((choice == null ? void 0 : choice.delta) == null) {
              return;
            }
            const delta = choice.delta;
            const emitReasoningChunk = (chunkText) => {
              if (!reasoningStarted) {
                reasoningId = openrouterResponseId || generateId();
                controller.enqueue({
                  type: "reasoning-start",
                  id: reasoningId
                });
                reasoningStarted = true;
              }
              controller.enqueue({
                type: "reasoning-delta",
                delta: chunkText,
                id: reasoningId || generateId()
              });
            };
            if (delta.reasoning_details && delta.reasoning_details.length > 0) {
              for (const detail of delta.reasoning_details) {
                switch (detail.type) {
                  case "reasoning.text" /* Text */: {
                    if (detail.text) {
                      emitReasoningChunk(detail.text);
                    }
                    break;
                  }
                  case "reasoning.encrypted" /* Encrypted */: {
                    if (detail.data) {
                      emitReasoningChunk("[REDACTED]");
                    }
                    break;
                  }
                  case "reasoning.summary" /* Summary */: {
                    if (detail.summary) {
                      emitReasoningChunk(detail.summary);
                    }
                    break;
                  }
                }
              }
            } else if (delta.reasoning != null) {
              emitReasoningChunk(delta.reasoning);
            }
            if (delta.content != null) {
              if (!textStarted) {
                textId = openrouterResponseId || generateId();
                controller.enqueue({
                  type: "text-start",
                  id: textId
                });
                textStarted = true;
              }
              controller.enqueue({
                type: "text-delta",
                delta: delta.content,
                id: textId || generateId()
              });
            }
            if (delta.tool_calls != null) {
              for (const toolCallDelta of delta.tool_calls) {
                const index = (_c = toolCallDelta.index) != null ? _c : toolCalls.length - 1;
                if (toolCalls[index] == null) {
                  if (toolCallDelta.type !== "function") {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'function' type.`
                    });
                  }
                  if (toolCallDelta.id == null) {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'id' to be a string.`
                    });
                  }
                  if (((_d = toolCallDelta.function) == null ? void 0 : _d.name) == null) {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'function.name' to be a string.`
                    });
                  }
                  toolCalls[index] = {
                    id: toolCallDelta.id,
                    type: "function",
                    function: {
                      name: toolCallDelta.function.name,
                      arguments: (_e = toolCallDelta.function.arguments) != null ? _e : ""
                    },
                    inputStarted: false,
                    sent: false
                  };
                  const toolCall2 = toolCalls[index];
                  if (toolCall2 == null) {
                    throw new Error("Tool call is missing");
                  }
                  if (((_f = toolCall2.function) == null ? void 0 : _f.name) != null && ((_g = toolCall2.function) == null ? void 0 : _g.arguments) != null && isParsableJson(toolCall2.function.arguments)) {
                    toolCall2.inputStarted = true;
                    controller.enqueue({
                      type: "tool-input-start",
                      id: toolCall2.id,
                      toolName: toolCall2.function.name
                    });
                    controller.enqueue({
                      type: "tool-input-delta",
                      id: toolCall2.id,
                      delta: toolCall2.function.arguments
                    });
                    controller.enqueue({
                      type: "tool-input-end",
                      id: toolCall2.id
                    });
                    controller.enqueue({
                      type: "tool-call",
                      toolCallId: toolCall2.id,
                      toolName: toolCall2.function.name,
                      input: toolCall2.function.arguments
                    });
                    toolCall2.sent = true;
                  }
                  continue;
                }
                const toolCall = toolCalls[index];
                if (toolCall == null) {
                  throw new Error("Tool call is missing");
                }
                if (!toolCall.inputStarted) {
                  toolCall.inputStarted = true;
                  controller.enqueue({
                    type: "tool-input-start",
                    id: toolCall.id,
                    toolName: toolCall.function.name
                  });
                }
                if (((_h = toolCallDelta.function) == null ? void 0 : _h.arguments) != null) {
                  toolCall.function.arguments += (_j = (_i = toolCallDelta.function) == null ? void 0 : _i.arguments) != null ? _j : "";
                }
                controller.enqueue({
                  type: "tool-input-delta",
                  id: toolCall.id,
                  delta: (_k = toolCallDelta.function.arguments) != null ? _k : ""
                });
                if (((_l = toolCall.function) == null ? void 0 : _l.name) != null && ((_m = toolCall.function) == null ? void 0 : _m.arguments) != null && isParsableJson(toolCall.function.arguments)) {
                  controller.enqueue({
                    type: "tool-call",
                    toolCallId: (_n = toolCall.id) != null ? _n : generateId(),
                    toolName: toolCall.function.name,
                    input: toolCall.function.arguments
                  });
                  toolCall.sent = true;
                }
              }
            }
          },
          flush(controller) {
            var _a16;
            if (finishReason === "tool-calls") {
              for (const toolCall of toolCalls) {
                if (toolCall && !toolCall.sent) {
                  controller.enqueue({
                    type: "tool-call",
                    toolCallId: (_a16 = toolCall.id) != null ? _a16 : generateId(),
                    toolName: toolCall.function.name,
                    // Coerce invalid arguments to an empty JSON object
                    input: isParsableJson(toolCall.function.arguments) ? toolCall.function.arguments : "{}"
                  });
                  toolCall.sent = true;
                }
              }
            }
            if (textStarted) {
              controller.enqueue({
                type: "text-end",
                id: textId || generateId()
              });
            }
            if (reasoningStarted) {
              controller.enqueue({
                type: "reasoning-end",
                id: reasoningId || generateId()
              });
            }
            controller.enqueue({
              type: "finish",
              finishReason,
              usage,
              providerMetadata: {
                openrouter: {
                  usage: openrouterUsage
                }
              }
            });
          }
        })
      ),
      warnings: [],
      request: { body: args },
      response: { headers: responseHeaders }
    };
  }
};

// src/completion/convert-to-openrouter-completion-prompt.ts
function convertToOpenRouterCompletionPrompt({
  prompt,
  inputFormat,
  user = "user",
  assistant = "assistant"
}) {
  if (prompt.length === 1 && prompt[0] && prompt[0].role === "user" && prompt[0].content.length === 1 && prompt[0].content[0] && prompt[0].content[0].type === "text") {
    return { prompt: prompt[0].content[0].text };
  }
  let text = "";
  if (prompt[0] && prompt[0].role === "system") {
    text += `${prompt[0].content}

`;
    prompt = prompt.slice(1);
  }
  for (const { role, content } of prompt) {
    switch (role) {
      case "system": {
        throw new InvalidPromptError({
          message: `Unexpected system message in prompt: ${content}`,
          prompt
        });
      }
      case "user": {
        const userMessage = content.map((part) => {
          switch (part.type) {
            case "text": {
              return part.text;
            }
            case "file": {
              throw new UnsupportedFunctionalityError({
                functionality: "file attachments"
              });
            }
            default: {
              return "";
            }
          }
        }).join("");
        text += `${user}:
${userMessage}

`;
        break;
      }
      case "assistant": {
        const assistantMessage = content.map(
          (part) => {
            switch (part.type) {
              case "text": {
                return part.text;
              }
              case "tool-call": {
                throw new UnsupportedFunctionalityError({
                  functionality: "tool-call messages"
                });
              }
              case "tool-result": {
                throw new UnsupportedFunctionalityError({
                  functionality: "tool-result messages"
                });
              }
              case "reasoning": {
                throw new UnsupportedFunctionalityError({
                  functionality: "reasoning messages"
                });
              }
              case "file": {
                throw new UnsupportedFunctionalityError({
                  functionality: "file attachments"
                });
              }
              default: {
                return "";
              }
            }
          }
        ).join("");
        text += `${assistant}:
${assistantMessage}

`;
        break;
      }
      case "tool": {
        throw new UnsupportedFunctionalityError({
          functionality: "tool messages"
        });
      }
    }
  }
  text += `${assistant}:
`;
  return {
    prompt: text
  };
}
var OpenRouterCompletionChunkSchema = union([
  object({
    id: string().optional(),
    model: string().optional(),
    choices: array(
      object({
        text: string(),
        reasoning: string().nullish().optional(),
        reasoning_details: ReasoningDetailArraySchema.nullish(),
        finish_reason: string().nullish(),
        index: number().nullish(),
        logprobs: object({
          tokens: array(string()),
          token_logprobs: array(number()),
          top_logprobs: array(record(string(), number())).nullable()
        }).nullable().optional()
      })
    ),
    usage: object({
      prompt_tokens: number(),
      prompt_tokens_details: object({
        cached_tokens: number()
      }).nullish(),
      completion_tokens: number(),
      completion_tokens_details: object({
        reasoning_tokens: number()
      }).nullish(),
      total_tokens: number(),
      cost: number().optional()
    }).nullish()
  }),
  OpenRouterErrorResponseSchema
]);

// src/completion/index.ts
var OpenRouterCompletionLanguageModel = class {
  constructor(modelId, settings, config) {
    this.specificationVersion = "v2";
    this.provider = "openrouter";
    this.supportedUrls = {
      "image/*": [
        /^data:image\/[a-zA-Z]+;base64,/,
        /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i
      ],
      "text/*": [/^data:text\//, /^https?:\/\/.+$/],
      "application/*": [/^data:application\//, /^https?:\/\/.+$/]
    };
    this.defaultObjectGenerationMode = void 0;
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }
  getArgs({
    prompt,
    maxOutputTokens,
    temperature,
    topP,
    frequencyPenalty,
    presencePenalty,
    seed,
    responseFormat,
    topK,
    stopSequences,
    tools,
    toolChoice
  }) {
    const { prompt: completionPrompt } = convertToOpenRouterCompletionPrompt({
      prompt,
      inputFormat: "prompt"
    });
    if (tools == null ? void 0 : tools.length) {
      throw new UnsupportedFunctionalityError({
        functionality: "tools"
      });
    }
    if (toolChoice) {
      throw new UnsupportedFunctionalityError({
        functionality: "toolChoice"
      });
    }
    return __spreadValues(__spreadValues({
      // model id:
      model: this.modelId,
      models: this.settings.models,
      // model specific settings:
      logit_bias: this.settings.logitBias,
      logprobs: typeof this.settings.logprobs === "number" ? this.settings.logprobs : typeof this.settings.logprobs === "boolean" ? this.settings.logprobs ? 0 : void 0 : void 0,
      suffix: this.settings.suffix,
      user: this.settings.user,
      // standardized settings:
      max_tokens: maxOutputTokens,
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      seed,
      stop: stopSequences,
      response_format: responseFormat,
      top_k: topK,
      // prompt:
      prompt: completionPrompt,
      // OpenRouter specific settings:
      include_reasoning: this.settings.includeReasoning,
      reasoning: this.settings.reasoning
    }, this.config.extraBody), this.settings.extraBody);
  }
  async doGenerate(options) {
    var _a15, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
    const providerOptions = options.providerOptions || {};
    const openrouterOptions = providerOptions.openrouter || {};
    const args = __spreadValues(__spreadValues({}, this.getArgs(options)), openrouterOptions);
    const { value: response, responseHeaders } = await postJsonToApi({
      url: this.config.url({
        path: "/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: args,
      failedResponseHandler: openrouterFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        OpenRouterCompletionChunkSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    if ("error" in response) {
      throw new Error(`${response.error.message}`);
    }
    const choice = response.choices[0];
    if (!choice) {
      throw new Error("No choice in OpenRouter completion response");
    }
    return {
      content: [
        {
          type: "text",
          text: (_a15 = choice.text) != null ? _a15 : ""
        }
      ],
      finishReason: mapOpenRouterFinishReason(choice.finish_reason),
      usage: {
        inputTokens: (_c = (_b = response.usage) == null ? void 0 : _b.prompt_tokens) != null ? _c : 0,
        outputTokens: (_e = (_d = response.usage) == null ? void 0 : _d.completion_tokens) != null ? _e : 0,
        totalTokens: ((_g = (_f = response.usage) == null ? void 0 : _f.prompt_tokens) != null ? _g : 0) + ((_i = (_h = response.usage) == null ? void 0 : _h.completion_tokens) != null ? _i : 0),
        reasoningTokens: (_l = (_k = (_j = response.usage) == null ? void 0 : _j.completion_tokens_details) == null ? void 0 : _k.reasoning_tokens) != null ? _l : 0,
        cachedInputTokens: (_o = (_n = (_m = response.usage) == null ? void 0 : _m.prompt_tokens_details) == null ? void 0 : _n.cached_tokens) != null ? _o : 0
      },
      warnings: [],
      response: {
        headers: responseHeaders
      }
    };
  }
  async doStream(options) {
    const providerOptions = options.providerOptions || {};
    const openrouterOptions = providerOptions.openrouter || {};
    const args = __spreadValues(__spreadValues({}, this.getArgs(options)), openrouterOptions);
    const { value: response, responseHeaders } = await postJsonToApi({
      url: this.config.url({
        path: "/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: __spreadProps(__spreadValues({}, args), {
        stream: true,
        // only include stream_options when in strict compatibility mode:
        stream_options: this.config.compatibility === "strict" ? { include_usage: true } : void 0
      }),
      failedResponseHandler: openrouterFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(
        OpenRouterCompletionChunkSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    let finishReason = "other";
    const usage = {
      inputTokens: Number.NaN,
      outputTokens: Number.NaN,
      totalTokens: Number.NaN,
      reasoningTokens: Number.NaN,
      cachedInputTokens: Number.NaN
    };
    const openrouterUsage = {};
    return {
      stream: response.pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            var _a15, _b;
            if (!chunk.success) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            if ("error" in value) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: value.error });
              return;
            }
            if (value.usage != null) {
              usage.inputTokens = value.usage.prompt_tokens;
              usage.outputTokens = value.usage.completion_tokens;
              usage.totalTokens = value.usage.prompt_tokens + value.usage.completion_tokens;
              openrouterUsage.promptTokens = value.usage.prompt_tokens;
              if (value.usage.prompt_tokens_details) {
                const cachedInputTokens = (_a15 = value.usage.prompt_tokens_details.cached_tokens) != null ? _a15 : 0;
                usage.cachedInputTokens = cachedInputTokens;
                openrouterUsage.promptTokensDetails = {
                  cachedTokens: cachedInputTokens
                };
              }
              openrouterUsage.completionTokens = value.usage.completion_tokens;
              if (value.usage.completion_tokens_details) {
                const reasoningTokens = (_b = value.usage.completion_tokens_details.reasoning_tokens) != null ? _b : 0;
                usage.reasoningTokens = reasoningTokens;
                openrouterUsage.completionTokensDetails = {
                  reasoningTokens
                };
              }
              openrouterUsage.cost = value.usage.cost;
              openrouterUsage.totalTokens = value.usage.total_tokens;
            }
            const choice = value.choices[0];
            if ((choice == null ? void 0 : choice.finish_reason) != null) {
              finishReason = mapOpenRouterFinishReason(choice.finish_reason);
            }
            if ((choice == null ? void 0 : choice.text) != null) {
              controller.enqueue({
                type: "text-delta",
                delta: choice.text,
                id: generateId()
              });
            }
          },
          flush(controller) {
            controller.enqueue({
              type: "finish",
              finishReason,
              usage,
              providerMetadata: {
                openrouter: {
                  usage: openrouterUsage
                }
              }
            });
          }
        })
      ),
      response: {
        headers: responseHeaders
      }
    };
  }
};

// src/provider.ts
function createOpenRouter(options = {}) {
  var _a15, _b, _c;
  const baseURL = (_b = withoutTrailingSlash((_a15 = options.baseURL) != null ? _a15 : options.baseUrl)) != null ? _b : "https://openrouter.ai/api/v1";
  const compatibility = (_c = options.compatibility) != null ? _c : "compatible";
  const getHeaders = () => __spreadValues({
    Authorization: `Bearer ${loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: "OPENROUTER_API_KEY",
      description: "OpenRouter"
    })}`
  }, options.headers);
  const createChatModel = (modelId, settings = {}) => new OpenRouterChatLanguageModel(modelId, settings, {
    provider: "openrouter.chat",
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    compatibility,
    fetch: options.fetch,
    extraBody: options.extraBody
  });
  const createCompletionModel = (modelId, settings = {}) => new OpenRouterCompletionLanguageModel(modelId, settings, {
    provider: "openrouter.completion",
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    compatibility,
    fetch: options.fetch,
    extraBody: options.extraBody
  });
  const createLanguageModel = (modelId, settings) => {
    if (new.target) {
      throw new Error(
        "The OpenRouter model function cannot be called with the new keyword."
      );
    }
    if (modelId === "openai/gpt-3.5-turbo-instruct") {
      return createCompletionModel(
        modelId,
        settings
      );
    }
    return createChatModel(modelId, settings);
  };
  const provider = (modelId, settings) => createLanguageModel(modelId, settings);
  provider.languageModel = createLanguageModel;
  provider.chat = createChatModel;
  provider.completion = createCompletionModel;
  return provider;
}
createOpenRouter({
  compatibility: "strict"
  // strict for OpenRouter API
});

/**
 * OpenRouter Provider implementation
 */
class OpenRouterProvider {
    constructor() {
        this.name = 'openrouter';
        this.defaultModel = 'meta-llama/llama-3.1-8b-instruct:free';
        this.description = 'OpenRouter models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.OPENROUTER_API_KEY) {
                config.apiKey = options.apiKey || process.env.OPENROUTER_API_KEY;
            }
            if (options.baseURL || process.env.OPENROUTER_BASE_URL) {
                config.baseURL = options.baseURL || process.env.OPENROUTER_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            if (options.extraBody) {
                config.extraBody = options.extraBody;
            }
            // OpenRouter will validate API key during actual API calls
            const openrouterProvider = createOpenRouter(config);
            // Support both model-only and model-with-settings formats
            const model = openrouterProvider(modelId, options.modelSettings || {});
            if (!model) {
                throw new Error(`Failed to create OpenRouter model with ID: ${modelId}`);
            }
            return model;
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Failed to create OpenRouter model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'OPENROUTER_API_KEY',
            baseURL: 'OPENROUTER_BASE_URL'
        };
    }
}

// src/perplexity-provider.ts
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
                  url: `data:${(_a = part.mediaType) != null ? _a : "image/jpeg"};base64,${typeof part.data === "string" ? part.data : convertUint8ArrayToBase64$1(part.data)}`
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
        throw new UnsupportedFunctionalityError$1({
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
    } = await postJsonToApi$1({
      url: `${this.config.baseURL}/chat/completions`,
      headers: combineHeaders$1(this.config.headers(), options.headers),
      body,
      failedResponseHandler: createJsonErrorResponseHandler$1({
        errorSchema: perplexityErrorSchema,
        errorToMessage
      }),
      successfulResponseHandler: createJsonResponseHandler$1(
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
    const { responseHeaders, value: response } = await postJsonToApi$1({
      url: `${this.config.baseURL}/chat/completions`,
      headers: combineHeaders$1(this.config.headers(), options.headers),
      body,
      failedResponseHandler: createJsonErrorResponseHandler$1({
        errorSchema: perplexityErrorSchema,
        errorToMessage
      }),
      successfulResponseHandler: createEventSourceResponseHandler$1(
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
var perplexityUsageSchema = object({
  prompt_tokens: number(),
  completion_tokens: number(),
  total_tokens: number().nullish(),
  citation_tokens: number().nullish(),
  num_search_queries: number().nullish()
});
var perplexityImageSchema = object({
  image_url: string(),
  origin_url: string(),
  height: number(),
  width: number()
});
var perplexityResponseSchema = object({
  id: string(),
  created: number(),
  model: string(),
  choices: array(
    object({
      message: object({
        role: literal("assistant"),
        content: string()
      }),
      finish_reason: string().nullish()
    })
  ),
  citations: array(string()).nullish(),
  images: array(perplexityImageSchema).nullish(),
  usage: perplexityUsageSchema.nullish()
});
var perplexityChunkSchema = object({
  id: string(),
  created: number(),
  model: string(),
  choices: array(
    object({
      delta: object({
        role: literal("assistant"),
        content: string()
      }),
      finish_reason: string().nullish()
    })
  ),
  citations: array(string()).nullish(),
  images: array(perplexityImageSchema).nullish(),
  usage: perplexityUsageSchema.nullish()
});
var perplexityErrorSchema = object({
  error: object({
    code: number(),
    message: string().nullish(),
    type: string().nullish()
  })
});
var errorToMessage = (data) => {
  var _a, _b;
  return (_b = (_a = data.error.message) != null ? _a : data.error.type) != null ? _b : "unknown error";
};

// src/perplexity-provider.ts
function createPerplexity(options = {}) {
  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey$1({
      apiKey: options.apiKey,
      environmentVariableName: "PERPLEXITY_API_KEY",
      description: "Perplexity"
    })}`,
    ...options.headers
  });
  const createLanguageModel = (modelId) => {
    var _a;
    return new PerplexityLanguageModel(modelId, {
      baseURL: withoutTrailingSlash$1(
        (_a = options.baseURL) != null ? _a : "https://api.perplexity.ai"
      ),
      headers: getHeaders,
      generateId: generateId$1,
      fetch: options.fetch
    });
  };
  const provider = (modelId) => createLanguageModel(modelId);
  provider.languageModel = createLanguageModel;
  provider.textEmbeddingModel = (modelId) => {
    throw new NoSuchModelError({ modelId, modelType: "textEmbeddingModel" });
  };
  provider.imageModel = (modelId) => {
    throw new NoSuchModelError({ modelId, modelType: "imageModel" });
  };
  return provider;
}
createPerplexity();

/**
 * Perplexity Provider implementation
 */
class PerplexityProvider {
    constructor() {
        this.name = 'perplexity';
        this.defaultModel = 'llama-3.1-sonar-small-128k-online';
        this.description = 'Perplexity models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.PERPLEXITY_API_KEY) {
                config.apiKey = options.apiKey || process.env.PERPLEXITY_API_KEY;
            }
            if (options.baseURL || process.env.PERPLEXITY_BASE_URL) {
                config.baseURL = options.baseURL || process.env.PERPLEXITY_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const perplexityProvider = createPerplexity(config);
            return perplexityProvider(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create Perplexity model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'PERPLEXITY_API_KEY',
            baseURL: 'PERPLEXITY_BASE_URL'
        };
    }
}

// src/togetherai-provider.ts
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
    const { value: response, responseHeaders } = await postJsonToApi$1({
      url: `${this.config.baseURL}/images/generations`,
      headers: combineHeaders$1(this.config.headers(), headers),
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
      failedResponseHandler: createJsonErrorResponseHandler$1({
        errorSchema: togetheraiErrorSchema,
        errorToMessage: (data) => data.error.message
      }),
      successfulResponseHandler: createJsonResponseHandler$1(
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
var togetheraiImageResponseSchema = object({
  data: array(
    object({
      b64_json: string()
    })
  )
});
var togetheraiErrorSchema = object({
  error: object({
    message: string()
  })
});

// src/togetherai-provider.ts
function createTogetherAI(options = {}) {
  var _a;
  const baseURL = withoutTrailingSlash$1(
    (_a = options.baseURL) != null ? _a : "https://api.together.xyz/v1/"
  );
  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey$1({
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
    return new OpenAICompatibleChatLanguageModel(
      modelId,
      getCommonModelConfig("chat")
    );
  };
  const createCompletionModel = (modelId) => new OpenAICompatibleCompletionLanguageModel(
    modelId,
    getCommonModelConfig("completion")
  );
  const createTextEmbeddingModel = (modelId) => new OpenAICompatibleEmbeddingModel(
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
createTogetherAI();

/**
 * TogetherAI Provider implementation
 */
class TogetherAIProvider {
    constructor() {
        this.name = 'togetherai';
        this.defaultModel = 'meta-llama/Llama-3-8b-chat-hf';
        this.description = 'TogetherAI models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.TOGETHERAI_API_KEY) {
                config.apiKey = options.apiKey || process.env.TOGETHERAI_API_KEY;
            }
            if (options.baseURL || process.env.TOGETHERAI_BASE_URL) {
                config.baseURL = options.baseURL || process.env.TOGETHERAI_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const togetherProvider = createTogetherAI(config);
            return togetherProvider(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create TogetherAI model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'TOGETHERAI_API_KEY',
            baseURL: 'TOGETHERAI_BASE_URL'
        };
    }
}

/**
 * xAI Grok Provider implementation
 */
class XAIProvider {
    constructor() {
        this.name = 'xai';
        this.defaultModel = 'grok-beta';
        this.description = 'xAI Grok models';
    }
    async createModel(modelId, options = {}) {
        try {
            const config = {};
            if (options.apiKey || process.env.XAI_API_KEY) {
                config.apiKey = options.apiKey || process.env.XAI_API_KEY;
            }
            if (options.baseURL || process.env.XAI_BASE_URL) {
                config.baseURL = options.baseURL || process.env.XAI_BASE_URL;
            }
            if (options.headers) {
                config.headers = options.headers;
            }
            const xaiProvider = createXai(config);
            return xaiProvider(modelId);
        }
        catch (error) {
            throw new Error(`Failed to create xAI model: ${error}`);
        }
    }
    getEnvVars() {
        return {
            apiKey: 'XAI_API_KEY',
            baseURL: 'XAI_BASE_URL'
        };
    }
}

/**
 * Registry of all available AI providers
 */
const providers = new Map();
// Register all official AI SDK text generation providers
providers.set('openai', new OpenAIProvider());
providers.set('anthropic', new AnthropicProvider());
providers.set('google', new GoogleProvider());
providers.set('google-vertex', new GoogleVertexProvider());
providers.set('azure', new AzureProvider());
providers.set('mistral', new MistralProvider());
providers.set('cohere', new CohereProvider());
providers.set('xai', new XAIProvider());
providers.set('amazon-bedrock', new AmazonBedrockProvider());
providers.set('togetherai', new TogetherAIProvider());
providers.set('fireworks', new FireworksProvider());
providers.set('deepinfra', new DeepInfraProvider());
providers.set('deepseek', new DeepSeekProvider());
providers.set('cerebras', new CerebrasProvider());
providers.set('groq', new GroqProvider());
providers.set('perplexity', new PerplexityProvider());
providers.set('claude-code', new ClaudeCodeProvider());
providers.set('openrouter', new OpenRouterProvider());
/**
 * Parse model string to extract provider and model ID
 * @param modelString - Format: "provider/model-id" or "provider"
 */
function parseModelString(modelString) {
    const parts = modelString.split('/');
    if (parts.length === 1) {
        // Provider only, use default model
        const provider = parts[0];
        const providerInstance = providers.get(provider);
        if (!providerInstance) {
            throw new Error(`Unknown provider: ${provider}`);
        }
        return { provider, modelId: providerInstance.defaultModel };
    }
    else {
        // Provider/model format
        const provider = parts[0];
        const modelId = parts.slice(1).join('/'); // Handle model IDs with slashes
        // Check if provider exists even for provider/model format
        const providerInstance = providers.get(provider);
        if (!providerInstance) {
            throw new Error(`Unknown provider: ${provider}`);
        }
        return { provider, modelId };
    }
}
/**
 * Create a language model instance
 * @param modelString - Provider/model format or provider only
 * @param options - Provider-specific options
 */
async function createModel(modelString, options = {}) {
    const { provider, modelId } = parseModelString(modelString);
    const providerInstance = providers.get(provider);
    if (!providerInstance) {
        throw new Error(`Unknown provider: ${provider}`);
    }
    return providerInstance.createModel(modelId, options);
}
/**
 * Get all available providers
 */
function getAvailableProviders() {
    return Array.from(providers.values());
}
/**
 * Get all registered providers (including unavailable ones)
 */
function getAllProviders() {
    return Array.from(providers.values());
}
/**
 * Check if a provider is available
 */
function isProviderAvailable(providerName) {
    return providers.has(providerName);
}
/**
 * Get environment variable names for a provider
 */
function getProviderEnvVars(providerName) {
    const provider = providers.get(providerName);
    if (!provider) {
        throw new Error(`Unknown provider: ${providerName}`);
    }
    return provider.getEnvVars();
}
/**
 * Get provider information
 */
function getProviderInfo(providerName) {
    return providers.get(providerName);
}

export { createModel, getAllProviders, getAvailableProviders, getProviderEnvVars, getProviderInfo, isProviderAvailable, parseModelString };
//# sourceMappingURL=index.js.map
