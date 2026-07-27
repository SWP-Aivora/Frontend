import { Role } from '@/shared/types/enums';

const getRoleBasePath = (role?: string) => {
  if (role === Role.ADMIN) return '/admin';
  if (role === Role.EXPERT) return '/expert';
  return '/client';
};

const parseRelativeNotificationUrl = (linkUrl: string) => {
  const hashRouterUrl = linkUrl.startsWith('#') ? linkUrl.slice(1) : linkUrl;
  const hashIndex = hashRouterUrl.indexOf('#');
  const beforeHash = hashIndex >= 0 ? hashRouterUrl.slice(0, hashIndex) : hashRouterUrl;
  const hash = hashIndex >= 0 ? hashRouterUrl.slice(hashIndex) : '';
  const searchIndex = beforeHash.indexOf('?');
  const rawPath = searchIndex >= 0 ? beforeHash.slice(0, searchIndex) : beforeHash;
  const search = searchIndex >= 0 ? beforeHash.slice(searchIndex) : '';
  const appPath = rawPath.replace(/^\/?api\/v\d+(?=\/|$)/i, '') || '/';
  const normalizedPath = appPath.startsWith('/') ? appPath : `/${appPath}`;

  return {
    normalizedPath,
    suffix: `${search}${hash}`,
  };
};

export const resolveNotificationPath = (linkUrl: string, role?: string) => {
  const trimmedUrl = linkUrl.trim();
  if (!trimmedUrl) return null;
  if (/^https?:\/\//i.test(trimmedUrl)) return trimmedUrl;

  const roleBasePath = getRoleBasePath(role);
  const { normalizedPath, suffix } = parseRelativeNotificationUrl(trimmedUrl);

  if (/^\/(admin|client|expert)(\/|$)/i.test(normalizedPath)) {
    return `${normalizedPath}${suffix}`;
  }

  const segments = normalizedPath.split('/').filter(Boolean);
  const [resource, id, child, childId] = segments;
  const normalizedResource = resource?.toLowerCase();
  const normalizedChild = child?.toLowerCase();

  if (normalizedResource === 'jobs' && id) {
    if (normalizedChild === 'proposals') {
      return role === Role.CLIENT
        ? `/client/job-posts/${id}/proposals${suffix}`
        : `${roleBasePath}/proposals${suffix}`;
    }

    return role === Role.EXPERT
      ? `/expert/jobs/${id}${suffix}`
      : role === Role.ADMIN
        ? `/admin/job-posts${suffix}`
        : `/client/job-posts${suffix}`;
  }

  if (normalizedResource === 'projects' && id) {
    if (normalizedChild === 'disputes') {
      return role === Role.ADMIN
        ? `/admin/projects/${id}/disputes${suffix}`
        : `${roleBasePath}/projects/${id}/disputes${suffix}`;
    }

    return role === Role.ADMIN
      ? `/admin/projects${suffix}`
      : `${roleBasePath}/projects/${id}/workspace${suffix}`;
  }

  if (normalizedResource === 'service-requests') {
    return role === Role.CLIENT && id
      ? `/client/services/requests/${id}${suffix}`
      : `${roleBasePath}/services${suffix}`;
  }

  if (normalizedResource === 'services') {
    if (normalizedChild === 'requests') {
      if (role === Role.EXPERT) {
        return childId
          ? `/expert/services/${id}/requests/${childId}${suffix}`
          : `/expert/services/${id}/requests${suffix}`;
      }

      return `/client/services/requests${suffix}`;
    }

    return role === Role.EXPERT
      ? `/expert/services${suffix}`
      : id
        ? `/client/services/${id}${suffix}`
        : `/client/services${suffix}`;
  }

  if (normalizedResource === 'disputes') {
    return role === Role.ADMIN
      ? `/admin/projects${suffix}`
      : `${roleBasePath}/projects${suffix}`;
  }

  if (normalizedResource === 'profile') {
    return `${roleBasePath}/profile${suffix}`;
  }

  if ((normalizedResource === 'experts' || normalizedResource === 'expert-profiles') && id) {
    return role === Role.ADMIN
      ? `/admin/users/${id}${suffix}`
      : `/client/experts/${id}${suffix}`;
  }

  if (normalizedResource === 'users' && id) {
    return role === Role.ADMIN
      ? `/admin/users/${id}${suffix}`
      : `${roleBasePath}/profile${suffix}`;
  }

  if (normalizedResource === 'proposals' && id && role !== Role.ADMIN) {
    return `${roleBasePath}/proposals/${id}${suffix}`;
  }

  if (normalizedResource === 'messages') {
    return `${roleBasePath}/messages${suffix}`;
  }

  if (normalizedResource === 'notifications') {
    return `${roleBasePath}/notifications${suffix}`;
  }

  return `${normalizedPath}${suffix}`;
};
