import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingCart, Plus, Minus, Mail, Phone, MapPin, Search, Package,
  ChevronLeft, ChevronRight, X, User, Filter, Star, Heart, Share2,
  CheckCircle, Clock, Truck, CheckCheck, Calendar, CreditCard,
  Download, Printer, ArrowRight, MessageCircle, Send, Facebook, Twitter, Instagram,
  Linkedin, Globe, Shield, Truck as DeliveryTruck, RotateCcw, HelpCircle,
  Moon, Sun, Sparkles, Award, TrendingUp, ShieldCheck, Headphones,
  Layers, Zap, Gift, BadgeCheck, Star as StarIcon, FileText, Info, 
  Ruler, RotateCw, Clock as ClockIcon, DollarSign, PackageOpen, Eye, AlertTriangle, RefreshCw
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { useStorefrontStore, StoreProduct } from "@/store/storefront.store";
import { useCarouselStore } from "@/store/carousel.store";
import { useProductStore } from "@/store/product.store";
import { NegotiationModal } from "./NegotiationModal";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

// Order types
interface OrderItem { _id: string; name: string; price: number; quantity: number; images?: Array<{ url: string }> }
interface Order {
  _id: string; orderId: string;
  customer: { name: string; email: string; phone: string; location: string };
  products: OrderItem[];
  payment: { amount: number; status: string; method?: string };
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress?: string; trackingNumber?: string;
  estimatedDelivery?: string; deliveryDate?: string;
  createdAt: string;
}

const getStatusColor = (s: Order["status"]) => {
  const map: Record<string, string> = {
    delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    processing: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-amber-400",
    cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  };
  return map[s] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
};

const getStatusIcon = (s: Order["status"]) => {
  const icons: Record<string, React.ReactNode> = {
    delivered: <CheckCheck className="w-4 h-4" />, shipped: <Truck className="w-4 h-4" />,
    cancelled: <X className="w-4 h-4" />,
  };
  return icons[s] || <Clock className="w-4 h-4" />;
};

const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

