import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/lib/api/subscription.api';
import type {
  CreateCheckoutRequest,
  CreatePortalRequest,
} from '@/lib/api/subscription.api';

export const useCurrentSubscription = (enabled = true) => {
  return useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: () => subscriptionApi.getCurrentSubscription(),
    enabled,
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
      // Redirect to PayPal approval page
      if (data.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      }
    },
  });
};

export const useActivateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: string) =>
      subscriptionApi.activateSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionApi.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};

export const useCreatePortal = () => {
  return useMutation({
    mutationFn: (data: CreatePortalRequest) =>
      subscriptionApi.createPortal(data),
    onSuccess: (data) => {
      if (data.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      }
    },
  });
};

export const useActivateMockSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plan: 'starter' | 'creator' | 'pro') =>
      subscriptionApi.activateMockSubscription(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};

export const usePurchaseSingleShot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionApi.purchaseSingleShot(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};

export const useCreateSingleShotCheckout = () => {
  return useMutation({
    mutationFn: (data: { successUrl: string; cancelUrl: string }) =>
      subscriptionApi.createSingleShotCheckout(data),
    onSuccess: (data) => {
      if (data?.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      }
    },
  });
};

export const useCaptureSingleShot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => subscriptionApi.captureSingleShot(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};
