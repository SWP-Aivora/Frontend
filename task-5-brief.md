# Task 5: Create GitHub Review Generator

**Files:**
- Create: `.github/scripts/utils/github-reviewer.js`
- Test: Unit tests for review generation

**Interfaces:**
- Consumes: Scored issues, PR metadata
- Produces: GitHub review comment body

- [ ] **Step 1: Write failing test**

Create `tests/utils/github-reviewer.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { generateReviewComment } from '../../.github/scripts/utils/github-reviewer.js';

describe('GitHub Review Generator', () => {
  it('should generate review comment with critical issues', () => {
    const scoredIssues = {
      highConfidence: [
        { file: 'test.js', line: 1, description: 'Critical issue', confidence: 90 }
      ],
      mediumConfidence: [],
      lowConfidence: []
    };
    
    const comment = generateReviewComment(scoredIssues, 'Test PR', 'abc123');
    expect(comment).toContain('🚨 Critical Issues');
    expect(comment).toContain('test.js:1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/utils/github-reviewer.test.js`
Expected: FAIL

- [ ] **Step 3: Create GitHub reviewer implementation**

Write `.github/scripts/utils/github-reviewer.js`:
```javascript
export function generateReviewComment(scoredIssues, prTitle, prSha) {
  const { highConfidence, mediumConfidence, lowConfidence, summary } = scoredIssues;
  
  const lines = [
    '## 🤖 Gemini AI Enhanced Code Review',
    '',
    `> **Summary**: ${summary}`,
    '',
  ];
  
  if (highConfidence.length > 0) {
    lines.push(`### 🚨 Critical Issues (Must Fix) (${highConfidence.length}):`, '');
    highConfidence.forEach((issue, index) => {
      lines.push(`${index + 1}. **[${issue.category.toUpperCase()}]** ${issue.description} (confidence: ${issue.confidence})`);
      lines.push(`   📄 [${issue.file}:${issue.line}](https://github.com/SWP-Aivora/Frontend/blob/${prSha}/${issue.file}#L${issue.line-1}-L${issue.line+1})`);
      lines.push('');
    });
  }
  
  if (mediumConfidence.length > 0) {
    lines.push(`### 💬 Important Issues (Should Fix) (${mediumConfidence.length}):`, '');
    mediumConfidence.forEach((issue, index) => {
      lines.push(`${index + 1}. **[${issue.category.toUpperCase()}]** ${issue.description} (confidence: ${issue.confidence})`);
      lines.push(`   📄 [${issue.file}:${issue.line}](https://github.com/SWP-Aivora/Frontend/blob/${prSha}/${issue.file}#L${issue.line-1}-L${issue.line+1})`);
      lines.push('');
    });
  }
  
  lines.push(
    '---',
    '<sub>🤖 Reviewed by 7 AI Experts | React with 👍 if helpful, 👎 if not</sub>'
  );
  
  return lines.join('\n');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/utils/github-reviewer.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .github/scripts/utils/github-reviewer.js tests/utils/github-reviewer.test.js
git commit -m "feat: add GitHub review generator utility"
```