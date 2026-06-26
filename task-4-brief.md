# Task 4: Create Confidence Scoring Utility

**Files:**
- Create: `.github/scripts/utils/confidence-scorer.js`
- Test: Unit tests for confidence scoring

**Interfaces:**
- Consumes: Array of issues from all agents
- Produces: Issues with confidence scores ≥80

- [ ] **Step 1: Write failing test**

Create `tests/utils/confidence-scorer.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { scoreIssues } from '../../.github/scripts/utils/confidence-scorer.js';

describe('Confidence Scorer', () => {
  it('should filter issues with confidence >= 80', () => {
    const issues = [
      { agent: 'req', confidence: 90 },
      { agent: 'bug', confidence: 75 },
      { agent: 'sec', confidence: 85 }
    ];
    
    const result = scoreIssues(issues);
    expect(result.highConfidence).toHaveLength(2);
    expect(result.mediumConfidence).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/utils/confidence-scorer.test.js`
Expected: FAIL

- [ ] **Step 3: Create confidence scorer implementation**

Write `.github/scripts/utils/confidence-scorer.js`:
```javascript
export function scoreIssues(allIssues) {
  const highConfidence = [];
  const mediumConfidence = [];
  const lowConfidence = [];
  
  allIssues.forEach(issue => {
    if (issue.confidence >= 80) {
      highConfidence.push(issue);
    } else if (issue.confidence >= 50) {
      mediumConfidence.push(issue);
    } else {
      lowConfidence.push(issue);
    }
  });
  
  return {
    highConfidence,
    mediumConfidence,
    lowConfidence,
    summary: `Total: ${allIssues.length}, Critical: ${highConfidence.length}, Important: ${mediumConfidence.length}`
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/utils/confidence-scorer.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .github/scripts/utils/confidence-scorer.js tests/utils/confidence-scorer.test.js
git commit -m "feat: add confidence scoring utility"
```