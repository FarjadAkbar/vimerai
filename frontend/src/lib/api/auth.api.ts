import { api } from './client';
import type { LoginInput, SignupInput } from '@/lib/auth/schema';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export interface PasswordResetRequestInput {
  email: string;
}

export interface PasswordResetInput {
  token: string;
  newPassword: string;
}

export const authApi = {
  signup: async (data: SignupInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signup', {
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  requestPasswordReset: async (
    data: PasswordResetRequestInput,
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      '/auth/password-reset/request',
      data,
    );
    return response.data;
  },

  resetPassword: async (
    data: PasswordResetInput,
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      '/auth/password-reset',
      data,
    );
    return response.data;
  },
};

