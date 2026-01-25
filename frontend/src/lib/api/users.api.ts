import { api } from './client';

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface UserResponse {
  user: User;
}

export interface UpdateUserRequest {
  email?: string;
}

export const usersApi = {
  getMe: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/users/me');
    return response.data;
  },

  updateMe: async (data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await api.put<UserResponse>('/users/me', data);
    return response.data;
  },
};

