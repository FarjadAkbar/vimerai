import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { brandKitsApi } from '@/lib/api/brand-kits.api';
import type {
  CreateBrandKitRequest,
  UpdateBrandKitRequest,
} from '@/lib/api/brand-kits.api';

export const useBrandKits = (enabled = true) => {
  return useQuery({
    queryKey: ['brand-kits'],
    queryFn: () => brandKitsApi.list(),
    enabled,
  });
};

export const useCreateBrandKit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBrandKitRequest) => brandKitsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-kits'] });
    },
  });
};

export const useUpdateBrandKit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBrandKitRequest;
    }) => brandKitsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-kits'] });
    },
  });
};

export const useUploadBrandKitLogo = () => {
  return useMutation({
    mutationFn: (file: File) => brandKitsApi.uploadLogo(file),
  });
};
