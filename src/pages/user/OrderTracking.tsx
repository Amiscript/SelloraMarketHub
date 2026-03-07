import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/store/api/axiosInstance";
import { toast } from "@/hooks/use-toast";

interface TrackedOrder {
  _id: string;
  orderId: string;
  status: string;
  payment: { status: string; amount: number };
  customer: { name: string; email: string; phone: string; location: string };
  products: Array<{ name: string; quantity: number; price: number }>;
  shippingMethod: string;
  trackingNumber?: string;
  statusHistory?: Array<{ status: string; changedAt: string; note?: string }>;
  createdAt: string;
}

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

const statusIcon = (s: string) => {
  if (s === "delivered") return <CheckCircle className="w-4 h-4" />;
  if (s === "cancelled") return <XCircle className="w-4 h-4" />;
  if (s === "shipped") return <Truck className="w-4 h-4" />;
  if (s === "processing") return <Package className="w-4 h-4" />;
  return <Clock className="w-4 h-4" />;
};

const statusColor = (s: string) => {
  if (s === "delivered") return "bg-green-100 text-green-700 border-green-200";
  if (s === "cancelled") return "bg-red-100 text-red-700 border-red-200";
  if (s === "shipped") return "bg-blue-100 text-blue-700 border-blue-200";
  if (s === "processing") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
};

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<"id" | "email">("id");
  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [searched, setSearched] = useState(false);

  const trackById = async () => {
    if (!orderId.trim()) return;
    setIsLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/orders/track/${orderId.trim()}`);
      const o = res.data.order;
      setOrders(o ? [o] : []);
    } catch {
      setOrders([]);
      toast({ title: "Order not found", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const trackByEmail = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    setSearched(true);
    try {
      const res = await api.post("/orders/track-by-email", { email: email.trim() });
      setOrders(res.data.orders || []);
    } catch {
      setOrders([]);
      toast({ title: "No orders found for this email", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const stepIndex = (status: string) => STATUS_STEPS.indexOf(status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">

      {/* Top bar */}
      <div className="bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" />Home</Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">Order Tracking</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground text-sm">Enter your order ID or email to see your order status</p>
        </div>

        {/* Search card */}
        <div className="bg-background rounded-2xl shadow-md p-6 mb-6">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab("id")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "id" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              Order ID
            </button>
            <button
              onClick={() => setTab("email")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "email" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              Email Address
            </button>
          </div>

          {tab === "id" ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="e.g. ORD-2024-XXXXX"
                  className="pl-9"
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && trackById()}
                />
              </div>
              <Button onClick={trackById} disabled={isLoading || !orderId.trim()}>
                {isLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Track"}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email used when ordering"
                  className="pl-9"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && trackByEmail()}
                />
              </div>
              <Button onClick={trackByEmail} disabled={isLoading || !email.trim()}>
                {isLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Search"}
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        {searched && !isLoading && orders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No orders found</p>
            <p className="text-sm mt-1">Double-check your order ID or email and try again</p>
          </div>
        )}

        {orders.map(order => (
          <div key={order._id} className="bg-background rounded-2xl shadow-md overflow-hidden mb-4">
            {/* Order header */}
            <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-mono text-sm font-semibold">{order.orderId || order._id}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${statusColor(order.status)} border text-xs flex items-center gap-1`}>
                  {statusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                <Badge className={order.payment.status === "completed" ? "bg-green-100 text-green-700 border border-green-200 text-xs" : "bg-amber-100 text-amber-700 border border-amber-200 text-xs"}>
                  Payment: {order.payment.status}
                </Badge>
              </div>
            </div>

            {/* Progress tracker */}
            {order.status !== "cancelled" && (
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  {STATUS_STEPS.map((step, i) => {
                    const current = stepIndex(order.status);
                    const done = i <= current;
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                          {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
                        </div>
                        <p className={`text-xs mt-1 capitalize ${done ? "text-primary font-medium" : "text-muted-foreground"}`}>{step}</p>
                        {i < STATUS_STEPS.length - 1 && (
                          <div className={`absolute h-0.5 w-full ${done && i < current ? "bg-primary" : "bg-muted"}`} style={{ display: "none" }} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Line connector */}
                <div className="relative mt-2 mx-4">
                  <div className="h-1 bg-muted rounded-full" />
                  <div
                    className="h-1 bg-primary rounded-full absolute top-0 left-0 transition-all"
                    style={{ width: `${(Math.max(0, stepIndex(order.status)) / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Tracking number */}
            {order.trackingNumber && (
              <div className="px-6 py-3 bg-blue-50 border-b border-border flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700">Tracking Number: <span className="font-mono font-semibold">{order.trackingNumber}</span></span>
              </div>
            )}

            {/* Products */}
            <div className="p-4 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Items Ordered</p>
              {order.products.map((p, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span>{p.name} × {p.quantity}</span>
                  <span>₦{(p.price * p.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">₦{order.payment.amount.toLocaleString()}</span>
              </div>
            </div>

            {/* Delivery info */}
            <div className="p-4 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">{order.customer.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="font-medium">{order.customer.phone}</p>
                </div>
              </div>
            </div>

            {/* Status history */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="px-4 pb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Status History</p>
                <div className="space-y-2">
                  {[...order.statusHistory].reverse().map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
                      <div>
                        <span className="font-medium capitalize">{h.status}</span>
                        {h.note && <span className="text-muted-foreground"> — {h.note}</span>}
                        <p className="text-muted-foreground">{new Date(h.changedAt).toLocaleString("en-NG")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTracking;
