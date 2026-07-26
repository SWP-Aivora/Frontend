import { describe, it, expect, vi } from 'vitest';
import { env } from '@/lib/env';
import { getRequestPath, matchesEndpoint } from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';

vi.mock('@/lib/env', () => ({
  env: { API_URL: 'https://aivora-backend.onrender.com/api/v1', NODE_ENV: 'test' },
}));

// env.API_URL is readonly in its real module type; the mock above is a plain mutable
// object at runtime, so this cast lets each test point it at a different base URL.
const setApiUrl = (value: string) => {
  (env as { API_URL: string }).API_URL = value;
};

describe('getRequestPath', () => {
  it('resolves a plain path when API_URL is absolute, without throwing', () => {
    setApiUrl('https://aivora-backend.onrender.com/api/v1');
    expect(getRequestPath('auth/login')).toBe('/api/auth/login');
  });

  it('strips query string and trailing slash when API_URL is absolute', () => {
    setApiUrl('https://aivora-backend.onrender.com/api/v1');
    expect(getRequestPath('jobs/?PageIndex=1')).toBe('/api/jobs');
  });

  it('resolves the same path when API_URL is relative (same-origin proxy), without throwing', () => {
    setApiUrl('/api/v1');
    expect(getRequestPath('auth/login')).toBe('/api/auth/login');
  });

  it('strips query string and trailing slash when API_URL is relative', () => {
    setApiUrl('/api/v1');
    expect(getRequestPath('jobs/?PageIndex=1')).toBe('/api/jobs');
  });

  it('returns empty string for an undefined url', () => {
    expect(getRequestPath(undefined)).toBe('');
  });
});

describe('matchesEndpoint', () => {
  it('matches auth endpoints when API_URL is absolute', () => {
    setApiUrl('https://aivora-backend.onrender.com/api/v1');
    expect(matchesEndpoint(API_ENDPOINTS.AUTH.LOGIN, API_ENDPOINTS.AUTH.LOGIN)).toBe(true);
    expect(matchesEndpoint(API_ENDPOINTS.AUTH.REFRESH_TOKEN, API_ENDPOINTS.AUTH.REFRESH_TOKEN)).toBe(true);
    expect(matchesEndpoint(API_ENDPOINTS.AUTH.LOGOUT, API_ENDPOINTS.AUTH.LOGOUT)).toBe(true);
    expect(matchesEndpoint(API_ENDPOINTS.JOBS.BASE, API_ENDPOINTS.AUTH.LOGIN)).toBe(false);
  });

  it('matches auth endpoints when API_URL is relative', () => {
    setApiUrl('/api/v1');
    expect(matchesEndpoint(API_ENDPOINTS.AUTH.LOGIN, API_ENDPOINTS.AUTH.LOGIN)).toBe(true);
    expect(matchesEndpoint(API_ENDPOINTS.AUTH.REFRESH_TOKEN, API_ENDPOINTS.AUTH.REFRESH_TOKEN)).toBe(true);
    expect(matchesEndpoint(API_ENDPOINTS.AUTH.LOGOUT, API_ENDPOINTS.AUTH.LOGOUT)).toBe(true);
    expect(matchesEndpoint(API_ENDPOINTS.JOBS.BASE, API_ENDPOINTS.AUTH.LOGIN)).toBe(false);
  });
});
