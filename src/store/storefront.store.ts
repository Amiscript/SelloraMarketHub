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

// In your storefront.store.ts, replace these three functions:

fetchCart: async (slug: string) => {
  try {
    const response = await api.get(`/api/v1/storefront/${slug}/cart`);
    const cartData = response.data.data;
    
    if (cartData && cartData.items) {
      cartData.items = cartData.items.map((item: any) => ({
        ...item,
        product: {
          ...item.product,
          images: item.product?.images || (item.image ? [{ url: item.image }] : []),
          stock: item.product?.stock ?? 99
        }
      }));
    }
    
    set({ cart: cartData || { items: [], total: 0, storeSlug: slug } });
    return cartData;
  } catch (error) {
    console.error('Fetch cart error:', error);
    set({ cart: { items: [], total: 0, storeSlug: slug } });
    return null;
  }
},

refreshCart: async (slug: string) => {
  try {
    const response = await api.get(`/api/v1/storefront/${slug}/cart`);
    const cartData = response.data?.data;
    if (cartData && cartData.items) {
      cartData.items = cartData.items.map((item: any) => ({
        ...item,
        product: {
          ...item.product,
          images: item.product?.images || (item.image ? [{ url: item.image }] : []),
          stock: item.product?.stock ?? 99
        }
      }));
    }
    set({ cart: cartData || null });
    return cartData;
  } catch (error) {
    console.error('Failed to refresh cart:', error);
    return null;
  }
},

manageCart: async (slug: string, action: string, productId?: string, quantity: number = 1) => {
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
            images: item.product?.images || (item.image ? [{ url: item.image }] : []),
            stock: item.product?.stock ?? 99
          }
        }));
      }
      set({ cart: updatedCart, isSubmitting: false });
    } else {
      await get().refreshCart(slug);
      set({ isSubmitting: false });
    }
    
    return updatedCart;
  } catch (err) {
    const msg = err instanceof AxiosError 
      ? err.response?.data?.message || err.response?.data?.error || 'Cart operation failed' 
      : 'Cart operation failed';
    set({ error: msg, isSubmitting: false });
    throw new Error(msg);
  }
},

 // store/storefront.store.ts - Updated placeOrder function

placeOrder: async (slug, orderData, retryCount = 0) => {
  set({ isSubmitting: true, error: null });
  try {
    // First, get the store client ID
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

    // Format products correctly - ensure each product has required fields
    const products = cart.items.map((item: any) => {
      const productId = typeof item.product === 'string' ? item.product : item.product._id;
      if (!productId) {
        throw new Error(`Product ID missing for ${item.product.name}`);
      }
      if (!item.quantity || item.quantity < 1) {
        throw new Error(`Invalid quantity for ${item.product.name}`);
      }
      return {
        productId: productId,
        quantity: Number(item.quantity),
      };
    });

    // Ensure customer email is provided (required by backend)
    const customerEmail = orderData.customer?.email?.trim();
    const customerPhone = orderData.customer?.phone?.trim();
    
    // Backend requires email - generate from phone if not provided
    let finalEmail = customerEmail;
    if (!finalEmail && customerPhone) {
      // Remove spaces and special characters for email generation
      const cleanPhone = customerPhone.replace(/[\s\+\(\)\-]/g, '');
      finalEmail = `${cleanPhone}@temp.com`;
    }
    if (!finalEmail) {
      finalEmail = `customer${Date.now()}@temp.com`;
    }

    const orderPayload = {
      clientId: clientId,
      customer: {
        name: orderData.customer?.name?.trim() || '',
        phone: customerPhone || '',
        email: finalEmail,
        location: orderData.customer?.location?.trim() || '',
      },
      products: products,
      shippingMethod: orderData.shippingMethod || 'standard',
      shippingAddress: orderData.shippingAddress?.trim() || orderData.customer?.location?.trim() || '',
      notes: orderData.notes || '',
    };

    // Validate required fields before sending
    const validationErrors = [];
    if (!orderPayload.clientId) validationErrors.push('clientId is required');
    if (!orderPayload.customer.name) validationErrors.push('customer name is required');
    if (!orderPayload.customer.phone) validationErrors.push('customer phone is required');
    if (!orderPayload.customer.location) validationErrors.push('customer location is required');
    if (!orderPayload.products || orderPayload.products.length === 0) validationErrors.push('products are required');
    
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    console.log('Placing order with payload:', JSON.stringify(orderPayload, null, 2));

    const res = await api.post('/api/v1/orders', orderPayload);
    
    const orderDataToStore = {
      orderId: res.data.order._id,
      reference: res.data.payment?.reference,
      storeSlug: slug,
      timestamp: Date.now(),
    };
    sessionStorage.setItem('pendingOrder', JSON.stringify(orderDataToStore));
    
    // Clear cart after successful order
    await get().manageCart(slug, 'clear');
    
    set({ isSubmitting: false });
    
    return {
      order: res.data.order,
      paymentUrl: res.data.payment?.authorization_url,
      reference: res.data.payment?.reference,
    };
  } catch (err: any) {
    console.error('Place order error:', err.response?.data || err.message);
    
    // Handle duplicate order error with retry
    if (err.response?.data?.error?.includes('Duplicate') && retryCount < 2) {
      console.log(`Retrying order (attempt ${retryCount + 1})...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return get().placeOrder(slug, orderData, retryCount + 1);
    }
    
    let errorMessage = 'Failed to place order';
    if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
      // If there are details, include them
      if (err.response.data.details) {
        errorMessage += `: ${err.response.data.details.join(', ')}`;
      }
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