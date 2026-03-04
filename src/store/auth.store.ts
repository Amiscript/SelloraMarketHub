// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'sub-admin' | 'client';
  isVerified: boolean;
  isActive: boolean;
  profileImage?: string;
  storeName?: string;
  storeSlug?: string;
  logo?: string;
  banner?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  storeStatus?: 'pending' | 'active' | 'suspended';
  phone?: string;
  dateOfBirth?: string;
  residentialAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  currentLocation?: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    accountType: string;
  };
  grantor?: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address?: string;
    occupation?: string;
  };
  idCardFront?: string;
  idCardBack?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterClientData {
  // Personal Information
  name: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  residentialAddress: string;
  city: string;
  state: string;
  country: string;
  currentLocation: string;
  
  // Bank Details (optional)
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    accountType: string;
  };
  
  // Grantor Information (optional)
  grantor?: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address?: string;
    occupation?: string;
  };
  
  // Store Information (optional)
  storeName?: string;
  storeDescription?: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface RegisterResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  message?: string;
  storeSlug?: string;
  storeUrl?: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  storeActive?: boolean;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface GetMeResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}

export interface ApiErrorResponse {
  success: boolean;
  error: string;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
    value?: number | string ;
  }>;
}

export interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  validationErrors: Array<{ field: string; message: string }> | null;
  storeUrl: string | null;

  // Actions
  login: (credentials: LoginCredentials, role?: 'admin' | 'client') => Promise<void>;
  registerClient: (data: RegisterClientData, files?: Record<string, File>) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (data: Partial<User>, files?: Record<string, File>) => Promise<void>;
  clearError: () => void;
  clearValidationErrors: () => void;
  setAuthFromStorage: () => void;
}

// JWT Payload type
interface JwtPayload {
  id: string;
  role: string;
  exp: number;
  iat: number;
}

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://sellora-backend.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // Clear auth state on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/client/login';
    }
    return Promise.reject(error);
  }
);

