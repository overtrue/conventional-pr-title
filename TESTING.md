# Testing Guide for Conventional PR Title Action

## Quick Start Testing

### 1. Set up API Keys

Go to your repository **Settings** → **Secrets and variables** → **Actions** and add these secrets:

#### Required (choose at least one):
- `OPENAI_API_KEY` - Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- `ANTHROPIC_API_KEY` - Get from [Anthropic Console](https://console.anthropic.com/)
- `GOOGLE_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

#### Optional (for testing multiple providers):
- `MISTRAL_API_KEY` - Get from [Mistral AI](https://console.mistral.ai/)
- `XAI_API_KEY` - Get from [xAI Console](https://console.x.ai/)
- `COHERE_API_KEY` - Get from [Cohere Dashboard](https://dashboard.cohere.com/)
- `AZURE_API_KEY` - Set up Azure OpenAI resource
- `VERCEL_API_KEY` - Get from [Vercel AI](https://vercel.com/ai)
- `DEEPSEEK_API_KEY` - Get from [DeepSeek Platform](https://platform.deepseek.com/)
- `CEREBRAS_API_KEY` - Get from [Cerebras Cloud](https://cloud.cerebras.ai/)
- `GROQ_API_KEY` - Get from [Groq Console](https://console.groq.com/)

### 2. Testing Methods

#### Method A: Create a Test PR
1. Create a new branch: `git checkout -b test-pr-title-action`
2. Make a small change (like updating this README)
3. Create a PR with a non-conventional title like: "Add some new features"
4. The action will automatically run and suggest improvements

#### Method B: Manual Workflow Trigger
1. Go to **Actions** tab in your repository
2. Select "Test PR Title Action" workflow
3. Click "Run workflow"
4. Choose your preferred AI provider and mode
5. View results in the workflow summary

#### Method C: Test Locally (Advanced)
```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Test specific functionality
npm run test -- --testNamePattern="configuration"
```

### 3. Test Scenarios

The test workflow includes these scenarios:

✅ **Good conventional title**: `feat(api): add user authentication endpoint`
❌ **Bad title**: `Add some new features and fix bugs`
❌ **Mixed case**: `Fix: resolve Memory Leak in Data Processing`
❌ **Too long**: Very long titles that exceed character limits

### 4. Expected Behavior

#### Suggestion Mode (default):
- Action adds a comment with AI-generated title suggestions
- Original PR title remains unchanged
- Provides reasoning for suggestions

#### Auto Mode:
- Action automatically updates the PR title
- Uses the first AI suggestion
- Comments with explanation of the change

### 5. Troubleshooting

#### Common Issues:

**"Configuration Error" - API key missing**
```
Solution: Add the required API key to repository secrets
```

**"AI service failed" - API quota exceeded**
```
Solution: Try a different provider or check your API quota
```

**"No suggestions generated" - Title already conventional**
```
Solution: Set skip-if-conventional: 'false' to force suggestions
```

#### Debug Mode:
Add this to any step to enable detailed logging:
```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

### 6. Cost Estimation

Approximate costs per API call:

| Provider | Model | Cost per 1K tokens (input/output) |
|----------|-------|-----------------------------------|
| OpenAI | gpt-4.1-mini | $0.00015 / $0.0006 |
| Anthropic | claude-3-5-haiku | $0.00025 / $0.00125 |
| Google | gemini-1.5-flash | $0.000075 / $0.0003 |
| Mistral | mistral-small | $0.0002 / $0.0006 |

Typical usage: ~200 input tokens + ~100 output tokens = **$0.0001 - $0.001 per PR**

### 7. Production Usage

Once testing is complete, add this to your main workflow:

```yaml
name: PR Title Check
on:
  pull_request:
    types: [opened, edited]

jobs:
  conventional-title:
    runs-on: ubuntu-latest
    steps:
      - uses: your-username/conventional-pr-title@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          ai-provider: 'openai'
          api-key: ${{ secrets.OPENAI_API_KEY }}
          mode: 'suggest'
```

Happy testing! 🚀