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