import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users.api';
import type { UpdateUserRequest } from '@/lib/api/users.api';

export const useUser = () => {
  // Check if token exists to determine if query should be enabled
  const hasToken =
    typeof window !== 'undefined' &&
    !!(localStorage.getItem('token') || sessionStorage.getItem('token'));

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await usersApi.getMe();
        // Update stored user data on successful API call
        if (typeof window !== 'undefined' && response.user) {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          if (localStorage.getItem('token')) {
            localStorage.setItem('user', JSON.stringify(response.user));
          } else if (sessionStorage.getItem('token')) {
            sessionStorage.setItem('user', JSON.stringify(response.user));
          }
        }
        return response;
      } catch (error) {
        // If API call fails, try to get from localStorage or sessionStorage
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          let userData = null;
          
          // Check the same storage as token
          if (localStorage.getItem('token')) {
            userData = localStorage.getItem('user');
          } else if (sessionStorage.getItem('token')) {
            userData = sessionStorage.getItem('user');
          }
          
          if (userData) {
            try {
              const user = JSON.parse(userData);
              return { user };
            } catch {
              // If parsing fails, clear invalid data
              if (localStorage.getItem('token')) {
                localStorage.removeItem('user');
              } else {
                sessionStorage.removeItem('user');
              }
              throw error;
            }
          }
        }
        throw error;
      }
    },
    enabled: hasToken, // Only fetch if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on error to avoid redirect loops
    initialData: () => {
      // Try to get from localStorage or sessionStorage for initial render
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        let userData = null;
        
        // Check the same storage as token
        if (localStorage.getItem('token')) {
          userData = localStorage.getItem('user');
        } else if (sessionStorage.getItem('token')) {
          userData = sessionStorage.getItem('user');
        }
        
        if (userData) {
          try {
            const user = JSON.parse(userData);
            return { user };
          } catch {
            return undefined;
          }
        }
      }
      return undefined;
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => usersApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

