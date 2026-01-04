import { api } from './client';

export type SubscriptionPlan = 'starter' | 'creator' | 'pro';

export interface CurrentSubscriptionResponse {
  plan: SubscriptionPlan;
  videosRemaining: number;
  limit: number;
}

export interface UsageResponse {
  videosUsed: number;
  videosRemaining: number;
  limit: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  videosPerMonth: number;
  popular?: boolean;
}

export interface PlansResponse {
  plans: Plan[];
}

export interface CreateCheckoutRequest {
  plan: SubscriptionPlan;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutResponse {
  sessionId: string;
  url: string;
}

export interface CreatePortalRequest {
  returnUrl: string;
}

export interface CreatePortalResponse {
  url: string;
}

export const subscriptionApi = {
  getCurrentSubscription: async (): Promise<CurrentSubscriptionResponse> => {
    const response = await api.get<CurrentSubscriptionResponse>(
      '/subscription/current',
    );
    return response.data;
  },

  getUsage: async (): Promise<UsageResponse> => {
    const response = await api.get<UsageResponse>('/subscription/usage');
    return response.data;
  },

  getPlans: async (): Promise<PlansResponse> => {
    const response = await api.get<PlansResponse>('/subscription/plans');
    return response.data;
  },

  createCheckout: async (
    data: CreateCheckoutRequest,
  ): Promise<CreateCheckoutResponse> => {
    const response = await api.post<CreateCheckoutResponse>(
      '/subscription/checkout',
      data,
    );
    return response.data;
  },

  createPortal: async (
    data: CreatePortalRequest,
  ): Promise<CreatePortalResponse> => {
    const response = await api.post<CreatePortalResponse>(
      '/subscription/portal',
      data,
    );
    return response.data;
  },
};

