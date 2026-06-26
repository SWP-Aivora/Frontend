import { describe, it, expect } from 'vitest';
import { generateReviewComment } from '../../.github/scripts/utils/github-reviewer.js';

describe('GitHub Review Generator', () => {
  it('should generate review comment with critical issues', () => {
    const scoredIssues = {
      highConfidence: [
        { file: 'test.js', line: 1, description: 'Critical issue', confidence: 90, category: 'security' }
      ],
      mediumConfidence: [],
      lowConfidence: []
    };

    const comment = generateReviewComment(scoredIssues, 'Test PR', 'abc123');
    expect(comment).toContain('🚨 Critical Issues');
    expect(comment).toContain('test.js:1');
  });
});