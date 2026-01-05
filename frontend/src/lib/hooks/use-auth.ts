import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi, type AuthResponse } from '@/lib/api/auth.api';
import { apiClient } from '@/lib/api/client';
import type { LoginInput, SignupInput } from '@/lib/auth/schema';

export const useSignup = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignupInput) => authApi.signup(data),
    onSuccess: (response: AuthResponse) => {
      // Store token and user
      apiClient.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      queryClient.setQueryData(['user'], { user: response.user });
      // Redirect to generator as per Phase 1 requirements
      router.push('/');
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (response: AuthResponse) => {
      // Store token and user
      apiClient.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      queryClient.setQueryData(['user'], { user: response.user });
      // Redirect to generator as per Phase 1 requirements
      router.push('/dashboard');
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    queryClient.clear();
    router.push('/login');
  };

  return logout;
};

