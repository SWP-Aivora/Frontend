import { describe, expect, it } from 'vitest';
import { Role } from '@/shared/types/enums';
import { resolveNotificationPath } from '@/features/notifications/utils/notificationRoutes';

describe('resolveNotificationPath', () => {
  it('preserves external links', () => {
    expect(resolveNotificationPath('https://example.com/projects/1', Role.CLIENT)).toBe('https://example.com/projects/1');
  });

  it('maps API project links to role workspace routes with query strings', () => {
    expect(resolveNotificationPath('/api/v1/projects/project-1?tab=files', Role.EXPERT)).toBe('/expert/projects/project-1/workspace?tab=files');
  });

  it('normalizes hash-router links without leaking the leading hash', () => {
    expect(resolveNotificationPath('#/projects/project-1?tab=files', Role.CLIENT)).toBe('/client/projects/project-1/workspace?tab=files');
  });

  it('preserves fragment identifiers on relative links', () => {
    expect(resolveNotificationPath('projects/project-1#notes', Role.CLIENT)).toBe('/client/projects/project-1/workspace#notes');
  });

  it('maps project disputes to the admin dispute route', () => {
    expect(resolveNotificationPath('/api/v1/projects/project-1/disputes?status=open', Role.ADMIN)).toBe('/admin/projects/project-1/disputes?status=open');
  });
});
