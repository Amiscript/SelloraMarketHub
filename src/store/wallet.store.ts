import { create } from 'zustand';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

export interface WalletBalance {
  totalEarnings: number;
  pendingBalance: number;
  availableBalance: number;
  commissionRate?: number;
}

export interface WalletTransaction {
  _id: string;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  order?: { _id: string; orderId: string };
  createdAt: string;
  paymentDate?: string;
}

interface WalletState {
  balance: WalletBalance | null;
  transactions: WalletTransaction[];
  total: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isWithdrawing: boolean;
  error: string | null;

  fetchBalance: () => Promise<void>;
  fetchTransactions: (page?: number, type?: string) => Promise<void>;
  requestWithdrawal: (amount: number) => Promise<void>;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: null,
  transactions: [],
  total: 0,
  totalPages: 0,
  currentPage: 1,
  isLoading: false,
  isWithdrawing: false,
  error: null,

  fetchBalance: async () => {
    try {
      const res = await api.get('/api/wallet/balance');
      set({ balance: res.data.wallet });
    } catch {
      // optional
    }
  },

  fetchTransactions: async (page = 1, type?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (type) params.append('type', type);
      const res = await api.get(`/api/wallet/transactions?${params.toString()}`);
      set({
        transactions: res.data.transactions || [],
        total: res.data.total || 0,
        totalPages: res.data.totalPages || 0,
        currentPage: res.data.currentPage || 1,
        balance: res.data.wallet || null,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load transactions' : 'Failed to load transactions';
      set({ error: msg, isLoading: false });
    }
  },

  requestWithdrawal: async (amount: number) => {
    set({ isWithdrawing: true, error: null });
    try {
      await api.post('/api/wallet/withdraw', { amount });
      // Refresh balance after withdrawal
      const res = await api.get('/api/wallet/balance');
      set({ balance: res.data.wallet, isWithdrawing: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Withdrawal failed' : 'Withdrawal failed';
      set({ error: msg, isWithdrawing: false });
      throw new Error(msg);
    }
  },

  clearError: () => set({ error: null }),
}));
