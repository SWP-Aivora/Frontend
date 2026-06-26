import { spawn } from 'child_process';
import { describe, it, expect } from 'vitest';

describe('CLI Interface', () => {
  it('should parse command line arguments correctly', async () => {
    const child = spawn('node', [
      '.github/scripts/subagent-review-harness.js',
      '--pr-number', '123',
      '--pr-title', 'Test PR',
      '--pr-sha', 'abc123',
      '--diff-file', '/tmp/test.diff'
    ]);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => stdout += data);
    child.stderr.on('data', (data) => stderr += data);

    await new Promise((resolve) => {
      child.on('close', resolve);
    });

    // Should fail due to missing API key, but not due to argument parsing
    expect(stderr).toContain('GEMINI_AI_KEY');
    expect(stderr).not.toContain('Missing required arguments');
  });
});