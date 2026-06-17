import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../../features/auth/services';
import apiClient from '../../../lib/axios';

vi.mock('../../../lib/axios');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('handles login success with camelCase fields', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            userId: '123',
            email: 'test@test.com',
            fullName: 'Test User',
            role: 'CLIENT',
            accessToken: 'acc_token',
            refreshToken: 'ref_token'
          }
        }
      };
      (vi.mocked(apiClient.post)).mockResolvedValue(mockResponse);

      const result = await authService.login({ email: 'test@test.com', password: 'password' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: '123',
        email: 'test@test.com',
        fullName: 'Test User',
        role: 'CLIENT',
        accessToken: 'acc_token',
        refreshToken: 'ref_token'
      });
    });

    it('handles login success with PascalCase fields', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            UserId: '456',
            Email: 'test2@test.com',
            FullName: 'Test User 2',
            Role: 'EXPERT',
            AccessToken: 'acc_token2',
            RefreshToken: 'ref_token2'
          }
        }
      };
      (vi.mocked(apiClient.post)).mockResolvedValue(mockResponse);

      const result = await authService.login({ email: 'test2@test.com', password: 'password' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: '456',
        email: 'test2@test.com',
        fullName: 'Test User 2',
        role: 'EXPERT',
        accessToken: 'acc_token2',
        refreshToken: 'ref_token2'
      });
    });

    it('returns data: null on failed login', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Invalid credentials',
          statusCode: 401
        }
      };
      (vi.mocked(apiClient.post)).mockResolvedValue(mockResponse);

      const result = await authService.login({ email: 'test@test.com', password: 'wrong' });
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe('Invalid credentials');
    });

    it('returns data: null when token fields are missing or format is invalid', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: null // invalid payload
        }
      };
      (vi.mocked(apiClient.post)).mockResolvedValue(mockResponse);

      const result = await authService.login({ email: 'test@test.com', password: 'password' });
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });
  });

  describe('getMe', () => {
    it('handles getMe success', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: '123',
            email: 'me@test.com',
            fullName: 'Me',
            role: 'ADMIN'
          }
        }
      };
      (vi.mocked(apiClient.get)).mockResolvedValue(mockResponse);

      const result = await authService.getMe();
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: '123',
        email: 'me@test.com',
        fullName: 'Me',
        role: 'ADMIN'
      });
    });

    it('returns data: null on failure', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Token expired',
          statusCode: 401
        }
      };
      (vi.mocked(apiClient.get)).mockResolvedValue(mockResponse);

      const result = await authService.getMe();
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });
  });
});
