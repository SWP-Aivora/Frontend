export const ServiceStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;
export type ServiceStatus = (typeof ServiceStatus)[keyof typeof ServiceStatus];

export const PackageTier = {
  BASIC: 'BASIC',
  STANDARD: 'STANDARD',
  PREMIUM: 'PREMIUM',
} as const;
export type PackageTier = (typeof PackageTier)[keyof typeof PackageTier];

export const ServiceRequestStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
} as const;
export type ServiceRequestStatus = (typeof ServiceRequestStatus)[keyof typeof ServiceRequestStatus];

export const ServiceOfferStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
} as const;
export type ServiceOfferStatus = (typeof ServiceOfferStatus)[keyof typeof ServiceOfferStatus];

export interface ServicePackage {
  id?: string;
  tier: PackageTier;
  title: string;
  description?: string | null;
  price: number;
  deliveryDays: number;
  features?: string | null;
}

export interface ServiceFaq {
  id?: string;
  question: string;
  answer: string;
}

export interface ExpertSummary {
  id?: string;
  fullName?: string;
  avatarUrl?: string | null;
  title?: string | null;
}

export interface ServiceListing {
  id: string;
  expertId: string;
  expertName?: string | null;
  expert?: ExpertSummary | null;
  title: string;
  description: string;
  status: ServiceStatus | string;
  attachmentUrl?: string | null;
  createdAt?: string;
  publishedAt?: string | null;
  packages: ServicePackage[];
  faqs: ServiceFaq[];
}

export interface CreateServicePayload {
  title: string;
  description: string;
  attachmentUrl?: string | null;
  packages: ServicePackagePayload[];
  faqs: ServiceFaqPayload[];
}

export interface UpdateServicePayload {
  title?: string | null;
  description?: string | null;
  attachmentUrl?: string | null;
  packages?: ServicePackagePayload[] | null;
  faqs?: ServiceFaqPayload[] | null;
}

export interface ServicePackagePayload {
  tier: PackageTier;
  title: string;
  description?: string | null;
  price: number;
  deliveryDays: number;
  features?: string | null;
}

export interface ServiceFaqPayload {
  question: string;
  answer: string;
}

export interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceTitle?: string | null;
  expertId: string;
  clientId: string;
  clientName?: string | null;
  packageId: string;
  packageTitle: string;
  packagePrice: number;
  packageDeliveryDays: number;
  note?: string | null;
  status: ServiceRequestStatus | string;
  createdAt?: string;
}

export interface CreateServiceRequestPayload {
  packageId: string;
  note?: string | null;
}

export interface ServiceOfferMilestone {
  id?: string;
  title: string;
  description?: string | null;
  amount: number;
  dueDays: number;
  acceptanceCriteria?: string | null;
  orderIndex: number;
}

export interface CreateServiceOfferPayload {
  amount: number;
  milestones: ServiceOfferMilestone[];
}

export interface ServiceOffer {
  id: string;
  serviceRequestId: string;
  expertId: string;
  amount: number;
  status: ServiceOfferStatus | string;
  createdAt?: string;
  milestones: ServiceOfferMilestone[];
}

export interface AcceptServiceOfferResult {
  projectId?: string;
  serviceOfferId?: string;
  status?: string;
}

export interface GenerateServiceDescriptionPayload {
  rawInput: string;
  skills: string[];
  priceFrom: number;
  deliveryDays: number;
  tone?: string;
  targetClient?: string;
  language?: string;
}

export interface GeneratedServiceDescription {
  suggestedTitle: string;
  suggestedDescription: string;
  packages: Array<{
    name: string;
    title?: string | null;
    price: number;
    deliveryDays: number;
    description: string;
    features: string[];
  }>;
  faqs: ServiceFaqPayload[];
  provider?: string;
}

