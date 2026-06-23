# Gemini PR Review Workflow Design

**Date**: 2026-06-23  
**Project**: AIVORA Frontend  
**Workflow**: Automatic PR Review using Gemini 3.1 Flash Lite

## Overview

A comprehensive GitHub Actions workflow that automatically reviews all pull requests using Gemini 3.1 Flash Lite. The workflow enforces project standards including Feature-Sliced Design (FSD), TypeScript strictness, security best practices, and UI/UX excellence.

## Architecture

### Three-Stage Sequential Review

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Stage 1:     │    │   Stage 2:     │    │   Stage 3:     │
│  Auto Checks   │───▶│ Gemini Review  │───▶│  Summary &     │
│                │    │                │    │  Decision      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Stage Details

### Stage 1: Automated Checks
**Purpose**: Fast, automated detection of obvious issues
**Duration**: ~1-2 minutes
**Actions**:
- ESLint with `--fix` flag
- TypeScript type checking
- Security pattern scanning
- Prettier formatting check

**Failure Handling**: Immediate REQUEST_CHANGES comment for critical issues

### Stage 2: Gemini Code Review
**Purpose**: Comprehensive code analysis against project standards
**Duration**: ~3-10 minutes
**Inputs**:
- PR title and description
- File diff and content
- Project context (package.json, tsconfig.json)
- GEMINI_AI_KEY environment variable

**Review Criteria**:
1. **Code Quality**: Readability, maintainability, best practices
2. **TypeScript**: Type safety, proper usage, interface definitions
3. **Security**: No hardcoded secrets, proper input validation
4. **Performance**: Optimization opportunities, unnecessary re-renders
5. **UI/UX**: Accessibility, Tailwind v4 usage, component design
6. **Architecture**: FSD compliance, proper feature organization
7. **Testing**: Missing tests, test quality

### Stage 3: Summary & Decision
**Purpose**: Consolidate findings and make final decision
**Duration**: ~1 minute
**Actions**:
- Aggregate all stage results
- Generate final review comment
- Post GitHub review with recommendation

## Implementation

### Workflow File: `.github/workflows/gemini-pr-review.yml`

```yaml
name: Gemini PR Review

on:
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]

concurrency:
  group: gemini-pr-review-${{ github.event.number }}
  cancel-in-progress: true

jobs:
  automated-checks:
    name: Automated Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - name: ESLint Check
        run: npm run lint -- --fix
      - name: TypeScript Check
        run: npm run typecheck
      - name: Security Scan
        run: node security-scan.js

  gemini-review:
    name: Gemini Code Review
    needs: automated-checks
    runs-on: ubuntu-latest
    env:
      GEMINI_API_KEY: ${{ secrets.GEMINI_AI_KEY }}
    steps:
      - uses: actions/checkout@v4
      - name: Get PR information
        uses: actions/github-script@v7
        with:
          script: |
            const { data } = await github.rest.pulls.get({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number
            });
            return data;
      - name: Call Gemini API
        run: |
          # Node.js script to call Gemini API with PR content
          node gemini-review.js

  summary-decision:
    name: Summary & Decision
    needs: gemini-review
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v7
        with:
          script: |
            const reviewData = JSON.parse(fs.readFileSync('review-result.json', 'utf8'));
            // Create and post GitHub review
            await github.rest.pulls.createReview({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number,
              body: reviewData.body,
              event: reviewData.recommendation
            });
```

## Output Format

### GitHub Review Structure
- **Overall Summary**: High-level assessment
- **Recommendation**: APPROVE | REQUEST_CHANGES | COMMENT
- **Detailed Findings**: Table or list of issues
  - File path and line number
  - Issue type (TypeScript, Security, Performance, etc.)
  - Severity (Critical/Major/Minor/Suggestion)
  - Description of the issue
  - Specific fix suggestion

### Example Review Comment
```
## Gemini Code Review Summary

This PR introduces significant improvements to the user authentication flow with proper TypeScript typing and security measures. The code follows FSD principles well.

**Recommendation: REQUEST_CHANGES**

### Critical Issues
📁 src/features/auth/components/LoginForm.tsx:15
**Type:** Security
**Severity:** Critical
**Issue:** Hardcoded API endpoint
**Fix:** Use constant from src/shared/constants/api.ts

### Major Issues
📁 src/features/auth/hooks/useAuth.ts:42
**Type:** TypeScript
**Severity:** Major  
**Issue:** Missing return type for async function
**Fix:** Add explicit return type: Promise<AuthResponse>

### Minor Issues
📁 src/features/auth/pages/LoginPage.tsx:28
**Type:** Performance
**Severity:** Minor
**Issue:** Unnecessary re-render on every prop change
**Fix:** Wrap form components in React.memo
```

## Error Handling

### Common Scenarios
1. **Large PRs (>100 files)**
   - Strategy: Sample most important files (components, pages)
   - Skip test files for diffs > 100 files
   
2. **API Failures**
   - Fallback to automated checks only
   - Comment explaining failure
   - Manual retry option

3. **Invalid API Key**
   - Early validation before calling API
   - Clear error message to maintainers

4. **Timeouts**
   - Chunk file processing
   - 10-15 minute timeout per stage
   - Partial reviews for timeout scenarios

### Recovery Strategy
- Stage failures don't block workflow
- Partial reviews acceptable
- Manual retry via workflow_dispatch

## Performance Metrics

### Expected Duration
- Small PRs (<10 files): 2-3 minutes
- Medium PRs (10-50 files): 5-8 minutes  
- Large PRs (>50 files): 10-15 minutes

### Monitoring
- Review completion rate
- Average review time
- Most common issue types
- API success rate

## Dependencies

### Required Secrets
- `GEMINI_AI_KEY`: Gemini API key (configured)

### Required Permissions
- GitHub default token (provided automatically)
- Read/write access to PRs

## Success Criteria

1. **Comprehensive Review**: All code aspects evaluated
2. **Actionable Feedback**: Specific, fixable issues identified
3. **Quick Turnaround**: Review within 10 minutes for typical PRs
4. **High Accuracy**: Minimal false positives
5. **Constructive Tone**: Helpful, encouraging feedback

## Future Enhancements

1. **Integration with CI Pipeline**: Add as required check
2. **Customizable Review Rules**: Configurable rules per file type
3. **AI-Powered Suggestions**: Automated fixes for common issues
4. **Historical Analysis**: Track review quality over time
5. **Multi-Language Support**: Expand to backend PRs

---

**Design approved by**: [Team Lead]  
**Next Steps**: Implementation with writing-plans skill