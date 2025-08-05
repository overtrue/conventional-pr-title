# AI Provider Support

This action supports all AI SDK v5 providers through a fully configurable system.

## 📋 Supported Providers

### All Providers
All providers are loaded dynamically as needed:

| Provider | Package | Default Model | Description |
|----------|---------|---------------|-------------|
| `openai` | `@ai-sdk/openai` | `gpt-4o-mini` | OpenAI GPT models |
| `anthropic` | `@ai-sdk/anthropic` | `claude-3-5-haiku-20241022` | Anthropic Claude models |
| `google` | `@ai-sdk/google` | `gemini-1.5-flash` | Google Generative AI models |
| `mistral` | `@ai-sdk/mistral` | `mistral-small-latest` | Mistral AI models |
| `cohere` | `@ai-sdk/cohere` | `command-r-plus` | Cohere Command models |
| `azure` | `@ai-sdk/azure` | `gpt-4o-mini` | Azure OpenAI Service |
| `xai` | `@ai-sdk/xai` | `grok-beta` | xAI Grok models |
| `amazon-bedrock` | `@ai-sdk/amazon-bedrock` | `anthropic.claude-3-haiku-20240307-v1:0` | Amazon Bedrock models |
| `google-vertex` | `@ai-sdk/google-vertex` | `gemini-1.5-flash` | Google Vertex AI models |
| `togetherai` | `@ai-sdk/togetherai` | `meta-llama/Llama-2-7b-chat-hf` | Together.ai models |
| `fireworks` | `@ai-sdk/fireworks` | `accounts/fireworks/models/llama-v2-7b-chat` | Fireworks AI models |
| `deepinfra` | `@ai-sdk/deepinfra` | `meta-llama/Llama-2-7b-chat-hf` | DeepInfra models |
| `deepseek` | `@ai-sdk/deepseek` | `deepseek-chat` | DeepSeek models |
| `cerebras` | `@ai-sdk/cerebras` | `llama3.1-8b` | Cerebras models |
| `groq` | `@ai-sdk/groq` | `llama-3.1-8b-instant` | Groq models |
| `perplexity` | `@ai-sdk/perplexity` | `llama-3.1-sonar-small-128k-online` | Perplexity models |
| `replicate` | `@ai-sdk/replicate` | `meta/llama-2-7b-chat` | Replicate models |
| `elevenlabs` | `@ai-sdk/elevenlabs` | `eleven_monolingual_v1` | ElevenLabs speech models |
| `lmnt` | `@ai-sdk/lmnt` | `lily` | LMNT speech models |
| `hume` | `@ai-sdk/hume` | `default` | Hume AI models |
| `revai` | `@ai-sdk/revai` | `whisper` | Rev.ai transcription models |
| `deepgram` | `@ai-sdk/deepgram` | `nova-2` | Deepgram speech models |
| `gladia` | `@ai-sdk/gladia` | `whisper` | Gladia transcription models |
| `assemblyai` | `@ai-sdk/assemblyai` | `best` | AssemblyAI transcription models |

### Community Providers
Third-party providers developed by the community:

| Provider | Package | Default Model | Description |
|----------|---------|---------------|-------------|
| `ollama` | `ollama-ai-provider` | `llama3.2` | Ollama local models |
| `chrome-ai` | `chrome-ai` | `text` | Chrome built-in AI |
| `openrouter` | `@openrouter/ai-sdk-provider` | `openai/gpt-3.5-turbo` | OpenRouter models |
| `workers-ai` | `workers-ai-provider` | `@cf/meta/llama-2-7b-chat-int8` | Cloudflare Workers AI |
| `claude-code` | `ai-sdk-provider-claude-code` | `claude-3-5-sonnet-20241022` | Claude Code SDK/CLI |
| `built-in-ai` | `built-in-ai` | `text` | Browser built-in AI |

## 🚀 Usage Examples

### Basic Usage (Default Models)
```yaml
- uses: your-action
  with:
    model: 'openai'  # Uses gpt-4o-mini
    # or
    model: 'anthropic'  # Uses claude-3-5-haiku-20241022
```

### Specific Model Selection
```yaml
- uses: your-action
  with:
    model: 'openai/gpt-4o'
    # or
    model: 'anthropic/claude-3-5-sonnet-20241022'
    # or
    model: 'groq/llama-3.1-70b-versatile'
```

### Advanced Usage with Custom Configuration

**Environment Variables:**
```bash
# Using environment variables
export OPENAI_API_KEY="sk-xxx"
export OPENAI_BASE_URL="https://custom.openai.endpoint/v1"

# Or for Azure with specific endpoint
export AZURE_API_KEY="your-key"
export AZURE_BASE_URL="https://your-resource.openai.azure.com"
```

**Programmatic Configuration:**
```typescript
import { createModel, createModelWithConfig } from './ai-factory'

// Using environment variables (automatic)
const model1 = await createModel('openai/gpt-4o-mini')

// Using explicit configuration
const model2 = await createModelWithConfig('openai/gpt-4o-mini', {
  apiKey: 'sk-custom-key',
  baseURL: 'https://custom.endpoint.com/v1',
  headers: { 'Custom-Header': 'value' }
})

// Mixed approach (env vars + custom options)
const model3 = await createModel('anthropic/claude-3-sonnet-20240229', {
  baseURL: 'https://custom.anthropic.endpoint.com/v1'
  // apiKey will be read from ANTHROPIC_API_KEY environment variable
})
```

