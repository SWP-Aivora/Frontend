import { describe, it, expect } from 'vitest';
import { QUERY_KEYS, REFETCH_INTERVALS } from '@/shared/constants';

describe('Shared Constants', () => {
  it('defines QUERY_KEYS with correct job query key builders', () => {
    expect(QUERY_KEYS.JOBS.DETAIL('123')).toEqual(['job', '123']);
    expect(QUERY_KEYS.JOBS.PROPOSALS('456')).toEqual(['proposals', '456']);
    expect(QUERY_KEYS.JOBS.PROPOSAL_COUNT('789')).toEqual(['proposals', '789', 'count']);
  });

  it('defines REFETCH_INTERVALS with expected milliseconds', () => {
    expect(REFETCH_INTERVALS.REALTIME_FAST).toBe(5000);
    expect(REFETCH_INTERVALS.REALTIME_SLOW).toBe(10000);
    expect(REFETCH_INTERVALS.BACKGROUND_SUMMARY).toBe(60000);
  });
});
