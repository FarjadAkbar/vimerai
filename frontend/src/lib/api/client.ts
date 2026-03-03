import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from './config';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    const publicRoutes = ['/auth/login', '/auth/signup', '/auth/password-reset'];

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        const isPublic = publicRoutes.some((route) =>
          config.url?.includes(route)
        );
    
        if (!token && !isPublic) {
          return Promise.reject(
            new AxiosError('No authentication token found', 'NO_TOKEN', config)
          );
        }

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token
          this.clearToken();
          // Only redirect to login if not on the root page (generator)
          // Root page allows unauthenticated access per Phase 1 requirements
          // if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          //   window.location.href = '/login';
          // }
        }
        return Promise.reject(error);
      },
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    // Check localStorage first (remember me), then sessionStorage
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  }

  setToken(token: string, rememberMe: boolean = false): void {
    if (typeof window !== 'undefined') {
      if (rememberMe) {
        // Store in localStorage for persistent sessions
        localStorage.setItem('token', token);
      } else {
        // Store in sessionStorage for temporary sessions
        sessionStorage.setItem('token', token);
        // Clear any existing localStorage token
        localStorage.removeItem('token');
      }
    }
  }

  getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export const api = apiClient.getInstance();

