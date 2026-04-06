import { useState, useMemo, useEffect } from "react";
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
  Ruler, RotateCw, Clock as ClockIcon, DollarSign, PackageOpen, Eye
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

// ── Order types ───────────────────────────────────────────────────────────────
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
    pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
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

// ── Modal Components ────────────────────────────────────────────────────────────

// About Us Modal
const AboutUsModal = ({ open, onOpenChange, storeInfo }: { open: boolean; onOpenChange: (open: boolean) => void; storeInfo: any }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <Info className="w-6 h-6 text-primary" /> About {storeInfo?.storeName || "Us"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            {storeInfo?.logo?.url ? (
              <img src={storeInfo.logo.url} className="w-16 h-16 rounded-xl object-cover" alt="logo" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                {storeInfo?.storeName?.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold dark:text-white">{storeInfo?.storeName}</h3>
              <p className="text-sm text-muted-foreground">Verified Store</p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {storeInfo?.description || storeInfo?.storeDescription || "Welcome to our store! We are dedicated to providing high-quality products and exceptional customer service. Our mission is to bring you the best shopping experience with carefully curated items that meet your needs and exceed your expectations."}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Award className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-semibold dark:text-white">Our Mission</h4><p className="text-sm text-muted-foreground">To deliver quality products with exceptional service and customer satisfaction.</p></div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Eye className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-semibold dark:text-white">Our Vision</h4><p className="text-sm text-muted-foreground">To become the most trusted online shopping destination in Nigeria.</p></div>
          </div>
        </div>
        
        <div className="border-t dark:border-gray-700 pt-4">
          <h4 className="font-semibold mb-3 dark:text-white">Why Choose Us?</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /> Quality Products</div>
            <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /> Fast Delivery</div>
            <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /> Secure Payments</div>
            <div className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500" /> 24/7 Support</div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

// How to Order Modal
const HowToOrderModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <PackageOpen className="w-6 h-6 text-primary" /> How to Order
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="space-y-4">
          {[
            { step: 1, title: "Browse Products", desc: "Explore our collection and find the items you love.", icon: Search },
            { step: 2, title: "Add to Cart", desc: "Click 'Add to Cart' on products you wish to purchase.", icon: ShoppingCart },
            { step: 3, title: "Review Cart", desc: "Check your cart to confirm quantities and prices.", icon: CheckCircle },
            { step: 4, title: "Proceed to Checkout", desc: "Enter your shipping and contact information.", icon: CreditCard },
            { step: 5, title: "Make Payment", desc: "Complete payment securely via Paystack.", icon: Shield },
            { step: 6, title: "Track Order", desc: "Receive confirmation and track your delivery.", icon: Truck },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-primary">{item.step}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold dark:text-white">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <item.icon className="w-5 h-5 text-muted-foreground" />
            </div>
          ))}
        </div>
        <div className="bg-primary/5 rounded-xl p-4">
          <p className="text-sm text-center text-muted-foreground">Need help? <button className="text-primary hover:underline" onClick={() => onOpenChange(false)}>Contact our support team</button></p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

// Shipping Policy Modal
const ShippingPolicyModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <DeliveryTruck className="w-6 h-6 text-primary" /> Shipping Policy
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <h4 className="font-semibold mb-2 dark:text-white">Delivery Times</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Standard Delivery</span><span className="font-medium">3-5 business days</span></div>
            <div className="flex justify-between"><span>Express Delivery</span><span className="font-medium">1-2 business days</span></div>
            <div className="flex justify-between"><span>Same-Day Delivery (Lagos)</span><span className="font-medium">Order before 12pm</span></div>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <h4 className="font-semibold mb-2 dark:text-white">Shipping Costs</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Lagos</span><span>₦2,000 - ₦3,500</span></li>
            <li className="flex justify-between"><span>Other States</span><span>₦3,500 - ₦5,000</span></li>
            <li className="flex justify-between"><span>Free Shipping</span><span>Orders over ₦50,000</span></li>
          </ul>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
          <h4 className="font-semibold mb-2 dark:text-white">Important Notes</h4>
          <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
            <li>Orders are processed within 24 hours</li>
            <li>Tracking number provided after dispatch</li>
            <li>International shipping available on request</li>
            <li>Remote areas may incur additional delivery time</li>
          </ul>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

// Return Policy Modal
const ReturnPolicyModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <RotateCcw className="w-6 h-6 text-primary" /> Return Policy
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <h4 className="font-semibold mb-2 dark:text-white">7-Day Return Policy</h4>
          <p className="text-sm text-muted-foreground">You can return any item within 7 days of delivery for a full refund or exchange.</p>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-semibold dark:text-white">Conditions for Returns:</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><X className="w-4 h-4 text-red-500 mt-0.5" /> Item must be unused and in original packaging</li>
            <li className="flex items-start gap-2"><X className="w-4 h-4 text-red-500 mt-0.5" /> Tags must be attached</li>
            <li className="flex items-start gap-2"><X className="w-4 h-4 text-red-500 mt-0.5" /> Proof of purchase required</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Customer pays return shipping unless item is defective</li>
          </ul>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <h4 className="font-semibold mb-2 dark:text-white">Refund Timeline</h4>
          <div className="space-y-1 text-sm">
            <p>• Refunds processed within 5-7 business days after return inspection</p>
            <p>• Refunded to original payment method</p>
            <p>• Store credit available for faster processing</p>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

// FAQ Modal
const FAQModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    { q: "How long does delivery take?", a: "Standard delivery takes 3-5 business days, while express delivery takes 1-2 business days. Lagos customers may qualify for same-day delivery if ordered before 12pm." },
    { q: "Do you offer international shipping?", a: "Yes, we offer international shipping on request. Please contact our customer service for rates and delivery times." },
    { q: "How can I track my order?", a: "You'll receive a tracking number via email and SMS once your order is dispatched. You can also track your order in the 'My Orders' section." },
    { q: "What payment methods do you accept?", a: "We accept all major cards, bank transfers, USSD, and QR payments via Paystack. All transactions are secure and encrypted." },
    { q: "Can I modify my order after placing it?", a: "Orders can be modified within 1 hour of placement. Please contact customer support immediately if you need to make changes." },
    { q: "What if I receive a damaged item?", a: "Contact us within 24 hours of delivery with photos of the damage. We'll arrange a replacement or refund immediately." },
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
            <HelpCircle className="w-6 h-6 text-primary" /> Frequently Asked Questions
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span className="font-medium dark:text-white">{faq.q}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${openIndex === idx ? "rotate-90" : ""}`} />
              </button>
              {openIndex === idx && (
                <div className="p-4 pt-0 text-sm text-muted-foreground border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Contact Us Modal
const ContactUsModal = ({ open, onOpenChange, storeInfo, whatsapp }: { open: boolean; onOpenChange: (open: boolean) => void; storeInfo: any; whatsapp: string }) => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Message Sent!", description: "We'll get back to you shortly." });
    setFormData({ name: "", email: "", message: "" });
    setSubmitting(false);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
            <Mail className="w-6 h-6 text-primary" /> Contact Us
          </DialogTitle>
          <DialogDescription>We'd love to hear from you! Send us a message and we'll respond within 24 hours.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid md:grid-cols-2 gap-4">
            {(storeInfo?.owner?.phone || whatsapp) && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                <Phone className="w-5 h-5 text-green-600" />
                <div><p className="text-xs text-muted-foreground">Call/WhatsApp</p><p className="font-medium dark:text-white">{whatsapp || storeInfo?.owner?.phone}</p></div>
              </div>
            )}
            {storeInfo?.owner?.email && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <Mail className="w-5 h-5 text-blue-600" />
                <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium dark:text-white">{storeInfo.owner.email}</p></div>
              </div>
            )}
            {storeInfo?.owner?.address && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 md:col-span-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <div><p className="text-xs text-muted-foreground">Address</p><p className="font-medium dark:text-white">{storeInfo.owner.address}</p></div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Your Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="rounded-lg" />
            <Input type="email" placeholder="Your Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="rounded-lg" />
            <Textarea placeholder="Your Message" rows={4} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} required className="rounded-lg resize-none" />
            <Button type="submit" disabled={submitting} className="w-full rounded-full bg-gradient-to-r from-primary to-primary/80">
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Track Order Modal
const TrackOrderModal = ({ open, onOpenChange, onSearchOrders }: { open: boolean; onOpenChange: (open: boolean) => void; onSearchOrders: () => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <Truck className="w-6 h-6 text-primary" /> Track Your Order
        </DialogTitle>
        <DialogDescription>Enter your order ID, email, or phone number to track your order</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <Input placeholder="Order ID, Email, or Phone Number" className="rounded-lg" />
        <Button onClick={() => { onSearchOrders(); onOpenChange(false); }} className="w-full rounded-full">Track Order</Button>
        <p className="text-xs text-center text-muted-foreground">Don't have your order ID? <button className="text-primary hover:underline" onClick={() => { onOpenChange(false); }}>Search by email or phone</button></p>
      </div>
    </DialogContent>
  </Dialog>
);

// Returns & Refunds Modal
const ReturnsRefundsModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <RotateCcw className="w-6 h-6 text-primary" /> Returns & Refunds
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <h4 className="font-semibold mb-2 dark:text-white">Return Process</h4>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>Contact our support team within 7 days of delivery</li>
            <li>Provide your order ID and reason for return</li>
            <li>Receive return authorization and shipping instructions</li>
            <li>Ship the item back in original condition</li>
            <li>Refund processed within 5-7 business days after inspection</li>
          </ol>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
          <h4 className="font-semibold mb-2 dark:text-white">Non-Returnable Items</h4>
          <ul className="space-y-1 text-sm list-disc list-inside">
            <li>Personal care items (opened)</li>
            <li>Perishable goods</li>
            <li>Custom or personalized items</li>
            <li>Digital downloads</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <h4 className="font-semibold mb-2 dark:text-white">Refund Methods</h4>
          <p className="text-sm text-muted-foreground">Refunds are processed to the original payment method. Store credit is available for faster processing.</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

// Size Guide Modal
const SizeGuideModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <Ruler className="w-6 h-6 text-primary" /> Size Guide
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2">Size</th><th className="text-left">Chest (in)</th><th className="text-left">Waist (in)</th><th className="text-left">Hip (in)</th>
               </tr>
            </thead>
            <tbody>
              {[{ size: "XS", chest: "32-34", waist: "24-26", hip: "34-36" }, { size: "S", chest: "35-37", waist: "27-29", hip: "37-39" }, { size: "M", chest: "38-40", waist: "30-32", hip: "40-42" }, { size: "L", chest: "41-43", waist: "33-35", hip: "43-45" }, { size: "XL", chest: "44-46", waist: "36-38", hip: "46-48" }].map(s => (
                <tr key={s.size} className="border-b dark:border-gray-700"><td className="py-2 font-medium">{s.size}</td><td>{s.chest}</td><td>{s.waist}</td><td>{s.hip}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <p className="text-sm text-muted-foreground text-center">How to measure: Use a soft measuring tape and measure around the fullest part of each area.</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

// Terms & Conditions Modal
const TermsConditionsModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <FileText className="w-6 h-6 text-primary" /> Terms & Conditions
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <h4 className="font-semibold mb-2 dark:text-white">1. Acceptance of Terms</h4>
          <p className="text-sm text-muted-foreground">By accessing and using this website, you accept and agree to be bound by these terms and conditions.</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <h4 className="font-semibold mb-2 dark:text-white">2. Product Information</h4>
          <p className="text-sm text-muted-foreground">We strive to display accurate product information but cannot guarantee that colors, details, or specifications are error-free.</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <h4 className="font-semibold mb-2 dark:text-white">3. Pricing</h4>
          <p className="text-sm text-muted-foreground">All prices are in Nigerian Naira (₦) and include applicable taxes unless stated otherwise.</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <h4 className="font-semibold mb-2 dark:text-white">4. Privacy Policy</h4>
          <p className="text-sm text-muted-foreground">Your personal information is protected and used only for order processing and communication.</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <h4 className="font-semibold mb-2 dark:text-white">5. Limitation of Liability</h4>
          <p className="text-sm text-muted-foreground">We are not liable for any indirect damages arising from the use of our products or services.</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

// Customer Service Modal
const CustomerServiceModal = ({ open, onOpenChange, storeInfo, whatsapp }: { open: boolean; onOpenChange: (open: boolean) => void; storeInfo: any; whatsapp: string }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl flex items-center gap-2 dark:text-white">
          <Headphones className="w-6 h-6 text-primary" /> Customer Service
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
            <Phone className="w-8 h-8 text-blue-600 mb-2" />
            <p className="font-semibold dark:text-white">Phone Support</p>
            <p className="text-sm text-muted-foreground">{whatsapp || storeInfo?.owner?.phone || "Available 9AM-6PM"}</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
            <Mail className="w-8 h-8 text-green-600 mb-2" />
            <p className="font-semibold dark:text-white">Email Support</p>
            <p className="text-sm text-muted-foreground">{storeInfo?.owner?.email || "support@store.com"}</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
            <MessageCircle className="w-8 h-8 text-purple-600 mb-2" />
            <p className="font-semibold dark:text-white">Live Chat</p>
            <p className="text-sm text-muted-foreground">24/7 WhatsApp Support</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20">
            <ClockIcon className="w-8 h-8 text-amber-600 mb-2" />
            <p className="font-semibold dark:text-white">Business Hours</p>
            <p className="text-sm text-muted-foreground">Mon-Fri: 9AM-6PM<br />Sat: 10AM-2PM</p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <p className="text-sm text-center text-muted-foreground">For urgent inquiries, please use the floating WhatsApp button or call our support line.</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

// ── Review Section ────────────────────────────────────────────────────────────
const ReviewSection = ({ productId, ratings }: { productId: string; ratings: any }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const { submitReview, fetchReviews } = useProductStore();

  useEffect(() => {
    fetchReviews(productId).then(d => setReviews(d.reviews || []));
  }, [productId]);

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
      setName(""); setComment(""); setRating(5);
      fetchReviews(productId).then(d => setReviews(d.reviews || []));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-4 border-t dark:border-gray-700 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold dark:text-white flex items-center gap-2">
          <StarIcon className="w-4 h-4 text-amber-500" />
          Customer Reviews ({ratings?.count ?? reviews.length})
        </h4>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="rounded-full">
          {showForm ? "Cancel" : "Write a Review"}
        </Button>
      </div>

      {ratings && ratings.count > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl">
          <div className="text-center">
            <span className="text-4xl font-bold dark:text-white">{ratings.average.toFixed(1)}</span>
            <div className="flex mt-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(ratings.average) ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{ratings.count} reviews</p>
          </div>
          <div className="flex-1">
            <div className="space-y-1">
              {[5,4,3,2,1].map(star => {
                const count = ratings.distribution?.[star] || 0;
                const percentage = ratings.count ? (count / ratings.count) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-6 text-muted-foreground">{star}★</span>
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percentage}%` }} />
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
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" className="mt-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg" />
            </div>
            <div>
              <Label className="text-sm font-medium dark:text-gray-300">Rating</Label>
              <div className="flex gap-1.5 mt-2">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setRating(s)} type="button" className="transition-transform hover:scale-110">
                    <Star className={`w-7 h-7 cursor-pointer transition-all ${s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium dark:text-gray-300">Your Review</Label>
              <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience with this product..." rows={3} className="mt-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg resize-none" />
            </div>
            <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
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
                  {r.name.charAt(0).toUpperCase()}
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
            <p className="text-xs text-muted-foreground/60 mt-2">{new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const UserStorefront = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
console.log("Store slug from params:", storeSlug); // Add this line

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

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

  const { storeInfo, products, cart, isLoading, isSubmitting, fetchStorefront, fetchStoreProducts, fetchCart, manageCart, placeOrder } = useStorefrontStore();
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

  useEffect(() => {
    if (!storeSlug) return;
    fetchStorefront(storeSlug);
    fetchStoreProducts(storeSlug);
    fetchCart(storeSlug);
    fetchStoreCarousels(storeSlug);
  }, [storeSlug]);

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

const addToCart = async (productId: string) => {
  if (!storeSlug) return;
  try {
    await manageCart(storeSlug, "add", productId, 1);  // ← CALLS WITH "add" ACTION
    toast({ title: "Added to Cart", description: "Product has been added to your cart" });
  } catch {
    toast({ title: "Error", description: "Failed to add to cart" });
  }
};

const updateCart = async (productId: string, quantity: number) => {
  if (!storeSlug) return;
  try {
    if (quantity === 0) await manageCart(storeSlug, "remove", productId);  // ← CALLS WITH "remove"
    else await manageCart(storeSlug, "update", productId, quantity);        // ← CALLS WITH "update"
  } catch {
    toast({ title: "Error", description: "Failed to update cart", variant: "destructive" });
  }
};

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSlug) return;
    try {
      const result = await placeOrder(storeSlug, {
        customer: { name: checkoutForm.name, phone: checkoutForm.phone, email: checkoutForm.email, location: checkoutForm.location },
        shippingAddress: checkoutForm.address || checkoutForm.location,
        shippingMethod: checkoutForm.shippingMethod,
        notes: checkoutForm.notes,
      });
      setOrderComplete(result);
      setShowCheckout(false);
      if (result.paymentUrl) window.location.href = result.paymentUrl;
    } catch (err: any) {
      toast({ title: "Order failed", description: err.message, variant: "destructive" });
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
      <AboutUsModal open={modals.aboutUs} onOpenChange={(open) => closeModal("aboutUs")} storeInfo={storeInfo} />
      <HowToOrderModal open={modals.howToOrder} onOpenChange={(open) => closeModal("howToOrder")} />
      <ShippingPolicyModal open={modals.shippingPolicy} onOpenChange={(open) => closeModal("shippingPolicy")} />
      <ReturnPolicyModal open={modals.returnPolicy} onOpenChange={(open) => closeModal("returnPolicy")} />
      <FAQModal open={modals.faqs} onOpenChange={(open) => closeModal("faqs")} />
      <ContactUsModal open={modals.contactUs} onOpenChange={(open) => closeModal("contactUs")} storeInfo={storeInfo} whatsapp={whatsapp} />
      <TrackOrderModal open={modals.trackOrder} onOpenChange={(open) => closeModal("trackOrder")} onSearchOrders={() => { setShowOrders(true); setOrderSearch(""); }} />
      <ReturnsRefundsModal open={modals.returnsRefunds} onOpenChange={(open) => closeModal("returnsRefunds")} />
      <SizeGuideModal open={modals.sizeGuide} onOpenChange={(open) => closeModal("sizeGuide")} />
      <TermsConditionsModal open={modals.termsConditions} onOpenChange={(open) => closeModal("termsConditions")} />
      <CustomerServiceModal open={modals.customerService} onOpenChange={(open) => closeModal("customerService")} storeInfo={storeInfo} whatsapp={whatsapp} />

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
          className="rounded-full w-14 h-14 shadow-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all hover:scale-110 animate-pulse" size="icon">
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
                  <Button variant="default" className="relative rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md">
                    <ShoppingCart className="w-4 h-4 mr-2" /> Cart
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">{cartCount}</span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="dark:bg-gray-800 dark:border-gray-700 w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle className="dark:text-white text-xl flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Your Cart ({cartCount} items)
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col h-full mt-6">
                    <div className="flex-1 overflow-y-auto py-4 space-y-3">
                      {!cart?.items.length ? (
                        <div className="text-center py-16 text-muted-foreground">
                          <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-40" />
                          <p className="text-lg font-medium">Your cart is empty</p>
                          <p className="text-sm mt-1">Add some products to get started</p>
                          <Button variant="outline" className="mt-6 rounded-full" onClick={() => setCartOpen(false)}>Continue Shopping</Button>
                        </div>
                      ) : cart.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
                          {item.product.images?.[0]?.url && (
                            <img src={item.product.images[0].url} className="w-16 h-16 rounded-lg object-cover" alt={item.product.name} />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate dark:text-white">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">{fmt(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => updateCart(item.product._id, item.quantity - 1)} className="rounded-full w-8 h-8">
                              <Minus className="w-3 h-3" />
                            </Button>
                            
                            <span className="w-8 text-center font-medium dark:text-white">{item.quantity}</span>
                            <Button variant="outline" size="icon" onClick={() => updateCart(item.product._id, item.quantity + 1)} className="rounded-full w-8 h-8">
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {cart && cart.items.length > 0 && (
                      <div className="border-t pt-4 space-y-4 dark:border-gray-700">
                        <div className="flex justify-between text-lg font-bold dark:text-white">
                          <span>Subtotal</span>
                          <span className="text-primary">{fmt(cartTotal)}</span>
                        </div>
                        <Button variant="default" className="w-full rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" onClick={() => { setCartOpen(false); setShowCheckout(true); }}>
                          Proceed to Checkout
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">Free shipping on orders over ₦50,000</p>
                      </div>
                    )}
                  </div>
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

      {/* Search & Filter */}
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
                  {product.stock > 0 && product.stock < 10 && (
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
                  {product.ratings && (
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
                  <div className="grid md:grid-cols-3 gap-5 mt-6">
                    {(storeInfo as any)?.owner?.email && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Mail className="w-5 h-5 text-primary" /></div>
                        <div className="text-left">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm font-medium dark:text-white">{(storeInfo as any).owner.email}</p>
                        </div>
                      </div>
                    )}
                    {(storeInfo as any)?.owner?.phone && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Phone className="w-5 h-5 text-primary" /></div>
                        <div className="text-left">
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm font-medium dark:text-white">{(storeInfo as any).owner.phone}</p>
                        </div>
                      </div>
                    )}
                    {(storeInfo as any)?.owner?.address && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-primary" /></div>
                        <div className="text-left">
                          <p className="text-xs text-muted-foreground">Address</p>
                          <p className="text-sm font-medium dark:text-white">{(storeInfo as any).owner.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
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

      {/* Professional Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {((storeInfo as any)?.profileImage?.url || (storeInfo as any)?.logo?.url) ? (
                  <img src={(storeInfo as any)?.profileImage?.url || (storeInfo as any)?.logo?.url} className="w-12 h-12 rounded-xl object-cover" alt="logo" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center font-bold text-white text-lg">
                    {storeInfo?.storeName?.charAt(0)}
                  </div>
                )}
                <h3 className="text-xl font-bold">{storeInfo?.storeName}</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Your trusted partner for quality products and exceptional service. 
                We're committed to providing the best shopping experience with fast delivery and secure payments.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-all duration-300 flex items-center justify-center hover:scale-110">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-all duration-300 flex items-center justify-center hover:scale-110">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-all duration-300 flex items-center justify-center hover:scale-110">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-all duration-300 flex items-center justify-center hover:scale-110">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-5 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" /> Quick Links
              </h4>
              <ul className="space-y-3">
                <li><button onClick={() => openModal("aboutUs")} className="text-gray-300 hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> About Us</button></li>
                <li><button onClick={() => openModal("howToOrder")} className="text-gray-300 hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> How to Order</button></li>
                <li><button onClick={() => openModal("shippingPolicy")} className="text-gray-300 hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Shipping Policy</button></li>
                <li><button onClick={() => openModal("returnPolicy")} className="text-gray-300 hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Return Policy</button></li>
                <li><button onClick={() => openModal("faqs")} className="text-gray-300 hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> FAQs</button></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="font-semibold text-lg mb-5 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-primary" /> Customer Service
              </h4>
              <ul className="space-y-3">
                <li><button onClick={() => openModal("customerService")} className="text-gray-300 hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Contact Us</button></li>
                <li><button onClick={() => openModal("trackOrder")} className="text-gray-300 hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Track Order</button></li>
                <li><button onClick={() => openModal("returnsRefunds")} className="text-gray-300 hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Returns & Refunds</button></li>
                <li><button onClick={() => openModal("sizeGuide")} className="text-gray-300 hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Size Guide</button></li>
                <li><button onClick={() => openModal("termsConditions")} className="text-gray-300 hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Terms & Conditions</button></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-lg mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Get in Touch
              </h4>
              <div className="space-y-4">
                {(storeInfo as any)?.owner?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{(storeInfo as any).owner.address}</span>
                  </div>
                )}
                {(storeInfo as any)?.owner?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{(storeInfo as any).owner.phone}</span>
                  </div>
                )}
                {(storeInfo as any)?.owner?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{(storeInfo as any).owner.email}</span>
                  </div>
                )}
                {whatsapp && (
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">WhatsApp Available</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-gray-700 border-b border-gray-700 mb-8">
            <div className="text-center group">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/30 transition-colors">
                <DeliveryTruck className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-semibold">Free Shipping</p>
              <p className="text-xs text-gray-400">On orders over ₦50,000</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/30 transition-colors">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-semibold">Secure Payment</p>
              <p className="text-xs text-gray-400">100% secure transactions</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/30 transition-colors">
                <RotateCcw className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-semibold">Easy Returns</p>
              <p className="text-xs text-gray-400">7-day return policy</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/30 transition-colors">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-semibold">24/7 Support</p>
              <p className="text-xs text-gray-400">Dedicated customer care</p>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} {storeInfo?.storeName}. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <img src="https://via.placeholder.com/40x24?text=Visa" alt="Visa" className="h-6" />
              <img src="https://via.placeholder.com/40x24?text=MC" alt="Mastercard" className="h-6" />
              <img src="https://via.placeholder.com/40x24?text=Paystack" alt="Paystack" className="h-6" />
            </div>
            <div className="text-sm text-gray-400">
              Powered by <span className="text-primary font-medium">Sellora MarketHub</span>
            </div>
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
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full"><Share2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-full"><Heart className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSelectedProduct(null)}><X className="w-4 h-4" /></Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-8 p-6 pt-4">
                {/* Images */}
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
                {/* Info */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-3xl font-bold text-primary dark:text-primary">{fmt(selectedProduct.price)}</h3>
                        {selectedProduct?.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                          <p className="text-sm text-muted-foreground line-through">{fmt(selectedProduct.originalPrice)}</p>
                        )}
                      </div>
                      {selectedProduct.ratings && (
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
                    <div className="flex gap-4">
                      <Button 
                        variant="default" 
                        className="flex-1 rounded-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                        disabled={selectedProduct.stock === 0} 
                        onClick={() => addToCart(selectedProduct._id)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 rounded-full h-12" 
                        disabled={selectedProduct.stock === 0} 
                        onClick={() => { 
                          addToCart(selectedProduct._id); 
                          setSelectedProduct(null); 
                          setCartOpen(true); 
                        }}
                      >
                        Buy Now
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full rounded-full h-12 border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                      disabled={selectedProduct.stock === 0}
                      onClick={() => {
                        setNegotiationModal({ open: true, product: selectedProduct });
                        setSelectedProduct(null);
                      }}
                    >
                     Negotiate Price
                    </Button>
                    {selectedProduct.stock === 0 && <p className="text-red-500 text-sm text-center">Currently out of stock</p>}
                    {whatsapp && (
                      <div className="pt-4 border-t dark:border-gray-700">
                        <Button variant="ghost" className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full" onClick={() => openWhatsApp(`Hello! I have a question about the ${selectedProduct.name}. Can you tell me more?`)}>
                          <MessageCircle className="w-4 h-4 mr-2" /> Ask about this product on WhatsApp
                        </Button>
                      </div>
                    )}
                    <ReviewSection productId={selectedProduct._id} ratings={selectedProduct.ratings} />
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
            <DialogDescription className="dark:text-gray-400">Complete your purchase with confidence</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCheckout} className="space-y-6 p-6 pt-4">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 p-5 rounded-xl">
              <h4 className="font-semibold mb-3 dark:text-white flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Order Summary</h4>
              {cart?.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center mb-2 py-1">
                  <span className="text-sm dark:text-gray-300">{item.product.name} × {item.quantity}</span>
                  <span className="text-sm font-medium dark:text-white">{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
              <Separator className="my-3 dark:bg-gray-600" />
              <div className="flex justify-between text-lg font-bold dark:text-white">
                <span>Total</span>
                <span className="text-primary">{fmt(cartTotal)}</span>
              </div>
            </div>
            <div className="space-y-5">
              <h4 className="font-semibold dark:text-white flex items-center gap-2"><User className="w-4 h-4" /> Contact Information</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Full Name <span className="text-red-500">*</span></Label>
                  <Input placeholder="John Doe" value={checkoutForm.name} onChange={e => setCheckoutForm(f => ({ ...f, name: e.target.value }))} required className="dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Phone Number <span className="text-red-500">*</span></Label>
                  <Input placeholder="+234..." value={checkoutForm.phone} onChange={e => setCheckoutForm(f => ({ ...f, phone: e.target.value }))} required className="dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Email Address</Label>
                  <Input type="email" placeholder="you@example.com" value={checkoutForm.email} onChange={e => setCheckoutForm(f => ({ ...f, email: e.target.value }))} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">City/Location <span className="text-red-500">*</span></Label>
                  <Input placeholder="City, State" value={checkoutForm.location} onChange={e => setCheckoutForm(f => ({ ...f, location: e.target.value }))} required className="dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="dark:text-gray-300">Full Address</Label>
                  <Input placeholder="Street address, apartment..." value={checkoutForm.address} onChange={e => setCheckoutForm(f => ({ ...f, address: e.target.value }))} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">City</Label>
                  <Input placeholder="City" value={checkoutForm.city} onChange={e => setCheckoutForm(f => ({ ...f, city: e.target.value }))} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">State/Province</Label>
                  <Input placeholder="State" value={checkoutForm.state} onChange={e => setCheckoutForm(f => ({ ...f, state: e.target.value }))} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Shipping Method</Label>
                  <select value={checkoutForm.shippingMethod} onChange={e => setCheckoutForm(f => ({ ...f, shippingMethod: e.target.value }))}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="standard">🚚 Standard Delivery (3-5 days)</option>
                    <option value="express">⚡ Express Delivery (1-2 days)</option>
                    <option value="pickup">🏪 Pickup at Store</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="dark:text-gray-300">Order Notes (Optional)</Label>
                <Textarea placeholder="Special instructions, delivery preferences..." value={checkoutForm.notes} onChange={e => setCheckoutForm(f => ({ ...f, notes: e.target.value }))} rows={3} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg resize-none" />
              </div>
              <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                <h4 className="font-semibold dark:text-white flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment Method</h4>
                <div className="flex items-center gap-4 p-4 border rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><CreditCard className="w-6 h-6 text-primary" /></div>
                  <div className="flex-1">
                    <p className="font-medium dark:text-white">Paystack Payment</p>
                    <p className="text-sm text-muted-foreground">Secure payment via Paystack (Cards, Bank Transfer, USSD, etc.)</p>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCheckout(false)} className="rounded-full px-6">Back to Cart</Button>
              <Button type="submit" variant="default" disabled={isSubmitting || !checkoutForm.name || !checkoutForm.phone || !checkoutForm.location} className="rounded-full px-6 bg-gradient-to-r from-primary to-primary/80">
                <CreditCard className="w-4 h-4 mr-2" />
                {isSubmitting ? "Processing..." : "Proceed to Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* My Orders Dialog */}
      <Dialog open={showOrders} onOpenChange={setShowOrders}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 rounded-2xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="dark:text-white text-2xl flex items-center gap-2"><Package className="w-5 h-5" /> My Orders</DialogTitle>
            <DialogDescription className="dark:text-gray-400">Enter your email, phone number, or order ID to track your orders</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 p-6 pt-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Email, phone number, or order ID" 
                  value={orderSearch} 
                  onChange={e => setOrderSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && searchOrders()} 
                  className="pl-11 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-full h-12" 
                />
              </div>
              <Button onClick={searchOrders} disabled={ordersLoading} className="rounded-full px-8 h-12">
                {ordersLoading ? "Searching..." : "Search"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">Tip: Search by email, phone number, or order ID to find your orders</p>
            <Separator className="dark:bg-gray-700" />
            {orders.length === 0 ? (
              <div className="text-center py-12 border rounded-xl dark:border-gray-700">
                <Package className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground font-medium mb-1">No orders found</p>
                <p className="text-sm text-muted-foreground">Enter your details above to find your orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground bg-gray-100 dark:bg-gray-700/50 inline-block px-3 py-1 rounded-full">{orders.length} order(s) found</p>
                {orders.map(order => (
                  <div key={order._id} className="border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer dark:border-gray-700 dark:hover:bg-gray-700/30" onClick={() => setSelectedOrder(order)}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}<span className="capitalize">{order.status}</span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${order.payment.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                          {order.payment.status.toUpperCase()}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Order ID</p>
                        <p className="font-mono text-sm font-medium dark:text-white">{order.orderId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-medium dark:text-white">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Customer</p>
                        <p className="font-medium dark:text-white">{order.customer.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-medium text-primary">{fmt(order.payment.amount)}</p>
                      </div>
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
                <DialogTitle className="flex items-center justify-between dark:text-white">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5" />
                    <span>Order #{selectedOrder.orderId}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Printing..." })} className="rounded-full">
                      <Printer className="w-4 h-4 mr-1" /> Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Downloading..." })} className="rounded-full">
                      <Download className="w-4 h-4 mr-1" /> PDF
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 p-6 pt-4">
                <div className={`p-5 rounded-xl ${getStatusColor(selectedOrder.status)}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                      {getStatusIcon(selectedOrder.status)}
                    </div>
                    <div>
                      <h4 className="font-semibold capitalize text-lg">Order {selectedOrder.status}</h4>
                      <p className="text-sm opacity-80">{selectedOrder.status === "delivered" ? `Delivered on ${formatDate(selectedOrder.deliveryDate)}` : `Placed on ${formatDate(selectedOrder.createdAt)}`}</p>
                    </div>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div className="mt-4 pt-4 border-t border-current/20">
                      <p className="text-sm font-medium">Tracking Number</p>
                      <p className="font-mono text-sm">{selectedOrder.trackingNumber}</p>
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                    <h4 className="font-semibold flex items-center gap-2 mb-3 dark:text-white"><User className="w-4 h-4" /> Customer Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600"><span className="text-muted-foreground">Name</span><span className="dark:text-white font-medium">{selectedOrder.customer.name}</span></div>
                      <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600"><span className="text-muted-foreground">Email</span><span className="dark:text-white">{selectedOrder.customer.email || "—"}</span></div>
                      <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600"><span className="text-muted-foreground">Phone</span><span className="dark:text-white">{selectedOrder.customer.phone}</span></div>
                      <div className="flex justify-between py-1"><span className="text-muted-foreground">Location</span><span className="dark:text-white">{selectedOrder.customer.location}</span></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                    <h4 className="font-semibold flex items-center gap-2 mb-3 dark:text-white"><Calendar className="w-4 h-4" /> Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600"><span className="text-muted-foreground">Date</span><span className="dark:text-white">{formatDate(selectedOrder.createdAt)}</span></div>
                      <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-600"><span className="text-muted-foreground">Payment Status</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${selectedOrder.payment.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                          {selectedOrder.payment.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between py-1"><span className="text-muted-foreground">Payment Method</span><span className="dark:text-white capitalize">{selectedOrder.payment.method || "Paystack"}</span></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 dark:text-white flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Order Items ({selectedOrder.products.length})</h4>
                  <div className="space-y-3">
                    {selectedOrder.products.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border rounded-xl dark:border-gray-700 bg-white dark:bg-gray-800/50">
                        {item.images?.[0]?.url && <img src={item.images[0].url} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />}
                        <div className="flex-1">
                          <h5 className="font-medium dark:text-white">{item.name}</h5>
                          <p className="text-sm text-muted-foreground">Unit Price: {fmt(item.price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-primary">{fmt(item.price * item.quantity)}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-4 dark:border-gray-700">
                  <div className="flex justify-between text-xl font-bold dark:text-white">
                    <span>Total Amount</span>
                    <span className="text-primary">{fmt(selectedOrder.payment.amount)}</span>
                  </div>
                </div>
                <DialogFooter className="gap-3">
                  <Button variant="outline" onClick={() => setSelectedOrder(null)} className="rounded-full">Close</Button>
                  {whatsapp && (
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-full"
                      onClick={() => openWhatsApp(`Hello! I have a question about my order ${selectedOrder.orderId}`)}>
                      <MessageCircle className="w-4 h-4 mr-2" /> Chat About Order
                    </Button>
                  )}
                  {selectedOrder.status === "delivered" && (
                    <Button variant="outline" onClick={() => toast({ title: "Return request submitted" })} className="rounded-full">Request Return</Button>
                  )}
                  {selectedOrder.status === "shipped" && (
                    <Button onClick={() => toast({ title: "Tracking opened" })} className="rounded-full">Track Package</Button>
                  )}
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Success Dialog */}
      <Dialog open={!!orderComplete} onOpenChange={() => setOrderComplete(null)}>
        <DialogContent className="max-w-sm text-center dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="dark:text-white text-2xl">Order Placed! 🎉</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-muted-foreground">Your order has been placed successfully.</p>
            {orderComplete?.order?.orderId && (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="font-mono font-medium dark:text-white">{orderComplete.order.orderId}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">You will receive a confirmation email shortly.</p>
          </div>
          <Button onClick={() => setOrderComplete(null)} className="w-full rounded-full bg-gradient-to-r from-primary to-primary/80">Continue Shopping</Button>
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