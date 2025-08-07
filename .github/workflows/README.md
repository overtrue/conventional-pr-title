# GitHub Actions Configuration

This document explains how to configure the Conventional PR Title action with different AI providers.

## Environment Variables (Secrets)

The action automatically reads API keys and base URLs from environment variables. Add these secrets in your repository settings:

### Claude Code Provider
```yaml
# Repository Secrets
CLAUDE_CODE_API_KEY: your-claude-code-api-key
CLAUDE_CODE_BASE_URL: https://api.anthropic.com/v1  # Optional
CLAUDE_CODE_EXECUTABLE_PATH: /usr/local/bin/claude  # Optional, path to claude executable
```

### OpenRouter Provider
```yaml
# Repository Secrets
OPENROUTER_API_KEY: your-openrouter-api-key
OPENROUTER_BASE_URL: https://openrouter.ai/api/v1  # Optional
```

### OpenAI Provider
```yaml
# Repository Secrets
OPENAI_API_KEY: your-openai-api-key
OPENAI_BASE_URL: https://api.openai.com/v1  # Optional
```

### Anthropic Provider
```yaml
# Repository Secrets
ANTHROPIC_API_KEY: your-anthropic-api-key
ANTHROPIC_BASE_URL: https://api.anthropic.com/v1  # Optional
```

### Google Provider
```yaml
# Repository Secrets
GOOGLE_GENERATIVE_AI_API_KEY: your-google-api-key
GOOGLE_BASE_URL: https://generativelanguage.googleapis.com  # Optional
```

## Workflow Configuration

### Basic Example
```yaml
- name: Auto-generate conventional PR title
  uses: ./
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    model: 'claude-code'  # Use default model
    mode: 'auto'
```

### Advanced Example
```yaml
- name: Auto-generate conventional PR title
  uses: ./
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    model: 'claude-code/sonnet'  # Use specific model
    mode: 'suggest'  # Add comment instead of auto-updating
    include-scope: 'true'
    skip-if-conventional: 'true'
    allowed-types: 'feat,fix,docs,style,refactor,test,chore'
    max-length: '72'
    debug: 'true'
    match-language: 'true'
    auto-comment: 'true'
```

## Supported Models

### Provider-Only Format (uses default model)
- `claude-code` → uses `sonnet`
- `openrouter` → uses `openai/gpt-4o`
- `openai` → uses `gpt-4o-mini`
- `anthropic` → uses `claude-3-5-sonnet-20241022`

### Full Model Path Format
- `claude-code/sonnet`
- `claude-code/opus`
- `openrouter/openai/gpt-4o`
- `openrouter/anthropic/claude-3-5-sonnet-20241022`
- `openai/gpt-4o-mini`
- `anthropic/claude-3-5-haiku-20241022`

## Available Providers

The action supports 18 AI providers:

### Official AI SDK Providers (16)
1. OpenAI (`openai`)
2. Anthropic (`anthropic`)
3. Google (`google`)
4. Google Vertex (`google-vertex`)
5. Azure (`azure`)
6. Mistral (`mistral`)
7. Cohere (`cohere`)
8. xAI (`xai`)
9. Amazon Bedrock (`amazon-bedrock`)
10. Together.ai (`togetherai`)
11. Fireworks (`fireworks`)
12. DeepInfra (`deepinfra`)
13. DeepSeek (`deepseek`)
14. Cerebras (`cerebras`)
15. Groq (`groq`)
16. Perplexity (`perplexity`)

### Community Providers (2)
17. Claude Code (`claude-code`)
18. OpenRouter (`openrouter`)

## Troubleshooting

### Common Issues

1. **"API key is missing"**
   - Ensure the correct environment variable is set in repository secrets
   - Check the provider's documentation for the correct variable name

2. **"Provider not available"**
   - The provider package might not be installed
   - Check if the provider is supported in the current version

3. **"Invalid model format"**
   - Use `provider/model` format or just `provider` for default model
   - Ensure the model ID is valid for the chosen provider

4. **"Claude Code executable not found"**
   - Ensure `@anthropic-ai/claude-code` is installed globally: `npm i -g @anthropic-ai/claude-code`
   - The action automatically detects the claude executable using `which claude`
   - If needed, set `CLAUDE_CODE_EXECUTABLE_PATH` environment variable to the correct path
   - Verify the executable exists and has proper permissions

5. **"Invalid JSON response"**
   - The action now has robust JSON parsing with fallback to text extraction
   - Enable debug mode to see detailed parsing attempts
   - The action will print the raw AI response when JSON parsing fails
   - Check the AI provider's response format and ensure it follows the expected structure
   - The action will still provide suggestions even if JSON parsing fails

### Debug Mode

Enable debug logging to troubleshoot issues:

```yaml
debug: 'true'
```

This will show detailed logs including:
- Provider detection
- Model creation
- API calls
- Error details
- JSON parsing attempts
- Fallback suggestions extraction
