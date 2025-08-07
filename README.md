# Conventional PR Title Action

A GitHub Action that automatically suggests or updates PR titles to follow the [Conventional Commits](https://conventionalcommits.org/) standard using AI.

## Features

- 🤖 **AI-Powered**: Leverages AI providers to generate intelligent title suggestions
- 📝 **Conventional Commits**: Ensures PR titles follow the Conventional Commits specification
- 🔄 **Dual Modes**: Auto-update titles or suggest improvements via comments
- ⚙️ **Highly Configurable**: Extensive customization options for validation rules and AI behavior
- 🎯 **Smart Analysis**: Analyzes changed files and PR content for context-aware suggestions
- 🛡️ **Robust**: Comprehensive error handling with retry mechanisms and fallbacks

## Quick Start

### 🚀 Simple Usage

```yaml
name: PR Title Check
on:
  pull_request:
    types: [opened, synchronize, reopened, edited]

jobs:
  conventional-title:
    runs-on: ubuntu-latest
    steps:
      - uses: overtrue/conventional-pr-title@v1
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          model: 'openai/gpt-4o-mini'  # or just 'openai'
```

### 🔧 Advanced Usage

```yaml
name: PR Title Check
on:
  pull_request:
    types: [opened, synchronize, reopened, edited]

jobs:
  conventional-title:
    runs-on: ubuntu-latest
    steps:
      - uses: overtrue/conventional-pr-title@v1
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          model: 'anthropic/claude-3-5-sonnet-20241022'
          mode: 'auto'  # automatically update title
          include-scope: 'true'
          debug: 'true'
```

### 📝 Model Examples

The action supports multiple AI providers with flexible model specification:

```yaml
# OpenAI models
model: 'openai/gpt-4o-mini'      # full format
model: 'openai'                  # short format, uses default model

# Anthropic models
model: 'anthropic/claude-3-5-sonnet-20241022'
model: 'anthropic'               # uses default Claude model

# Google models
model: 'google/gemini-1.5-flash'
model: 'google'                  # uses default Gemini model

# Other providers
model: 'mistral/mistral-large-latest'
model: 'xai/grok-beta'
model: 'cohere/command-r-plus'
model: 'azure/gpt-4o-mini'
model: 'vertex/gemini-1.5-flash'
```

> For more models, please refer to the [AI SDK v5 Providers and Models documentation](https://v5.ai-sdk.dev/docs/foundations/providers-and-models).

### 🔑 Environment Variables

#### API Keys (Required)
Set your API keys as GitHub secrets:

```bash
# Common providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
MISTRAL_API_KEY=...
XAI_API_KEY=...
COHERE_API_KEY=...
AZURE_API_KEY=...
GOOGLE_VERTEX_API_KEY=...
```

#### Custom Base URLs (Optional)
For custom endpoints or proxy servers:

```bash
OPENAI_BASE_URL=https://api.openai.com/v1
ANTHROPIC_BASE_URL=https://api.anthropic.com/v1
GOOGLE_BASE_URL=https://generativelanguage.googleapis.com
MISTRAL_BASE_URL=https://api.mistral.ai
XAI_BASE_URL=https://api.x.ai
COHERE_BASE_URL=https://api.cohere.ai
AZURE_BASE_URL=https://your-resource.openai.azure.com
GOOGLE_VERTEX_BASE_URL=https://us-central1-aiplatform.googleapis.com
```

#### Complete Examples for Different Providers

**OpenAI Example:**
```yaml
- uses: overtrue/conventional-pr-title@v1
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    model: 'openai/gpt-4o-mini'
    mode: 'auto'
```

**Anthropic Example:**
```yaml
- uses: overtrue/conventional-pr-title@v1
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    model: 'anthropic/claude-3-5-sonnet-20241022'
    mode: 'auto'
```

**OpenRouter Example:**
```yaml
- uses: overtrue/conventional-pr-title@v1
  env:
    OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    model: 'openrouter'
    mode: 'auto'
```

**Custom Endpoint Example:**
```yaml
- uses: overtrue/conventional-pr-title@v1
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    OPENAI_BASE_URL: ${{ secrets.CUSTOM_OPENAI_ENDPOINT }}
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    model: 'openai/gpt-4o-mini'
    mode: 'auto'
```

## Configuration

### Required Inputs

| Input | Description | Example |
|-------|-------------|---------|
| `github-token` | GitHub token for API access | `${{ secrets.GITHUB_TOKEN }}` |
| `model` | AI model to use (provider/model format or just provider) | `openai/gpt-4o-mini`, `anthropic` |

### Optional Inputs

| Input | Description | Default | Example |
|-------|-------------|---------|---------|
| `mode` | Operation mode: `auto` or `suggest` | `suggest` | `auto` |
| `include-scope` | Whether to prefer including scope in generated titles | `true` | `false` |
| `skip-if-conventional` | Skip processing if title already follows conventional commits | `true` | `false` |
| `debug` | Enable debug logging | `false` | `true` |

### Validation Rules

| Input | Description | Default |
|-------|-------------|---------|
| `allowed-types` | Comma-separated list of allowed commit types | `feat,fix,docs,style,refactor,test,chore,perf,ci,build,revert` |
| `require-scope` | Whether to require a scope in commit messages | `false` |
| `max-length` | Maximum allowed length for PR title | `72` |
| `min-description-length` | Minimum length for description part | `3` |

### Customization

| Input | Description | Default |
|-------|-------------|---------|
| `custom-prompt` | Custom prompt template for AI title generation | `''` |
| `comment-template` | Custom template for suggestion comments | `''` |
| `match-language` | Match the language of the original PR title and description. When enabled, AI will generate the description part in the same language while keeping type and scope in English. Supports Chinese, Japanese, Korean, and other languages. | `true` |
| `auto-comment` | Add a comment when auto-updating PR title | `true` |

## Supported AI Models

For the complete list of supported models and providers, please refer to the [AI SDK v5 Providers and Models documentation](https://v5.ai-sdk.dev/docs/foundations/providers-and-models).

The action supports all providers and models available in AI SDK v5, including:

- **OpenAI**: GPT-4 series, o1/o3/o4 reasoning models, GPT-3.5 Turbo
- **Anthropic**: Claude 4, Claude 3.5/3.7 Sonnet, Claude 3.5 Haiku
- **Google**: Gemini 2.0/1.5 Flash/Pro, Gemini Pro
- **Mistral**: Pixtral Large/12B, Mistral Large/Medium/Small
- **xAI**: Grok 4/3/2 series with vision variants
- **Cohere**: Command R+, Command R, Command
- **Azure**: Enterprise-hosted OpenAI models
- **Vertex AI**: Google Cloud-hosted Gemini models

## Examples

### Basic Configuration

```yaml
- uses: overtrue/conventional-pr-title@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    model: 'openai'
```

### Advanced Configuration

```yaml
- uses: overtrue/conventional-pr-title@v1
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    model: 'anthropic/claude-3-5-sonnet-20241022'
    mode: 'auto'
    allowed-types: 'feat,fix,docs,refactor'
    include-scope: 'true'
    max-length: '100'
    debug: 'true'
```

### Custom Prompt

```yaml
- uses: overtrue/conventional-pr-title@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    model: 'openai/gpt-4o-mini'
    custom-prompt: 'Generate a conventional commit title that emphasizes the business impact of this change.'
```

### Language Matching

When `match-language` is enabled, the AI will detect the language of the original PR title and generate the description part in the same language:

```yaml
- uses: overtrue/conventional-pr-title@v1
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    model: 'openai/gpt-4o-mini'
    match-language: 'true'
```

**Examples:**
- **Chinese PR title**: "添加新的用户界面组件" → `feat(ui): 添加新的用户界面组件`
- **Japanese PR title**: "新しいユーザーインターフェースコンポーネントを追加" → `feat(ui): 新しいユーザーインターフェースコンポーネントを追加`
- **Korean PR title**: "새로운 사용자 인터페이스 컴포넌트 추가" → `feat(ui): 새로운 사용자 인터페이스 컴포넌트 추가`
- **English PR title**: "Add new user interface component" → `feat(ui): add new user interface component`

> **Note**: Type and scope always remain in English (e.g., `feat`, `fix`, `ui`, `auth`), only the description part matches the original language.

## Outputs

| Output | Description |
|--------|-------------|
| `is-conventional` | Whether the PR title follows conventional commits format |
| `suggested-titles` | JSON array of AI-suggested conventional commits titles |
| `original-title` | Original PR title before processing |
| `action-taken` | Action taken: "updated", "commented", "skipped", or "error" |
| `error-message` | Error message if action failed |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## References

- [Conventional Commits](https://conventionalcommits.org/)
- [AI SDK v5 Providers and Models](https://v5.ai-sdk.dev/docs/foundations/providers-and-models)
- [GitHub Actions](https://docs.github.com/en/actions)
