// store/storefront.store.ts
import { create } from 'zustand';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

export interface StorefrontSettings {
  storeName: string;
  description?: string;
  logo?: { url: string; public_id: string };
  banner?: { url: string; public_id: string };
  theme?: { primaryColor: string; secondaryColor: string; backgroundColor: string; fontFamily: string };
  contact?: { enabled: boolean; formEnabled: boolean; whatsappEnabled: boolean };
  socialLinks?: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string };
  seo?: { title?: string; description?: string; keywords?: string[] };
  owner?: { name: string; email: string; phone?: string; whatsapp?: string; address?: string };
}

export interface StorefrontInfo {
  _id: string;
  storeName: string;
  storeSlug: string;
  description?: string;
  storeDescription?: string;
  logo?: { url: string; public_id?: string };
  banner?: { url: string; public_id?: string };
  banners?: Array<{ title: string; subtitle?: string; image: { url: string }; link?: string; active: boolean; order: number }>;
  profileImage?: { url: string };
  theme?: { primaryColor?: string; secondaryColor?: string; backgroundColor?: string; fontFamily?: string };
  socialLinks?: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string };
  seo?: { title?: string; description?: string };
  contact?: { enabled?: boolean; whatsappEnabled?: boolean };
  owner?: { name?: string; phone?: string; whatsapp?: string; email?: string; address?: string };
  settings?: StorefrontSettings;
  isActive?: boolean;
  client?: string;
}

export interface StoreProduct {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  originalPrice: number;
  images: Array<{ url: string; public_id: string }>;
  status: string;
  commissionRate: number;
  slug?: string;
  ratings?: { average: number; count: number };
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
  price: number;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
  storeSlug: string;
  total: number;
  sessionId?: string;
}

interface StorefrontState {
  storeInfo: StorefrontInfo | null;
  products: StoreProduct[];
  selectedProduct: StoreProduct | null;
  cart: Cart | null;
  settings: StorefrontSettings | null;
  total: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchStorefront: (slug: string) => Promise<void>;
  fetchStoreProducts: (slug: string, filters?: { page?: number; search?: string; category?: string }) => Promise<void>;
  fetchProductDetails: (slug: string, productSlug: string) => Promise<void>;
  fetchCart: (slug: string, sessionId?: string) => Promise<void>;
  refreshCart: (slug: string) => Promise<void>;
  manageCart: (slug: string, action: 'add' | 'remove' | 'update' | 'clear', productId?: string, quantity?: number) => Promise<void>;
  placeOrder: (slug: string, orderData: any, retryCount?: number) => Promise<{ order: any; paymentUrl: string; reference: string }>;
  verifyPayment: (reference: string, orderId: string) => Promise<{ success: boolean; order?: any; error?: string }>;
  fetchClientSettings: () => Promise<void>;
  updateClientSettings: (data: Partial<StorefrontSettings>) => Promise<void>;
  clearError: () => void;
}

