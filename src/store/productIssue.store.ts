import { create } from 'zustand';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

export type IssueType = 'wrong_info' | 'wrong_price' | 'bad_images' | 'out_of_stock' | 'pricing_issue' | 'other';
export type IssueStatus = 'open' | 'in_review' | 'resolved' | 'dismissed';

export interface ProductIssue {
  _id: string;
  product: { _id: string; name: string; images?: Array<{ url: string }>; price: number } | string;
  reportedBy: { _id: string; name: string; email: string; storeName?: string } | string;
  assignedTo?: string;
  issueType: IssueType;
  description: string;
  status: IssueStatus;
  adminNote?: string;
  resolvedAt?: string;
  resolvedBy?: { _id: string; name: string } | string;
  createdAt: string;
}

export interface IssueStats {
  open: number;
  in_review: number;
  resolved: number;
}

interface ProductIssueState {
  issues: ProductIssue[];
  myIssues: ProductIssue[];
  stats: IssueStats | null;
  total: number;
  totalPages: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  reportIssue: (productId: string, issueType: IssueType, description: string) => Promise<void>;
  fetchMyIssues: () => Promise<void>;
  fetchAllIssues: (filters?: { status?: string; page?: number }) => Promise<void>;
  fetchProductIssues: (productId: string) => Promise<ProductIssue[]>;
  updateIssueStatus: (issueId: string, status: IssueStatus, adminNote?: string) => Promise<void>;
  clearError: () => void;
}

export const useProductIssueStore = create<ProductIssueState>((set) => ({
  issues: [],
  myIssues: [],
  stats: null,
  total: 0,
  totalPages: 0,
  isLoading: false,
  isSubmitting: false,
  error: null,

  reportIssue: async (productId, issueType, description) => {
    set({ isSubmitting: true, error: null });
    try {
      await api.post(`/api/v1/product-issues/${productId}/report`, { issueType, description });
      set({ isSubmitting: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to report issue' : 'Failed to report issue';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  fetchMyIssues: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/product-issues/my');
      set({ myIssues: res.data.issues || [], isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load issues' : 'Failed to load issues';
      set({ error: msg, isLoading: false });
    }
  },

  fetchAllIssues: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.page) params.append('page', String(filters.page));
      const res = await api.get(`/api/v1/product-issues?${params.toString()}`);
      set({
        issues: res.data.issues || [],
        total: res.data.total || 0,
        totalPages: res.data.totalPages || 0,
        stats: res.data.stats || null,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load issues' : 'Failed to load issues';
      set({ error: msg, isLoading: false });
    }
  },

  fetchProductIssues: async (productId) => {
    try {
      const res = await api.get(`/api/v1/product-issues/product/${productId}`);
      return res.data.issues || [];
    } catch {
      return [];
    }
  },

  updateIssueStatus: async (issueId, status, adminNote) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await api.put(`/api/v1/product-issues/${issueId}/status`, { status, adminNote });
      const updated: ProductIssue = res.data.issue;
      set((state) => ({
        issues: state.issues.map(i => i._id === issueId ? updated : i),
        isSubmitting: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to update issue' : 'Failed to update issue';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  clearError: () => set({ error: null }),
}));
