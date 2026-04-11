
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
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  sellerResponse?: string;
  chatId?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface NegotiationStats {
  totalOffers: number;
  acceptedOffers: number;
  rejectedOffers: number;
  pendingOffers: number;
  avgDiscount: number;
  totalSavings: number;
  successRate: string | number;
}

interface NegotiationState {
  negotiations: Negotiation[];
  currentNegotiation: Negotiation | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  stats: NegotiationStats | null;

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
  fetchNegotiationStats: (storeSlug: string) => Promise<void>;
  updateNegotiation: (
    storeSlug: string,
    negotiationId: string,
    data: {
      status?: 'accepted' | 'rejected';
      sellerResponse?: string;
      counterOfferPrice?: number;
    }
  ) => Promise<Negotiation>;
  deleteNegotiation: (storeSlug: string, negotiationId: string) => Promise<void>;
  clearError: () => void;
  clearNegotiations: () => void;
}

// Helper function to build the correct API endpoint
// Matches backend route: /api/v1/storefront/:storeSlug/negotiations
const getNegotiationEndpoint = (storeSlug: string, negotiationId?: string) => {
  const base = `/api/v1/negotiations/${storeSlug}/negotiations`;
  return negotiationId ? `${base}/${negotiationId}` : base;
};

export const useNegotiationStore = create<NegotiationState>((set, get) => ({
  // Initial State
  negotiations: [],
  currentNegotiation: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  stats: null,

  // Create Negotiation
  createNegotiation: async (storeSlug, data) => {
    set({ isSubmitting: true, error: null });
    try {
      const endpoint = getNegotiationEndpoint(storeSlug);
      console.log('📝 Creating negotiation at:', endpoint);
      console.log('📦 Request data:', data);
      
      const response = await api.post(endpoint, {
        productId: data.productId,
        productName: data.productName,
        originalPrice: data.originalPrice,
        offerPrice: data.offerPrice,
        message: data.message,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
      });
      
      console.log('📨 Response:', response.data);
      
      // Handle response structure from backend
      // Backend returns: { success: true, message: "...", data: negotiation }
      let negotiation: Negotiation | null = null;
      
      if (response.data.data && response.data.data._id) {
        negotiation = response.data.data;
      } else if (response.data._id) {
        negotiation = response.data;
      } else if (response.data.negotiation && response.data.negotiation._id) {
        negotiation = response.data.negotiation;
      }
      
      if (!negotiation) {
        throw new Error('Invalid response structure from server');
      }
      
      console.log('✅ Negotiation created:', negotiation._id);
      console.log('💰 Offer: ₦' + negotiation.offerPrice + ' (was ₦' + negotiation.originalPrice + ')');

      set({
        currentNegotiation: negotiation,
        isSubmitting: false,
      });

      return negotiation;
    } catch (err) {
      let msg = 'Failed to create negotiation';
      
      if (err instanceof AxiosError) {
        msg = err.response?.data?.message || 
              err.response?.data?.error || 
              'Failed to create negotiation';
        console.error('❌ Axios error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
        });
      } else if (err instanceof Error) {
        msg = err.message;
      }
      
      console.error('❌ Create negotiation error:', msg);
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  // Fetch All Negotiations
  fetchNegotiations: async (storeSlug, status) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = getNegotiationEndpoint(storeSlug);
      const params = status ? `?status=${status}` : '';
      const url = `${endpoint}${params}`;
      
      console.log('📡 Fetching negotiations from:', url);
      
      const response = await api.get(url);
      console.log('📨 Response:', response.data);
      
      // Handle different response structures
      let negotiations: Negotiation[] = [];
      
      if (response.data.data && Array.isArray(response.data.data)) {
        negotiations = response.data.data;
      } else if (response.data.negotiations && Array.isArray(response.data.negotiations)) {
        negotiations = response.data.negotiations;
      } else if (Array.isArray(response.data)) {
        negotiations = response.data;
      }
      
      console.log(`✅ Fetched ${negotiations.length} negotiations`);

      set({
        negotiations,
        isLoading: false,
      });
    } catch (err) {
      let msg = 'Failed to fetch negotiations';
      
      if (err instanceof AxiosError) {
        msg = err.response?.data?.message || 
              err.response?.data?.error || 
              'Failed to fetch negotiations';
      }
      
      console.error('❌ Fetch negotiations error:', msg);
      set({ error: msg, isLoading: false });
    }
  },

  // Fetch Single Negotiation
  fetchNegotiation: async (storeSlug, negotiationId) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = getNegotiationEndpoint(storeSlug, negotiationId);
      console.log('📡 Fetching negotiation from:', endpoint);
      
      const response = await api.get(endpoint);
      console.log('📨 Response:', response.data);
      
      let negotiation: Negotiation | null = null;
      
      if (response.data.data && response.data.data._id) {
        negotiation = response.data.data;
      } else if (response.data._id) {
        negotiation = response.data;
      } else if (response.data.negotiation && response.data.negotiation._id) {
        negotiation = response.data.negotiation;
      }
      
      if (!negotiation) {
        throw new Error('Negotiation not found in response');
      }
      
      console.log('✅ Negotiation fetched:', negotiation._id);

      set({
        currentNegotiation: negotiation,
        isLoading: false,
      });
    } catch (err) {
      let msg = 'Failed to fetch negotiation';
      
      if (err instanceof AxiosError) {
        msg = err.response?.data?.message || 
              err.response?.data?.error || 
              'Failed to fetch negotiation';
      }
      
      console.error('❌ Fetch negotiation error:', msg);
      set({ error: msg, isLoading: false });
    }
  },

  // Fetch Negotiation Statistics
  fetchNegotiationStats: async (storeSlug) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = `${getNegotiationEndpoint(storeSlug)}/stats`;
      console.log('📡 Fetching negotiation stats from:', endpoint);
      
      const response = await api.get(endpoint);
      console.log('📨 Stats response:', response.data);
      
      let stats: NegotiationStats | null = null;
      
      if (response.data.data) {
        stats = response.data.data;
      } else if (response.data.stats) {
        stats = response.data.stats;
      }
      
      console.log('✅ Negotiation stats fetched:', stats);

      set({
        stats,
        isLoading: false,
      });
    } catch (err) {
      let msg = 'Failed to fetch negotiation stats';
      
      if (err instanceof AxiosError) {
        msg = err.response?.data?.message || 
              err.response?.data?.error || 
              'Failed to fetch negotiation stats';
      }
      
      console.error('❌ Fetch negotiation stats error:', msg);
      set({ error: msg, isLoading: false });
    }
  },

  // Update Negotiation (Accept/Reject/Counter Offer)
  updateNegotiation: async (storeSlug, negotiationId, data) => {
    set({ isSubmitting: true, error: null });
    try {
      const endpoint = getNegotiationEndpoint(storeSlug, negotiationId);
      console.log(`📝 Updating negotiation at:`, endpoint);
      console.log('📦 Update data:', data);
      
      const response = await api.patch(endpoint, {
        status: data.status,
        sellerResponse: data.sellerResponse,
        counterOfferPrice: data.counterOfferPrice,
      });
      
      console.log('📨 Response:', response.data);
      
      let negotiation: Negotiation | null = null;
      
      if (response.data.data && response.data.data._id) {
        negotiation = response.data.data;
      } else if (response.data._id) {
        negotiation = response.data;
      } else if (response.data.negotiation && response.data.negotiation._id) {
        negotiation = response.data.negotiation;
      }
      
      if (!negotiation) {
        throw new Error('Invalid response structure');
      }
      
      const statusText = data.status || 'updated';
      console.log(`✅ Negotiation ${statusText}:`, negotiation._id);

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
      let msg = 'Failed to update negotiation';
      
      if (err instanceof AxiosError) {
        msg = err.response?.data?.message || 
              err.response?.data?.error || 
              'Failed to update negotiation';
      }
      
      console.error('❌ Update negotiation error:', msg);
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  // Delete Negotiation
  deleteNegotiation: async (storeSlug, negotiationId) => {
    set({ isSubmitting: true, error: null });
    try {
      const endpoint = getNegotiationEndpoint(storeSlug, negotiationId);
      console.log('🗑️ Deleting negotiation at:', endpoint);
      
      await api.delete(endpoint);
      
      console.log('✅ Negotiation deleted:', negotiationId);

      // Remove from list
      set((state) => ({
        negotiations: state.negotiations.filter((n) => n._id !== negotiationId),
        currentNegotiation: state.currentNegotiation?._id === negotiationId ? null : state.currentNegotiation,
        isSubmitting: false,
      }));
    } catch (err) {
      let msg = 'Failed to delete negotiation';
      
      if (err instanceof AxiosError) {
        msg = err.response?.data?.message || 
              err.response?.data?.error || 
              'Failed to delete negotiation';
      }
      
      console.error('❌ Delete negotiation error:', msg);
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  // Clear Error
  clearError: () => set({ error: null }),

  // Clear Negotiations
  clearNegotiations: () => set({ 
    negotiations: [], 
    currentNegotiation: null, 
    stats: null 
  }),
}));