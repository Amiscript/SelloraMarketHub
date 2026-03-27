import { create } from 'zustand';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CarouselSlide {
  _id: string;
  title: string;
  subtitle: string;
  image: { url: string; public_id: string };
  order: number;
  active: boolean;
  createdAt?: string;
}

export interface ClientCarouselSlide {
  _id: string;
  title: string;
  subtitle?: string;
  image: { url: string; public_id: string };
  link?: string;
  buttonText?: string;
  storeSlug?: string;
  storeName?: string;
  order: number;
  active: boolean;
  createdBy?: string;
  createdAt?: string;
}

interface CarouselState {
  // Admin carousels
  adminSlides: CarouselSlide[];
  publicSlides: CarouselSlide[];
  // Client carousels
  clientSlides: ClientCarouselSlide[];
  storeSlides: ClientCarouselSlide[];

  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Admin actions
  fetchAdminCarousels: () => Promise<void>;
  fetchPublicCarousels: () => Promise<void>;
  createAdminCarousel: (data: { title: string; subtitle: string }, image: File) => Promise<void>;
  updateAdminCarousel: (id: string, data: Partial<CarouselSlide>, image?: File) => Promise<void>;
  deleteAdminCarousel: (id: string) => Promise<void>;
  toggleAdminCarousel: (id: string) => Promise<void>;
  reorderAdminCarousels: (order: string[]) => Promise<void>;

  // Client carousel actions
  fetchClientCarousels: () => Promise<void>;
  fetchStoreCarousels: (storeSlug: string) => Promise<void>;
  createClientCarousel: (data: { title: string; subtitle?: string; link?: string; buttonText?: string }, image: File) => Promise<void>;
  updateClientCarousel: (id: string, data: Partial<ClientCarouselSlide>, image?: File) => Promise<void>;
  deleteClientCarousel: (id: string) => Promise<void>;
  toggleClientCarousel: (id: string) => Promise<void>;
  reorderClientCarousels: (order: string[]) => Promise<void>;

  clearError: () => void;
}

export const useCarouselStore = create<CarouselState>((set) => ({
  adminSlides: [],
  publicSlides: [],
  clientSlides: [],
  storeSlides: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchAdminCarousels: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/carousel');
      set({ adminSlides: res.data.carousels || [], isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load carousels' : 'Failed to load carousels';
      set({ error: msg, isLoading: false });
    }
  },

  fetchPublicCarousels: async () => {
    try {
      const res = await api.get('/api/v1/carousel/public');
      set({ publicSlides: res.data.carousels || [] });
    } catch {
      // Public carousels are optional
    }
  },

  createAdminCarousel: async (data, image) => {
    set({ isSubmitting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('subtitle', data.subtitle);
      formData.append('image', image);
      const res = await api.post('/api/v1/carousel', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      set((state) => ({ adminSlides: [...state.adminSlides, res.data.carousel], isSubmitting: false }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to create carousel' : 'Failed to create carousel';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  updateAdminCarousel: async (id, data, image) => {
    set({ isSubmitting: true, error: null });
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined) formData.append(k, String(v)); });
      if (image) formData.append('image', image);
      const res = await api.put(`/api/v1/carousel/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      set((state) => ({ adminSlides: state.adminSlides.map((s) => s._id === id ? res.data.carousel : s), isSubmitting: false }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to update carousel' : 'Failed to update carousel';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  deleteAdminCarousel: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await api.delete(`/api/v1/carousel/${id}`);
      set((state) => ({ adminSlides: state.adminSlides.filter((s) => s._id !== id), isSubmitting: false }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to delete carousel' : 'Failed to delete carousel';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  toggleAdminCarousel: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await api.put(`/api/v1/carousel/${id}/toggle-active`);
      set((state) => ({ adminSlides: state.adminSlides.map((s) => s._id === id ? res.data.carousel : s), isSubmitting: false }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to toggle carousel' : 'Failed to toggle carousel';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  reorderAdminCarousels: async (order) => {
    try {
      await api.put('/api/v1/carousel/reorder', { order });
    } catch {
      // Best effort
    }
  },

  // ── Client Carousel ─────────────────────────────────────────────────────

  fetchClientCarousels: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/client-carousels/my');
      set({ clientSlides: res.data.carousels || [], isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load carousels' : 'Failed to load carousels';
      set({ error: msg, isLoading: false });
    }
  },

fetchStoreCarousels: async (storeSlug) => {
    try {
      const res = await api.get(`/api/v1/client-carousels/store/${storeSlug}`);
      set({ storeSlides: res.data.carousels || [] });
    } catch (err: any) {
      console.error('fetchStoreCarousels error:', err?.response?.data || err?.message);
    }
  },

  createClientCarousel: async (data, image) => {
    set({ isSubmitting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.subtitle) formData.append('subtitle', data.subtitle);
      if (data.link) formData.append('link', data.link);
      if (data.buttonText) formData.append('buttonText', data.buttonText);
      formData.append('image', image);
      const res = await api.post('/api/v1/client-carousels/my', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      set((state) => ({ clientSlides: [...state.clientSlides, res.data.carousel], isSubmitting: false }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to create carousel' : 'Failed to create carousel';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  updateClientCarousel: async (id, data, image) => {
    set({ isSubmitting: true, error: null });
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined) formData.append(k, String(v)); });
      if (image) formData.append('image', image);
      const res = await api.put(`/api/v1/client-carousels/my/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      set((state) => ({ clientSlides: state.clientSlides.map((s) => s._id === id ? res.data.carousel : s), isSubmitting: false }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to update carousel' : 'Failed to update carousel';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  deleteClientCarousel: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await api.delete(`/api/v1/client-carousels/my/${id}`);
      set((state) => ({ clientSlides: state.clientSlides.filter((s) => s._id !== id), isSubmitting: false }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to delete carousel' : 'Failed to delete carousel';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  toggleClientCarousel: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
   const res = await api.patch(`/api/v1/client-carousels/my/${id}/toggle`);
      set((state) => ({ clientSlides: state.clientSlides.map((s) => s._id === id ? res.data.carousel : s), isSubmitting: false }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to toggle carousel' : 'Failed to toggle carousel';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  reorderClientCarousels: async (order) => {
    try {
      await api.put('/api/v1/client-carousels/my/reorder', { order });
    } catch {
      // Best effort
    }
  },

  clearError: () => set({ error: null }),
}));
