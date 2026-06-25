import { describe, it, expect } from 'vitest';
import { readGeminiContext } from '../../.github/scripts/utils/gemini-context-reader.js';

describe('Gemini Context Reader', () => {
  it('should read and parse GEMINI.md', async () => {
    const context = await readGeminiContext();
    expect(context).toHaveProperty('security');
    expect(context).toHaveProperty('architecture');
    expect(context).toHaveProperty('typescript');
  });

  it('should validate required sections', async () => {
    const context = await readGeminiContext();
    expect(context.security).toContain('Credential Protection');
    expect(context.architecture).toContain('Features are strictly isolated');
  });
});