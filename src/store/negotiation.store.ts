// src/store/negotiation.store.ts

import { create } from 'zustand';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

export interface Negotiation {
  _id: string;
  storeSlug: string;
  productId: string;
  productName: string;
  originalPrice: number;
  offerPrice: number;
  discount: number;
  discountPercent: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  sellerResponse?: string;
  chatId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface NegotiationState {
  negotiations: Negotiation[];
  currentNegotiation: Negotiation | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  createNegotiation: (
    storeSlug: string,
    data: {
      productId: string;
      productName: string;
      originalPrice: number;
      offerPrice: number;
      message: string;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
    }
  ) => Promise<Negotiation>;

  fetchNegotiations: (storeSlug: string, status?: string) => Promise<void>;
  fetchNegotiation: (storeSlug: string, negotiationId: string) => Promise<void>;
  updateNegotiationStatus: (
    storeSlug: string,
    negotiationId: string,
    status: 'accepted' | 'rejected',
    sellerResponse?: string
  ) => Promise<Negotiation>;

  counterOffer: (
    storeSlug: string,
    negotiationId: string,
    counterOfferPrice: number,
    message: string
  ) => Promise<Negotiation>;

  clearError: () => void;
  clearNegotiations: () => void;
}

export const useNegotiationStore = create<NegotiationState>((set, get) => ({
  // Initial State
  negotiations: [],
  currentNegotiation: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  // Create Negotiation
  createNegotiation: async (storeSlug, data) => {
    set({ isSubmitting: true, error: null });
    try {
      console.log('📝 Creating negotiation...', data);
      const res = await api.post(`/api/v1/storefront/${storeSlug}/negotiations`, data);

      const negotiation = res.data.data;
      console.log('✅ Negotiation created:', negotiation._id);

      set({
        currentNegotiation: negotiation,
        isSubmitting: false,
      });

      return negotiation;
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? err.response?.data?.error || 'Failed to create negotiation'
          : 'Failed to create negotiation';

      console.error('❌ Create negotiation error:', msg);
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  // Fetch All Negotiations
  fetchNegotiations: async (storeSlug, status) => {
    set({ isLoading: true, error: null });
    try {
      const params = status ? `?status=${status}` : '';
      const res = await api.get(
        `/api/v1/storefront/${storeSlug}/negotiations${params}`
      );

      const negotiations = res.data.data || [];
      console.log('✅ Negotiations fetched:', negotiations.length);

      set({
        negotiations,
        isLoading: false,
      });
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? err.response?.data?.error || 'Failed to fetch negotiations'
          : 'Failed to fetch negotiations';

      console.error('❌ Fetch negotiations error:', msg);
      set({ error: msg, isLoading: false });
    }
  },

  // Fetch Single Negotiation
  fetchNegotiation: async (storeSlug, negotiationId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(
        `/api/v1/storefront/${storeSlug}/negotiations/${negotiationId}`
      );

      const negotiation = res.data.data;
      console.log('✅ Negotiation fetched:', negotiation._id);

      set({
        currentNegotiation: negotiation,
        isLoading: false,
      });
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? err.response?.data?.error || 'Failed to fetch negotiation'
          : 'Failed to fetch negotiation';

      console.error('❌ Fetch negotiation error:', msg);
      set({ error: msg, isLoading: false });
    }
  },

  // Update Negotiation Status (Accept/Reject)
  updateNegotiationStatus: async (
    storeSlug,
    negotiationId,
    status,
    sellerResponse
  ) => {
    set({ isSubmitting: true, error: null });
    try {
      console.log(`📝 Updating negotiation to ${status}...`);
      const res = await api.patch(
        `/api/v1/storefront/${storeSlug}/negotiations/${negotiationId}`,
        {
          status,
          sellerResponse,
        }
      );

      const negotiation = res.data.data;
      console.log(`✅ Negotiation ${status}:`, negotiation._id);

      // Update in list
      set((state) => ({
        negotiations: state.negotiations.map((n) =>
          n._id === negotiationId ? negotiation : n
        ),
        currentNegotiation: negotiation,
        isSubmitting: false,
      }));

      return negotiation;
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? err.response?.data?.error || 'Failed to update negotiation'
          : 'Failed to update negotiation';

      console.error('❌ Update negotiation error:', msg);
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  // Counter Offer
  counterOffer: async (storeSlug, negotiationId, counterOfferPrice, message) => {
    set({ isSubmitting: true, error: null });
    try {
      console.log('📝 Sending counter offer...', counterOfferPrice);
      const res = await api.patch(
        `/api/v1/storefront/${storeSlug}/negotiations/${negotiationId}`,
        {
          counterOfferPrice,
          sellerResponse: message,
          status: 'pending', // Keep as pending while negotiating
        }
      );

      const negotiation = res.data.data;
      console.log('✅ Counter offer sent:', negotiation._id);

      // Update in list
      set((state) => ({
        negotiations: state.negotiations.map((n) =>
          n._id === negotiationId ? negotiation : n
        ),
        currentNegotiation: negotiation,
        isSubmitting: false,
      }));

      return negotiation;
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? err.response?.data?.error || 'Failed to send counter offer'
          : 'Failed to send counter offer';

      console.error('❌ Counter offer error:', msg);
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  // Clear Error
  clearError: () => set({ error: null }),

  // Clear Negotiations
  clearNegotiations: () => set({ negotiations: [], currentNegotiation: null }),
}));
