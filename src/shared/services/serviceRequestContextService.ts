import apiClient from '@/lib/axios';
import { normalizeBaseResponse } from '@/lib/api-utils';
import { API_ENDPOINTS } from '@/shared/constants';
import type { BaseResponse } from '@/shared/types/api';

type ApiRecord = Record<string, unknown>;

export interface ServiceRequestContext {
  id: string;
  serviceId: string;
  serviceTitle?: string | null;
  packageTitle?: string | null;
}

const getRecord = (value: unknown): ApiRecord => (
  value && typeof value === 'object' && !Array.isArray(value) ? value as ApiRecord : {}
);

const getString = (item: ApiRecord, ...keys: string[]): string => {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
  }

  return '';
};

const normalizeServiceRequestContext = (value: unknown): ServiceRequestContext => {
  const item = getRecord(value);
  return {
    id: getString(item, 'id', 'Id'),
    serviceId: getString(item, 'serviceId', 'ServiceId'),
    serviceTitle: getString(item, 'serviceTitle', 'ServiceTitle') || null,
    packageTitle: getString(item, 'packageTitle', 'PackageTitle') || null,
  };
};

export const serviceRequestContextService = {
  getById: async (requestId: string): Promise<BaseResponse<ServiceRequestContext>> => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.REQUEST_BY_ID(requestId));
    const normalized = normalizeBaseResponse<unknown>(response);

    return {
      ...normalized,
      data: normalized.data ? normalizeServiceRequestContext(normalized.data) : null,
    };
  },
};