export const useStorefrontStore = create<StorefrontState>((set, get) => ({
  storeInfo: null,
  products: [],
  selectedProduct: null,
  cart: null,
  settings: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchStorefront: async (slug) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/v1/storefront/${slug}`);
      const d = res.data.data;
      set({
        storeInfo: d?.storefront || d?.store || d?.client || null,
        products: d?.products || [],
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.message || err.response?.data?.error || 'Store not found' : 'Store not found';
      set({ error: msg, isLoading: false });
    }
  },

  fetchStoreProducts: async (slug, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      const res = await api.get(`/api/v1/storefront/${slug}/products?${params.toString()}`);
      const d = res.data.data;
      set({
        products: d?.products || [],
        total: d?.pagination?.total || 0,
        totalPages: d?.pagination?.pages || 0,
        currentPage: d?.pagination?.page || 1,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.message || err.response?.data?.error || 'Failed to load products' : 'Failed to load products';
      set({ error: msg, isLoading: false });
    }
  },

  fetchProductDetails: async (slug, productSlug) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/v1/storefront/${slug}/products/${productSlug}`);
      set({ selectedProduct: res.data.data?.product || null, isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.message || err.response?.data?.error || 'Product not found' : 'Product not found';
      set({ error: msg, isLoading: false });
    }
  },

  fetchCart: async (slug, sessionId) => {
    try {
      const params = sessionId ? `?sessionId=${sessionId}` : '';
      const res = await api.get(`/api/v1/storefront/${slug}/cart${params}`);
      const cartData = res.data.data;
      
      if (cartData && cartData.items) {
        cartData.items = cartData.items.map((item: any) => ({
          ...item,
          product: {
            ...item.product,
            images: item.product.images || (item.product.image ? [{ url: item.product.image }] : [])
          }
        }));
      }
      
      set({ cart: cartData || null });
    } catch {
      set({ cart: { items: [], total: 0, storeSlug: slug } });
    }
  },

  refreshCart: async (slug: string) => {
    try {
      const res = await api.get(`/api/v1/storefront/${slug}/cart`);
      const cartData = res.data?.data;
      if (cartData && cartData.items) {
        cartData.items = cartData.items.map((item: any) => ({
          ...item,
          product: {
            ...item.product,
            images: item.product.images || (item.product.image ? [{ url: item.product.image }] : [])
          }
        }));
      }
      set({ cart: cartData || null });
    } catch (error) {
      console.error('Failed to refresh cart:', error);
    }
  },

  manageCart: async (slug, action, productId, quantity = 1) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await api.post(`/api/v1/storefront/${slug}/cart`, {
        productId,
        action,
        quantity: action === 'add' ? quantity : (action === 'update' ? quantity : undefined)
      });
      
      const updatedCart = response.data?.data;
      
      if (updatedCart) {
        if (updatedCart.items) {
          updatedCart.items = updatedCart.items.map((item: any) => ({
            ...item,
            product: {
              ...item.product,
              images: item.product.images || (item.product.image ? [{ url: item.product.image }] : [])
            }
          }));
        }
        set({ cart: updatedCart, isSubmitting: false });
      } else {
        await get().refreshCart(slug);
        set({ isSubmitting: false });
      }
    } catch (err) {
      const msg = err instanceof AxiosError 
        ? err.response?.data?.message || err.response?.data?.error || 'Cart operation failed' 
        : 'Cart operation failed';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  placeOrder: async (slug, orderData, retryCount = 0) => {
    set({ isSubmitting: true, error: null });
    try {
      const storefrontRes = await api.get(`/api/v1/storefront/${slug}`);
      const storefrontData = storefrontRes.data.data;
      
      let clientId;
      if (storefrontData?.storefront?.client) {
        clientId = storefrontData.storefront.client;
      } else if (storefrontData?.client?._id) {
        clientId = storefrontData.client._id;
      } else if (storefrontData?.client) {
        clientId = storefrontData.client;
      } else if (storefrontData?._id && storefrontData?.storeName) {
        clientId = storefrontData._id;
      } else {
        throw new Error('Store client not found');
      }

      const state = useStorefrontStore.getState();
      const cart = state.cart;
      
      if (!cart?.items?.length) {
        throw new Error('Cart is empty');
      }

      const products = cart.items.map((item: any) => ({
        productId: typeof item.product === 'string' ? item.product : item.product._id,
        quantity: item.quantity,
      }));
      
      const orderPayload = {
        clientId: clientId,
        customer: {
          name: orderData.customer?.name,
          phone: orderData.customer?.phone,
          email: orderData.customer?.email || `${orderData.customer?.phone?.replace(/\s/g, '')}@temp.com`,
          location: orderData.customer?.location,
        },
        products: products,
        shippingMethod: orderData.shippingMethod || 'standard',
        shippingAddress: orderData.shippingAddress || orderData.customer?.location,
        notes: orderData.notes || '',
      };

      console.log('Placing order with payload:', JSON.stringify(orderPayload, null, 2));

      const res = await api.post('/api/v1/orders', orderPayload);
      
      const orderDataToStore = {
        orderId: res.data.order._id,
        reference: res.data.payment?.reference,
        storeSlug: slug,
        timestamp: Date.now(),
      };
      sessionStorage.setItem('pendingOrder', JSON.stringify(orderDataToStore));
      
      await get().manageCart(slug, 'clear');
      
      set({ isSubmitting: false });
      
      return {
        order: res.data.order,
        paymentUrl: res.data.payment?.authorization_url,
        reference: res.data.payment?.reference,
      };
    } catch (err: any) {
      console.error('Place order error:', err.response?.data || err.message);
      
      if (err.response?.data?.error?.includes('Duplicate') && retryCount < 2) {
        console.log(`Retrying order (attempt ${retryCount + 1})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return get().placeOrder(slug, orderData, retryCount + 1);
      }
      
      let errorMessage = 'Failed to place order';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      set({ error: errorMessage, isSubmitting: false });
      throw new Error(errorMessage);
    }
  },

  verifyPayment: async (reference: string, orderId: string) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/api/v1/orders/verify-payment', { reference, orderId });
      
      if (res.data.success) {
        sessionStorage.removeItem('pendingOrder');
        set({ isLoading: false });
        return { success: true, order: res.data.order };
      } else {
        set({ isLoading: false });
        return { success: false, error: res.data.error };
      }
    } catch (err: any) {
      const msg = err instanceof AxiosError ? err.response?.data?.error : 'Payment verification failed';
      set({ isLoading: false });
      return { success: false, error: msg };
    }
  },

  fetchClientSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/client/storefront/settings');
      set({ settings: res.data.data || res.data.settings, isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load settings' : 'Failed to load settings';
      set({ error: msg, isLoading: false });
    }
  },

  updateClientSettings: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await api.put('/api/v1/client/storefront/settings', data);
      set({ settings: res.data.data || res.data.settings, isSubmitting: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to update settings' : 'Failed to update settings';
      set({ error: msg, isSubmitting: false });
      throw new Error(msg);
    }
  },

  clearError: () => set({ error: null }),
}));