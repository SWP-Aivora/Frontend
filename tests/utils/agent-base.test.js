import { describe, it, expect } from 'vitest';
import { AgentBase } from '../../.github/scripts/utils/agent-base.js';

class TestAgent extends AgentBase {
  getPrompt() {
    return 'Review for test issues';
  }

  getCategory() {
    return 'test';
  }

  async analyzeWithAI(prompt, diff) {
    return [
      { file: 'test.js', line: 1, description: 'Test issue', confidence: 85 }
    ];
  }
}

describe('Agent Base', () => {
  it('should create agent with proper structure', async () => {
    const agent = new TestAgent();
    const result = await agent.run('test diff', { test: 'context' });

    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('summary');
    expect(result.issues).toHaveLength(1);
  });
});