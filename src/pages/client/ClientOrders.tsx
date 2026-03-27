import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, Package, Clock, Truck, CheckCircle, XCircle, RefreshCw,
  ChevronLeft, ChevronRight, Eye, CreditCard, Phone, MapPin,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import { useOrderStore, Order } from "@/store/order.store";
import { useAuthStore } from "@/store/auth.store";
import { LayoutDashboard, ShoppingCart, TrendingUp, Image, Settings, Wallet } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { name: "My Products", href: "/client/products", icon: Package },
  { name: "Orders", href: "/client/orders", icon: ShoppingCart },
  { name: "Sales", href: "/client/sales", icon: TrendingUp },
  { name: "Payments", href: "/client/payments", icon: CreditCard },
  { name: "Wallet", href: "/client/wallet", icon: Wallet },
  { name: "Carousel", href: "/client/carousel", icon: Image },
  { name: "Settings", href: "/client/settings", icon: Settings },
];

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  delivered: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  processing: <Package className="w-4 h-4" />,
  shipped: <Truck className="w-4 h-4" />,
  delivered: <CheckCircle className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const ClientOrders = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { clientOrders, stats, clientTotal, clientTotalPages, clientCurrentPage, isLoading, fetchClientOrders, fetchOrderStats } = useOrderStore();
  const { user } = useAuthStore();

  const load = useCallback(() => {
    fetchClientOrders({ page, limit: 10, search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined });
  }, [page, search, statusFilter]);

  useEffect(() => { fetchOrderStats(); }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Client Portal" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Store Owner"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold mb-1">My Orders</h1>
              <p className="text-muted-foreground">Track orders placed through your store</p>
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
              <div
                key={s}
                className={`stat-card flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors ${statusFilter === s ? "border-primary" : ""}`}
                onClick={() => { setStatusFilter(s); setPage(1); }}
              >
                <div className={`p-2 rounded-lg ${statusColors[s]}`}>{statusIcons[s]}</div>
                <p className="text-xs text-muted-foreground capitalize">{s}</p>
                <p className="text-xl font-bold">{(stats as any)?.[s] ?? "—"}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by order ID, customer…" className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {["pending","processing","shipped","delivered","cancelled"].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="stat-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Customer</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Commission</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b">
                        {[...Array(6)].map((_, j) => <td key={j} className="p-4"><Skeleton className="h-4 w-full" /></td>)}
                      </tr>
                    ))
                  ) : clientOrders.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No orders found</td></tr>
                  ) : (
                    clientOrders.map((order) => (
                      <tr key={order._id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-sm">{order.orderId}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <p className="text-sm">{order.customer.name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                        </td>
                        <td className="p-4"><p className="font-semibold text-sm">{fmt(order.payment.amount)}</p></td>
                        <td className="p-4 hidden md:table-cell"><p className="text-sm text-muted-foreground">{fmt(order.payment.commission)}</p></td>
                        <td className="p-4">
                          <Badge className={`capitalize border text-xs flex items-center gap-1 w-fit ${statusColors[order.status] || ""}`}>
                            {statusIcons[order.status]}<span>{order.status}</span>
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}><Eye className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {clientTotalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">{clientOrders.length} of {clientTotal}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={clientCurrentPage <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                  <span className="px-3 py-1 text-sm">Page {clientCurrentPage} of {clientTotalPages}</span>
                  <Button variant="outline" size="sm" disabled={clientCurrentPage >= clientTotalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order: {selectedOrder?.orderId}</DialogTitle>
            <DialogDescription>Detailed order information</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={`capitalize border ${statusColors[selectedOrder.status] || ""}`}>{selectedOrder.status}</Badge>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                <p className="font-medium flex items-center gap-2"><Phone className="w-4 h-4" /> Customer Details</p>
                <p>{selectedOrder.customer.name}</p>
                <p className="text-muted-foreground">{selectedOrder.customer.email}</p>
                <p className="text-muted-foreground">{selectedOrder.customer.phone}</p>
                {selectedOrder.customer.location && (
                  <p className="text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedOrder.customer.location}</p>
                )}
              </div>
              <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                <p className="font-medium flex items-center gap-2"><Package className="w-4 h-4" /> Products</p>
                {selectedOrder.products.map((p, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{p.name} × {p.quantity}</span>
                    <span className="font-medium">{fmt(p.price * p.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-muted/30 p-3 rounded-lg space-y-1">
                <p className="font-medium flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment</p>
                <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">{fmt(selectedOrder.payment.amount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Your Earnings</span><span className="text-success font-semibold">{fmt(selectedOrder.payment.amount - selectedOrder.payment.commission)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Commission</span><span>{fmt(selectedOrder.payment.commission)}</span></div>
              </div>
              {selectedOrder.trackingNumber && (
                <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <Truck className="w-4 h-4" /><span>Tracking: {selectedOrder.trackingNumber}</span>
                </div>
              )}
              {selectedOrder.notes && <div className="bg-muted/30 p-3 rounded-lg"><p className="font-medium mb-1">Notes</p><p className="text-muted-foreground">{selectedOrder.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientOrders;
