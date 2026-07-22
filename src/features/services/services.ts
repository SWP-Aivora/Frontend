import apiClient from '@/lib/axios';
import { normalizeBaseResponse, normalizePaginatedResponse } from '@/lib/api-utils';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { API_ENDPOINTS } from '@/shared/constants';
import type {
  AcceptServiceOfferResult,
  CreateServiceOfferPayload,
  CreateServicePayload,
  CreateServiceRequestPayload,
  GeneratedServiceDescription,
  ServiceFaq,
  ServiceListing,
  ServiceOffer,
  ServiceOfferMilestone,
  ServicePackage,
  ServiceRequest,
  UpdateServicePayload,
} from './types';
import { PackageTier, ServiceRequestStatus, ServiceStatus } from './types';

type ApiRecord = Record<string, unknown>;

export interface ServiceCatalogParams {
  PageIndex?: number;
  PageSize?: number;
  SearchTerm?: string;
}

export interface ClientServiceRequestParams extends ServiceCatalogParams {
  status?: string;
}

const getRecord = (value: unknown): ApiRecord => (
  value && typeof value === 'object' && !Array.isArray(value) ? value as ApiRecord : {}
);

const getString = (item: ApiRecord, keys: string[], fallback = ''): string => {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
  }
  return fallback;
};

const getNullableString = (item: ApiRecord, keys: string[]): string | null => {
  const value = getString(item, keys, '');
  return value.trim() ? value : null;
};

const getNumber = (item: ApiRecord, keys: string[], fallback = 0): number => {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
};

const getArray = <T>(item: ApiRecord, keys: string[]): T[] => {
  for (const key of keys) {
    const value = item[key];
    if (Array.isArray(value)) return value as T[];
  }
  return [];
};

const normalizeTier = (value: unknown): PackageTier => {
  const normalized = String(value ?? '').toUpperCase();
  if (normalized === PackageTier.STANDARD) return PackageTier.STANDARD;
  if (normalized === PackageTier.PREMIUM) return PackageTier.PREMIUM;
  return PackageTier.BASIC;
};

const normalizeServiceStatus = (value: unknown): string => {
  const normalized = String(value ?? '').toUpperCase();
  if (normalized === ServiceStatus.PUBLISHED) return ServiceStatus.PUBLISHED;
  return ServiceStatus.DRAFT;
};

const normalizeRequestStatus = (value: unknown): string => {
  const normalized = String(value ?? '').toUpperCase();
  if (normalized === ServiceRequestStatus.ACCEPTED) return ServiceRequestStatus.ACCEPTED;
  if (normalized === ServiceRequestStatus.DECLINED) return ServiceRequestStatus.DECLINED;
  return ServiceRequestStatus.PENDING;
};

const normalizePackage = (value: unknown): ServicePackage => {
  const item = getRecord(value);
  return {
    id: getString(item, ['id', 'Id']) || undefined,
    tier: normalizeTier(item.tier ?? item.Tier ?? item.name ?? item.Name),
    title: getString(item, ['title', 'Title', 'name', 'Name'], 'Package'),
    description: getNullableString(item, ['description', 'Description']),
    price: getNumber(item, ['price', 'Price']),
    deliveryDays: getNumber(item, ['deliveryDays', 'DeliveryDays']),
    features: getNullableString(item, ['features', 'Features']),
  };
};

const normalizeFaq = (value: unknown): ServiceFaq => {
  const item = getRecord(value);
  return {
    id: getString(item, ['id', 'Id']) || undefined,
    question: getString(item, ['question', 'Question']),
    answer: getString(item, ['answer', 'Answer']),
  };
};

