import { useQuery, useMutation } from '@tanstack/react-query';
import { subscriptionApi } from '@/lib/api/subscription.api';
import type {
  CreateCheckoutRequest,
  CreatePortalRequest,
} from '@/lib/api/subscription.api';

export const useCurrentSubscription = () => {
  return useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: () => subscriptionApi.getCurrentSubscription(),
  });
};

export const useUsage = () => {
  return useQuery({
    queryKey: ['subscription', 'usage'],
    queryFn: () => subscriptionApi.getUsage(),
  });
};

export const usePlans = () => {
  return useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: () => subscriptionApi.getPlans(),
  });
};

export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: (data: CreateCheckoutRequest) =>
      subscriptionApi.createCheckout(data),
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      }
    },
  });
};

export const useCreatePortal = () => {
  return useMutation({
    mutationFn: (data: CreatePortalRequest) =>
      subscriptionApi.createPortal(data),
    onSuccess: (data) => {
      // Redirect to Stripe portal
      if (data.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      }
    },
  });
};

