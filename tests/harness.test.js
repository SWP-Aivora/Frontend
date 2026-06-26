import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubagentReviewHarness } from '../.github/scripts/subagent-review-harness.js';

// Mock dependencies
vi.mock('@google/generative-ai');
vi.mock('../../.github/scripts/utils/gemini-context-reader.js');
vi.mock('fs');

describe('Subagent Review Harness', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should run full review process with mocked dependencies', async () => {
    // Mock Gemini AI
    vi.fn().mockResolvedValue({
      response: { text: () => '[]' }
    });

    // Mock context reader
    vi.mocked(require('../../.github/scripts/utils/gemini-context-reader.js')).readGeminiContext.mockResolvedValue({
      security: 'test security',
      architecture: 'test architecture'
    });

    // Mock file system
    vi.mocked(require('fs').readFileSync).mockReturnValue('test diff content');

    const harness = new SubagentReviewHarness('test-api-key');
    const result = await harness.run({
      prNumber: 123,
      prTitle: 'Test PR',
      prSha: 'abc123',
      diffFile: '/tmp/test.diff'
    });

    expect(result).toHaveProperty('reviewComment');
    expect(result).toHaveProperty('performanceMetrics');
    expect(result.performanceMetrics.duration).toBeGreaterThan(0);
  });
});