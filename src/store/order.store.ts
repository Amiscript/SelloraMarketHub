import { create } from 'zustand';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OrderCustomer {
  name: string;
  phone: string;
  email: string;
  location: string;
  shippingAddress?: string;
}

export interface OrderProduct {
  product: { _id: string; name: string; images?: Array<{ url: string }> } | string;
  name: string;
  price: number;
  quantity: number;
  commissionRate: number;
  commission: number;
}

export interface OrderPayment {
  amount: number;
  commission: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference?: string;
  method?: string;
  transactionId?: string;
  paidAt?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  client: { _id: string; name: string; storeName?: string; storeSlug?: string } | string;
  customer: OrderCustomer;
  products: OrderProduct[];
  payment: OrderPayment;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingMethod: string;
  shippingAddress?: string;
  trackingNumber?: string;
  notes?: string;
  adminNotes?: string;
  cancellationReason?: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrderStats {
  totalOrders: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

interface OrderState {
  orders: Order[];
  clientOrders: Order[];
  selectedOrder: Order | null;
  total: number;
  totalPages: number;
  currentPage: number;
  clientTotal: number;
  clientTotalPages: number;
  clientCurrentPage: number;
  stats: OrderStats | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchOrders: (filters?: OrderFilters) => Promise<void>;
  fetchClientOrders: (filters?: OrderFilters) => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  fetchOrderStats: () => Promise<void>;
  updateOrderStatus: (id: string, status: string, data?: { trackingNumber?: string; adminNotes?: string; cancellationReason?: string }) => Promise<void>;
  clearError: () => void;
  clearSelected: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  clientOrders: [],
  selectedOrder: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
  clientTotal: 0,
  clientTotalPages: 0,
  clientCurrentPage: 1,
  stats: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchOrders: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      const res = await api.get(`/api/v1/orders?${params.toString()}`);
      set({
        orders: res.data.orders || [],
        total: res.data.total || 0,
        totalPages: res.data.totalPages || 0,
        currentPage: res.data.currentPage || 1,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load orders' : 'Failed to load orders';
      set({ error: msg, isLoading: false });
    }
  },

  fetchClientOrders: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      const res = await api.get(`/api/v1/orders/my-orders?${params.toString()}`);
      set({
        clientOrders: res.data.orders || [],
        clientTotal: res.data.total || 0,
        clientTotalPages: res.data.totalPages || 0,
        clientCurrentPage: res.data.currentPage || 1,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load orders' : 'Failed to load orders';
      set({ error: msg, isLoading: false });
    }
  },

  fetchOrderById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/v1/orders/${id}`);
      set({ selectedOrder: res.data.order, isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load order' : 'Failed to load order';
      set({ error: msg, isLoading: false });
    }
  },

  fetchOrderStats: async () => {
    try {
      const res = await api.get('/api/v1/orders/stats');
      set({ stats: res.data.stats });
    } catch {
      // Stats are optional
    }
  },

  updateOrderStatus: async (id, status, data = {}) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await api.put(`/api/v1/orders/${id}/status`, { status, ...data });
      const updated: Order = res.data.order;
      set((state) => ({
        orders: state.orders.map((o) => (o._id === id ? updated : o)),
        selectedOrder: state.selectedOrder?._id === id ? updated : state.selectedOrder,
        isSubmitting: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to update order' : 'Failed to update order';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  clearError: () => set({ error: null }),
  clearSelected: () => set({ selectedOrder: null }),
}));
