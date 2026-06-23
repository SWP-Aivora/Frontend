# Gemini Code Review Action

This GitHub Action reviews pull requests using Google's Gemini AI to provide automated code reviews.

## Features

- Analyzes pull request diffs using Gemini AI
- Provides constructive feedback on code quality
- Identifies potential bugs and security issues
- Suggests improvements for readability and maintainability
- Posts review comments directly to the pull request

## Usage

### Basic Usage

```yaml
name: Gemini Code Review
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
      
      - name: Run Gemini Code Review
        uses: ./.github/actions/gemini-review-action
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        with:
          pr-number: ${{ github.event.pull_request.number }}
          repo: ${{ github.repository }}
```

## Required Secrets

You need to add the following repository secrets:

1. `GEMINI_API_KEY`: Your Google Gemini API key obtained from [Google AI Studio](https://aistudio.google.com/)

## How to Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key or use an existing one
4. Copy the API key and add it as a repository secret in GitHub

## Action Inputs

| Input | Description | Required |
|-------|-------------|----------|
| `pr-number` | The pull request number to review | Yes |
| `repo` | Repository in format owner/repo | Yes |
| `diff-summary` | Summary of changes in the PR | Yes |
| `full-diff` | Full diff of the PR | Yes |

## Output

| Output | Description |
|--------|-------------|
| `review-result` | JSON containing review comments and summary |

## Example Review Output

```json
{
  "summary": "Good start but needs attention to TypeScript types and error handling",
  "priority": "medium",
  "comments": [
    {
      "file": "src/components/Button.tsx",
      "line": 45,
      "severity": "error",
      "comment": "Missing type for props - use proper TypeScript interface"
    },
    {
      "file": "src/utils/api.ts",
      "line": 120,
      "severity": "warning",
      "comment": "No error handling for API response - add try/catch"
    }
  ],
  "metadata": {
    "prNumber": 123,
    "repo": "owner/repo",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "model": "gemini-3.5-flash"
  }
}
```

## Customization

You can customize the review by modifying the prompt in the action script:

1. Open `.github/actions/gemini-review-action/index.js`
2. Modify the `prompt` variable to include specific requirements or guidelines
3. For example, you can add focus on specific programming languages or frameworks

## Troubleshooting

### Common Issues

1. **API Key Not Found**: Ensure `GEMINI_API_KEY` is properly set as a repository secret
2. **Permission Denied**: Make sure the action has `pull-requests: write` permission
3. **JSON Parsing Errors**: Gemini sometimes returns formatted text that may need extraction

### Debug Mode

Enable debug logging by adding `ACTIONS_STEP_DEBUG: true` to your workflow:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
```