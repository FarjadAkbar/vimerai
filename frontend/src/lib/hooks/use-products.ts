import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products.api';
import type {
  CreateProductRequest,
  ScrapeProductRequest,
  UpdateProductRequest,
} from '@/lib/api/products.api';

export const useProducts = (enabled = true) => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list(),
    enabled,
  });
};

export const useScrapeProduct = () => {
  return useMutation({
    mutationFn: (data: ScrapeProductRequest) => productsApi.scrape(data),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductRequest) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductRequest;
    }) => productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUploadProductImage = () => {
  return useMutation({
    mutationFn: (file: File) => productsApi.uploadImage(file),
  });
};
