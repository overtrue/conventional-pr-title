# Auto Pipeline Configuration

This repository includes an automatic pipeline that will automatically suggest or update PR titles to follow the Conventional Commits standard using Claude AI.

## Setup Instructions

### 1. Configure Repository Secrets

Add the following secrets to your repository (Settings → Secrets and variables → Actions):

- `ANTHROPIC_API_KEY`: Your Claude API key from Anthropic
- `ANTHROPIC_BASE_URL`: (Optional) Custom base URL if using a proxy or custom endpoint

### 2. Workflow Configuration

The auto pipeline is configured in `.github/workflows/auto-pr-title.yml` with the following settings:

- **AI Provider**: Anthropic Claude
- **Model**: `claude-3-5-sonnet-20241022`
- **Mode**: `auto` (automatically updates PR titles)
- **Triggers**: Runs on PR opened, synchronize, reopened, or edited events
- **Smart Skip**: Automatically skips PRs that already follow conventional commits

### 3. How It Works

1. When a PR is created or updated, the workflow automatically runs
2. Uses Claude AI to analyze the PR changes and generate a conventional commit title
3. The PR title is automatically updated with the AI-generated conventional title (or skipped if already conventional)
4. Supports all standard conventional commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

### 4. Configuration Options

You can customize the behavior by modifying `.github/workflows/auto-pr-title.yml`:

```yaml
with:
  ai-provider: 'anthropic'
  model: 'claude-3-5-sonnet-20241022'
  mode: 'auto'  # or 'suggest' for comments instead
  temperature: '0.3'
  max-tokens: '200'
  include-scope: 'true'
  max-length: '72'
```

### 5. Manual Override

If you need to use a different title format, you can:
1. Manually edit the PR title after the workflow runs
2. Use a title that already follows conventional commits (workflow will skip)
3. Disable the workflow by renaming or removing the workflow file

## Troubleshooting

- **Missing API Key**: Ensure `ANTHROPIC_API_KEY` is set in repository secrets
- **Custom Endpoint**: Set `ANTHROPIC_BASE_URL` secret if using a proxy
- **Workflow Not Running**: Check that the workflow file exists and is properly formatted
- **Title Not Updated**: Verify the repository has write permissions for the GitHub token

## Example

Before: `Update login functionality and fix bug`
After: `feat(auth): update login functionality and fix authentication bug`