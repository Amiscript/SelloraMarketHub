import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ShoppingCart, Plus, Minus, Mail, Phone, MapPin, Search, Package, 
  ChevronLeft, ChevronRight, X, User, Filter, Star, Heart, Share2,
  CheckCircle, Clock, Truck, CheckCheck, Calendar, Hash, CreditCard,
  Download, Printer, ArrowRight, MessageCircle, Send, Home, Building,
  MapPin as MapPinIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// Store data (would come from database in real app)
const storeData = {
  name: "Demo Store",
  owner: "John Doe",
  email: "john@demostore.com",
  phone: "+1234567890",
  whatsapp: "+1234567890", // WhatsApp number for chat
  address: "123 Business Street, City",
  ownerProfile: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  banners: [
    { id: 1, title: "Welcome to Demo Store", subtitle: "Best deals await you", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200" },
    { id: 2, title: "New Arrivals", subtitle: "Check out what's new", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200" },
  ],
  products: [
    { 
      id: 1, 
      name: "Premium Widget", 
      price: 129.99, 
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", 
      description: "High-quality premium widget for all your needs.",
      category: "Electronics",
      rating: 4.5,
      reviews: 128,
      inStock: true,
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800"
      ],
      specifications: {
        material: "Aluminum",
        weight: "1.5kg",
        dimensions: "10 x 5 x 3 cm",
        warranty: "2 years"
      }
    },
    { 
      id: 2, 
      name: "Starter Kit", 
      price: 49.99, 
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400", 
      description: "Perfect starter kit for beginners.",
      category: "Kits",
      rating: 4.2,
      reviews: 89,
      inStock: true,
      images: [
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
      ],
      specifications: {
        material: "Plastic",
        weight: "0.8kg",
        dimensions: "15 x 10 x 5 cm",
        warranty: "1 year"
      }
    },
    { 
      id: 3, 
      name: "Pro Package", 
      price: 199.99, 
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400", 
      description: "Professional package with all features.",
      category: "Professional",
      rating: 4.8,
      reviews: 256,
      inStock: true,
      images: [
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800",
        "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=800"
      ],
      specifications: {
        material: "Stainless Steel",
        weight: "3.2kg",
        dimensions: "20 x 15 x 10 cm",
        warranty: "3 years"
      }
    },
    { 
      id: 4, 
      name: "Basic Bundle", 
      price: 79.99, 
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", 
      description: "Essential bundle for everyday use.",
      category: "Essentials",
      rating: 4.0,
      reviews: 56,
      inStock: false,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800"
      ],
      specifications: {
        material: "ABS Plastic",
        weight: "1.2kg",
        dimensions: "12 x 8 x 6 cm",
        warranty: "1 year"
      }
    },
  ],
};

