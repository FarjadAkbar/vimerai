import { useQuery } from '@tanstack/react-query';
import { kitsApi } from '@/lib/api/kits.api';

export const useActiveKit = (enabled = true) => {
  return useQuery({
    queryKey: ['kits', 'active'],
    queryFn: () => kitsApi.getActive(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};
