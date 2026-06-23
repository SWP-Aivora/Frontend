# Gemini Review Deployment Guide

## Prerequisites

1. GEMINI_AI_KEY secret configured in repository settings
2. Repository has proper GitHub Actions permissions
3. Main branch protection rules configured

## Deployment Steps

1. **Push Changes**
   ```bash
   git push origin gemini-review-test
   ```

2. **Create Test PR**
   - Create PR from gemini-review-test to main
   - Include test files from `src/test-component.tsx`

3. **Monitor Execution**
   - Check "Actions" tab in GitHub repository
   - Look for "Gemini Code Review" workflow run
   - Monitor logs for error messages

4. **Verify Results**
   - Check if review comments are posted
   - Verify auto-approval logic works
   - Test fallback mechanisms

## Troubleshooting

### Common Issues

1. **No Review Comments**
   - Check workflow run logs
   - Verify environment variables
   - Check API response parsing

2. **API Failures**
   - Verify GEMINI_AI_KEY is valid
   - Check API quota limits
   - Monitor model availability

3. **JSON Parsing Errors**
   - Check logs for fallback activation
   - Verify response format matches expected schema

### Debug Commands

```bash
# Check workflow logs
gh run view --web

# Check repository secrets
gh secret list

# Test API locally
node scripts/test-gemini-local.js
```

## Success Criteria

- Review workflow runs without errors
- Review comments are posted successfully
- Auto-approval/request changes logic works
- Fallback mechanisms function properly
- System handles various PR complexities