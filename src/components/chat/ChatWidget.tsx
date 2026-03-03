import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2, Paperclip, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "user" | "support" | "admin" | "client";
  senderName?: string;
  read: boolean;
  timestamp: Date;
}

interface ChatWidgetProps {
  type?: "admin" | "client" | "store";
  storeName?: string;
}

// Dummy data for different chat types
const DUMMY_DATA = {
  admin: {
    title: "Admin Support",
    gradient: "from-purple-600 to-pink-600",
    initialMessages: [
      {
        id: "1",
        text: "Welcome to Admin Support. How can I help you manage the platform?",
        sender: "support",
        senderName: "System Admin",
        read: true,
        timestamp: new Date(),
      },
      {
        id: "2",
        text: "I need help with a client's verification",
        sender: "user",
        senderName: "Admin User",
        read: true,
        timestamp: new Date(Date.now() - 5 * 60000),
      },
      {
        id: "3",
        text: "I can help with that. Which client is it?",
        sender: "support",
        senderName: "System Admin",
        read: true,
        timestamp: new Date(Date.now() - 3 * 60000),
      },
    ],
  },
  client: {
    title: "Client Support",
    gradient: "from-violet-600 to-indigo-600",
    initialMessages: [
      {
        id: "1",
        text: "Welcome to Client Support! How can we help with your store today?",
        sender: "support",
        senderName: "Support Agent",
        read: true,
        timestamp: new Date(),
      },
      {
        id: "2",
        text: "I have a question about my commission rate",
        sender: "user",
        senderName: "Store Owner",
        read: true,
        timestamp: new Date(Date.now() - 10 * 60000),
      },
      {
        id: "3",
        text: "I'd be happy to explain our commission structure. What would you like to know?",
        sender: "support",
        senderName: "Support Agent",
        read: true,
        timestamp: new Date(Date.now() - 8 * 60000),
      },
    ],
  },
  store: {
    title: "Store Support",
    gradient: "from-green-600 to-emerald-600",
    initialMessages: [
      {
        id: "1",
        text: "Hi! Welcome to our store. How can we help you today?",
        sender: "support",
        senderName: "Store Representative",
        read: true,
        timestamp: new Date(),
      },
    ],
  },
};

export default function ChatWidget({ type = "client", storeName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(type === "store");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [unreadCount, setUnreadCount] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize messages based on type
  useEffect(() => {
    if (type === "store" && !showCustomerForm) {
      setMessages(DUMMY_DATA.store.initialMessages as Message[]);
    } else if (type !== "store") {
      setMessages(DUMMY_DATA[type].initialMessages as Message[]);
    }
  }, [type, showCustomerForm]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      read: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate support response
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getAutoResponse(type, inputValue),
        sender: "support",
        senderName: getSupportName(type),
        read: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, supportMessage]);
    }, 1000);
  };

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.phone) return;

    // Add welcome message from customer
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: inputValue || `Hello! I'm ${customerInfo.name} and I'd like to chat about your products.`,
      sender: "user",
      senderName: customerInfo.name,
      read: true,
      timestamp: new Date(),
    };

    setMessages([DUMMY_DATA.store.initialMessages[0] as Message, welcomeMessage]);
    setShowCustomerForm(false);
    setInputValue("");

    // Simulate store response
    setTimeout(() => {
      const storeResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `Thanks for reaching out ${customerInfo.name}! A representative will be with you shortly.`,
        sender: "support",
        senderName: storeName || "Store Representative",
        read: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, storeResponse]);
    }, 1500);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
    // Simulate file upload
    setTimeout(() => {
      const fileMessage: Message = {
        id: Date.now().toString(),
        text: "📎 File attached",
        sender: "user",
        read: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fileMessage]);
    }, 500);
  };

  const getAutoResponse = (type: string, userMessage: string): string => {
    const responses = {
      admin: "I've noted your admin request. Our team will look into this immediately.",
      client: "Thanks for your message. A support agent will get back to you shortly.",
      store: "Thank you for your interest! One of our staff will assist you soon.",
    };
    return responses[type as keyof typeof responses] || responses.client;
  };

  const getSupportName = (type: string): string => {
    const names = {
      admin: "Admin Support",
      client: "Support Agent",
      store: storeName || "Store Staff",
    };
    return names[type as keyof typeof names] || "Support";
  };

  const getHeaderTitle = () => {
    if (type === "store" && storeName) return storeName;
    return DUMMY_DATA[type]?.title || "Support Chat";
  };

  const getHeaderGradient = () => {
    return DUMMY_DATA[type]?.gradient || "from-violet-600 to-indigo-600";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMessageStatusIcon = (msg: Message) => {
    if (msg.sender === "user") {
      if (msg.read) {
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      }
      return <Check className="w-3 h-3 text-gray-400" />;
    }
    return null;
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br ${getHeaderGradient()} rounded-full shadow-2xl shadow-violet-600/40 flex items-center justify-center text-white z-50 hover:shadow-violet-600/60 transition-shadow`}
          >
            <MessageCircle className="w-7 h-7" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-pulse text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed bottom-6 right-6 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${getHeaderGradient()} p-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    {getHeaderTitle()}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white/80 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Customer Info Form (for store only) */}
            {showCustomerForm && type === "store" ? (
              <form onSubmit={handleStartChat} className="p-4 space-y-4 flex-1 overflow-y-auto">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MessageCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold">Chat with {storeName || "our store"}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Please provide your details to start chatting
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Your name"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <Input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="+1234567890"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Message (Optional)</label>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="How can we help you?"
                    className="w-full"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Start Chat
                </Button>

                <p className="text-xs text-center text-gray-400 mt-2">
                  By starting a chat, you agree to our Terms of Service
                </p>
              </form>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="max-w-[75%]">
                        {msg.sender !== "user" && (
                          <p className="text-xs text-gray-500 mb-1 ml-2">
                            {msg.senderName || "Support"}
                          </p>
                        )}
                        <div
                          className={`${
                            msg.sender === "user"
                              ? `bg-gradient-to-r ${getHeaderGradient()} text-white`
                              : "bg-white border border-slate-200 text-slate-800"
                          } rounded-2xl px-4 py-2.5 shadow-sm`}
                        >
                          <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                            msg.sender === "user" ? "text-white/70" : "text-slate-400"
                          }`}>
                            <span>{formatTime(msg.timestamp)}</span>
                            {getMessageStatusIcon(msg)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 h-11 rounded-xl border-slate-200 focus:border-violet-400 focus:ring-violet-400/20"
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={handleFileUpload}
                      className="h-11 w-11 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 border-0"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      multiple 
                      onChange={() => {
                        // Simulate file attachment
                        setTimeout(() => {
                          const fileMessage: Message = {
                            id: Date.now().toString(),
                            text: "📎 File attached",
                            sender: "user",
                            read: false,
                            timestamp: new Date(),
                          };
                          setMessages((prev) => [...prev, fileMessage]);
                        }, 500);
                      }}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!inputValue.trim()}
                      className={`h-11 w-11 rounded-xl bg-gradient-to-r ${getHeaderGradient()} hover:opacity-90 border-0 shadow-lg`}
                    >
                      <Send className="w-4 h-4" />
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