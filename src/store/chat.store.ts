// store/chat.store.ts
import { create } from 'zustand';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/lib/api';

export interface ChatMessage {
  _id: string;
  sender: { _id: string; name: string; email: string; profileImage?: string } | string;
  text: string;
  content?: string; // For compatibility
  type?: 'text' | 'image' | 'file';
  attachments?: any[];
  readBy: Array<{ user: string; readAt: Date }>;
  createdAt: string;
  isDeleted?: boolean;
}

export interface ChatParticipant {
  user: { _id: string; name: string; email: string; role: string; storeName?: string } | string;
  userModel: 'User' | 'Client';
  userType?: string;
  lastReadAt?: Date;
  unreadCount?: number;
}

export interface Chat {
  _id: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  status: 'active' | 'closed';
  type?: 'support' | 'order' | 'general' | 'product';
  order?: { _id: string; orderId: string };
  product?: { _id: string; name: string };
  client?: { _id: string; storeName: string; storeSlug: string };
  metadata?: { 
    assignedTo?: string; 
    assignedAt?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    storeSlug?: string;
    initiatedBy?: string;
    isGuestChat?: boolean;
  };
  lastMessage?: ChatMessage;
  closedAt?: Date;
  closedBy?: string;
  closedReason?: string;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

export type ChatContext = 'general' | 'client' | 'admin' | 'store';

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  unreadCount: number;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  socket: Socket | null;
  isConnected: boolean;

  fetchChats: (context?: ChatContext, storeSlug?: string, status?: string) => Promise<void>;
  fetchChatById: (chatId: string, context?: ChatContext, storeSlug?: string) => Promise<void>;
  createChat: (data: { 
    participantId: string; 
    participantType?: string; 
    message?: string; 
    orderId?: string;
    productId?: string;
    clientId?: string;
    type?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  }, context?: ChatContext, storeSlug?: string) => Promise<Chat>;
  initiateStoreChat: (storeSlug: string, data: {
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    message?: string;
  }) => Promise<Chat>;
  sendMessage: (chatId: string, text: string, attachments?: any[], context?: ChatContext, storeSlug?: string) => Promise<void>;
  markAsRead: (chatId: string, context?: ChatContext, storeSlug?: string) => Promise<void>;
  closeChat: (chatId: string, reason?: string, context?: ChatContext, storeSlug?: string) => Promise<void>;
  fetchUnreadCount: (context?: ChatContext, storeSlug?: string) => Promise<void>;

  fetchSupportChats: () => Promise<void>;
  fetchAllChats: () => Promise<void>;
  assignChat: (chatId: string, agentId: string) => Promise<void>;

  connectSocket: (token: string) => void;
  disconnectSocket: () => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;

  clearError: () => void;
  setActiveChat: (chat: Chat | null) => void;
}

