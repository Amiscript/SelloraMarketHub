import { create } from 'zustand';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

export interface ProductImage {
  url: string;
  public_id: string;
  order?: number;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
category: 'Electronics' | 'Bundles' | 'Software' | 'Hardware' | 'Accessories' | 'Services' | 
  'Clothing & Apparel' | 'Footwear' | 'Books & Stationery' | 'Furniture' | 
  'Perfume & Fragrance' | 'Toys & Games' | 'Sports & Outdoors' | 'Beauty & Personal Care' | 
  'Food & Beverage' | 'Medical' | 'Automotive' | 'Pet Supplies' | 
  'Industrial & Tools' | 'Jewelry & Watches' | 'Home & Kitchen' | 'Gift Cards' | 
  'Parts & Components' | 'Tools' | 'Safety Equipment' | 'Lighting' | 
  'Audio & Video' | 'Networking' | 'Storage' | 'Fashion' | 'Baby & Kids' | 
  'Grocery' | 'Mobile Devices' | 'Wearables' | 'Smart Home' | 'Gaming' | 
  'Travel & Luggage' | 'Art & Collectibles' | 'Music & Instruments' | 
  'Printing & Publishing' | 'Real Estate' | 'Financial Services' | 'Health & Wellness' | 
  'Education & Learning' | 'Events & Experiences' | 'Secondhand/Refurbished' | 'Other';
  price: number;
  stock: number;
  images: ProductImage[];
  status: 'active' | 'out_of_stock' | 'draft';
  commissionRate: number;
  minCommissionRate?: number;
  client?: string | null;
  slug?: string;
  ratings?: { average: number; count: number };
  enlistedAt?: string;
  createdAt: string;
  updatedAt: string;
  originalPrice: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  draftProducts: number;
  categoryStats: Array<{ _id: string; count: number }>;
}

export interface Review {
  _id?: string;
  name: string;
  rating: number;
  comment: string;
  verified?: boolean;
  createdAt: string;
}

interface ProductState {
  catalog: Product[];
  catalogTotal: number;
  catalogTotalPages: number;
  catalogPage: number;
  myProducts: Product[];
  myTotal: number;
  allProducts: Product[];
  allTotal: number;
  allTotalPages: number;
  stats: ProductStats | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchCatalog: (filters?: ProductFilters) => Promise<void>;
  fetchMyProducts: () => Promise<void>;
  enlistProduct: (productId: string, commissionRate: number) => Promise<void>;
  delistProduct: (productId: string) => Promise<void>;
  fetchAllProducts: (filters?: ProductFilters) => Promise<void>;
  createProduct: (data: Partial<Product>, images?: File[]) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Product>, images?: File[]) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  fetchProductStats: () => Promise<void>;
  submitReview: (productId: string, data: { rating: number; comment: string; name: string }) => Promise<void>;
  fetchReviews: (productId: string, page?: number) => Promise<{ reviews: Review[]; total: number; ratings: any }>;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  catalog: [],
  catalogTotal: 0,
  catalogTotalPages: 0,
  catalogPage: 1,
  myProducts: [],
  myTotal: 0,
  allProducts: [],
  allTotal: 0,
  allTotalPages: 0,
  stats: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchCatalog: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== 'all') params.append(k, String(v));
      });
      const res = await api.get(`/api/v1/products?${params}`);
      set({
        catalog: res.data.products || [],
        catalogTotal: res.data.total || 0,
        catalogTotalPages: res.data.totalPages || 0,
        catalogPage: res.data.currentPage || 1,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load catalog' : 'Failed to load catalog';
      set({ error: msg, isLoading: false });
    }
  },

  fetchMyProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/products/enlisted/me');
      set({
        myProducts: res.data.products || [],
        myTotal: res.data.total || 0,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load your products' : 'Failed to load your products';
      set({ error: msg, isLoading: false });
    }
  },

  enlistProduct: async (productId, commissionRate) => {
    set({ isSubmitting: true, error: null });
    try {
      await api.post(`/api/v1/products/${productId}/enlist`, { commissionRate });
      await get().fetchMyProducts();
      set({ isSubmitting: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to enlist product' : 'Failed to enlist product';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  delistProduct: async (productId) => {
    set({ isSubmitting: true, error: null });
    try {
      await api.delete(`/api/v1/products/${productId}/enlist`);
      set((state) => ({
        myProducts: state.myProducts.filter(p => p._id !== productId),
        myTotal: state.myTotal - 1,
        isSubmitting: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to remove product' : 'Failed to remove product';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  fetchAllProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      const res = await api.get(`/api/v1/products/admin/all?${params}`);
      set({
        allProducts: res.data.products || [],
        allTotal: res.data.total || 0,
        allTotalPages: res.data.totalPages || 0,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load products' : 'Failed to load products';
      set({ error: msg, isLoading: false });
    }
  },

  createProduct: async (data, images) => {
    set({ isSubmitting: true, error: null });
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, String(v));
      });
      if (images) images.forEach(img => formData.append('images', img));
      const res = await api.post('/api/v1/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newProduct: Product = res.data.product;
      set(state => ({
        catalog: [newProduct, ...state.catalog],
        catalogTotal: state.catalogTotal + 1,
        allProducts: [newProduct, ...state.allProducts],
        isSubmitting: false,
      }));
      return newProduct;
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to create product' : 'Failed to create product';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  updateProduct: async (id, data, images) => {
    set({ isSubmitting: true, error: null });
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, String(v));
      });
      if (images) images.forEach(img => formData.append('images', img));
      const res = await api.put(`/api/v1/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updated: Product = res.data.product;
      set(state => ({
        catalog: state.catalog.map(p => p._id === id ? updated : p),
        allProducts: state.allProducts.map(p => p._id === id ? updated : p),
        isSubmitting: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to update product' : 'Failed to update product';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  deleteProduct: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await api.delete(`/api/v1/products/${id}`);
      set(state => ({
        catalog: state.catalog.filter(p => p._id !== id),
        allProducts: state.allProducts.filter(p => p._id !== id),
        catalogTotal: state.catalogTotal - 1,
        isSubmitting: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to delete product' : 'Failed to delete product';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  fetchProductStats: async () => {
    try {
      const res = await api.get('/api/v1/products/stats');
      set({ stats: res.data.stats });
    } catch { /* optional */ }
  },

  submitReview: async (productId, data) => {
  set({ isSubmitting: true, error: null });
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Make sure the api instance includes the token
    const response = await api.post(`/api/v1/products/${productId}/reviews`, data, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Review submission response:', response.data);
    
    set({ isSubmitting: false });
    return response.data;
  } catch (err: any) {
    console.error('Review submission error:', err.response?.data || err.message);
    const msg = err instanceof AxiosError 
      ? err.response?.data?.error || err.response?.data?.message || 'Failed to submit review' 
      : 'Failed to submit review';
    set({ error: msg, isSubmitting: false });
    throw new Error(msg);
  }
},

  fetchReviews: async (productId, page = 1) => {
    try {
      const res = await api.get(`/api/v1/products/${productId}/reviews?page=${page}&limit=10`);
      return {
        reviews: res.data.reviews || [],
        total: res.data.total || 0,
        ratings: res.data.ratings || null,
      };
    } catch {
      return { reviews: [], total: 0, ratings: null };
    }
  },

  clearError: () => set({ error: null }),
}));