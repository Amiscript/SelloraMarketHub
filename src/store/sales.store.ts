import { create } from 'zustand';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

export interface SaleOrder {
  _id: string;
  orderId: string;
  client?: { _id: string; name: string; storeName?: string; storeSlug?: string };
  customer: { name: string; email: string; phone: string };
  products: Array<{ name: string; price: number; quantity: number; commissionRate: number }>;
  payment: { amount: number; commission: number; status: string };
  status: string;
  createdAt: string;
  deliveryDate?: string;
}

export interface SalesStats {
  totalSales: number;
  todaySales: number;
  yesterdaySales: number;
  salesChange: number;
  totalRevenue: number;
  todayRevenue: number;
  salesByStatus: Array<{ _id: string; count: number }>;
  topProducts: Array<{ _id: string; name: string; totalSold: number; totalRevenue: number }>;
}

export interface ClientSalesStats {
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  salesByStatus: Array<{ _id: string; count: number }>;
}

export interface SalesFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface SalesState {
  sales: SaleOrder[];
  adminStats: SalesStats | null;
  clientStats: ClientSalesStats | null;
  total: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;

  fetchAdminStats: () => Promise<void>;
  fetchAllSales: (filters?: SalesFilters) => Promise<void>;
  fetchClientSales: (filters?: SalesFilters) => Promise<void>;
  exportSales: (filters?: { startDate?: string; endDate?: string; clientId?: string }) => Promise<void>;
  clearError: () => void;
}

export const useSalesStore = create<SalesState>((set) => ({
  sales: [],
  adminStats: null,
  clientStats: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
  isLoading: false,
  isExporting: false,
  error: null,

  fetchAdminStats: async () => {
    try {
      const res = await api.get('/api/sales/stats');
      set({ adminStats: res.data.stats });
    } catch {
      // optional
    }
  },

  fetchAllSales: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      const res = await api.get(`/api/sales/admin?${params.toString()}`);
      set({
        sales: res.data.orders || [],
        total: res.data.total || 0,
        totalPages: res.data.totalPages || 0,
        currentPage: res.data.currentPage || 1,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load sales' : 'Failed to load sales';
      set({ error: msg, isLoading: false });
    }
  },

  fetchClientSales: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      const res = await api.get(`/api/sales/client?${params.toString()}`);
      set({
        sales: res.data.orders || [],
        total: res.data.total || 0,
        totalPages: res.data.totalPages || 0,
        currentPage: res.data.currentPage || 1,
        clientStats: res.data.stats || null,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load sales' : 'Failed to load sales';
      set({ error: msg, isLoading: false });
    }
  },

  exportSales: async (filters = {}) => {
    set({ isExporting: true, error: null });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      const res = await api.get(`/api/sales/export?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      set({ isExporting: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Export failed' : 'Export failed';
      set({ error: msg, isExporting: false });
      throw new Error(msg);
    }
  },

  clearError: () => set({ error: null }),
}));
