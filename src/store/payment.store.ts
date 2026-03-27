import { create } from 'zustand';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Payment {
  _id: string;
  client: { _id: string; name: string; storeName?: string } | string;
  order?: { _id: string; orderId: string } | string;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    accountType: string;
  };
  rejectionReason?: string;
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentFilters {
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

interface PaymentState {
  payments: Payment[];
  total: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchPayments: (filters?: PaymentFilters) => Promise<void>;
  fetchClientPayments: (filters?: PaymentFilters) => Promise<void>;
  approvePayment: (id: string) => Promise<void>;
  rejectPayment: (id: string, reason: string) => Promise<void>;
  processPayment: (id: string) => Promise<void>;
  clearError: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  total: 0,
  totalPages: 0,
  currentPage: 1,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchPayments: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      const res = await api.get(`/api/v1/payments?${params.toString()}`);
      set({
        payments: res.data.payments || [],
        total: res.data.total || 0,
        totalPages: res.data.totalPages || 0,
        currentPage: res.data.currentPage || 1,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load payments' : 'Failed to load payments';
      set({ error: msg, isLoading: false });
    }
  },

  fetchClientPayments: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      const res = await api.get(`/api/v1/payments/my-payments?${params.toString()}`);
      set({
        payments: res.data.payments || [],
        total: res.data.total || 0,
        totalPages: res.data.totalPages || 0,
        currentPage: res.data.currentPage || 1,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load payments' : 'Failed to load payments';
      set({ error: msg, isLoading: false });
    }
  },

  approvePayment: async (id: string) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await api.put(`/api/v1/payments/${id}/approve`);
      const updated: Payment = res.data.payment;
      set((state) => ({
        payments: state.payments.map((p) => (p._id === id ? updated : p)),
        isSubmitting: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to approve payment' : 'Failed to approve payment';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  rejectPayment: async (id: string, reason: string) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await api.put(`/api/v1/payments/${id}/reject`, { rejectionReason: reason });
      const updated: Payment = res.data.payment;
      set((state) => ({
        payments: state.payments.map((p) => (p._id === id ? updated : p)),
        isSubmitting: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to reject payment' : 'Failed to reject payment';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  processPayment: async (id: string) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await api.put(`/api/v1/payments/${id}/process`);
      const updated: Payment = res.data.payment;
      set((state) => ({
        payments: state.payments.map((p) => (p._id === id ? updated : p)),
        isSubmitting: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to process payment' : 'Failed to process payment';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  clearError: () => set({ error: null }),
}));