// Mock order data
const mockOrders: Order[] = [
  {
    id: "ORD-2024-001",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+1234567890",
    customerLocation: "123 Main St, City, Country",
    date: "2024-01-15",
    status: "delivered",
    total: 299.97,
    items: [
      { id: 1, name: "Premium Widget", price: 129.99, quantity: 1, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
      { id: 2, name: "Starter Kit", price: 49.99, quantity: 2, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400" },
    ],
    shippingAddress: "123 Main St, City, Country",
    paymentMethod: "Credit Card",
    paymentStatus: "paid",
    trackingNumber: "TRK123456789",
    estimatedDelivery: "2024-01-20",
    deliveredDate: "2024-01-19",
  },
  {
    id: "ORD-2024-002",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    customerPhone: "+0987654321",
    customerLocation: "456 Oak Ave, City, Country",
    date: "2024-01-10",
    status: "shipped",
    total: 199.99,
    items: [
      { id: 3, name: "Pro Package", price: 199.99, quantity: 1, image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400" },
    ],
    shippingAddress: "456 Oak Ave, City, Country",
    paymentMethod: "Paystack",
    paymentStatus: "paid",
    trackingNumber: "TRK987654321",
    estimatedDelivery: "2024-01-25",
    deliveredDate: null,
  },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ProductDetails {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  images: string[];
  specifications: {
    material: string;
    weight: string;
    dimensions: string;
    warranty: string;
  };
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLocation: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  trackingNumber: string | null;
  estimatedDelivery: string;
  deliveredDate: string | null;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  location: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes?: string;
}

const UserStorefront = () => {
  const { storeSlug } = useParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(mockOrders);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    location: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: ""
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");

  // Get unique categories
  const categories = useMemo(() => {
    const cats = storeData.products.map(p => p.category);
    return ["All", ...Array.from(new Set(cats))];
  }, []);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    return storeData.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Search orders by email, phone, or order ID
  const searchOrders = () => {
    if (!orderSearch.trim()) {
      setFilteredOrders(mockOrders);
      return;
    }

    const searchTerm = orderSearch.toLowerCase().trim();
    const results = mockOrders.filter(order =>
      order.customerEmail.toLowerCase().includes(searchTerm) ||
      order.customerPhone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm)
    );

    setFilteredOrders(results);
    
    if (results.length > 0) {
      toast({
        title: "Orders Found",
        description: `Found ${results.length} order(s)`,
      });
    } else {
      toast({
        title: "No Orders Found",
        description: "Try a different email, phone, or order ID",
        variant: "destructive",
      });
    }
  };

  // Get status badge color
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return "bg-green-100 text-green-800";
      case 'shipped': return "bg-blue-100 text-blue-800";
      case 'processing': return "bg-yellow-100 text-yellow-800";
      case 'pending': return "bg-orange-100 text-orange-800";
      case 'cancelled': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return <CheckCheck className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid': return "bg-green-100 text-green-800";
      case 'pending': return "bg-yellow-100 text-yellow-800";
      case 'failed': return "bg-red-100 text-red-800";
      case 'refunded': return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const addToCart = (product: typeof storeData.products[0]) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item) => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast({ title: "Added to Cart", description: `${product.name} added to your cart.` });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(cart.map((item) => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter((item) => item.quantity > 0));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({ 
        title: "Cart is empty", 
        description: "Add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }
    setShowCheckout(true);
  };

  const handleProceedToPayment = () => {
    // Validate customer info
    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.location.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Phone, Location)",
        variant: "destructive"
      });
      return;
    }

    // In real app, save customer info and proceed to Paystack
    toast({ 
      title: "Proceeding to Payment", 
      description: "Redirecting to Paystack..." 
    });

    // Create order summary for WhatsApp message
    const orderSummary = cart.map(item => 
      `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const whatsappText = `Hello ${storeData.name}!%0A%0A`
      + `*New Order Inquiry*%0A%0A`
      + `*Customer Information:*%0A`
      + `Name: ${customerInfo.name}%0A`
      + `Phone: ${customerInfo.phone}%0A`
      + `Email: ${customerInfo.email || 'Not provided'}%0A`
      + `Location: ${customerInfo.location}%0A`
      + `${customerInfo.address ? `Address: ${customerInfo.address}%0A` : ''}`
      + `${customerInfo.city ? `City: ${customerInfo.city}%0A` : ''}`
      + `${customerInfo.state ? `State: ${customerInfo.state}%0A` : ''}`
      + `${customerInfo.zipCode ? `Zip Code: ${customerInfo.zipCode}%0A` : ''}`
      + `${customerInfo.notes ? `Notes: ${customerInfo.notes}%0A` : ''}`
      + `%0A*Order Items:*%0A${orderSummary}%0A%0A`
      + `*Total: $${cartTotal.toFixed(2)}*%0A%0A`
      + `I'm ready to proceed with payment.`;

    setWhatsappMessage(whatsappText);
    
    // Close checkout dialog
    setShowCheckout(false);
    
    // Open WhatsApp in new tab
    setTimeout(() => {
      window.open(`https://wa.me/${storeData.whatsapp.replace('+', '')}?text=${whatsappText}`, '_blank');
    }, 500);

    // Clear cart
    setCart([]);
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % storeData.banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + storeData.banners.length) % storeData.banners.length);
  };

  const openProductDetails = (product: typeof storeData.products[0]) => {
    setSelectedProduct(product);
    setSelectedImageIndex(0);
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handlePrintInvoice = () => {
    toast({ title: "Printing Invoice", description: "Opening print dialog..." });
    // In real app, generate PDF invoice
  };

  const handleDownloadInvoice = () => {
    toast({ title: "Downloading Invoice", description: "Your invoice is being downloaded." });
    // In real app, generate and download PDF
  };

  // Handle Enter key for order search
  const handleOrderSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchOrders();
    }
  };

  // Handle customer info change
  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Initialize chat message with store info
  useEffect(() => {
    const message = `Hello ${storeData.name}! I have a question about your products.`;
    setChatMessage(message);
  }, []);

  // Open WhatsApp chat
  const openWhatsAppChat = () => {
    const message = chatMessage || "Hello! I have a question about your products.";
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${storeData.whatsapp.replace('+', '')}?text=${encodedMessage}`, '_blank');
  };

  // Send chat message
  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;
    
    const encodedMessage = encodeURIComponent(chatMessage);
    window.open(`https://wa.me/${storeData.whatsapp.replace('+', '')}?text=${encodedMessage}`, '_blank');
    setIsChatOpen(false);
    setChatMessage("");
    
    toast({
      title: "Opening WhatsApp",
      description: "You'll be redirected to WhatsApp to send your message."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Floating WhatsApp Chat Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Chat Bubble */}
        {isChatOpen && (
          <div className="mb-3 w-80 bg-background rounded-xl shadow-2xl border border-border animate-in slide-in-from-bottom-5">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Chat with {storeData.name}</h4>
                  <p className="text-xs text-muted-foreground">Typically replies within minutes</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <Label htmlFor="chat-message" className="text-sm font-medium mb-2 block">
                  Your Message
                </Label>
                <Textarea
                  id="chat-message"
                  placeholder="Type your message here..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsChatOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={sendChatMessage}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send via WhatsApp
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Button */}
        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="rounded-full w-14 h-14 shadow-2xl bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <MessageCircle className="w-7 h-7" />
        </Button>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold gradient-text">{storeData.name}</h1>
              <p className="text-sm text-muted-foreground">by {storeData.owner}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setShowOrders(true)}>
                <Package className="w-4 h-4 mr-2" /> My Orders
              </Button>
              <Button variant="hero" onClick={() => setShowCart(true)} className="relative">
                <ShoppingCart className="w-4 h-4 mr-2" /> Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Carousel */}
      <section className="relative h-[400px] overflow-hidden">
        {storeData.banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentBanner ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-transparent flex items-center">
              <div className="container mx-auto px-4">
                <h2 className="text-4xl font-display font-bold text-primary-foreground mb-2">{banner.title}</h2>
                <p className="text-xl text-primary-foreground/80">{banner.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={prevBanner}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextBanner}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {storeData.banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentBanner ? "bg-primary" : "bg-primary-foreground/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold">Our Products</h2>
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} of {storeData.products.length} products
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="stat-card group cursor-pointer hover:shadow-lg transition-all duration-300"
              onClick={() => openProductDetails(product)}
            >
              <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-muted relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {!product.inStock && (
                  <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium">
                    Out of Stock
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="w-8 h-8">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold mb-1">{product.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm ml-1">{product.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                <span className="text-xs px-2 py-1 bg-muted rounded-full">{product.category}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">${product.price}</span>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" /> Add
                </Button>
              </div>
            </div>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}
      </section>

      {/* Store Owner Info */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-display font-bold mb-8">About the Store Owner</h2>
          <div className="bg-background rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <img 
                  src={storeData.ownerProfile} 
                  alt={storeData.owner}
                  className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">{storeData.owner}</h3>
                <p className="text-muted-foreground mb-4">Store Owner & Entrepreneur</p>
                <p className="text-sm mb-6">
                  Welcome to my store! I'm passionate about providing high-quality products 
                  and excellent customer service. Feel free to reach out with any questions!
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{storeData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{storeData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{storeData.address}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <Button 
                    onClick={openWhatsAppChat}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat with us on WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Shopping Cart</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowCart(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border border-border">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-bold mb-4">
                    <span>Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <Button variant="hero" className="w-full" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    You'll be asked for your contact details before payment
                  </p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog - Customer Information */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Please provide your contact information to complete your order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Order Summary */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Order Summary</h4>
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span className="text-sm">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-sm font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer Information Form */}
            <div className="space-y-4">
              <h4 className="font-semibold">Contact Information</h4>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={customerInfo.name}
                    onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+1234567890"
                    value={customerInfo.phone}
                    onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={customerInfo.email}
                    onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm">
                    City/Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={customerInfo.location}
                    onChange={(e) => handleCustomerInfoChange('location', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="text-sm">
                    Full Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="Street address, apartment, suite, etc."
                    value={customerInfo.address}
                    onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm">
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={customerInfo.city}
                    onChange={(e) => handleCustomerInfoChange('city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm">
                    State/Province
                  </Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={customerInfo.state}
                    onChange={(e) => handleCustomerInfoChange('state', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-sm">
                    ZIP/Postal Code
                  </Label>
                  <Input
                    id="zipCode"
                    placeholder="12345"
                    value={customerInfo.zipCode}
                    onChange={(e) => handleCustomerInfoChange('zipCode', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">
                  Order Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Special instructions, delivery preferences, etc."
                  value={customerInfo.notes}
                  onChange={(e) => handleCustomerInfoChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-semibold">Payment Method</h4>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Paystack Payment</p>
                    <p className="text-sm text-muted-foreground">
                      Secure payment via Paystack (Cards, Bank Transfer, etc.)
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Notification */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">WhatsApp Confirmation</p>
                    <p className="text-sm text-green-700">
                      After payment, you'll be redirected to WhatsApp to confirm your order details with the store owner.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCheckout(false)}
            >
              Back to Cart
            </Button>
            <Button
              variant="hero"
              onClick={handleProceedToPayment}
              disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.location}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Proceed to Paystack Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* My Orders Dialog - Search and View Orders */}
      <Dialog open={showOrders} onOpenChange={setShowOrders}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Orders</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your email, phone number, or order ID to view your orders
            </p>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {/* Search Section */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Email, phone number, or order ID"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    onKeyDown={handleOrderSearchKeyDown}
                    className="pl-10"
                  />
                </div>
                <Button onClick={searchOrders}>
                  Search
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: You can search by your email address, phone number, or specific order ID (e.g., ORD-2024-001)
              </p>
            </div>

            <Separator />

            {/* Orders List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Order History</h3>
                <span className="text-sm text-muted-foreground">
                  {filteredOrders.length} order(s) found
                </span>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No orders found</p>
                  <p className="text-sm text-muted-foreground">
                    Enter your email, phone, or order ID above to find your orders
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div 
                      key={order.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => openOrderDetails(order)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {order.paymentStatus.toUpperCase()}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                      
                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Order ID</p>
                          <p className="font-medium">{order.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">{formatDate(order.date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Customer</p>
                          <p className="font-medium">{order.customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            {index < 2 && index < order.items.length - 1 && (
                              <span className="text-muted-foreground">•</span>
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-sm text-muted-foreground">
                            +{order.items.length - 3} more items
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Order Details: {selectedOrder.id}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrintInvoice}>
                      <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadInvoice}>
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Order Status Banner */}
                <div className={`p-4 rounded-lg ${getStatusColor(selectedOrder.status)}`}>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(selectedOrder.status)}
                    <div>
                      <h4 className="font-semibold capitalize">Order {selectedOrder.status}</h4>
                      <p className="text-sm">
                        {selectedOrder.status === 'delivered' 
                          ? `Delivered on ${formatDate(selectedOrder.deliveredDate!)}`
                          : selectedOrder.status === 'shipped'
                          ? `Estimated delivery: ${formatDate(selectedOrder.estimatedDelivery)}`
                          : `Order placed on ${formatDate(selectedOrder.date)}`
                        }
                      </p>
                    </div>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium">Tracking Number</p>
                      <p className="font-mono">{selectedOrder.trackingNumber}</p>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" /> Customer Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Name</span>
                        <span className="font-medium">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="font-medium">{selectedOrder.customerEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Phone</span>
                        <span className="font-medium">{selectedOrder.customerPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Location</span>
                        <span className="font-medium">{selectedOrder.customerLocation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Order Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Order Date</span>
                        <span className="font-medium">{formatDate(selectedOrder.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Payment Method</span>
                        <span className="font-medium">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Payment Status</span>
                        <div className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                          {selectedOrder.paymentStatus.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <MapPinIcon className="w-4 h-4" /> Shipping Address
                  </h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-medium">{selectedOrder.shippingAddress}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3">Order Items ({selectedOrder.items.length})</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <h5 className="font-medium">{item.name}</h5>
                          <p className="text-sm text-muted-foreground">Unit Price: ${item.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>$0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                    Close
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-green-600 text-white hover:bg-green-700 hover:text-white"
                    onClick={() => window.open(`https://wa.me/${storeData.whatsapp.replace('+', '')}?text=Hello! I have a question about my order ${selectedOrder.id}`, '_blank')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat About This Order
                  </Button>
                  {selectedOrder.status === 'delivered' && (
                    <Button onClick={() => toast({ title: "Request Submitted", description: "Your return request has been submitted." })}>
                      Request Return
                    </Button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <Button onClick={() => toast({ title: "Tracking", description: "Tracking page opened." })}>
                      Track Package
                    </Button>
                  )}
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedProduct.name}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-8 pt-4">
                {/* Product Images */}
                <div>
                  <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-muted">
                    <img
                      src={selectedProduct.images[selectedImageIndex]}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {selectedProduct.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImageIndex === index ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${selectedProduct.name} view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold">${selectedProduct.price}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1">{selectedProduct.rating}</span>
                        </div>
                        <span className="text-muted-foreground">({selectedProduct.reviews} reviews)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm px-3 py-1 bg-muted rounded-full">
                        {selectedProduct.category}
                      </span>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        selectedProduct.inStock 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {selectedProduct.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{selectedProduct.description}</p>
                  </div>

                  {/* Specifications */}
                  <div>
                    <h4 className="font-semibold mb-3">Specifications</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                        <div key={key} className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground capitalize">{key}</p>
                          <p className="font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="hero"
                        className="flex-1"
                        onClick={() => addToCart(selectedProduct)}
                        disabled={!selectedProduct.inStock}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          addToCart(selectedProduct);
                          setSelectedProduct(null);
                          setShowCart(true);
                        }}
                        disabled={!selectedProduct.inStock}
                      >
                        Buy Now
                      </Button>
                    </div>
                    {!selectedProduct.inStock && (
                      <p className="text-destructive text-sm text-center">
                        This product is currently out of stock
                      </p>
                    )}
                    <div className="pt-4 border-t">
                      <Button 
                        variant="ghost" 
                        className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => {
                          const message = `Hello! I have a question about the ${selectedProduct.name}. Can you tell me more about it?`;
                          window.open(`https://wa.me/${storeData.whatsapp.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ask about this product on WhatsApp
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserStorefront;