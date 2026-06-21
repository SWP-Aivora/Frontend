import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNotificationActions } from '../../../features/notifications/hooks/useNotificationActions';
import { NOTIFICATION_KEYS } from '../../../features/notifications/hooks/useNotifications';
import { notificationService } from '../../../features/notifications/services';
import { NotificationPriority, NotificationStatus, NotificationType, type Notification } from '../../../features/notifications/types';
import type { BaseResponse, PaginatedResponse } from '../../../shared/types/api';

vi.mock('../../../features/notifications/services', () => ({
  notificationService: {
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const makeNotification = (id: string, isRead: boolean): Notification => ({
  id,
  type: NotificationType.GENERAL,
  title: `Notification ${id}`,
  message: `Message ${id}`,
  priority: NotificationPriority.NORMAL,
  status: isRead ? NotificationStatus.READ : NotificationStatus.UNREAD,
  isRead,
  createdAt: '2026-06-18T00:00:00.000Z',
});

const makeListResponse = (notifications: Notification[]): PaginatedResponse<Notification> => ({
  success: true,
  message: '',
  statusCode: 200,
  data: notifications,
  metadata: {
    pageIndex: 1,
    pageSize: 20,
    totalCount: notifications.length,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  },
});

const makeUnreadCountResponse = (count: number): BaseResponse<number> => ({
  success: true,
  message: '',
  statusCode: 200,
  data: count,
});

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useNotificationActions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('marks only the selected notification as read and updates unread count', async () => {
    const listKey = NOTIFICATION_KEYS.list({ PageSize: 20, PageIndex: 1 });
    queryClient.setQueryData(listKey, makeListResponse([
      makeNotification('n1', false),
      makeNotification('n2', false),
    ]));
    queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount, makeUnreadCountResponse(2));
    vi.mocked(notificationService.markAsRead).mockResolvedValue({
      success: true,
      message: '',
      statusCode: 200,
      data: null,
    });

    const { result } = renderHook(() => useNotificationActions(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.markAsRead('n1');
    });

    await waitFor(() => expect(notificationService.markAsRead).toHaveBeenCalledWith('n1'));

    const list = queryClient.getQueryData<PaginatedResponse<Notification>>(listKey);
    const notifications = list?.data ?? [];
    expect(notifications.find((n) => n.id === 'n1')).toMatchObject({
      isRead: true,
      status: NotificationStatus.READ,
    });
    expect(notifications.find((n) => n.id === 'n2')).toMatchObject({
      isRead: false,
      status: NotificationStatus.UNREAD,
    });
    expect(queryClient.getQueryData<BaseResponse<number>>(NOTIFICATION_KEYS.unreadCount)?.data).toBe(1);
  });

  it('rolls back the selected notification and unread count when mark read fails', async () => {
    const listKey = NOTIFICATION_KEYS.list({ PageSize: 20, PageIndex: 1 });
    queryClient.setQueryData(listKey, makeListResponse([
      makeNotification('n1', false),
      makeNotification('n2', false),
    ]));
    queryClient.setQueryData(NOTIFICATION_KEYS.unreadCount, makeUnreadCountResponse(2));
    vi.mocked(notificationService.markAsRead).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNotificationActions(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.markAsRead('n1');
    });

    await waitFor(() => expect(result.current.isMarkingAsRead).toBe(false));

    const list = queryClient.getQueryData<PaginatedResponse<Notification>>(listKey);
    const notifications = list?.data ?? [];
    expect(notifications.find((n) => n.id === 'n1')).toMatchObject({
      isRead: false,
      status: NotificationStatus.UNREAD,
    });
    expect(notifications.find((n) => n.id === 'n2')).toMatchObject({
      isRead: false,
      status: NotificationStatus.UNREAD,
    });
    expect(queryClient.getQueryData<BaseResponse<number>>(NOTIFICATION_KEYS.unreadCount)?.data).toBe(2);
  });
});