const normalizeService = (value: unknown): ServiceListing => {
  const item = getRecord(value);
  const expert = getRecord(item.expert ?? item.Expert);

  return {
    id: getString(item, ['id', 'Id']),
    expertId: getString(item, ['expertId', 'ExpertId']),
    expertName: getNullableString(item, ['expertName', 'ExpertName']),
    expert: Object.keys(expert).length > 0 ? {
      id: getString(expert, ['id', 'Id']),
      fullName: getString(expert, ['fullName', 'FullName', 'name', 'Name']),
      avatarUrl: getNullableString(expert, ['avatarUrl', 'AvatarUrl']),
      title: getNullableString(expert, ['title', 'Title']),
    } : null,
    title: getString(item, ['title', 'Title'], 'Untitled service'),
    description: getString(item, ['description', 'Description']),
    status: normalizeServiceStatus(item.status ?? item.Status),
    attachmentUrl: getNullableString(item, ['attachmentUrl', 'AttachmentUrl']),
    createdAt: getString(item, ['createdAt', 'CreatedAt']) || undefined,
    publishedAt: getNullableString(item, ['publishedAt', 'PublishedAt']),
    packages: getArray<unknown>(item, ['packages', 'Packages']).map(normalizePackage),
    faqs: getArray<unknown>(item, ['faqs', 'Faqs']).map(normalizeFaq),
  };
};

const normalizeRequest = (value: unknown): ServiceRequest => {
  const item = getRecord(value);
  const offers = getArray<unknown>(item, ['offers', 'Offers', 'serviceOffers', 'ServiceOffers']).map(normalizeOffer);
  const offerRecord = item.offer ?? item.Offer ?? item.serviceOffer ?? item.ServiceOffer;

  return {
    id: getString(item, ['id', 'Id']),
    serviceId: getString(item, ['serviceId', 'ServiceId']),
    serviceTitle: getNullableString(item, ['serviceTitle', 'ServiceTitle']),
    expertId: getString(item, ['expertId', 'ExpertId']),
    expertName: getNullableString(item, ['expertName', 'ExpertName']),
    clientId: getString(item, ['clientId', 'ClientId']),
    clientName: getNullableString(item, ['clientName', 'ClientName']),
    packageId: getString(item, ['packageId', 'PackageId']),
    packageTitle: getString(item, ['packageTitle', 'PackageTitle'], 'Selected package'),
    packagePrice: getNumber(item, ['packagePrice', 'PackagePrice']),
    packageDeliveryDays: getNumber(item, ['packageDeliveryDays', 'PackageDeliveryDays']),
    note: getNullableString(item, ['note', 'Note']),
    status: normalizeRequestStatus(item.status ?? item.Status),
    createdAt: getString(item, ['createdAt', 'CreatedAt']) || undefined,
    offer: offerRecord ? normalizeOffer(offerRecord) : (offers[0] ?? null),
  };
};

const normalizeOfferMilestone = (value: unknown): ServiceOfferMilestone => {
  const item = getRecord(value);
  return {
    id: getString(item, ['id', 'Id']) || undefined,
    title: getString(item, ['title', 'Title']),
    description: getNullableString(item, ['description', 'Description']),
    amount: getNumber(item, ['amount', 'Amount']),
    dueDays: getNumber(item, ['dueDays', 'DueDays']),
    acceptanceCriteria: getNullableString(item, ['acceptanceCriteria', 'AcceptanceCriteria']),
    orderIndex: getNumber(item, ['orderIndex', 'OrderIndex']),
  };
};

const normalizeOffer = (value: unknown): ServiceOffer => {
  const item = getRecord(value);
  return {
    id: getString(item, ['id', 'Id']),
    serviceRequestId: getString(item, ['serviceRequestId', 'ServiceRequestId']),
    expertId: getString(item, ['expertId', 'ExpertId']),
    amount: getNumber(item, ['amount', 'Amount']),
    status: getString(item, ['status', 'Status'], 'PENDING'),
    createdAt: getString(item, ['createdAt', 'CreatedAt']) || undefined,
    milestones: getArray<unknown>(item, ['milestones', 'Milestones']).map(normalizeOfferMilestone),
  };
};

