import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2, Loader2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore, ChatContext, ChatMessage } from "@/store/chat.store";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/components/ui/use-toast";

interface ChatWidgetProps {
  type?: "admin" | "client" | "store";
  storeName?: string;
  storeSlug?: string;
}

const contextMap: Record<string, ChatContext> = {
  admin: "admin",
  client: "client",
  store: "store",
};

const gradientMap: Record<string, string> = {
  admin: "from-purple-600 to-pink-600",
  client: "from-violet-600 to-indigo-600",
  store: "from-green-600 to-emerald-600",
};

const titleMap: Record<string, string> = {
  admin: "Admin Support",
  client: "Client Support",
  store: "Store Chat",
};

function getSenderName(msg: ChatMessage, currentUserId?: string): string {
  if (typeof msg.sender === "string") return "Support";
  return msg.sender._id === currentUserId ? "You" : msg.sender.name || "Support";
}

function isOwnMessage(msg: ChatMessage, currentUserId?: string): boolean {
  if (typeof msg.sender === "string") return msg.sender === currentUserId;
  return msg.sender._id === currentUserId;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export default function ChatWidget({ type = "client", storeName, storeSlug }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [guestForm, setGuestForm] = useState({ name: "", email: "", phone: "" });
  const [showGuestForm, setShowGuestForm] = useState(type === "store");
  const [isStartingChat, setIsStartingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    chats, activeChat, isLoading, isSending, error, isConnected, unreadCount,
    fetchChats, fetchChatById, createChat, initiateStoreChat, sendMessage, markAsRead,
    connectSocket, disconnectSocket, joinChat, leaveChat, fetchUnreadCount, clearError,
  } = useChatStore();

  const { user, token } = useAuthStore();
  const context = contextMap[type] || "general";
  const gradient = gradientMap[type] || gradientMap.client;
  const title = type === "store" && storeName ? storeName : titleMap[type] || "Support";
const { toast } = useToast();
  // Connect socket + fetch chats for authenticated users
  useEffect(() => {
    if (token && type !== "store") {
      connectSocket(token);
      fetchChats(context as ChatContext);
      fetchUnreadCount(context as ChatContext);
    }
    return () => { if (token && type !== "store") disconnectSocket(); };
  }, [token, type]);

  // Join first chat when widget opens
  useEffect(() => {
    if (!isOpen || type === "store") return;
    if (chats.length > 0 && !activeChatId) {
      const first = chats[0];
      setActiveChatId(first._id);
      fetchChatById(first._id, context as ChatContext);
      joinChat(first._id);
      markAsRead(first._id, context as ChatContext);
    }
  }, [isOpen, chats]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const handleClose = () => {
    if (activeChatId) leaveChat(activeChatId);
    setIsOpen(false);
  };

  const handleOpen = async () => {
    setIsOpen(true);
    if (chats.length === 0 && token && type !== "store") {
      try {
        const newChat = await createChat(
          { participantId: "support", participantType: "admin", message: "Hello, I need help." },
          context as ChatContext
        );
        setActiveChatId(newChat._id);
        joinChat(newChat._id);
      } catch { /* handled by store */ }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeChatId) return;
    try {
      await sendMessage(activeChatId, inputValue.trim(), [], context as ChatContext);
      setInputValue("");
    } catch { /* error shown inline */ }
  };

  // FIXED: Use initiateStoreChat for guest users
  const handleGuestStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestForm.name || !guestForm.phone) {
      toast({
        title: "Required Fields",
        description: "Name and phone are required to start a chat",
        variant: "destructive",
      });
      return;
    }
    
    setIsStartingChat(true);
    
    try {
      // Use the dedicated initiateStoreChat method
      const newChat = await initiateStoreChat(storeSlug || "store", {
        customerName: guestForm.name,
        customerEmail: guestForm.email || "",
        customerPhone: guestForm.phone,
        message: inputValue || `Hi! I'm ${guestForm.name}. I need assistance with your store.`,
      });
      
      setActiveChatId(newChat._id);
      joinChat(newChat._id);
      setShowGuestForm(false);
      setInputValue("");
      
      toast({
        title: "Chat Started",
        description: "You can now chat with the store owner",
      });
    } catch (error: any) {
      console.error("Failed to start chat:", error);
      toast({
        title: "Error",
        description: error.message || "Unable to start chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsStartingChat(false);
    }
  };

  const messages = activeChat?.messages || [];
  const currentUserId = user?._id;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br ${gradient} rounded-full shadow-2xl flex items-center justify-center text-white z-50`}
          >
            <MessageCircle className="w-7 h-7" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-xs flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }} transition={{ type: "spring", duration: 0.5 }}
            className="fixed bottom-6 right-6 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${gradient} p-4 flex items-center justify-between shrink-0`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{title}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isConnected || type === "store" ? "bg-green-400 animate-pulse" : "bg-gray-300"}`} />
                    <span className="text-white/80 text-xs">{isConnected || type === "store" ? "Online" : "Connecting…"}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={handleClose} className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button onClick={handleClose} className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Guest form — store only */}
            {type === "store" && showGuestForm ? (
              <form onSubmit={handleGuestStart} className="p-4 space-y-3 flex-1 overflow-y-auto">
                <div className="text-center mb-2">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MessageCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-sm">Chat with {storeName || "us"}</h4>
                  <p className="text-xs text-gray-500 mt-1">Fill in your details to start</p>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Name *</label>
                  <Input 
                    value={guestForm.name} 
                    onChange={e => setGuestForm(f => ({ ...f, name: e.target.value }))} 
                    placeholder="Your name" 
                    required 
                    disabled={isStartingChat}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Phone *</label>
                  <Input 
                    value={guestForm.phone} 
                    onChange={e => setGuestForm(f => ({ ...f, phone: e.target.value }))} 
                    placeholder="+234..." 
                    required 
                    disabled={isStartingChat}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Email</label>
                  <Input 
                    type="email" 
                    value={guestForm.email} 
                    onChange={e => setGuestForm(f => ({ ...f, email: e.target.value }))} 
                    placeholder="you@example.com" 
                    disabled={isStartingChat}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Message (optional)</label>
                  <Input 
                    value={inputValue} 
                    onChange={e => setInputValue(e.target.value)} 
                    placeholder="How can we help?" 
                    disabled={isStartingChat}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isStartingChat}
                  className={`w-full bg-gradient-to-r ${gradient} text-white border-0`}
                >
                  {isStartingChat ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Chat...
                    </>
                  ) : (
                    "Start Chat"
                  )}
                </Button>
                <p className="text-[10px] text-center text-gray-400">By starting a chat, you agree to our Terms</p>
              </form>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                  {isLoading && messages.length === 0 && (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {!isLoading && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <MessageCircle className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-sm font-medium">No messages yet</p>
                      <p className="text-xs mt-1">Send a message to get started</p>
                    </div>
                  )}
                  {messages.map((msg) => {
                    const own = isOwnMessage(msg, currentUserId);
                    // Handle both 'content' and 'text' field names
                    const messageContent = (msg as any).content || msg.text || '';
                    return (
                      <motion.div key={msg._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${own ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-[75%]">
                          {!own && <p className="text-xs text-gray-500 mb-1 ml-2">{getSenderName(msg, currentUserId)}</p>}
                          <div className={`rounded-2xl px-3.5 py-2.5 shadow-sm ${own ? `bg-gradient-to-r ${gradient} text-white` : "bg-white border border-slate-200 text-slate-800"}`}>
                            <p className="text-sm leading-relaxed break-words">{messageContent}</p>
                            <p className={`text-[10px] mt-0.5 text-right ${own ? "text-white/60" : "text-slate-400"}`}>{formatTime(msg.createdAt)}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
                      <WifiOff className="w-3.5 h-3.5 shrink-0" />
                      <span>{error}</span>
                      <button className="ml-auto underline" onClick={clearError}>dismiss</button>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 shrink-0">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue} onChange={e => setInputValue(e.target.value)}
                      placeholder="Type a message…" className="flex-1 h-10 rounded-xl text-sm" disabled={isSending}
                    />
                    <Button type="submit" size="icon" disabled={!inputValue.trim() || isSending}
                      className={`h-10 w-10 rounded-xl bg-gradient-to-r ${gradient} border-0 shrink-0`}>
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}