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
  ratings?: { 
    average: number; 
    count: number; 
    distribution?: { 1: number; 2: number; 3: number; 4: number; 5: number };
  };
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
  userType?: string;
  user?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  totalPages: number;
  currentPage: number;
  ratings: {
    average: number;
    count: number;
    distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  };
}

interface ProductState {
  // State
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
  
  // Product CRUD
  fetchCatalog: (filters?: ProductFilters) => Promise<void>;
  fetchMyProducts: () => Promise<void>;
  enlistProduct: (productId: string, commissionRate: number) => Promise<void>;
  delistProduct: (productId: string) => Promise<void>;
  fetchAllProducts: (filters?: ProductFilters) => Promise<void>;
  createProduct: (data: Partial<Product>, images?: File[]) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Product>, images?: File[]) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  fetchProductStats: () => Promise<void>;
  
  // Reviews
  submitReview: (productId: string, data: { rating: number; comment: string; name: string }) => Promise<any>;
  fetchReviews: (productId: string, page?: number) => Promise<ReviewsResponse>;
  updateProductRatings: (productId: string, ratings: Product['ratings']) => void;
  refreshProductRatings: (productId: string) => Promise<void>;
  refreshSingleProduct: (productId: string) => Promise<Product | null>;
  
  // Utilities
  clearError: () => void;
  getProductById: (productId: string) => Product | undefined;
}

export const useProductStore = create<ProductState>((set, get) => ({
  // Initial state
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

  // Fetch catalog products (public)
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

  // Fetch products enlisted by current user
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

  // Enlist a product (add to store)
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

  // Delist a product (remove from store)
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

  // Fetch all products (admin only)
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

  // Create a new product
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

  // Update an existing product
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
        myProducts: state.myProducts.map(p => p._id === id ? updated : p),
        isSubmitting: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to update product' : 'Failed to update product';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  // Delete a product
  deleteProduct: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await api.delete(`/api/v1/products/${id}`);
      set(state => ({
        catalog: state.catalog.filter(p => p._id !== id),
        allProducts: state.allProducts.filter(p => p._id !== id),
        myProducts: state.myProducts.filter(p => p._id !== id),
        catalogTotal: state.catalogTotal - 1,
        allTotal: state.allTotal - 1,
        myTotal: state.myTotal - 1,
        isSubmitting: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to delete product' : 'Failed to delete product';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  // Fetch product statistics (admin only)
  fetchProductStats: async () => {
    try {
      const res = await api.get('/api/v1/products/stats');
      set({ stats: res.data.stats });
    } catch (err) {
      console.error('Failed to fetch product stats:', err);
    }
  },

  // Submit a review for a product
  submitReview: async (productId, data) => {
    set({ isSubmitting: true, error: null });
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.post(`/api/v1/products/${productId}/reviews`, data, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Review submission response:', response.data);
      
      // CRITICAL FIX: Refresh the entire product to get updated ratings
      if (response.data.ratings) {
        // Update ratings immediately
        get().updateProductRatings(productId, response.data.ratings);
      }
      
      // Always refresh the single product to ensure all data is up to date
      await get().refreshSingleProduct(productId);
      
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

  // Fetch reviews for a product
  fetchReviews: async (productId, page = 1) => {
    try {
      const res = await api.get(`/api/v1/products/${productId}/reviews?page=${page}&limit=10`);
      return {
        reviews: res.data.reviews || [],
        total: res.data.total || 0,
        totalPages: res.data.totalPages || 0,
        currentPage: res.data.currentPage || page,
        ratings: res.data.ratings || { 
          average: 0, 
          count: 0, 
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
        },
      };
    } catch (error) {
      console.error('Fetch reviews error:', error);
      return {
        reviews: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        ratings: { 
          average: 0, 
          count: 0, 
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
        },
      };
    }
  },

  // Update product ratings in all product lists
  updateProductRatings: (productId: string, ratings: Product['ratings']) => {
    set(state => ({
      catalog: state.catalog.map(p => 
        p._id === productId ? { ...p, ratings } : p
      ),
      allProducts: state.allProducts.map(p => 
        p._id === productId ? { ...p, ratings } : p
      ),
      myProducts: state.myProducts.map(p => 
        p._id === productId ? { ...p, ratings } : p
      ),
    }));
  },

  // Refresh a single product from the server
  refreshSingleProduct: async (productId: string): Promise<Product | null> => {
    try {
      const res = await api.get(`/api/v1/products/${productId}`);
      const updatedProduct = res.data.product || res.data;
      
      if (updatedProduct) {
        // Update the product in all lists
        set(state => ({
          catalog: state.catalog.map(p => p._id === productId ? updatedProduct : p),
          allProducts: state.allProducts.map(p => p._id === productId ? updatedProduct : p),
          myProducts: state.myProducts.map(p => p._id === productId ? updatedProduct : p),
        }));
        return updatedProduct;
      }
      return null;
    } catch (error) {
      console.error('Failed to refresh single product:', error);
      return null;
    }
  },

  // Refresh product ratings from server
  refreshProductRatings: async (productId: string) => {
    try {
      const res = await api.get(`/api/v1/products/${productId}/reviews?page=1&limit=1`);
      if (res.data.ratings) {
        get().updateProductRatings(productId, res.data.ratings);
      }
    } catch (error) {
      console.error('Failed to refresh product ratings:', error);
    }
  },

  // Get a single product by ID from the store
  getProductById: (productId: string) => {
    const state = get();
    return state.catalog.find(p => p._id === productId) ||
           state.allProducts.find(p => p._id === productId) ||
           state.myProducts.find(p => p._id === productId);
  },

  // Clear error message
  clearError: () => set({ error: null }),
}));