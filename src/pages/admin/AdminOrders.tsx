import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, Eye, Truck, CheckCircle, XCircle, Clock, Package,
  MapPin, Phone, Mail, CreditCard, Calendar, RefreshCw,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useOrderStore, Order } from "@/store/order.store";
import { useAuthStore } from "@/store/auth.store";
import { LayoutDashboard, ShoppingCart, Users, CreditCard as CIcon, Image, UserCog, TrendingUp } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Sales Management", href: "/admin/sales", icon: ShoppingCart },
  { name: "Client Management", href: "/admin/clients", icon: Users },
  { name: "Payment Management", href: "/admin/payments", icon: CIcon },
  { name: "Order Tracking", href: "/admin/orders", icon: Package },
  { name: "Product Management", href: "/admin/products", icon: Package },
  { name: "Carousel Management", href: "/admin/carousel", icon: Image },
  { name: "Sub-Admin Management", href: "/admin/sub-admins", icon: UserCog },
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

const AdminOrders = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateDialog, setUpdateDialog] = useState<{ order: Order; newStatus: string } | null>(null);
  const [tracking, setTracking] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [page, setPage] = useState(1);

  const { orders, stats, total, totalPages, currentPage, isLoading, isSubmitting, fetchOrders, fetchOrderStats, updateOrderStatus } = useOrderStore();
  const { user } = useAuthStore();

  const load = useCallback(() => {
    fetchOrders({ page, limit: 10, search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined });
  }, [page, search, statusFilter]);

  useEffect(() => { fetchOrderStats(); }, []);
  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async () => {
    if (!updateDialog) return;
    try {
      await updateOrderStatus(updateDialog.order._id, updateDialog.newStatus, {
        trackingNumber: tracking || undefined,
        adminNotes: adminNotes || undefined,
        cancellationReason: cancelReason || undefined,
      });
      toast({ title: "Order Updated", description: `Order status changed to ${updateDialog.newStatus}` });
      setUpdateDialog(null);
      setTracking(""); setAdminNotes(""); setCancelReason("");
      if (selectedOrder?._id === updateDialog.order._id) setSelectedOrder(null);
    } catch {
      toast({ title: "Error", description: "Failed to update order", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Admin Panel" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Admin"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold mb-1">Order Tracking</h1>
              <p className="text-muted-foreground">Monitor and manage all customer orders</p>
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["pending","processing","shipped","delivered","cancelled"].map((s) => (
              <div key={s} className="stat-card flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors" onClick={() => { setStatusFilter(s); setPage(1); }}>
                <div className={`p-2 rounded-lg ${statusColors[s].replace("border-", "")}`}>{statusIcons[s]}</div>
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Client Store</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
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
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No orders found</td></tr>
                  ) : (
                    orders.map((order) => {
                      const clientName = typeof order.client === "object" ? (order.client as any).storeName || (order.client as any).name : "—";
                      return (
                        <tr key={order._id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <p className="font-medium text-sm">{order.orderId}</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <p className="text-sm font-medium">{order.customer.name}</p>
                            <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                          </td>
                          <td className="p-4 hidden lg:table-cell text-sm">{clientName}</td>
                          <td className="p-4">
                            <p className="font-semibold text-sm">{fmt(order.payment.amount)}</p>
                            <p className="text-xs text-muted-foreground">Commission: {fmt(order.payment.commission)}</p>
                          </td>
                          <td className="p-4">
                            <Badge className={`capitalize border ${statusColors[order.status] || ""}`}>
                              {statusIcons[order.status]} <span className="ml-1">{order.status}</span>
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {order.status !== "delivered" && order.status !== "cancelled" && (
                                <Button variant="outline" size="sm" onClick={() => setUpdateDialog({ order, newStatus: "" })}>
                                  Update
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">Showing {orders.length} of {total} orders</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                  <span className="px-3 py-1 text-sm">Page {currentPage} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order: {selectedOrder?.orderId}</DialogTitle>
            <DialogDescription>Full order details and tracking information</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="font-medium flex items-center gap-2"><Mail className="w-4 h-4" /> Customer</p>
                  <div className="bg-muted/30 p-3 rounded-lg space-y-1">
                    <p>{selectedOrder.customer.name}</p>
                    <p className="text-muted-foreground">{selectedOrder.customer.email}</p>
                    <p className="text-muted-foreground">{selectedOrder.customer.phone}</p>
                    <p className="text-muted-foreground">{selectedOrder.customer.location}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment</p>
                  <div className="bg-muted/30 p-3 rounded-lg space-y-1">
                    <p className="font-semibold">{fmt(selectedOrder.payment.amount)}</p>
                    <p className="text-muted-foreground">Commission: {fmt(selectedOrder.payment.commission)}</p>
                    <Badge variant={selectedOrder.payment.status === "completed" ? "default" : "secondary"} className="capitalize">{selectedOrder.payment.status}</Badge>
                    {selectedOrder.payment.reference && <p className="text-xs text-muted-foreground">Ref: {selectedOrder.payment.reference}</p>}
                  </div>
                </div>
              </div>
              <div>
                <p className="font-medium mb-2">Products</p>
                <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                  {selectedOrder.products.map((p, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{p.name} × {p.quantity}</span>
                      <span className="font-medium">{fmt(p.price * p.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedOrder.trackingNumber && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="w-4 h-4" />
                  <span>Tracking: {selectedOrder.trackingNumber}</span>
                </div>
              )}
              {selectedOrder.notes && <div><p className="font-medium mb-1">Notes</p><p className="text-muted-foreground bg-muted/30 p-3 rounded-lg">{selectedOrder.notes}</p></div>}
              {selectedOrder.adminNotes && <div><p className="font-medium mb-1">Admin Notes</p><p className="text-muted-foreground bg-muted/30 p-3 rounded-lg">{selectedOrder.adminNotes}</p></div>}

              {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                <Button className="w-full" onClick={() => { setSelectedOrder(null); setUpdateDialog({ order: selectedOrder, newStatus: "" }); }}>
                  Update Status
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={!!updateDialog} onOpenChange={() => setUpdateDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          {updateDialog && (
            <div className="space-y-4">
              <Select value={updateDialog.newStatus} onValueChange={(v) => setUpdateDialog({ ...updateDialog, newStatus: v })}>
                <SelectTrigger><SelectValue placeholder="Select new status" /></SelectTrigger>
                <SelectContent>
                  {["processing","shipped","delivered","cancelled"].map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {updateDialog.newStatus === "shipped" && (
                <Input placeholder="Tracking number (optional)" value={tracking} onChange={(e) => setTracking(e.target.value)} />
              )}
              {updateDialog.newStatus === "cancelled" && (
                <Textarea placeholder="Cancellation reason" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} />
              )}
              <Textarea placeholder="Admin notes (optional)" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={2} />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setUpdateDialog(null)}>Cancel</Button>
                <Button className="flex-1" disabled={!updateDialog.newStatus || isSubmitting} onClick={handleStatusUpdate}>
                  {isSubmitting ? "Updating…" : "Update"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
