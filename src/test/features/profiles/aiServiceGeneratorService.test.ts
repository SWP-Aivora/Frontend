import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiServiceGeneratorService } from '../../../features/profiles/aiServiceGeneratorService';
import apiClient from '../../../lib/axios';

vi.mock('../../../lib/axios');

describe('aiServiceGeneratorService.generateServiceDescription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the AI service generator endpoint and returns the normalized result', async () => {
    (vi.mocked(apiClient.post)).mockResolvedValue({
      data: {
        success: true,
        data: {
          suggestedTitle: 'Custom React Dashboard Development',
          suggestedDescription: 'I build data-rich dashboards for SaaS startups.',
          packages: [
            { name: 'Basic', title: 'Starter Dashboard', price: 100, deliveryDays: 5, description: 'A single-page dashboard', features: ['1 page', '2 charts'] },
          ],
          faqs: [
            { question: 'What tech stack do you use?', answer: 'React, TypeScript, and D3.js.' },
          ],
        },
        message: 'Service description generated',
      },
    });

    const result = await aiServiceGeneratorService.generateServiceDescription({
      rawInput: 'I build custom React dashboards',
      skills: ['React', 'TypeScript'],
      priceFrom: 100,
      deliveryDays: 5,
      tone: 'professional',
      targetClient: 'startup',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/ai/service-generator', {
      rawInput: 'I build custom React dashboards',
      skills: ['React', 'TypeScript'],
      priceFrom: 100,
      deliveryDays: 5,
      tone: 'professional',
      targetClient: 'startup',
    });
    expect(result.success).toBe(true);
    expect(result.data?.suggestedTitle).toBe('Custom React Dashboard Development');
    expect(result.data?.packages).toHaveLength(1);
  });
});
