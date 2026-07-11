import { api } from './client';

export interface Product {
  id: string;
  userId: string;
  name: string;
  description: string;
  imageUrls: string[];
  landingPageUrl: string;
  price: string | null;
  brandKitIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductsListResponse {
  products: Product[];
}

export interface ProductResponse {
  product: Product;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  imageUrls: string[];
  landingPageUrl: string;
  price?: string;
  brandKitIds?: string[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  imageUrls?: string[];
  landingPageUrl?: string;
  price?: string | null;
  brandKitIds?: string[];
}

export const productsApi = {
  list: async (): Promise<ProductsListResponse> => {
    const response = await api.get<ProductsListResponse>('/products');
    return response.data;
  },

  create: async (data: CreateProductRequest): Promise<ProductResponse> => {
    const response = await api.post<ProductResponse>('/products', data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateProductRequest,
  ): Promise<ProductResponse> => {
    const response = await api.put<ProductResponse>(`/products/${id}`, data);
    return response.data;
  },

  uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ imageUrl: string }>(
      '/products/images',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },
};
