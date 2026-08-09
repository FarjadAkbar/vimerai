import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi, type AuthResponse } from '@/lib/api/auth.api';
import { apiClient } from '@/lib/api/client';
import type { LoginInput, SignupInput } from '@/lib/auth/schema';
import { PRODUCT_PATH } from '@/lib/product-path';

export const useSignup = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignupInput) => authApi.signup(data),
    onSuccess: (response: AuthResponse) => {
      // Store token and user (default to rememberMe: true for signup)
      apiClient.setToken(response.token, true);
      // Store user in localStorage for persistent sessions (signup defaults to rememberMe)
      localStorage.setItem('user', JSON.stringify(response.user));
      queryClient.setQueryData(['user'], { user: response.user });
      // Primary create path is Brand Studio (Fetra MVP / ticket 05)
      router.push(PRODUCT_PATH.studio);
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (response: AuthResponse, variables: LoginInput) => {
      // Store token and user based on rememberMe preference
      const rememberMe = variables.rememberMe ?? false;
      apiClient.setToken(response.token, rememberMe);
      
      // Store user in the same storage as token for consistency
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(response.user));
        // Clear sessionStorage user if switching to localStorage
        sessionStorage.removeItem('user');
      } else {
        sessionStorage.setItem('user', JSON.stringify(response.user));
        // Clear any existing localStorage user when using sessionStorage
        localStorage.removeItem('user');
      }
      
      // Update React Query cache
      queryClient.setQueryData(['user'], { user: response.user });
      // Primary create path is Brand Studio (Fetra MVP / ticket 05)
      router.push(PRODUCT_PATH.studio);
    },
  });
};

export const usePasswordResetRequest = () => {
  return useMutation({
    mutationFn: (email: string) =>
      authApi.requestPasswordReset({ email }),
  });
};

export const usePasswordReset = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authApi.resetPassword(data),
    onSuccess: () => {
      router.push('/login');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const logout = () => {
    // Clear both localStorage and sessionStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Redirect to login
    router.push('/');
    // Cancel any ongoing queries to prevent refetches
    queryClient.cancelQueries();
    
    // Set user query to null to trigger immediate re-render
    // This will make userData?.user falsy in the header
    queryClient.setQueryData(['user'], null);
    
    // Clear all cached data
    queryClient.clear();
    
  };

  return logout;
};

