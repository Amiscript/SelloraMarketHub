import { create } from 'zustand';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface StatValue {
  value: number;
  change?: number;
  changeType?: 'positive' | 'negative';
}

export interface RecentSale {
  _id: string;
  orderId: string;
  client?: { _id: string; name: string };
  customer: { name: string; email: string };
  payment: { amount: number };
  status: string;
  createdAt: string;
}

export interface MonthlyRevenue {
  _id: { month: number };
  revenue: number;
  orders: number;
  commission?: number;
}

export interface TopClient {
  _id: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
}

export interface ProductCategory {
  _id: string;
  count: number;
}

export interface TopProduct {
  _id: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
}

export interface AdminDashboardStats {
  activeClients: StatValue;
  totalProducts: StatValue;
  totalSales: StatValue;
  totalRevenue: StatValue;
  verifiedClients: StatValue;
  pendingPayments: StatValue;
  subAdmins: StatValue;
}

export interface ClientDashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  pendingOrders: number;
  activeProducts: number;
  totalEarnings: number;
  pendingBalance: number;
}

export interface ClientInfo {
  _id: string;
  name: string;
  email: string;
  storeSlug: string;
  totalEarnings: number;
  pendingBalance: number;
  commissionRate: number;
}

interface DashboardState {
  // Admin
  adminStats: AdminDashboardStats | null;
  adminRecentSales: RecentSale[];
  adminCharts: {
    monthlyRevenue: MonthlyRevenue[];
    topClients: TopClient[];
    productCategories: ProductCategory[];
  } | null;

  // Client
  clientStats: ClientDashboardStats | null;
  clientRecentSales: RecentSale[];
  clientCharts: {
    monthlyRevenue: MonthlyRevenue[];
    topProducts: TopProduct[];
  } | null;
  clientInfo: ClientInfo | null;

  // UI State
  isLoadingAdmin: boolean;
  isLoadingClient: boolean;
  error: string | null;

  // Actions
  fetchAdminDashboard: () => Promise<void>;
  fetchClientDashboard: () => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  adminStats: null,
  adminRecentSales: [],
  adminCharts: null,
  clientStats: null,
  clientRecentSales: [],
  clientCharts: null,
  clientInfo: null,
  isLoadingAdmin: false,
  isLoadingClient: false,
  error: null,

  fetchAdminDashboard: async () => {
    set({ isLoadingAdmin: true, error: null });
    try {
      const res = await api.get('/api/v1/dashboard/admin');
      const { stats, recentSales, charts } = res.data;
      set({
        adminStats: stats,
        adminRecentSales: recentSales || [],
        adminCharts: charts || null,
        isLoadingAdmin: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load dashboard' : 'Failed to load dashboard';
      set({ error: msg, isLoadingAdmin: false });
    }
  },

  fetchClientDashboard: async () => {
    set({ isLoadingClient: true, error: null });
    try {
      const res = await api.get('/api/v1/dashboard/client');
      const { stats, recentSales, charts, client } = res.data;
      set({
        clientStats: stats,
        clientRecentSales: recentSales || [],
        clientCharts: charts || null,
        clientInfo: client || null,
        isLoadingClient: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load dashboard' : 'Failed to load dashboard';
      set({ error: msg, isLoadingClient: false });
    }
  },

  clearError: () => set({ error: null }),
}));