// Review Section
const ReviewSection = ({ productId, ratings: initialRatings, onReviewSubmitted }: { 
  productId: string; 
  ratings: any; 
  onReviewSubmitted?: () => void;
}) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [currentRatings, setCurrentRatings] = useState(initialRatings);
  const { submitReview, fetchReviews } = useProductStore();

  const loadReviews = async () => {
    const result = await fetchReviews(productId);
    setReviews(result.reviews || []);
    if (result.ratings) {
      setCurrentRatings(result.ratings);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  useEffect(() => {
    if (initialRatings) {
      setCurrentRatings(initialRatings);
    }
  }, [initialRatings]);

  const handleSubmit = async () => {
    if (!name.trim() || !comment.trim()) {
      toast({ title: "Please fill in your name and comment", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await submitReview(productId, { rating, comment, name });
      toast({ title: "Review submitted! Thank you." });
      setShowForm(false);
      setName(""); 
      setComment(""); 
      setRating(5);
      await loadReviews();
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const reviewCount = currentRatings?.count ?? reviews.length;
  const averageRating = currentRatings?.average ?? 0;
  const distribution = currentRatings?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <div className="pt-4 border-t dark:border-gray-700 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold dark:text-white flex items-center gap-2">
          <StarIcon className="w-4 h-4 text-amber-500" />
          Customer Reviews ({reviewCount})
        </h4>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="rounded-full">
          {showForm ? "Cancel" : "Write a Review"}
        </Button>
      </div>

      {reviewCount > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl">
          <div className="text-center">
            <span className="text-4xl font-bold dark:text-white">{averageRating.toFixed(1)}</span>
            <div className="flex mt-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{reviewCount} reviews</p>
          </div>
          <div className="flex-1">
            <div className="space-y-1">
              {[5,4,3,2,1].map(star => {
                const count = distribution[star] || 0;
                const percentage = reviewCount ? (count / reviewCount) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-6 text-muted-foreground">{star}★</span>
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-8 text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/80 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium dark:text-gray-300">Your Name</Label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Enter your name" 
                className="mt-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg" 
              />
            </div>
            <div>
              <Label className="text-sm font-medium dark:text-gray-300">Rating</Label>
              <div className="flex gap-1.5 mt-2">
                {[1,2,3,4,5].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setRating(s)} 
                    type="button" 
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star className={`w-7 h-7 cursor-pointer transition-all ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium dark:text-gray-300">Your Review</Label>
              <Textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                placeholder="Share your experience with this product..." 
                rows={3} 
                className="mt-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg resize-none" 
              />
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting} 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : reviews.map((r, i) => (
          <div key={i} className="bg-white dark:bg-gray-800/60 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-medium text-sm">
                  {r.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <p className="font-medium text-sm dark:text-white">{r.name}</p>
              </div>
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}`} />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Just now'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Modal components
const AboutUsModal = ({ open, onOpenChange, storeInfo }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <Info className="w-6 h-6 text-primary" /> About {storeInfo?.storeName || "Us"}
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p className="text-muted-foreground">{storeInfo?.description || storeInfo?.storeDescription || "Welcome to our store!"}</p>
      </div>
    </DialogContent>
  </Dialog>
);

const HowToOrderModal = ({ open, onOpenChange }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <PackageOpen className="w-6 h-6 text-primary" /> How to Order
        </DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-3">
        <p>1. Browse products and add to cart</p>
        <p>2. Review your cart</p>
        <p>3. Proceed to checkout</p>
        <p>4. Enter shipping details</p>
        <p>5. Complete payment</p>
      </div>
    </DialogContent>
  </Dialog>
);

const ShippingPolicyModal = ({ open, onOpenChange }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <DeliveryTruck className="w-6 h-6 text-primary" /> Shipping Policy
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p>Standard delivery: 3-5 business days</p>
        <p>Express delivery: 1-2 business days</p>
        <p>Free shipping on orders over ₦50,000</p>
      </div>
    </DialogContent>
  </Dialog>
);

const ReturnPolicyModal = ({ open, onOpenChange }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <RotateCcw className="w-6 h-6 text-primary" /> Return Policy
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p>7-day return policy for unused items in original packaging.</p>
      </div>
    </DialogContent>
  </Dialog>
);

const FAQModal = ({ open, onOpenChange }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <HelpCircle className="w-6 h-6 text-primary" /> FAQs
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p className="font-semibold">How long does delivery take?</p>
        <p className="text-muted-foreground mb-3">3-5 business days for standard delivery.</p>
        <p className="font-semibold">What payment methods do you accept?</p>
        <p className="text-muted-foreground">Cards, bank transfers, USSD via Paystack.</p>
      </div>
    </DialogContent>
  </Dialog>
);

const ContactUsModal = ({ open, onOpenChange, storeInfo, whatsapp }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <Mail className="w-6 h-6 text-primary" /> Contact Us
        </DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-3">
        <p>Phone/WhatsApp: {whatsapp || storeInfo?.owner?.phone}</p>
        <p>Email: {storeInfo?.owner?.email}</p>
      </div>
    </DialogContent>
  </Dialog>
);

const TrackOrderModal = ({ open, onOpenChange, onSearchOrders }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <Truck className="w-6 h-6 text-primary" /> Track Order
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <Input placeholder="Order ID or Email" className="mb-4" />
        <Button onClick={() => { onSearchOrders(); onOpenChange(false); }} className="w-full">Track</Button>
      </div>
    </DialogContent>
  </Dialog>
);

const ReturnsRefundsModal = ({ open, onOpenChange }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <RotateCcw className="w-6 h-6 text-primary" /> Returns & Refunds
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p>Contact support within 7 days of delivery to initiate a return.</p>
      </div>
    </DialogContent>
  </Dialog>
);

const SizeGuideModal = ({ open, onOpenChange }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <Ruler className="w-6 h-6 text-primary" /> Size Guide
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <table className="w-full text-sm">
          <thead>
            <tr><th>Size</th><th>Chest</th><th>Waist</th></tr>
          </thead>
          <tbody>
            <tr><td>S</td><td>34-36</td><td>28-30</td></tr>
            <tr><td>M</td><td>38-40</td><td>32-34</td></tr>
            <tr><td>L</td><td>42-44</td><td>36-38</td></tr>
          </tbody>
        </table>
      </div>
    </DialogContent>
  </Dialog>
);

const TermsConditionsModal = ({ open, onOpenChange }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <FileText className="w-6 h-6 text-primary" /> Terms & Conditions
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p>By using this store, you agree to our terms and conditions.</p>
      </div>
    </DialogContent>
  </Dialog>
);

const CustomerServiceModal = ({ open, onOpenChange, storeInfo, whatsapp }: any) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <Headphones className="w-6 h-6 text-primary" /> Customer Service
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p>Available 9AM - 6PM, Monday to Friday</p>
        <p>WhatsApp: {whatsapp}</p>
        <p>Email: {storeInfo?.owner?.email}</p>
      </div>
    </DialogContent>
  </Dialog>
);

// Main Component
const UserStorefront = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Refresh state - simplified like ClientDashboard
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const { storeInfo, products, cart, isLoading, isSubmitting, fetchStorefront, fetchStoreProducts, fetchCart, manageCart, placeOrder, refreshCart } = useStorefrontStore();
  const { storeSlides, fetchStoreCarousels } = useCarouselStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderComplete, setOrderComplete] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: "", phone: "", email: "", location: "",
    address: "", city: "", state: "", zipCode: "",
    shippingMethod: "standard", notes: "",
  });

  // Negotiation modal state
  const [negotiationModal, setNegotiationModal] = useState<{
    open: boolean;
    product: any;
  }>({
    open: false,
    product: null,
  });

  // Modal states
  const [modals, setModals] = useState({
    aboutUs: false,
    howToOrder: false,
    shippingPolicy: false,
    returnPolicy: false,
    faqs: false,
    contactUs: false,
    trackOrder: false,
    returnsRefunds: false,
    sizeGuide: false,
    termsConditions: false,
    customerService: false,
  });

  const openModal = (modal: keyof typeof modals) => setModals(prev => ({ ...prev, [modal]: true }));
  const closeModal = (modal: keyof typeof modals) => setModals(prev => ({ ...prev, [modal]: false }));

  // Helper function to get current stock
  const getProductStock = (productId: string): number => {
    const product = products.find(p => p._id === productId);
    return product?.stock ?? 0;
  };

  // Refresh function - simplified like ClientDashboard
  const fetchDashboardData = useCallback(async () => {
    if (!storeSlug) return;
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchStorefront(storeSlug),
        fetchStoreProducts(storeSlug),
        fetchCart(storeSlug),
        fetchStoreCarousels(storeSlug),
      ]);
    } catch (error) {
      console.error("Failed to fetch store data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [storeSlug, fetchStorefront, fetchStoreProducts, fetchCart, fetchStoreCarousels]);

  // Initial load
  useEffect(() => {
    if (storeSlug) {
      fetchDashboardData();
    }
  }, [storeSlug, fetchDashboardData]);

  const storefrontBanners = ((storeInfo as any)?.banners || [])
    .filter((b: any) => b.active !== false)
    .map((b: any) => ({ _id: b._id || b.title, title: b.title, subtitle: b.subtitle, image: b.image, link: b.link }));
  const carouselBanners = storeSlides.filter(s => s.active !== false)
    .map(s => ({ _id: s._id, title: s.title, subtitle: s.subtitle, image: s.image, link: s.link }));
  const banners = carouselBanners.length > 0 ? carouselBanners : storefrontBanners;

  useEffect(() => {
    if (banners.length > 1) {
      const t = setInterval(() => setCurrentBanner(i => (i + 1) % banners.length), 5000);
      return () => clearInterval(t);
    }
  }, [banners.length]);

  useEffect(() => {
    if (storeInfo?.storeName) setChatMessage(`Hello ${storeInfo.storeName}! I have a question about your products.`);
  }, [storeInfo?.storeName]);

  const categories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean);
    return ["All", ...Array.from(new Set(cats))];
  }, [products]);

  const filteredProducts = useMemo(() => products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
    const matchCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCat;
  }), [products, search, selectedCategory]);

  const cartCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const cartTotal = cart?.total ?? 0;
  const whatsapp = (storeInfo as any)?.owner?.whatsapp || (storeInfo as any)?.owner?.phone || "";

  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!storeSlug) return;
    
    const actionKey = `add_${productId}`;
    if (pendingActions.has(actionKey)) return;
    
    setPendingActions(prev => new Set(prev).add(actionKey));
    
    try {
      await manageCart(storeSlug, "add", productId, quantity);
      toast({ 
        title: "Added to Cart", 
        description: "Product has been added to your cart",
        duration: 1500,
      });
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message || "Failed to add to cart", 
        variant: "destructive" 
      });
    } finally {
      setTimeout(() => {
        setPendingActions(prev => {
          const newSet = new Set(prev);
          newSet.delete(actionKey);
          return newSet;
        });
      }, 500);
    }
  };

  const updateCartQuantity = async (productId: string, newQuantity: number) => {
    if (!storeSlug) return;
    
    const actionKey = `update_${productId}`;
    if (pendingActions.has(actionKey)) return;
    
    setPendingActions(prev => new Set(prev).add(actionKey));
    
    try {
      if (newQuantity <= 0) {
        await manageCart(storeSlug, "remove", productId);
      } else {
        await manageCart(storeSlug, "update", productId, newQuantity);
      }
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message || "Failed to update cart", 
        variant: "destructive" 
      });
      await fetchCart(storeSlug);
    } finally {
      setTimeout(() => {
        setPendingActions(prev => {
          const newSet = new Set(prev);
          newSet.delete(actionKey);
          return newSet;
        });
      }, 300);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCheckingOut) {
      toast({ 
        title: "Processing", 
        description: "Please wait, your order is being processed...",
      });
      return;
    }
    
    if (!storeSlug || !cart?.items?.length) {
      toast({ 
        title: "Cart Empty", 
        description: "Please add items to your cart before checking out",
        variant: "destructive" 
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      // First, validate stock with latest data
      const stockIssues = [];
      for (const item of cart.items) {
        const product = products.find(p => p._id === item.product._id);
        if (!product) {
          stockIssues.push(`${item.product.name}: Product not found`);
        } else if (item.quantity > product.stock) {
          stockIssues.push(`${product.name}: ${item.quantity} requested, ${product.stock} available`);
        }
      }
      
      if (stockIssues.length > 0) {
        toast({ 
          title: "Stock Issues", 
          description: stockIssues.join(', '),
          variant: "destructive" 
        });
        setIsCheckingOut(false);
        return;
      }

      // Validate required fields
      const missingFields = [];
      if (!checkoutForm.name?.trim()) missingFields.push('Name');
      if (!checkoutForm.phone?.trim()) missingFields.push('Phone Number');
      if (!checkoutForm.location?.trim()) missingFields.push('Location');
      
      if (missingFields.length > 0) {
        toast({ 
          title: "Missing Information", 
          description: `Please fill in: ${missingFields.join(', ')}`,
          variant: "destructive" 
        });
        setIsCheckingOut(false);
        return;
      }

      // Validate phone number
      const phoneRegex = /^[\+\d\s\(\)\-]{8,}$/;
      if (!phoneRegex.test(checkoutForm.phone)) {
        toast({ 
          title: "Invalid Phone Number", 
          description: "Please enter a valid phone number",
          variant: "destructive" 
        });
        setIsCheckingOut(false);
        return;
      }

      // Prepare order data
      const orderData = {
        customer: { 
          name: checkoutForm.name.trim(), 
          phone: checkoutForm.phone.trim(), 
          email: checkoutForm.email?.trim() || `${checkoutForm.phone.replace(/\s/g, '')}@temp.com`,
          location: checkoutForm.location.trim()
        },
        shippingAddress: checkoutForm.address?.trim() || checkoutForm.location.trim(),
        shippingMethod: checkoutForm.shippingMethod,
        notes: checkoutForm.notes?.trim() || '',
      };

      const result = await placeOrder(storeSlug, orderData);
      
      setOrderComplete(result);
      setShowCheckout(false);
      
      if (result.paymentUrl) {
        await manageCart(storeSlug, 'clear');
        window.location.href = result.paymentUrl;
      } else {
        toast({ 
          title: "Order Created", 
          description: "Your order has been created successfully." 
        });
        await manageCart(storeSlug, 'clear');
        await fetchDashboardData();
      }
      
    } catch (err: any) {
      console.error('Checkout error:', err);
      
      let errorMessage = err.message || "Something went wrong. Please try again.";
      
      if (errorMessage.toLowerCase().includes('stock')) {
        errorMessage = "Some items are out of stock. Please review your cart.";
        await refreshCart(storeSlug);
      } else if (errorMessage.includes('Duplicate')) {
        errorMessage = "Order already in progress. Please wait a moment.";
      }
      
      toast({ 
        title: "Order Failed", 
        description: errorMessage,
        variant: "destructive" 
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const searchOrders = async () => {
    if (!orderSearch.trim() || !storeSlug) return;
    setOrdersLoading(true);
    try {
      const { api } = await import("@/lib/api");
      const res = await api.get(`/storefront/${storeSlug}/orders/search?search=${encodeURIComponent(orderSearch)}`);
      const found: Order[] = res.data.data || res.data.orders || [];
      setOrders(found);
      if (!found.length) toast({ title: "No orders found", variant: "destructive" });
    } catch {
      toast({ title: "Could not search orders", variant: "destructive" });
    } finally {
      setOrdersLoading(false);
    }
  };

  const openWhatsApp = (msg?: string) => {
    if (!whatsapp) return;
    const text = encodeURIComponent(msg || chatMessage || "Hello!");
    window.open(`https://wa.me/${whatsapp.replace("+", "")}?text=${text}`, "_blank");
  };

  const hasStockIssues = cart?.items?.some(item => {
    const product = products.find(p => p._id === item.product._id);
    return product && item.quantity > product.stock;
  }) ?? false;

  // Handle payment return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentReference = urlParams.get('reference');
    const orderId = urlParams.get('orderId');
    
    if (paymentReference && orderId) {
      fetchDashboardData();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [fetchDashboardData]);

  if (isLoading && !storeInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-16 w-full rounded-xl mb-6" />
          <Skeleton className="h-[450px] w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!storeInfo && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
            <Package className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold dark:text-white">Store Not Found</h1>
          <p className="text-muted-foreground">This store doesn't exist or has been deactivated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">

      {/* Modals */}
      <AboutUsModal open={modals.aboutUs} onOpenChange={(open: boolean) => closeModal("aboutUs")} storeInfo={storeInfo} />
      <HowToOrderModal open={modals.howToOrder} onOpenChange={(open: boolean) => closeModal("howToOrder")} />
      <ShippingPolicyModal open={modals.shippingPolicy} onOpenChange={(open: boolean) => closeModal("shippingPolicy")} />
      <ReturnPolicyModal open={modals.returnPolicy} onOpenChange={(open: boolean) => closeModal("returnPolicy")} />
      <FAQModal open={modals.faqs} onOpenChange={(open: boolean) => closeModal("faqs")} />
      <ContactUsModal open={modals.contactUs} onOpenChange={(open: boolean) => closeModal("contactUs")} storeInfo={storeInfo} whatsapp={whatsapp} />
      <TrackOrderModal open={modals.trackOrder} onOpenChange={(open: boolean) => closeModal("trackOrder")} onSearchOrders={() => { setShowOrders(true); setOrderSearch(""); }} />
      <ReturnsRefundsModal open={modals.returnsRefunds} onOpenChange={(open: boolean) => closeModal("returnsRefunds")} />
      <SizeGuideModal open={modals.sizeGuide} onOpenChange={(open: boolean) => closeModal("sizeGuide")} />
      <TermsConditionsModal open={modals.termsConditions} onOpenChange={(open: boolean) => closeModal("termsConditions")} />
      <CustomerServiceModal open={modals.customerService} onOpenChange={(open: boolean) => closeModal("customerService")} storeInfo={storeInfo} whatsapp={whatsapp} />

      {/* Floating WhatsApp */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isChatOpen && (
          <div className="mb-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-5 fade-in duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Chat with {storeInfo?.storeName}</h4>
                  <p className="text-xs text-white/80">Typically replies within minutes</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <Label className="text-sm font-medium mb-2 block dark:text-gray-300">Your Message</Label>
              <Textarea value={chatMessage} onChange={e => setChatMessage(e.target.value)} rows={3} className="resize-none mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-xl" placeholder="Type your message..." />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setIsChatOpen(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-full" onClick={() => { openWhatsApp(); setIsChatOpen(false); }}>
                  <Send className="w-4 h-4 mr-2" /> Send
                </Button>
              </div>
            </div>
          </div>
        )}
        <Button onClick={() => setIsChatOpen(!isChatOpen)}
          className="rounded-full w-14 h-14 shadow-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all hover:scale-110" size="icon">
          <MessageCircle className="w-7 h-7" />
        </Button>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {(storeInfo as any)?.logo?.url ? (
                <img src={(storeInfo as any).logo.url} className="w-12 h-12 rounded-xl object-cover shadow-md" alt="logo" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center font-bold text-white text-xl shadow-md">
                  {storeInfo?.storeName?.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {storeInfo?.storeName}
                </h1>
                {(storeInfo as any)?.owner?.name && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-primary" /> Verified Store
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" onClick={() => setShowOrders(true)} className="rounded-full">
                <Package className="w-4 h-4 mr-2" /> Orders
              </Button>
              <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="default" className="relative rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-md">
                    <ShoppingCart className="w-4 h-4 mr-2" /> Cart
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                
                <SheetContent className="dark:bg-gray-800 dark:border-gray-700 w-full sm:max-w-lg flex flex-col p-0">
                  <SheetHeader className="p-4 border-b dark:border-gray-800 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="flex items-center gap-2 dark:text-white">
                        <ShoppingCart className="w-5 h-5" />
                        Your Cart ({cartCount} items)
                      </SheetTitle>
                      <Button variant="ghost" size="icon" onClick={() => setCartOpen(false)} className="rounded-full">
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto py-4 px-4">
                    {!cart?.items?.length ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-40" />
                        <p className="text-lg font-medium">Your cart is empty</p>
                        <p className="text-sm mt-1">Add some products to get started</p>
                        <Button variant="outline" className="mt-6 rounded-full" onClick={() => setCartOpen(false)}>
                          Continue Shopping
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cart.items.map((item, index) => {
                          const currentStock = getProductStock(item.product._id);
                          const isLowStock = currentStock > 0 && item.quantity > currentStock;
                          const isOutOfStock = currentStock === 0;
                          
                          return (
                            <div 
                              key={item.product._id || index} 
                              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm"
                            >
                              {item.product.images?.[0]?.url ? (
                                <img 
                                  src={item.product.images[0].url} 
                                  className="w-16 h-16 rounded-lg object-cover" 
                                  alt={item.product.name} 
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate dark:text-white">{item.product.name}</p>
                                <p className="text-sm text-muted-foreground">₦{item.price.toLocaleString()}</p>
                                {currentStock > 0 && currentStock <= 5 && (
                                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                    Only {currentStock} left in stock!
                                  </p>
                                )}
                                {(isLowStock || isOutOfStock) && (
                                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    {isOutOfStock ? '❌ Out of stock' : `⚠️ Only ${currentStock} available`}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)} 
                                  className="rounded-full w-8 h-8"
                                  disabled={pendingActions.has(`update_${item.product._id}`)}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center font-medium dark:text-white">{item.quantity}</span>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)} 
                                  className="rounded-full w-8 h-8"
                                  disabled={
                                    pendingActions.has(`update_${item.product._id}`) || 
                                    (currentStock > 0 && item.quantity >= currentStock)
                                  }
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              <div className="text-right min-w-[80px]">
                                <p className="font-medium text-primary">₦{(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => updateCartQuantity(item.product._id, 0)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {cart?.items && cart.items.length > 0 && (
                    <div className="border-t dark:border-gray-700 pt-4 space-y-4 px-4 pb-4 flex-shrink-0">
                      <div className="space-y-2">
                        <div className="flex justify-between text-lg font-bold dark:text-white">
                          <span>Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                          <span className="text-primary">₦{cart.total.toLocaleString()}</span>
                        </div>
                        {hasStockIssues && (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Some items have stock issues. Please review before checkout.
                            </p>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="default" 
                        className="w-full rounded-full bg-gradient-to-r from-primary to-primary/80 h-12"
                        onClick={() => { 
                          setCartOpen(false); 
                          setShowCheckout(true); 
                        }}
                        disabled={hasStockIssues}
                      >
                        Proceed to Checkout
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Free shipping on orders over ₦50,000
                      </p>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Carousel */}
      {banners.length > 0 ? (
        <section className="relative h-[500px] overflow-hidden">
          {banners.map((banner, index) => (
            <div key={banner._id} className={`absolute inset-0 transition-all duration-700 ease-out ${index === currentBanner ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}>
              <img src={banner.image?.url} alt={banner.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl animate-in slide-in-from-left-5 duration-700">
                    <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">{banner.title}</h2>
                    {banner.subtitle && <p className="text-xl text-white/90 mb-6">{banner.subtitle}</p>}
                    <Button className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-8">Shop Now →</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {banners.length > 1 && (
            <>
              <button onClick={() => setCurrentBanner(i => (i - 1 + banners.length) % banners.length)} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all">
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button onClick={() => setCurrentBanner(i => (i + 1) % banners.length)} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all">
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setCurrentBanner(i)} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentBanner ? "w-8 bg-white" : "bg-white/50"}`} />
                ))}
              </div>
            </>
          )}
        </section>
      ) : (storeInfo as any)?.banner?.url ? (
        <section className="relative h-[450px] overflow-hidden">
          <img src={(storeInfo as any).banner.url} className="w-full h-full object-cover" alt="banner" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
            <div className="container mx-auto px-4">
              <h2 className="text-5xl font-bold text-white mb-4">{storeInfo?.storeName}</h2>
              {(storeInfo?.description || (storeInfo as any)?.storeDescription) && (
                <p className="text-xl text-white/90 max-w-2xl">{storeInfo?.description || (storeInfo as any)?.storeDescription}</p>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* Search & Filter with Refresh Button - Like ClientDashboard */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex-1 w-full sm:max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search products by name or description..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-full h-11" 
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Refresh Button - Like ClientDashboard */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDashboardData} 
              disabled={isRefreshing}
              className="rounded-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} /> 
              Refresh
            </Button>
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] dark:bg-gray-800 dark:border-gray-700 dark:text-white rounded-full h-11">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                {categories.map(c => (
                  <SelectItem key={c} value={c} className="dark:text-white dark:focus:bg-gray-700 cursor-pointer">
                    {c === "All" ? "All Categories" : c}
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
          <div>
            <h2 className="text-3xl font-bold dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Our Products
            </h2>
            <p className="text-muted-foreground mt-1">Discover our curated collection</p>
          </div>
          <p className="text-sm text-muted-foreground bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-64 rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
            <Button variant="outline" className="mt-4 rounded-full" onClick={() => { setSearch(""); setSelectedCategory("All"); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div 
                key={product._id} 
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:-translate-y-1" 
                onClick={() => { setSelectedProduct(product); setSelectedImageIndex(0); }}
              >
                <div className="aspect-square rounded-t-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative">
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="w-12 h-12 text-muted-foreground" /></div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-md">
                      Out of Stock
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute top-3 left-3 bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-md">
                      Only {product.stock} left
                    </div>
                  )}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <Button size="icon" variant="secondary" className="w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </Button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg truncate flex-1 dark:text-white">{product.name}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full dark:text-gray-300 ml-2">
                      {product.category}
                    </span>
                  </div>
                  {product.ratings && product.ratings.average > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm ml-1 font-medium dark:text-gray-300">{product.ratings.average.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">({product.ratings.count} reviews)</span>
                    </div>
                  )}
                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <span className="text-xl font-bold text-primary dark:text-primary">{fmt(product.price)}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-muted-foreground line-through ml-2">{fmt(product.originalPrice)}</span>
                      )}
                      {product.stock > 0 && product.stock <= 10 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Only {product.stock} left!
                        </p>
                      )}
                      {product.stock > 10 && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          In stock ({product.stock})
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={e => { e.stopPropagation(); addToCart(product._id); }} 
                        disabled={product.stock === 0}
                        className="rounded-full px-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" /> Add
                      </Button>
                      <Button 
                        onClick={e => { 
                          e.stopPropagation(); 
                          setNegotiationModal({ open: true, product: product });
                        }} 
                        variant="outline"
                        className="rounded-full px-4"
                        disabled={product.stock === 0}
                      >
                        Negotiate
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Store Owner Info */}
      {((storeInfo as any)?.owner || storeInfo?.storeName) && (
        <section className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/30 dark:to-gray-900/30 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold dark:text-white">About the Store</h2>
              <div className="w-20 h-1 bg-primary mx-auto mt-3 rounded-full"></div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative">
                  {((storeInfo as any)?.profileImage?.url || (storeInfo as any)?.logo?.url) ? (
                    <img src={(storeInfo as any)?.profileImage?.url || (storeInfo as any)?.logo?.url} alt={storeInfo?.storeName} className="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-gray-700 shadow-xl" />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-5xl font-bold text-white shadow-xl">
                      {storeInfo?.storeName?.charAt(0)}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <BadgeCheck className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2 dark:text-white">{storeInfo?.storeName}</h3>
                  {(storeInfo as any)?.owner?.name && (
                    <p className="text-muted-foreground mb-3 flex items-center justify-center md:justify-start gap-2">
                      <User className="w-4 h-4" /> Owner: {(storeInfo as any).owner.name}
                    </p>
                  )}
                  {(storeInfo?.description || (storeInfo as any)?.storeDescription) && (
                    <p className="text-sm mb-6 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto md:mx-0">
                      {storeInfo?.description || (storeInfo as any)?.storeDescription}
                    </p>
                  )}
                  {whatsapp && (
                    <div className="mt-8 pt-6 border-t dark:border-gray-700">
                      <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-full px-6 shadow-md" onClick={() => openWhatsApp()}>
                        <MessageCircle className="w-4 h-4 mr-2" /> Chat with us on WhatsApp
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">{storeInfo?.storeName}</h3>
              <p className="text-gray-300 text-sm">Your trusted partner for quality products and exceptional service.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-5">Quick Links</h4>
              <ul className="space-y-3">
                <li><button onClick={() => openModal("aboutUs")} className="text-gray-300 hover:text-primary transition-colors">About Us</button></li>
                <li><button onClick={() => openModal("howToOrder")} className="text-gray-300 hover:text-primary transition-colors">How to Order</button></li>
                <li><button onClick={() => openModal("shippingPolicy")} className="text-gray-300 hover:text-primary transition-colors">Shipping Policy</button></li>
                <li><button onClick={() => openModal("returnPolicy")} className="text-gray-300 hover:text-primary transition-colors">Return Policy</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-5">Customer Service</h4>
              <ul className="space-y-3">
                <li><button onClick={() => openModal("contactUs")} className="text-gray-300 hover:text-primary transition-colors">Contact Us</button></li>
                <li><button onClick={() => openModal("faqs")} className="text-gray-300 hover:text-primary transition-colors">FAQs</button></li>
                <li><button onClick={() => openModal("trackOrder")} className="text-gray-300 hover:text-primary transition-colors">Track Order</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-5">Contact Info</h4>
              <div className="space-y-3">
                {(storeInfo as any)?.owner?.phone && (
                  <p className="text-gray-300 text-sm flex items-center gap-2"><Phone className="w-4 h-4" /> {(storeInfo as any).owner.phone}</p>
                )}
                {(storeInfo as any)?.owner?.email && (
                  <p className="text-gray-300 text-sm flex items-center gap-2"><Mail className="w-4 h-4" /> {(storeInfo as any).owner.email}</p>
                )}
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} {storeInfo?.storeName}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 p-0 rounded-2xl">
          {selectedProduct && (
            <>
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="flex items-center justify-between dark:text-white text-2xl">
                  <span>{selectedProduct.name}</span>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSelectedProduct(null)}><X className="w-4 h-4" /></Button>
                </DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-8 p-6 pt-4">
                <div>
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    {selectedProduct.images?.[selectedImageIndex]?.url && (
                      <img src={selectedProduct.images[selectedImageIndex].url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  {selectedProduct.images?.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto py-2">
                      {selectedProduct.images.map((img, i) => (
                        <button 
                          key={i} 
                          onClick={() => setSelectedImageIndex(i)} 
                          className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImageIndex ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
                        >
                          <img src={img.url} alt={`view ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-3xl font-bold text-primary dark:text-primary">{fmt(selectedProduct.price)}</h3>
                      {selectedProduct.ratings && selectedProduct.ratings.average > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                            <span className="ml-1 font-medium dark:text-white">{selectedProduct.ratings.average.toFixed(1)}</span>
                          </div>
                          <span className="text-muted-foreground">({selectedProduct.ratings.count})</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full dark:text-gray-300">{selectedProduct.category}</span>
                      <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${selectedProduct.stock > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {selectedProduct.stock > 0 ? `✓ In Stock (${selectedProduct.stock})` : "✗ Out of Stock"}
                      </span>
                    </div>
                    {selectedProduct.description && (
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                        <h4 className="font-semibold mb-2 dark:text-white">Description</h4>
                        <p className="text-muted-foreground dark:text-gray-300 leading-relaxed">{selectedProduct.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <Button 
                      variant="default" 
                      className="w-full rounded-full h-12 bg-gradient-to-r from-primary to-primary/80" 
                      disabled={selectedProduct.stock === 0} 
                      onClick={() => addToCart(selectedProduct._id)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                    </Button>
                    <ReviewSection 
                      productId={selectedProduct._id} 
                      ratings={selectedProduct.ratings}
                      onReviewSubmitted={() => {
                        if (storeSlug) {
                          fetchDashboardData();
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 rounded-2xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="dark:text-white text-2xl">Secure Checkout</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCheckout} className="space-y-6 p-6 pt-4">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 p-5 rounded-xl">
              <h4 className="font-semibold mb-3 dark:text-white">Order Summary</h4>
              {cart?.items.map((item, i) => {
                const currentStock = getProductStock(item.product._id);
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2 py-1">
                      <span className="text-sm dark:text-gray-300">{item.product.name} × {item.quantity}</span>
                      <span className="text-sm font-medium dark:text-white">{fmt(item.price * item.quantity)}</span>
                    </div>
                    {currentStock > 0 && item.quantity > currentStock && (
                      <p className="text-xs text-red-500 mb-2">⚠️ Only {currentStock} available in stock</p>
                    )}
                  </div>
                );
              })}
              <Separator className="my-3" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{fmt(cartTotal)}</span>
              </div>
            </div>

            {hasStockIssues && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl p-4">
                <h4 className="font-semibold text-red-700 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Stock Issues Detected
                </h4>
                <ul className="space-y-1 text-sm text-red-600">
                  {cart?.items.map(item => {
                    const product = products.find(p => p._id === item.product._id);
                    if (product && item.quantity > product.stock) {
                      return (
                        <li key={item.product._id}>
                          • {item.product.name}: Requested {item.quantity}, Available {product.stock}
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>
              </div>
            )}

            <div className="space-y-5">
              <h4 className="font-semibold dark:text-white">Contact Information</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Full Name *" value={checkoutForm.name} onChange={e => setCheckoutForm(f => ({ ...f, name: e.target.value }))} required />
                <Input placeholder="Phone Number *" value={checkoutForm.phone} onChange={e => setCheckoutForm(f => ({ ...f, phone: e.target.value }))} required />
                <Input placeholder="Email" type="email" value={checkoutForm.email} onChange={e => setCheckoutForm(f => ({ ...f, email: e.target.value }))} />
                <Input placeholder="City/Location *" value={checkoutForm.location} onChange={e => setCheckoutForm(f => ({ ...f, location: e.target.value }))} required />
                <div className="md:col-span-2">
                  <Input placeholder="Full Address" value={checkoutForm.address} onChange={e => setCheckoutForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <select value={checkoutForm.shippingMethod} onChange={e => setCheckoutForm(f => ({ ...f, shippingMethod: e.target.value }))}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option value="standard">Standard Delivery (3-5 days)</option>
                  <option value="express">Express Delivery (1-2 days)</option>
                </select>
              </div>
              <Textarea placeholder="Order Notes (Optional)" value={checkoutForm.notes} onChange={e => setCheckoutForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
            </div>
            <DialogFooter className="gap-3">
              <Button type="button" variant="outline" onClick={() => setShowCheckout(false)}>Back to Cart</Button>
              <Button type="submit" disabled={isSubmitting || hasStockIssues || isCheckingOut}>
                {isCheckingOut ? "Processing..." : "Proceed to Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* My Orders Dialog */}
      <Dialog open={showOrders} onOpenChange={setShowOrders}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 rounded-2xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>My Orders</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-6 pt-4">
            <div className="flex gap-3">
              <Input 
                placeholder="Email, phone number, or order ID" 
                value={orderSearch} 
                onChange={e => setOrderSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && searchOrders()} 
              />
              <Button onClick={searchOrders} disabled={ordersLoading}>
                {ordersLoading ? "Searching..." : "Search"}
              </Button>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order._id} className="border rounded-xl p-5 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <div className="flex justify-between mb-4">
                      <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div><p className="text-xs text-muted-foreground">Order ID</p><p className="font-mono text-sm">{order.orderId}</p></div>
                      <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{formatDate(order.createdAt)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{order.customer.name}</p></div>
                      <div><p className="text-xs text-muted-foreground">Total</p><p className="font-medium text-primary">{fmt(order.payment.amount)}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 rounded-2xl p-0">
          {selectedOrder && (
            <>
              <DialogHeader className="p-6 pb-0">
                <DialogTitle>Order #{selectedOrder.orderId}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 p-6 pt-4">
                <div className={`p-5 rounded-xl ${getStatusColor(selectedOrder.status)}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                      {getStatusIcon(selectedOrder.status)}
                    </div>
                    <div>
                      <h4 className="font-semibold capitalize">Order {selectedOrder.status}</h4>
                      <p className="text-sm opacity-80">Placed on {formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-semibold mb-3">Customer Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> {selectedOrder.customer.name}</p>
                      <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.customer.phone}</p>
                      <p><span className="text-muted-foreground">Email:</span> {selectedOrder.customer.email || "—"}</p>
                      <p><span className="text-muted-foreground">Location:</span> {selectedOrder.customer.location}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-semibold mb-3">Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                      <p><span className="text-muted-foreground">Payment Status:</span> {selectedOrder.payment.status}</p>
                      <p><span className="text-muted-foreground">Total:</span> {fmt(selectedOrder.payment.amount)}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.products.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border rounded-xl">
                        <div className="flex-1">
                          <h5 className="font-medium">{item.name}</h5>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-primary">{fmt(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Success Dialog */}
      <Dialog open={!!orderComplete} onOpenChange={() => setOrderComplete(null)}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Order Placed! 🎉</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-muted-foreground">Your order has been placed successfully.</p>
            <Button onClick={() => setOrderComplete(null)}>Continue Shopping</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Negotiation Modal */}
      {negotiationModal.product && (
        <NegotiationModal
          open={negotiationModal.open}
          onClose={() => setNegotiationModal({ open: false, product: null })}
          product={negotiationModal.product}
          storeSlug={storeSlug || ''}
          storeOwnerId={(storeInfo as any)?.owner?._id || (storeInfo as any)?.userId || ''}
          customerName={checkoutForm.name || ''}
          customerEmail={checkoutForm.email || ''}
          customerPhone={checkoutForm.phone || ''}
        />
      )}
    </div>
  );
};

export default UserStorefront;