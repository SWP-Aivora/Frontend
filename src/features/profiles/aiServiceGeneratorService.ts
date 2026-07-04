import apiClient from '@/lib/axios';
import type { BaseResponse } from '@/shared/types/api';
import { normalizeBaseResponse } from '@/lib/api-utils';

export interface ServicePackage {
  name: string;
  title: string | null;
  price: number;
  deliveryDays: number;
  description: string;
  features: string[];
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceDescriptionResult {
  suggestedTitle: string;
  suggestedDescription: string;
  packages: ServicePackage[];
  faqs: ServiceFaq[];
}

export interface GenerateServiceDescriptionRequest {
  rawInput: string;
  skills: string[];
  priceFrom: number;
  deliveryDays: number;
  tone?: string;
  targetClient?: string;
  language?: string;
}

export const aiServiceGeneratorService = {
  generateServiceDescription: async (data: GenerateServiceDescriptionRequest): Promise<BaseResponse<ServiceDescriptionResult>> => {
    const response = await apiClient.post<BaseResponse<ServiceDescriptionResult>>('/ai/service-generator', data);
    return normalizeBaseResponse<ServiceDescriptionResult>(response);
  },
};
