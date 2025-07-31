# Conventional PR Title Action

A GitHub Action that automatically suggests or updates PR titles to follow the [Conventional Commits](https://conventionalcommits.org/) standard using AI.

## Features

- 🤖 **AI-Powered**: Leverages multiple AI providers (OpenAI, Anthropic, Google, Mistral, xAI, Cohere, Azure) to generate intelligent title suggestions
- 📝 **Conventional Commits**: Ensures PR titles follow the Conventional Commits specification
- 🔄 **Dual Modes**: Auto-update titles or suggest improvements via comments
- ⚙️ **Highly Configurable**: Extensive customization options for validation rules and AI behavior
- 🎯 **Smart Analysis**: Analyzes changed files and PR content for context-aware suggestions
- 💰 **Cost Tracking**: Built-in cost estimation and model recommendations
- 🛡️ **Robust**: Comprehensive error handling with retry mechanisms and fallbacks

## Supported AI Models

The action supports **54 models** across **10 providers**:

### 🔥 Latest Models (2025)
- **OpenAI**: `gpt-4.1`, `gpt-4.1-mini`, `gpt-4.1-nano`, `o3`, `o3-mini`, `o4-mini`
- **Anthropic**: `claude-opus-4-20250514`, `claude-sonnet-4-20250514`, `claude-3-7-sonnet-20250219`
- **xAI**: `grok-4`, `grok-3`, `grok-3-fast`, `grok-3-mini`, `grok-3-mini-fast`
- **Google**: `gemini-2.0-flash-exp`, `gemini-1.5-flash`, `gemini-1.5-pro`
- **Mistral**: `pixtral-large-latest`, `mistral-medium-2505`, `pixtral-12b-2409`

### 📋 Full Provider Support
- **OpenAI**: GPT-4 series, o1/o3/o4 reasoning models, GPT-3.5 Turbo
- **Anthropic**: Claude 4, Claude 3.5/3.7 Sonnet, Claude 3.5 Haiku
- **Google**: Gemini 2.0/1.5 Flash/Pro, Gemini Pro
- **Mistral**: Pixtral Large/12B, Mistral Large/Medium/Small (latest versions)
- **xAI**: Grok 4/3/2 series with vision variants
- **Cohere**: Command R+, Command R, Command
- **Azure**: Enterprise-hosted OpenAI models
- **Vercel**: v0 code generation models
- **DeepSeek**: Chat and reasoning models
- **Cerebras**: Ultra-fast Llama models
- **Groq**: High-speed Llama, Mixtral, and Gemma models
- **Vertex AI**: Google Cloud-hosted Gemini models


## Quick Start

### 🏗️ Build & Publish (GitHub Action 规范)

> **注意：dist/ 目录必须提交到仓库，不能 .gitignore！**

1. 安装依赖：
   ```bash
   npm install
   ```
2. 构建 TypeScript：
   ```bash
   npm run build
   ```
3. 打包产物（推荐 ncc）：
   ```bash
   npm run package
   ```
4. 提交 dist/ 目录：
   ```bash
   git add dist/ && git commit -m "build: update dist for action"
   ```
5. 推送到主分支，确保 action.yml 的 main 字段指向 dist/index.js。

> **CI/CD 注意事项**：
> - GitHub Action 必须提交构建产物（dist/）到主分支，否则 marketplace/PR 流水线会报“File not found: dist/index.js”。
> - 推荐本地构建后再 push。

```yaml
name: PR Title Check
on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  conventional-title:
    runs-on: ubuntu-latest
    steps:
      - uses: overtrue/conventional-pr-title@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          ai-provider: 'openai'
          api-key: ${{ secrets.OPENAI_API_KEY }}
```

## Configuration

### Required Inputs

| Input | Description | Example |
|-------|-------------|---------|
| `github-token` | GitHub token for API access | `${{ secrets.GITHUB_TOKEN }}` |
| `api-key` | AI provider API key | `${{ secrets.OPENAI_API_KEY }}` |

### AI Configuration

| Input | Description | Default |
|-------|-------------|---------|
| `ai-provider` | AI provider (`openai`, `anthropic`, `google`, `mistral`, `xai`, `cohere`, `azure`, `vercel`, `deepseek`, `cerebras`, `groq`, `vertex`) | `openai` |
| `model` | Specific model to use | Provider-specific default |
| `temperature` | AI creativity (0.0-1.0) | `0.3` |
| `max-tokens` | Maximum response tokens | `500` |

### Operation Modes

| Input | Description | Default |
|-------|-------------|---------|
| `mode` | `auto` (update title) or `suggest` (comment) | `suggest` |
| `skip-if-conventional` | Skip processing if title is already conventional | `true` |

### Validation Rules

| Input | Description | Default |
|-------|-------------|---------|
| `allowed-types` | Comma-separated conventional commit types | `feat,fix,docs,style,refactor,test,chore,perf,ci,build,revert` |
| `require-scope` | Require scope in commit format | `false` |
| `max-length` | Maximum title length | `72` |
| `min-description-length` | Minimum description length | `3` |

### Customization

| Input | Description | Default |
|-------|-------------|---------|
| `include-scope` | Prefer including scope in suggestions | `true` |
| `custom-prompt` | Custom AI prompt template | _(empty)_ |
| `comment-template` | Custom comment template | _(empty)_ |

## Examples

### Basic Setup (Suggestion Mode)
```yaml
- uses: overtrue/conventional-pr-title@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    ai-provider: 'anthropic'
    api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    model: 'claude-sonnet-4-20250514'
```

### Auto-Update Mode
```yaml
- uses: overtrue/conventional-pr-title@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    ai-provider: 'openai'
    api-key: ${{ secrets.OPENAI_API_KEY }}
    model: 'gpt-4.1-mini'
    mode: 'auto'
    temperature: '0.2'
```

### Strict Validation
```yaml
- uses: overtrue/conventional-pr-title@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    ai-provider: 'google'
    api-key: ${{ secrets.GOOGLE_API_KEY }}
    allowed-types: 'feat,fix,docs'
    require-scope: 'true'
    max-length: '50'
    skip-if-conventional: 'false'
```

### Custom Templates
```yaml
- uses: overtrue/conventional-pr-title@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    ai-provider: 'mistral'
    api-key: ${{ secrets.MISTRAL_API_KEY }}
    custom-prompt: 'Generate titles focusing on user impact'
    comment-template: |
      🎯 **Suggested PR Titles:**
      ${suggestions}

      **Current Title:** ${currentTitle}
      **Reasoning:** ${reasoning}
```

## Outputs

| Output | Description | Type |
|--------|-------------|------|
| `is-conventional` | Whether title follows conventional format | `boolean` |
| `suggested-titles` | AI-generated title suggestions | `string[]` (JSON) |
| `original-title` | Original PR title | `string` |
| `action-taken` | Action performed (`updated`, `commented`, `skipped`, `error`) | `string` |
| `error-message` | Error message if action failed | `string` |

### Using Outputs
```yaml
- uses: overtrue/conventional-pr-title@v1
  id: pr-title
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    ai-provider: 'openai'
    api-key: ${{ secrets.OPENAI_API_KEY }}

- name: Check Results
  run: |
    echo "Is conventional: ${{ steps.pr-title.outputs.is-conventional }}"
    echo "Action taken: ${{ steps.pr-title.outputs.action-taken }}"
    echo "Suggestions: ${{ steps.pr-title.outputs.suggested-titles }}"
```

## AI Provider Setup

### OpenAI
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add as repository secret: `OPENAI_API_KEY`
3. Recommended models: `gpt-4.1-mini`, `gpt-4o-mini`, `o3-mini`

### Anthropic (Claude)
1. Get API key from [Anthropic Console](https://console.anthropic.com/)
2. Add as repository secret: `ANTHROPIC_API_KEY`
3. Recommended models: `claude-sonnet-4-20250514`, `claude-3-5-haiku-20241022`

### Google (Gemini)
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add as repository secret: `GOOGLE_API_KEY`
3. Recommended models: `gemini-1.5-flash`, `gemini-1.5-pro`

### Other Providers
- **Mistral**: Get key from [Mistral AI](https://console.mistral.ai/) → `MISTRAL_API_KEY`
- **xAI**: Get key from [xAI Console](https://console.x.ai/) → `XAI_API_KEY`
- **Cohere**: Get key from [Cohere Dashboard](https://dashboard.cohere.com/) → `COHERE_API_KEY`
- **Azure**: Set up Azure OpenAI resource → `AZURE_API_KEY`
- **Vercel**: Get key from [Vercel AI](https://vercel.com/ai) → `VERCEL_API_KEY`
- **DeepSeek**: Get key from [DeepSeek Platform](https://platform.deepseek.com/) → `DEEPSEEK_API_KEY`
- **Cerebras**: Get key from [Cerebras Cloud](https://cloud.cerebras.ai/) → `CEREBRAS_API_KEY`
- **Groq**: Get key from [Groq Console](https://console.groq.com/) → `GROQ_API_KEY`
- **Vertex AI**: Set up Google Cloud Vertex AI → `GOOGLE_VERTEX_AI_API_KEY`

## Conventional Commits Format

The action enforces the [Conventional Commits](https://conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Common Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Reverting changes

### Examples
- ✅ `feat(auth): add OAuth2 integration`
- ✅ `fix: resolve memory leak in data processing`
- ✅ `docs: update API documentation`
- ❌ `Add new feature` (missing type)
- ❌ `fix: Fix the bug.` (period not allowed)

## Troubleshooting

### Common Issues

**Action fails with "Configuration Error"**
- Ensure all required inputs are provided
- Check that API keys are correctly set as repository secrets
- Verify the AI provider name is spelled correctly

**AI service timeout or errors**
- Check API key permissions and quotas
- Try a different model or provider
- Reduce `max-tokens` if hitting limits

**Permission denied errors**
- Ensure `github-token` has sufficient permissions
- For auto-update mode, token needs write access to pull requests

**No suggestions generated**
- Check if `skip-if-conventional` is enabled and title is already conventional
- Verify the AI provider service is available
- Try adjusting `temperature` or `custom-prompt`

### Debug Mode
Add debug logging to your workflow:

```yaml
- uses: overtrue/conventional-pr-title@v1
  env:
    ACTIONS_STEP_DEBUG: true
  with:
    # ... your configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Build: `npm run build && npm run package`
6. Commit: `git commit -m "feat: add amazing feature"`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Setup
```bash
# Clone and install
git clone https://github.com/overtrue/conventional-pr-title.git
cd conventional-pr-title
npm install

# Run tests
npm test

# Build and package
npm run all
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Development Status

This GitHub Action is currently in development and has not been officially released yet.

### Current Features
- ✨ Support for **54 models** across **10 AI providers**
- 🤖 Auto-update and suggestion modes for PR titles
- 📝 Conventional Commits validation and enforcement
- ⚙️ Comprehensive configuration options
- 💰 Built-in cost estimation and model recommendations
- 🛡️ Robust error handling and retry mechanisms
- 📊 Comprehensive test coverage (152 tests passing)

## Testing

To test this action in your repository:

1. **Set up API keys**: Add at least one AI provider API key to your repository secrets (e.g., `OPENAI_API_KEY`)
2. **Create a test PR**: Make a PR with a non-conventional title like "Add some features"
3. **Run the test workflow**: Go to Actions → "Test PR Title Action" → "Run workflow"

See [TESTING.md](TESTING.md) for detailed testing instructions and troubleshooting.

### Quick Test
```yaml
# .github/workflows/test.yml
name: Test PR Title
on:
  pull_request:
    types: [opened, edited]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: your-username/conventional-pr-title@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          ai-provider: 'openai'
          api-key: ${{ secrets.OPENAI_API_KEY }}
```

---

**Made with ❤️ for better commit hygiene**
