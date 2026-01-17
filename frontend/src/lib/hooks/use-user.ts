import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users.api';
import type { UpdateUserRequest } from '@/lib/api/users.api';

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try{
        const res = await usersApi.getMe();
      return res;
      }catch(err){
        console.log(err)
        return null
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
