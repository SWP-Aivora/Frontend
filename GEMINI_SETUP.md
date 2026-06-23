# Gemini API Setup for PR Review

## Overview
This document explains how to set up Google Gemini API to automatically review pull requests in this repository.

## Prerequisites
1. GitHub account with repository access
2. Google account
3. Access to Google AI Studio

## Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click on "API Keys" in the left sidebar
4. Click "Create API Key"
5. Copy the generated API key

## Step 2: Add API Key to GitHub Repository

1. Navigate to your GitHub repository
2. Go to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Name the secret: `GEMINI_AI_KEY`
5. Paste your API key in the secret value field
6. Click **Add secret**

## Step 3: Configure Repository Permissions

The workflow requires these permissions:
- `pull-requests: write` - to post review comments
- `contents: read` - to access repository content

These are already configured in the workflow file at `.github/workflows/gemini-review.yml`

## Step 4: Test the Workflow

1. Create a new branch
2. Make some changes to the code
3. Create a pull request to the `main` branch
4. The Gemini review workflow should automatically trigger

## What Happens When PR is Created

The workflow will:
1. Checkout the repository
2. Get the PR diff and file changes
3. Send the code to Gemini AI for review
4. Post review comments and summary as GitHub review

## Customization Options

### Modify Review Focus
You can customize what Gemini focuses on by editing the prompt in `.github/actions/gemini-review-action/index.js`:

```javascript
const prompt = `
You are an expert code reviewer focused on TypeScript and React...
// Add your specific requirements here
`;
```

### Add Review Categories
The review can be customized to focus on:
- Security issues
- Performance optimizations
- Code style adherence
- Best practices
- Type safety

## Troubleshooting

### Common Issues

1. **Workflow fails to trigger**
   - Ensure the PR is targeting the `main` branch
   - Check that workflow file syntax is correct

2. **Gemini API errors**
   - Verify the API key is correct
   - Ensure you have sufficient API quota
   - Check if the API key is restricted to the Gemini API only

3. **Review comments not posted**
   - Verify `pull-requests: write` permission
   - Check for errors in the action logs

### Debug Mode

To enable debug logging:
```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

## Cost Considerations

- Gemini API usage is billed based on tokens processed
- Reviewing large PRs may incur higher costs
- Monitor your usage in Google Cloud Console

## Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Verify API key validity
3. Review Gemini API documentation
4. Check repository permissions