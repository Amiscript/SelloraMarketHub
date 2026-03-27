import { create } from 'zustand';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ClientImage {
  url: string;
  public_id: string;
}

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'client';
  isActive: boolean;
  isVerified: boolean;
verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended';
  storeStatus: 'pending' | 'active' | 'suspended';
  storeName: string;
  storeSlug: string;
  storeDescription?: string;
  profileImage?: ClientImage;
  logo?: ClientImage;
  banner?: ClientImage;
  idCardFront?: ClientImage;
  idCardBack?: ClientImage;
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
  totalEarnings: number;
  pendingBalance: number;
  commissionRate: number;
  products?: string[];
  sales?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientStats {
  totalClients: number;
  verifiedClients: number;
  pendingClients: number;
  suspendedClients: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
}

export interface ClientFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ClientManagementState {
  clients: Client[];
  selectedClient: Client | null;
  total: number;
  totalPages: number;
  currentPage: number;
  stats: ClientStats | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchClients: (filters?: ClientFilters) => Promise<void>;
  fetchClientById: (id: string) => Promise<void>;
  fetchClientStats: () => Promise<void>;
  updateClientStatus: (id: string, status: string) => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  clearError: () => void;
  clearSelected: () => void;
}

export const useClientManagementStore = create<ClientManagementState>((set) => ({
  clients: [],
  selectedClient: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
  stats: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchClients: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      const res = await api.get(`/api/v1/clients?${params.toString()}`);
      set({
        clients: res.data.clients || [],
        total: res.data.total || 0,
        totalPages: res.data.totalPages || 0,
        currentPage: res.data.currentPage || 1,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load clients' : 'Failed to load clients';
      set({ error: msg, isLoading: false });
    }
  },

  fetchClientById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/v1/clients/${id}`);
      set({ selectedClient: res.data.client, isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load client' : 'Failed to load client';
      set({ error: msg, isLoading: false });
    }
  },

  fetchClientStats: async () => {
    try {
      const res = await api.get('/api/v1/clients/stats');
      set({ stats: res.data.stats });
    } catch {
      // Stats optional
    }
  },

  updateClientStatus: async (id: string, status: string) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await api.put(`/api/v1/clients/${id}/status`, { status });
      const updated: Client = res.data.client;
      set((state) => ({
        clients: state.clients.map((c) => (c._id === id ? updated : c)),
        selectedClient: state.selectedClient?._id === id ? updated : state.selectedClient,
        isSubmitting: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to update status' : 'Failed to update status';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  updateClient: async (id: string, data: Partial<Client>) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await api.put(`/api/v1/clients/${id}`, data);
      const updated: Client = res.data.client;
      set((state) => ({
        clients: state.clients.map((c) => (c._id === id ? updated : c)),
        selectedClient: state.selectedClient?._id === id ? updated : state.selectedClient,
        isSubmitting: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to update client' : 'Failed to update client';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  deleteClient: async (id: string) => {
    set({ isSubmitting: true, error: null });
    try {
      await api.delete(`/api/v1/clients/${id}`);
      set((state) => ({
        clients: state.clients.filter((c) => c._id !== id),
        isSubmitting: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to delete client' : 'Failed to delete client';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  clearError: () => set({ error: null }),
  clearSelected: () => set({ selectedClient: null }),
}));