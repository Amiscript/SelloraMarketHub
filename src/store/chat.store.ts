import { create } from 'zustand';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/lib/api';

export interface ChatMessage {
  _id: string;
  sender: { _id: string; name: string; email: string; profileImage?: string } | string;
  content: string;
  type: 'text' | 'image' | 'file';
  readBy: string[];
  createdAt: string;
}

export interface ChatParticipant {
  user: { _id: string; name: string; email: string; role: string; storeName?: string } | string;
  userModel: 'User' | 'Client';
  unreadCount: number;
}

export interface Chat {
  _id: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  status: 'active' | 'closed';
  type?: 'support' | 'order' | 'store';
  order?: { _id: string; orderId: string };
  product?: { _id: string; name: string };
  client?: { storeName: string; storeSlug: string };
  lastMessage?: ChatMessage;
  metadata?: { assignedTo?: string; assignedAt?: string };
  createdAt: string;
  updatedAt: string;
}

// Context determines which API prefix is used
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

  // REST actions — prefix determines route
  fetchChats: (context?: ChatContext, storeSlug?: string) => Promise<void>;
  fetchChatById: (chatId: string, context?: ChatContext) => Promise<void>;
  createChat: (data: { participantId: string; participantModel?: string; message?: string; orderId?: string }, context?: ChatContext, storeSlug?: string) => Promise<Chat>;
  sendMessage: (chatId: string, content: string, type?: string, context?: ChatContext) => Promise<void>;
  markAsRead: (chatId: string, context?: ChatContext) => Promise<void>;
  closeChat: (chatId: string, context?: ChatContext) => Promise<void>;
  fetchUnreadCount: (context?: ChatContext) => Promise<void>;

  // Admin extras
  fetchSupportChats: () => Promise<void>;
  fetchAllChats: () => Promise<void>;
  assignChat: (chatId: string, agentId: string) => Promise<void>;

  // Socket actions
  connectSocket: (token: string) => void;
  disconnectSocket: () => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;

  clearError: () => void;
  setActiveChat: (chat: Chat | null) => void;
}

// Build the API prefix for a given context
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

  fetchChats: async (context = 'general', storeSlug) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`${prefix(context, storeSlug)}`);
      set({ chats: res.data.chats || [], isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load chats' : 'Failed to load chats';
      set({ error: msg, isLoading: false });
    }
  },

  fetchChatById: async (chatId, context = 'general') => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`${prefix(context)}/${chatId}`);
      set({ activeChat: res.data.chat, isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load chat' : 'Failed to load chat';
      set({ error: msg, isLoading: false });
    }
  },

  createChat: async (data, context = 'general', storeSlug) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post(`${prefix(context, storeSlug)}`, data);
      const newChat: Chat = res.data.chat;
      set((state) => ({ chats: [newChat, ...state.chats], activeChat: newChat, isLoading: false }));
      return newChat;
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to create chat' : 'Failed to create chat';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  sendMessage: async (chatId, content, type = 'text', context = 'general') => {
    set({ isSending: true, error: null });
    try {
      const res = await api.post(`${prefix(context)}/${chatId}/messages`, { content, type });
      const updatedChat: Chat = res.data.chat;
      set((state) => ({
        chats: state.chats.map((c) => (c._id === chatId ? updatedChat : c)),
        activeChat: state.activeChat?._id === chatId ? updatedChat : state.activeChat,
        isSending: false,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to send message' : 'Failed to send message';
      set({ error: msg, isSending: false });
      throw new Error(msg);
    }
  },

  markAsRead: async (chatId, context = 'general') => {
    try {
      await api.put(`${prefix(context)}/${chatId}/read`);
      set((state) => ({
        chats: state.chats.map((c) =>
          c._id === chatId
            ? { ...c, participants: c.participants.map((p) => ({ ...p, unreadCount: 0 })) }
            : c
        ),
      }));
    } catch { /* best effort */ }
  },

  closeChat: async (chatId, context = 'general') => {
    try {
      await api.put(`${prefix(context)}/${chatId}/close`);
      set((state) => ({
        chats: state.chats.map((c) => (c._id === chatId ? { ...c, status: 'closed' } : c)),
        activeChat: state.activeChat?._id === chatId ? { ...state.activeChat, status: 'closed' } : state.activeChat,
      }));
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to close chat' : 'Failed to close chat';
      set({ error: msg });
    }
  },

  fetchUnreadCount: async (context = 'general') => {
    try {
      const res = await api.get(`${prefix(context)}/unread`);
      set({ unreadCount: res.data.count || 0 });
    } catch { /* optional */ }
  },

  fetchSupportChats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/admin/chats/support');
      set({ chats: res.data.chats || [], isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load support chats' : 'Failed to load support chats';
      set({ error: msg, isLoading: false });
    }
  },

  fetchAllChats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/admin/chats/all');
      set({ chats: res.data.chats || [], isLoading: false });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to load all chats' : 'Failed to load all chats';
      set({ error: msg, isLoading: false });
    }
  },

  assignChat: async (chatId, agentId) => {
    try {
      await api.put(`/api/v1/admin/chats/${chatId}/assign`, { agentId });
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.error || 'Failed to assign chat' : 'Failed to assign chat';
      set({ error: msg });
    }
  },

  // ── Socket ──────────────────────────────────────────────────────────────

  connectSocket: (token) => {
    const existing = get().socket;
    if (existing?.connected) return;

    // API_URL includes /api/v1 — socket connects to the base server URL
    const serverUrl = API_URL.replace('/api/v1', '');

    const socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => set({ isConnected: true }));
    socket.on('disconnect', () => set({ isConnected: false }));

    socket.on('new_message', (data: { chatId: string; message: ChatMessage }) => {
      set((state) => {
        const updatedChats = state.chats.map((c) => {
          if (c._id === data.chatId) {
            return { ...c, messages: [...(c.messages || []), data.message], lastMessage: data.message };
          }
          return c;
        });
        const updatedActive = state.activeChat?._id === data.chatId
          ? { ...state.activeChat, messages: [...(state.activeChat.messages || []), data.message] }
          : state.activeChat;
        return { chats: updatedChats, activeChat: updatedActive };
      });
    });

    socket.on('chat_closed', (data: { chatId: string }) => {
      set((state) => ({
        chats: state.chats.map((c) => c._id === data.chatId ? { ...c, status: 'closed' } : c),
      }));
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  joinChat: (chatId) => { get().socket?.emit('join_chat', chatId); },
  leaveChat: (chatId) => { get().socket?.emit('leave_chat', chatId); },

  clearError: () => set({ error: null }),
  setActiveChat: (chat) => set({ activeChat: chat }),
}));