// Create store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      validationErrors: null,
      storeUrl: null,

      // Set auth from storage (called on app initialization)
      setAuthFromStorage: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr) as User;
            set({
              token,
              user,
              isAuthenticated: true,
              storeUrl: user.storeSlug 
                ? `${import.meta.env.VITE_CLIENT_URL || 'https://sellora-backend.onrender.com'}/store/${user.storeSlug}`
                : null,
            });
          } catch (error) {
            console.error('Failed to parse user from storage');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      },

      // Login
      login: async (credentials: LoginCredentials, role: 'admin' | 'client' = 'client') => {
        set({ isLoading: true, error: null, validationErrors: null });
        
        try {
          const response = await api.post<LoginResponse>('/auth/login', credentials);
          
          if (response.data.success && response.data.token && response.data.user) {
            const { token, user } = response.data;
            
            // Validate role
            if (role === 'admin' && user.role !== 'admin') {
              throw new Error('Invalid admin credentials');
            }
            
            if (role === 'client' && user.role !== 'client') {
              throw new Error('Invalid client credentials');
            }
            
            // Store in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Update state
            set({
              token,
              user,
              isAuthenticated: true,
              isLoading: false,
              storeUrl: user.storeSlug 
                ? `${import.meta.env.VITE_CLIENT_URL || 'https://sellora-backend.onrender.com'}/store/${user.storeSlug}`
                : null,
            });
          } else {
            throw new Error(response.data.error || 'Login failed');
          }
        } catch (error: unknown) {
          let errorMessage = 'Login failed';
          let validationErrors = null;
          
          if (error instanceof AxiosError && error.response?.data) {
            const data = error.response.data;
            errorMessage = data.error || errorMessage;
            
            // Handle validation errors array
            if (data.errors && Array.isArray(data.errors)) {
              validationErrors = data.errors.map(err => ({
                field: err.field,
                message: err.message
              }));
            }
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          set({ 
            error: errorMessage, 
            validationErrors,
            isLoading: false 
          });
          throw new Error(errorMessage);
        }
      },

      // Register Client
      registerClient: async (data: RegisterClientData, files?: Record<string, File>) => {
        set({ isLoading: true, error: null, validationErrors: null });
        
        try {
          const formData = new FormData();
          
          // Append all text fields
          (Object.keys(data) as Array<keyof RegisterClientData>).forEach((key) => {
            const value = data[key];
            if (value !== undefined && value !== null) {
              if ((key === 'bankDetails' || key === 'grantor') && value && typeof value === 'object') {
                formData.append(key, JSON.stringify(value));
              } else {
                formData.append(key, String(value));
              }
            }
          });

          // Append files if provided (matching the field names expected by the backend)
          if (files) {
            Object.entries(files).forEach(([fieldName, file]) => {
              formData.append(fieldName, file);
            });
          }

          const response = await api.post<RegisterResponse>('/auth/register/client', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data.success && response.data.token && response.data.user) {
            const { token, user, storeUrl } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            set({
              token,
              user,
              isAuthenticated: true,
              isLoading: false,
              storeUrl: storeUrl || (user.storeSlug 
                ? `${import.meta.env.VITE_CLIENT_URL || 'https://sellora-backend.onrender.com'}/store/${user.storeSlug}`
                : null),
            });

            return response.data;
          } else {
            throw new Error(response.data.error || 'Registration failed');
          }
        } catch (error: unknown) {
          let errorMessage = 'Registration failed';
          let validationErrors = null;
          
          if (error instanceof AxiosError && error.response?.data) {
            const data = error.response.data;
            errorMessage = data.error || errorMessage;
            
            // Handle validation errors array
            if (data.errors && Array.isArray(data.errors)) {
              validationErrors = data.errors.map(err => ({
                field: err.field,
                message: err.message
              }));
            }
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          set({ 
            error: errorMessage, 
            validationErrors,
            isLoading: false 
          });
          throw new Error(errorMessage);
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await api.post('/auth/logout');
        } catch (error: unknown) {
          console.error('Logout error:', error);
        } finally {
          // Always clear local state
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            validationErrors: null,
            storeUrl: null,
          });
        }
      },

      // Verify Email
      verifyEmail: async (token: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get<VerifyEmailResponse>(`/auth/verify-email/${token}`);
          
          if (response.data.success) {
            // Update user verification status in state if logged in
            const currentUser = get().user;
            if (currentUser) {
              const updatedUser = { ...currentUser, isVerified: true };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              set({ user: updatedUser });
            }
            
            set({ isLoading: false });
            return true;
          } else {
            throw new Error(response.data.error || 'Verification failed');
          }
        } catch (error: unknown) {
          let errorMessage = 'Verification failed';
          
          if (error instanceof AxiosError && error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      // Forgot Password
      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
          
          if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to send reset email');
          }
          
          set({ isLoading: false });
        } catch (error: unknown) {
          let errorMessage = 'Failed to send reset email';
          
          if (error instanceof AxiosError && error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      // Reset Password
      resetPassword: async (token: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post<ResetPasswordResponse>(`/auth/reset-password/${token}`, { password });
          
          if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to reset password');
          }
          
          set({ isLoading: false });
        } catch (error: unknown) {
          let errorMessage = 'Failed to reset password';
          
          if (error instanceof AxiosError && error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      // Get Current User
      getCurrentUser: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get<GetMeResponse>('/auth/me');
          
          if (response.data.success && response.data.user) {
            const user = response.data.user;
            localStorage.setItem('user', JSON.stringify(user));
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              storeUrl: user.storeSlug 
                ? `${import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'}/store/${user.storeSlug}`
                : null,
            });
          } else {
            throw new Error('Failed to get user data');
          }
        } catch (error: unknown) {
          let errorMessage = 'Failed to get user data';
          
          if (error instanceof AxiosError && error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          // Clear auth if token is invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: errorMessage,
            validationErrors: null,
            storeUrl: null,
          });
        }
      },

      // Update Profile - using PATCH /auth/update-profile
      updateProfile: async (data: Partial<User>, files?: Record<string, File>) => {
        set({ isLoading: true, error: null, validationErrors: null });
        
        try {
          const formData = new FormData();
          
          // Append text fields
          (Object.keys(data) as Array<keyof User>).forEach((key) => {
            const value = data[key];
            if (value !== undefined && value !== null) {
              if ((key === 'bankDetails' || key === 'grantor') && typeof value === 'object') {
                formData.append(key, JSON.stringify(value));
              } else {
                formData.append(key, String(value));
              }
            }
          });

          // Append files if provided
          if (files) {
            Object.entries(files).forEach(([fieldName, file]) => {
              formData.append(fieldName, file);
            });
          }

          const response = await api.patch<UpdateProfileResponse>('/auth/update-profile', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data.success && response.data.user) {
            const updatedUser = response.data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            set({
              user: updatedUser,
              isLoading: false,
              storeUrl: updatedUser.storeSlug 
                ? `${import.meta.env.VITE_CLIENT_URL || 'https://sellora-backend.onrender.com'}/store/${updatedUser.storeSlug}`
                : null,
            });
          } else {
            throw new Error(response.data.error || 'Profile update failed');
          }
        } catch (error: unknown) {
          let errorMessage = 'Profile update failed';
          let validationErrors = null;
          
          if (error instanceof AxiosError && error.response?.data) {
            const data = error.response.data;
            errorMessage = data.error || errorMessage;
            
            if (data.errors && Array.isArray(data.errors)) {
              validationErrors = data.errors.map(err => ({
                field: err.field,
                message: err.message
              }));
            }
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          set({ 
            error: errorMessage, 
            validationErrors,
            isLoading: false 
          });
          throw new Error(errorMessage);
        }
      },

      // Clear Error
      clearError: () => set({ error: null }),
      
      // Clear Validation Errors
      clearValidationErrors: () => set({ validationErrors: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        storeUrl: state.storeUrl,
      }),
    }
  )
);