const normalizeAcceptOfferResult = (value: unknown): AcceptServiceOfferResult => {
  const item = getRecord(value);
  return {
    projectId: getString(item, ['projectId', 'ProjectId']) || undefined,
    serviceOfferId: getString(item, ['serviceOfferId', 'ServiceOfferId']) || undefined,
    status: getString(item, ['status', 'Status']) || undefined,
  };
};

const normalizeGeneratedService = (value: unknown): GeneratedServiceDescription => {
  const item = getRecord(value);
  return {
    suggestedTitle: getString(item, ['suggestedTitle', 'SuggestedTitle']),
    suggestedDescription: getString(item, ['suggestedDescription', 'SuggestedDescription']),
    provider: getString(item, ['provider', 'Provider']) || undefined,
    packages: getArray<unknown>(item, ['packages', 'Packages']).map((pkg) => {
      const record = getRecord(pkg);
      const rawFeatures = record.features ?? record.Features;
      return {
        name: getString(record, ['name', 'Name'], 'Basic'),
        title: getNullableString(record, ['title', 'Title']),
        price: getNumber(record, ['price', 'Price']),
        deliveryDays: getNumber(record, ['deliveryDays', 'DeliveryDays']),
        description: getString(record, ['description', 'Description']),
        features: Array.isArray(rawFeatures) ? rawFeatures.filter((feature): feature is string => typeof feature === 'string') : [],
      };
    }),
    faqs: getArray<unknown>(item, ['faqs', 'Faqs']).map((faq) => {
      const record = getRecord(faq);
      return {
        question: getString(record, ['question', 'Question']),
        answer: getString(record, ['answer', 'Answer']),
      };
    }),
  };
};

