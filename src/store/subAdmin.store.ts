import { create } from 'zustand';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

export type SubAdminPermission =
  | 'manage_clients'
  | 'manage_products'
  | 'manage_orders'
  | 'manage_payments'
  | 'manage_carousel'
  | 'view_reports'
  | 'view_support'
  | 'assign_chat'
  | 'manage_support';

export interface SubAdmin {
  _id: string;
  name: string;
  email: string;
  role: 'sub-admin';
  isActive: boolean;
  permissions: SubAdminPermission[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubAdminState {
  subAdmins: SubAdmin[];
  selectedSubAdmin: SubAdmin | null;
  total: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchSubAdmins: () => Promise<void>;
  fetchSubAdminById: (id: string) => Promise<void>;
  createSubAdmin: (data: { name: string; email: string; permissions?: SubAdminPermission[] }) => Promise<void>;
  updateSubAdmin: (id: string, data: { permissions?: SubAdminPermission[]; isActive?: boolean }) => Promise<void>;
  deleteSubAdmin: (id: string) => Promise<void>;
  clearError: () => void;
  clearSelected: () => void;
}

export const useSubAdminStore = create<SubAdminState>((set) => ({
  subAdmins: [],
  selectedSubAdmin: null,
  total: 0,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchSubAdmins: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/sub-admins');
      set({ subAdmins: res.data.subAdmins || [], total: res.data.total || 0, isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load sub-admins' : 'Failed to load sub-admins';
      set({ error: msg, isLoading: false });
    }
  },

  fetchSubAdminById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/v1/sub-admins/${id}`);
      set({ selectedSubAdmin: res.data.subAdmin, isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load sub-admin' : 'Failed to load sub-admin';
      set({ error: msg, isLoading: false });
    }
  },


createSubAdmin: async (data) => {
  set({ isSubmitting: true, error: null });
  try {
    const res = await api.post('/api/v1/sub-admins', data);
    
    // Show warning if email wasn't sent but sub-admin was created
    if (res.data.message && res.data.message.includes('email could not be sent')) {
      console.warn(res.data.message);
      // You might want to show a warning toast here
    }
    
    set((state) => ({
      subAdmins: [res.data.subAdmin, ...state.subAdmins],
      isSubmitting: false,
    }));
    
    return res.data;
  } catch (err) {
    const axiosError = err as AxiosError;
    const errorMessage = (axiosError.response?.data as any)?.error || 'Failed to create sub-admin';
    set({ error: errorMessage, isSubmitting: false });
    throw new Error(errorMessage);
  }
},

  updateSubAdmin: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await api.put(`/api/v1/sub-admins/${id}`, data);
      const updated: SubAdmin = res.data.subAdmin;
      set((state) => ({
        subAdmins: state.subAdmins.map((s) => (s._id === id ? updated : s)),
        selectedSubAdmin: state.selectedSubAdmin?._id === id ? updated : state.selectedSubAdmin,
        isSubmitting: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to update sub-admin' : 'Failed to update sub-admin';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  deleteSubAdmin: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await api.delete(`/api/v1/sub-admins/${id}`);
      set((state) => ({
        subAdmins: state.subAdmins.filter((s) => s._id !== id),
        isSubmitting: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to delete sub-admin' : 'Failed to delete sub-admin';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  clearError: () => set({ error: null }),
  clearSelected: () => set({ selectedSubAdmin: null }),
}));