const prefix = (context: ChatContext = 'general', storeSlug?: string) => {
  switch (context) {
    case 'client': return '/api/v1/client/chats';
    case 'admin':  return '/api/v1/admin/chats';
    case 'store':  return `/api/v1/store/${storeSlug}/chats`;
    default:       return '/api/v1/chats';
  }
};

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  unreadCount: 0,
  isLoading: false,
  isSending: false,
  error: null,
  socket: null,
  isConnected: false,

  fetchChats: async (context = 'general', storeSlug, status = 'active') => {
    set({ isLoading: true, error: null });
    try {
      const url = `${prefix(context, storeSlug)}?status=${status}`;
      console.log('📡 Fetching chats:', url);
      
      const res = await api.get(url);
      
      let chats = [];
      if (res.data.data?.chats) {
        chats = res.data.data.chats;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        chats = res.data.data;
      } else if (Array.isArray(res.data.chats)) {
        chats = res.data.chats;
      }
      
      console.log('✅ Chats fetched:', chats.length);
      set({ chats, isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError 
        ? err.response?.data?.message || err.response?.data?.error || 'Failed to load chats'
        : 'Failed to load chats';
      console.error('❌ Fetch chats error:', msg);
      set({ error: msg, isLoading: false });
    }
  },

  fetchChatById: async (chatId, context = 'general', storeSlug) => {
    set({ isLoading: true, error: null });
    try {
      const url = `${prefix(context, storeSlug)}/${chatId}`;
      console.log('📡 Fetching chat:', url);
      
      const res = await api.get(url);
      
      let chat = null;
      if (res.data.data && res.data.data._id) {
        chat = res.data.data;
      } else if (res.data.data && res.data.data.chat) {
        chat = res.data.data.chat;
      } else if (res.data.chat) {
        chat = res.data.chat;
      }
      
      if (!chat) {
        throw new Error('Chat not found in response');
      }
      
      console.log('✅ Chat fetched:', chat._id);
      set({ activeChat: chat, isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError 
        ? err.response?.data?.message || err.response?.data?.error || 'Failed to load chat'
        : 'Failed to load chat';
      console.error('❌ Fetch chat error:', msg);
      set({ error: msg, isLoading: false });
    }
  },

  createChat: async (data, context = 'general', storeSlug) => {
    set({ isLoading: true, error: null });
    try {
      let endpoint: string;
      let response;
      
      // For store context without participantId (guest user), use initiate endpoint
      if (context === 'store' && !data.participantId) {
        console.log('📧 Using initiate endpoint for guest chat');
        endpoint = `/api/v1/store/${storeSlug}/chats/initiate`;
        
        const initiateData = {
          customerName: data.customerName || 'Guest',
          customerEmail: data.customerEmail || '',
          customerPhone: data.customerPhone || 'Not provided',
          message: data.message || '',
        };
        
        console.log('📧 Initiate data:', initiateData);
        response = await api.post(endpoint, initiateData);
      } else {
        // Use regular chat creation for authenticated users
        endpoint = context === 'store' 
          ? `/api/v1/store/${storeSlug}/chats` 
          : prefix(context, storeSlug);
        
        const backendData: any = {
          participantId: data.participantId,
          participantType: data.participantType || (context === 'client' ? 'client' : 'user'),
        };
        
        if (data.message) {
          backendData.initialMessage = data.message;
        }
        
        if (data.orderId) backendData.orderId = data.orderId;
        if (data.productId) backendData.productId = data.productId;
        if (data.clientId) backendData.clientId = data.clientId;
        if (data.type) backendData.type = data.type;
        
        console.log('📧 Creating chat with data:', backendData);
        console.log('📧 Endpoint:', endpoint);
        
        response = await api.post(endpoint, backendData);
      }
      
      console.log('📨 Response:', response.data);
      
      // Handle response
      let newChat = null;
      if (response.data.data && response.data.data._id) {
        newChat = response.data.data;
      } else if (response.data.data && response.data.data.chat) {
        newChat = response.data.data.chat;
      } else if (response.data.chat && response.data.chat._id) {
        newChat = response.data.chat;
      } else if (response.data._id) {
        newChat = response.data;
      }
      
      if (!newChat) {
        throw new Error('Invalid response structure: ' + JSON.stringify(response.data));
      }
      
      console.log('✅ Chat created:', newChat._id);
      
      set((state) => ({ 
        chats: [newChat, ...state.chats], 
        activeChat: newChat, 
        isLoading: false 
      }));
      return newChat;
    } catch (err) {
      const msg = err instanceof AxiosError 
        ? err.response?.data?.message || err.response?.data?.error || 'Failed to create chat'
        : 'Failed to create chat';
      console.error('❌ Create chat error:', msg);
      console.error('Full error:', err);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  initiateStoreChat: async (storeSlug, data) => {
    set({ isLoading: true, error: null });
    try {
      // FIXED: Use '/chats/initiate' with the 's'
      const endpoint = `/api/v1/store/${storeSlug}/chats/initiate`;
      console.log('📧 Initiating store chat:', endpoint, data);
      
      const res = await api.post(endpoint, {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        message: data.message,
      });
      
      console.log('📨 Response:', res.data);
      
      let newChat = null;
      if (res.data.data && res.data.data._id) {
        newChat = res.data.data;
      } else if (res.data.data && res.data.data.chat) {
        newChat = res.data.data.chat;
      } else if (res.data.chat) {
        newChat = res.data.chat;
      }
      
      if (!newChat) {
        throw new Error('Invalid response structure');
      }
      
      console.log('✅ Store chat initiated:', newChat._id);
      
      // Store guest token if provided
      if (res.data.data?.guestToken) {
        localStorage.setItem(`guest_chat_token_${storeSlug}`, res.data.data.guestToken);
      }
      
      set({ activeChat: newChat, isLoading: false });
      return newChat;
    } catch (err) {
      const msg = err instanceof AxiosError 
        ? err.response?.data?.message || err.response?.data?.error || 'Failed to initiate chat'
        : 'Failed to initiate chat';
      console.error('❌ Initiate store chat error:', msg);
      console.error('Full error:', err);
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  sendMessage: async (chatId, text, attachments = [], context = 'general', storeSlug) => {
    set({ isSending: true, error: null });
    try {
      const endpoint = `${prefix(context, storeSlug)}/${chatId}/messages`;
      console.log('📤 Sending message:', { chatId, text });
      
      const res = await api.post(endpoint, { text, attachments });
      
      let message = null;
      if (res.data.data && res.data.data._id) {
        message = res.data.data;
      } else if (res.data.message) {
        message = res.data.message;
      }
      
      if (!message) {
        throw new Error('Invalid response structure');
      }
      
      set((state) => {
        const updatedChats = state.chats.map((c) => {
          if (c._id === chatId) {
            return { 
              ...c, 
              messages: [...(c.messages || []), message],
              lastMessage: message,
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        });
        
        const updatedActive = state.activeChat?._id === chatId
          ? { ...state.activeChat, messages: [...(state.activeChat.messages || []), message] }
          : state.activeChat;
        
        return { chats: updatedChats, activeChat: updatedActive, isSending: false };
      });
    } catch (err) {
      const msg = err instanceof AxiosError 
        ? err.response?.data?.message || err.response?.data?.error || 'Failed to send message'
        : 'Failed to send message';
      console.error('❌ Send message error:', msg);
      set({ error: msg, isSending: false });
      throw new Error(msg);
    }
  },

  markAsRead: async (chatId, context = 'general', storeSlug) => {
    try {
      const endpoint = `${prefix(context, storeSlug)}/${chatId}/read`;
      await api.put(endpoint);
      
      set((state) => ({
        chats: state.chats.map((c) =>
          c._id === chatId
            ? { ...c, participants: c.participants.map((p) => ({ ...p, unreadCount: 0 })) }
            : c
        ),
      }));
    } catch (err) {
      console.error('❌ Mark as read error:', err);
    }
  },

  closeChat: async (chatId, reason, context = 'general', storeSlug) => {
    try {
      const endpoint = `${prefix(context, storeSlug)}/${chatId}/close`;
      await api.put(endpoint, { reason });
      
      set((state) => ({
        chats: state.chats.map((c) => (c._id === chatId ? { ...c, status: 'closed' } : c)),
        activeChat: state.activeChat?._id === chatId ? { ...state.activeChat, status: 'closed' } : state.activeChat,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError 
        ? err.response?.data?.message || err.response?.data?.error || 'Failed to close chat'
        : 'Failed to close chat';
      console.error('❌ Close chat error:', msg);
      set({ error: msg });
    }
  },

  fetchUnreadCount: async (context = 'general', storeSlug) => {
    try {
      const endpoint = `${prefix(context, storeSlug)}/unread`;
      const res = await api.get(endpoint);
      
      let count = 0;
      if (res.data.data?.unreadCount !== undefined) {
        count = res.data.data.unreadCount;
      } else if (res.data.count !== undefined) {
        count = res.data.count;
      }
      
      set({ unreadCount: count });
    } catch (err) {
      console.error('❌ Fetch unread count error:', err);
    }
  },

  fetchSupportChats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/admin/chats/support');
      
      let chats = [];
      if (res.data.data?.chats) {
        chats = res.data.data.chats;
      } else if (Array.isArray(res.data.chats)) {
        chats = res.data.chats;
      }
      
      set({ chats, isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError 
        ? err.response?.data?.message || err.response?.data?.error || 'Failed to load support chats'
        : 'Failed to load support chats';
      console.error('❌ Fetch support chats error:', msg);
      set({ error: msg, isLoading: false });
    }
  },

  fetchAllChats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/admin/chats/all');
      
      let chats = [];
      if (res.data.data?.chats) {
        chats = res.data.data.chats;
      } else if (Array.isArray(res.data.chats)) {
        chats = res.data.chats;
      }
      
      set({ chats, isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError 
        ? err.response?.data?.message || err.response?.data?.error || 'Failed to load all chats'
        : 'Failed to load all chats';
      console.error('❌ Fetch all chats error:', msg);
      set({ error: msg, isLoading: false });
    }
  },

  assignChat: async (chatId, agentId) => {
    try {
      await api.put(`/api/v1/admin/chats/${chatId}/assign`, { agentId });
      console.log('✅ Chat assigned:', chatId);
    } catch (err) {
      const msg = err instanceof AxiosError 
        ? err.response?.data?.message || err.response?.data?.error || 'Failed to assign chat'
        : 'Failed to assign chat';
      console.error('❌ Assign chat error:', msg);
      set({ error: msg });
    }
  },

  connectSocket: (token) => {
    const existing = get().socket;
    if (existing?.connected) return;

    const serverUrl = API_URL.replace('/api/v1', '');
    console.log('🔌 Connecting to socket server:', serverUrl);

    const socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected');
      set({ isConnected: true });
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      set({ isConnected: false });
    });

    socket.on('new_message', (data: { chatId: string; message: ChatMessage }) => {
      console.log('📨 New message received:', data);
      set((state) => {
        const updatedChats = state.chats.map((c) => {
          if (c._id === data.chatId) {
            return { 
              ...c, 
              messages: [...(c.messages || []), data.message], 
              lastMessage: data.message,
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        });
        
        const updatedActive = state.activeChat?._id === data.chatId
          ? { ...state.activeChat, messages: [...(state.activeChat.messages || []), data.message] }
          : state.activeChat;
          
        return { chats: updatedChats, activeChat: updatedActive };
      });
    });

    socket.on('chat_closed', (data: { chatId: string; closedBy: string; reason?: string }) => {
      console.log('🔒 Chat closed:', data);
      set((state) => ({
        chats: state.chats.map((c) => c._id === data.chatId ? { ...c, status: 'closed' } : c),
        activeChat: state.activeChat?._id === data.chatId ? { ...state.activeChat, status: 'closed' } : state.activeChat,
      }));
    });

    socket.on('messages_read', (data: { chatId: string; userId: string; readAt: Date }) => {
      console.log('👀 Messages read:', data);
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      console.log('🔌 Disconnecting socket');
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  joinChat: (chatId) => {
    console.log('🚪 Joining chat room:', chatId);
    get().socket?.emit('join_chat', chatId);
  },
  
  leaveChat: (chatId) => {
    console.log('🚪 Leaving chat room:', chatId);
    get().socket?.emit('leave_chat', chatId);
  },

  clearError: () => set({ error: null }),
  setActiveChat: (chat) => set({ activeChat: chat }),
}));