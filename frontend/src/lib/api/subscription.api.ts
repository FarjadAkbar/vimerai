import { api } from './client';

export type SubscriptionPlan = 'free' | 'starter' | 'creator' | 'pro';
export type BillingPeriod = 'monthly' | 'yearly';

export interface CurrentSubscriptionResponse {
  plan: SubscriptionPlan;
  /** When user has a recurring plan: 'monthly' | 'yearly'. Null for free or legacy subscriptions. */
  billingPeriod: 'monthly' | 'yearly' | null;
  videosRemaining: number;
  limit: number;
  singleShotCredits: number;
}

export interface UsageResponse {
  videosUsed: number;
  videosRemaining: number;
  limit: number;
  singleShotCredits: number;
}

export interface CreateCheckoutRequest {
  plan: SubscriptionPlan;
  billingPeriod: BillingPeriod;
  successUrl: string;
  cancelUrl: string;
}

export type PricingRegion = 'global' | 'mea';

export interface PricingRegionResponse {
  region: PricingRegion;
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

  createCheckout: async (
    data: CreateCheckoutRequest,
  ): Promise<CreateCheckoutResponse> => {
    const response = await api.post<CreateCheckoutResponse>(
      '/subscription/checkout',
      data,
    );
    return response.data;
  },

  getPricingRegion: async (): Promise<PricingRegionResponse> => {
const MEA_COUNTRY_CODES = new Set<string>([
  'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM', 'CG', 'CD',
  'DJ', 'EG', 'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'CI', 'KE',
  'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG',
  'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'TZ', 'TG', 'TN', 'UG',
  'ZM', 'ZW',
  // Middle East
  'BH', 'CY', 'IR', 'IQ', 'IL', 'JO', 'KW', 'LB', 'OM', 'PS', 'QA', 'SA', 'SY',
  'TR', 'AE', 'YE',
]);
        const res = await fetch(`https://ipapi.co/json`);
        const data = await res.json();
        console.log(data)
        const country =  data.countryCode ?? null;

  
  if (!country) return { region: 'global'} ;
    
  const region = MEA_COUNTRY_CODES.has(country.toUpperCase()) ? 'mea' : 'global';
  return { region };

  },

  activateSubscription: async (
    subscriptionId: string,
  ): Promise<{ plan: SubscriptionPlan } | null> => {
    const response = await api.post<{ plan: SubscriptionPlan } | null>(
      '/subscription/activate-subscription',
      { subscriptionId },
    );
    return response.data;
  },

  cancelSubscription: async (): Promise<{ cancelled: boolean }> => {
    const response = await api.post<{ cancelled: boolean }>(
      '/subscription/cancel-subscription',
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

  activateMockSubscription: async (
    plan: SubscriptionPlan,
  ): Promise<{ message: string; plan: SubscriptionPlan }> => {
    const response = await api.post<{ message: string; plan: SubscriptionPlan }>(
      '/subscription/activate-mock',
      { plan },
    );
    return response.data;
  },

  purchaseSingleShot: async (): Promise<{ singleShotCredits: number }> => {
    const response = await api.post<{ singleShotCredits: number }>(
      '/subscription/purchase-single-shot',
    );
    return response.data;
  },

  createSingleShotCheckout: async (data: {
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ orderId: string; url: string }> => {
    const response = await api.post<{ orderId: string; url: string }>(
      '/subscription/checkout-single-shot',
      data,
    );
    return response.data;
  },

  captureSingleShot: async (
    orderId: string,
  ): Promise<{ singleShotCredits: number } | null> => {
    const response = await api.post<{ singleShotCredits: number } | null>(
      '/subscription/capture-single-shot',
      { orderId },
    );
    return response.data;
  },
};