export const servicesFeatureApi = {
  getServices: async (params: ServiceCatalogParams = {}): Promise<PaginatedResponse<ServiceListing>> => {
    const cleanParams: ServiceCatalogParams = {};
    if (params.PageIndex) cleanParams.PageIndex = params.PageIndex;
    if (params.PageSize) cleanParams.PageSize = params.PageSize;
    if (params.SearchTerm?.trim()) cleanParams.SearchTerm = params.SearchTerm.trim();

    const response = await apiClient.get(API_ENDPOINTS.SERVICES.BASE, {
      params: Object.keys(cleanParams).length > 0 ? cleanParams : undefined,
    });
    const normalized = normalizePaginatedResponse<unknown>(response);
    return {
      ...normalized,
      data: (normalized.data ?? []).map(normalizeService),
    };
  },

  getMyServices: async (): Promise<BaseResponse<ServiceListing[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.MINE);
    const normalized = normalizeBaseResponse<unknown[]>(response);
    return {
      ...normalized,
      data: Array.isArray(normalized.data) ? normalized.data.map(normalizeService) : [],
    };
  },

  getServiceById: async (id: string): Promise<BaseResponse<ServiceListing>> => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.ID(id));
    const normalized = normalizeBaseResponse<unknown>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeService(normalized.data) : null,
    };
  },

  createService: async (payload: CreateServicePayload): Promise<BaseResponse<ServiceListing>> => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.BASE, payload);
    const normalized = normalizeBaseResponse<unknown>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeService(normalized.data) : null,
    };
  },

  updateService: async (id: string, payload: UpdateServicePayload): Promise<BaseResponse<ServiceListing>> => {
    const response = await apiClient.put(API_ENDPOINTS.SERVICES.ID(id), payload);
    const normalized = normalizeBaseResponse<unknown>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeService(normalized.data) : null,
    };
  },

  publishService: async (id: string): Promise<BaseResponse<ServiceListing>> => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.PUBLISH(id));
    const normalized = normalizeBaseResponse<unknown>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeService(normalized.data) : null,
    };
  },

  unpublishService: async (id: string): Promise<BaseResponse<ServiceListing>> => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.UNPUBLISH(id));
    const normalized = normalizeBaseResponse<unknown>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeService(normalized.data) : null,
    };
  },

  createServiceRequest: async (serviceId: string, payload: CreateServiceRequestPayload): Promise<BaseResponse<ServiceRequest>> => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.REQUESTS(serviceId), payload);
    const normalized = normalizeBaseResponse<unknown>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeRequest(normalized.data) : null,
    };
  },

  getServiceRequestsForExpert: async (status?: string): Promise<BaseResponse<ServiceRequest[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.EXPERT_REQUESTS, { params: status && status !== 'all' ? { status } : undefined });
    const normalized = normalizeBaseResponse<unknown[]>(response);
    return {
      ...normalized,
      data: Array.isArray(normalized.data) ? normalized.data.map(normalizeRequest) : [],
    };
  },

  getClientServiceRequests: async (params: ClientServiceRequestParams = {}): Promise<PaginatedResponse<ServiceRequest>> => {
    const cleanParams: ClientServiceRequestParams = {};
    if (params.PageIndex) cleanParams.PageIndex = params.PageIndex;
    if (params.PageSize) cleanParams.PageSize = params.PageSize;
    if (params.SearchTerm?.trim()) cleanParams.SearchTerm = params.SearchTerm.trim();
    if (params.status && params.status !== 'all') cleanParams.status = params.status;

    const response = await apiClient.get(API_ENDPOINTS.SERVICES.CLIENT_REQUESTS, {
      params: Object.keys(cleanParams).length > 0 ? cleanParams : undefined,
    });
    const normalized = normalizePaginatedResponse<unknown>(response);
    return {
      ...normalized,
      data: (normalized.data ?? []).map(normalizeRequest),
    };
  },

  getServiceRequestsByService: async (serviceId: string): Promise<BaseResponse<ServiceRequest[]>> => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.REQUESTS(serviceId));
    const normalized = normalizeBaseResponse<unknown[]>(response);
    return {
      ...normalized,
      data: Array.isArray(normalized.data) ? normalized.data.map(normalizeRequest) : [],
    };
  },

  acceptServiceRequest: async (requestId: string): Promise<BaseResponse<ServiceRequest>> => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.ACCEPT_REQUEST(requestId));
    const normalized = normalizeBaseResponse<unknown>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeRequest(normalized.data) : null,
    };
  },

  declineServiceRequest: async (requestId: string): Promise<BaseResponse<ServiceRequest>> => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.DECLINE_REQUEST(requestId));
    const normalized = normalizeBaseResponse<unknown>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeRequest(normalized.data) : null,
    };
  },

  createServiceOffer: async (requestId: string, payload: CreateServiceOfferPayload): Promise<BaseResponse<ServiceOffer>> => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.OFFERS(requestId), payload);
    const normalized = normalizeBaseResponse<unknown>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeOffer(normalized.data) : null,
    };
  },

  getServiceOfferForRequest: async (requestId: string): Promise<BaseResponse<ServiceOffer>> => {
    const response = await apiClient.get(API_ENDPOINTS.SERVICES.OFFER(requestId));
    const normalized = normalizeBaseResponse<unknown>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeOffer(normalized.data) : null,
    };
  },

  acceptServiceOffer: async (offerId: string): Promise<BaseResponse<AcceptServiceOfferResult>> => {
    const response = await apiClient.post(API_ENDPOINTS.SERVICES.ACCEPT_OFFER(offerId));
    const normalized = normalizeBaseResponse<unknown>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeAcceptOfferResult(normalized.data) : null,
    };
  },

  generateServiceDescription: async (payload: {
    rawInput: string;
    skills: string[];
    priceFrom: number;
    deliveryDays: number;
    tone?: string;
    targetClient?: string;
    language?: string;
  }): Promise<BaseResponse<GeneratedServiceDescription>> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.SERVICE_GENERATOR, payload);
    const normalized = normalizeBaseResponse<unknown>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeGeneratedService(normalized.data) : null,
    };
  },
};
