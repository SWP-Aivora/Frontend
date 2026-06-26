# Enhanced Code Review System (Start Small)

## Overview
Enhanced AI-powered code review system using 2 specialized agents for better code quality analysis.

## Architecture
- **Bug Hunter Agent**: Detects logic errors, null/undefined risks, race conditions, missing error handling
- **TypeScript Agent**: Enforces TypeScript strict compliance, checks import type usage, enum usage, type safety

## Features
- 🚀 Parallel agent execution for faster reviews
- 🎯 Confidence scoring (0-100) with threshold-based categorization
- 📚 Integrated GEMINI.md context reading
- 🤖 Smart GitHub review generation
- 🔄 Automatic fallback for self-approval scenarios
- ⚡ Performance monitoring

## Agent Details

### Bug Hunter Agent
- **Focus**: Logic errors and runtime issues
- **Checks**: null risks, race conditions, infinite loops, error handling, React issues
- **Confidence Threshold**: ≥80 for critical issues

### TypeScript Agent
- **Focus**: TypeScript strict compliance
- **Checks**: import type usage, enum alternatives, type annotations, generic usage
- **Confidence Threshold**: ≥80 for critical issues

## Usage

### Manual Testing
```bash
# Run test script
node .github/scripts/test-enhanced-review.js

# Install dependencies
npm install
```

### GitHub Actions Workflow
The enhanced review is automatically triggered on:
- Pull request opened
- Pull request synchronized (updated)

### Workflow Steps
1. **Setup**: Node.js 20.x and dependency installation
2. **Diff Generation**: Filter relevant files (skip lock files, images, etc.)
3. **Enhanced Review**: Run 2 agents in parallel
4. **Review Generation**: Create formatted GitHub comment
5. **Auto-Approval**: Automatic approval if no critical issues found

## Configuration Required

### Repository Secrets
- `GEMINI_AI_KEY`: Gemini API key for AI analysis
- `BOT_GITHUB_TOKEN`: GitHub token for posting reviews

### Performance Targets
- Review time: <10 seconds for typical PRs
- Maximum diff size: 100,000 characters
- Agents: 2 parallel workers

## Confidence Scoring
- **0**: False positive
- **25**: Possible issue
- **50**: Minor issue/nitpick
- **75**: Important issue
- **100**: Critical issue (blocks PR)

## File Structure
```
.github/scripts/
├── agents/
│   ├── bug-hunter-agent.js
│   └── typescript-agent.js
├── utils/
│   ├── agent-base.js
│   ├── confidence-scorer.js
│   ├── gemini-context-reader.js
│   └── github-reviewer.js
├── enhanced-review-harness.js
└── test-enhanced-review.js

.github/workflows/
└── enhanced-review-small.yml
```

## Next Steps
After successful testing of this 2-agent system:
1. Add remaining 5 agents (Security, Architecture, React, Testing, Requirements)
2. Implement rate limiting and error recovery
3. Add performance dashboard
4. Extend to support multiple repositories

## Troubleshooting

### Common Issues
1. **No Review Comments**: Check GEMINI_AI_KEY secret and API quota
2. **JSON Parsing Errors**: Review agent prompts for proper formatting
3. **Self-Approval Errors**: System automatically falls back to COMMENT mode

### Debug Commands
```bash
# Check workflow logs
gh run view --web

# Test dependencies
node -e "console.log(require('@google/generative-ai'))"

# Validate test script
node .github/scripts/test-enhanced-review.js
```

## Migration from Original System
This enhanced system replaces the original single-agent review with:
- Better accuracy through specialized agents
- Faster parallel processing
- Improved confidence scoring
- Enhanced error handling
- Performance metrics tracking