**GitHub Actions:**
```yaml
- uses: your-action
  with:
    model: 'groq/llama-3.1-8b-instant'
  env:
    GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
    GROQ_BASE_URL: ${{ secrets.GROQ_BASE_URL }}  # Optional custom endpoint
```

## 🔧 Configuration System

The provider system is fully configurable via `src/model-config.json`:

```json
{
  "providers": {
    "provider-name": {
      "defaultModel": "model-name",
      "description": "Provider description",
      "packageName": "@ai-sdk/provider-name",
      "exportName": "providerFunction",
      "isCore": true,  // Optional: for pre-installed providers
      "isFactory": true  // Optional: for factory-based providers like Azure
    }
  }
}
```

## 🔑 Environment Variables

Each provider supports both API key and base URL configuration via environment variables:

| Provider | API Key | Base URL |
|----------|---------|----------|
| OpenAI | `OPENAI_API_KEY` | `OPENAI_BASE_URL` |
| Anthropic | `ANTHROPIC_API_KEY` | `ANTHROPIC_BASE_URL` |
| Google | `GOOGLE_API_KEY` | `GOOGLE_BASE_URL` |
| Mistral | `MISTRAL_API_KEY` | `MISTRAL_BASE_URL` |
| Cohere | `COHERE_API_KEY` | `COHERE_BASE_URL` |
| Azure | `AZURE_API_KEY` | `AZURE_BASE_URL` |
| xAI | `XAI_API_KEY` | `XAI_BASE_URL` |
| Groq | `GROQ_API_KEY` | `GROQ_BASE_URL` |
| Cerebras | `CEREBRAS_API_KEY` | `CEREBRAS_BASE_URL` |
| DeepSeek | `DEEPSEEK_API_KEY` | `DEEPSEEK_BASE_URL` |
| Perplexity | `PERPLEXITY_API_KEY` | `PERPLEXITY_BASE_URL` |
| Google Vertex | `GOOGLE_VERTEX_API_KEY` | `GOOGLE_VERTEX_BASE_URL` |
| Amazon Bedrock | `AMAZON_BEDROCK_API_KEY` | `AMAZON_BEDROCK_BASE_URL` |
| *...and so on* |

### Pattern
The environment variable naming follows this pattern:
- API Key: `{PROVIDER_NAME}_API_KEY`
- Base URL: `{PROVIDER_NAME}_BASE_URL`

Where `{PROVIDER_NAME}` is the provider name in uppercase with hyphens replaced by underscores.

### Provider-Specific Configuration
Some providers require additional configuration parameters beyond API keys and base URLs:

**Google Vertex AI:**
```bash
GOOGLE_VERTEX_PROJECT_ID=my-gcp-project
GOOGLE_VERTEX_LOCATION=us-central1
GOOGLE_VERTEX_API_KEY=ya29.xxx  # Or use GCP service account
```

**Azure OpenAI:**
```bash
AZURE_API_KEY=your-azure-key
AZURE_RESOURCE_NAME=your-resource-name
AZURE_DEPLOYMENT_NAME=gpt-4-deployment
AZURE_BASE_URL=https://your-resource.openai.azure.com
```

**Amazon Bedrock:**
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxx
AMAZON_BEDROCK_API_KEY=xxx  # If using API key auth
```

These provider-specific variables are automatically detected and passed to the appropriate configuration functions.

## 📦 Dynamic Loading

The system supports dynamic loading of providers:

- **Core providers** are pre-loaded for optimal performance
- **Extended providers** are lazy-loaded when needed
- **Missing providers** show helpful installation instructions
- **Caching** prevents re-loading of already imported providers

## 🛠️ Factory Architecture

Key components:

1. **`loadProvider()`** - Dynamically imports providers based on configuration
2. **`createModel()`** - Async factory function that returns AI SDK LanguageModel instances
3. **Provider Cache** - Avoids re-importing already loaded providers
4. **Configuration-Driven** - All provider logic based on `model-config.json`

## 🎯 Benefits

- ✅ **Comprehensive Support**: All AI SDK v5 providers supported
- ✅ **Configuration-Driven**: No hardcoded provider lists
- ✅ **Dynamic Loading**: Only load what you need
- ✅ **Environment Variables**: Automatic support for `*_API_KEY` and `*_BASE_URL`
- ✅ **Custom Configuration**: Override any provider settings programmatically
- ✅ **Error Handling**: Clear installation instructions for missing packages
- ✅ **Unified Architecture**: All providers treated equally
- ✅ **Extensible**: Easy to add new providers via configuration
- ✅ **Type Safe**: Full TypeScript support
- ✅ **Flexible**: Multiple ways to configure providers

## 🔄 Format Support

Slash format with optional model specification:

```typescript
// Full format (recommended)
await createModel('openai/gpt-4o-mini')
await createModel('anthropic/claude-3-5-sonnet-20241022')

// Provider-only format (uses default model)
await createModel('openai')  // → gpt-4o-mini
await createModel('anthropic')  // → claude-3-5-haiku-20241022
```

---

For the latest supported models and providers, please refer to the [official AI SDK documentation](https://v5.ai-sdk.dev/docs/foundations/providers-and-models).
