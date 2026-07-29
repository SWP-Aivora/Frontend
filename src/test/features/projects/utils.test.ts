import { describe, it, expect } from 'vitest';
import { getDisputeGuardErrorMessage, DISPUTE_ACTION_BLOCKED_TOAST } from '../../../features/projects/utils';

describe('getDisputeGuardErrorMessage', () => {
  it('matches the fund-milestone dispute-guard message', () => {
    const error = {
      response: {
        data: { message: 'Cannot fund a milestone while there is an active dispute.' },
      },
    };

    expect(getDisputeGuardErrorMessage(error)).toBe(DISPUTE_ACTION_BLOCKED_TOAST);
  });

  it('returns null for unrelated errors', () => {
    const error = { response: { data: { message: 'Something else went wrong.' } } };

    expect(getDisputeGuardErrorMessage(error)).toBeNull();
  });
});
