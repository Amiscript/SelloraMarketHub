import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Search, DollarSign, Clock, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { usePaymentStore, Payment } from "@/store/payment.store";
import { useAuthStore } from "@/store/auth.store";
import { LayoutDashboard, ShoppingCart, Users, CreditCard, Package, Image, UserCog } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Sales Management", href: "/admin/sales", icon: ShoppingCart },
  { name: "Client Management", href: "/admin/clients", icon: Users },
  { name: "Payment Management", href: "/admin/payments", icon: CreditCard },
  { name: "Order Tracking", href: "/admin/orders", icon: Package },
  { name: "Product Management", href: "/admin/products", icon: Package },
  { name: "Carousel Management", href: "/admin/carousel", icon: Image },
  { name: "Sub-Admin Management", href: "/admin/sub-admins", icon: UserCog },
];

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  paid: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const PaymentManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [approveTarget, setApproveTarget] = useState<Payment | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { payments, total, totalPages, currentPage, isLoading, isSubmitting, fetchPayments, approvePayment, rejectPayment, processPayment } = usePaymentStore();
  const { user } = useAuthStore();

  const load = useCallback(() => {
    fetchPayments({ page, limit: 10, search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined });
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const pendingPayments = payments.filter(p => p.status === "pending");
  const approvedPayments = payments.filter(p => p.status === "approved");
  const paidPayments = payments.filter(p => p.status === "paid");
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleApprove = async () => {
    if (!approveTarget) return;
    try {
      await approvePayment(approveTarget._id);
      toast({ title: "Payment Approved", description: `Payment has been approved successfully.` });
      setApproveTarget(null);
    } catch {
      toast({ title: "Error", description: "Failed to approve payment", variant: "destructive" });
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    try {
      await rejectPayment(rejectTarget._id, rejectReason);
      toast({ title: "Payment Rejected", description: "Payment has been rejected and client notified.", variant: "destructive" });
      setRejectTarget(null);
      setRejectReason("");
    } catch {
      toast({ title: "Error", description: "Failed to reject payment", variant: "destructive" });
    }
  };

  const handleProcess = async (payment: Payment) => {
    try {
      await processPayment(payment._id);
      toast({ title: "Payment Processed", description: "Payment has been processed and transferred." });
    } catch {
      toast({ title: "Error", description: "Failed to process payment", variant: "destructive" });
    }
  };

  const clientName = (p: Payment) =>
    typeof p.client === "object" ? (p.client as any).storeName || (p.client as any).name : "—";

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Admin Panel" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Admin"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold mb-1">Payment Management</h1>
              <p className="text-muted-foreground">Manage client commission payouts</p>
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Pending" value={fmt(totalPending)} icon={Clock} iconColor="from-warning to-warning/70" />
            <StatCard title="Pending Count" value={String(pendingPayments.length)} icon={DollarSign} iconColor="from-primary to-primary/70" />
            <StatCard title="Approved" value={String(approvedPayments.length)} icon={CheckCircle} iconColor="from-blue-500 to-blue-500/70" />
            <StatCard title="Paid Out" value={String(paidPayments.length)} icon={CheckCircle} iconColor="from-success to-success/70" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search payments…" className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {["pending","approved","paid","rejected"].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="stat-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Description</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Bank</th>
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
                  ) : payments.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No payments found</td></tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment._id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-sm">{clientName(payment)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">{payment.description}</td>
                        <td className="p-4">
                          <p className="font-semibold text-sm">{fmt(payment.amount)}</p>
                        </td>
                        <td className="p-4">
                          <Badge className={`capitalize border ${statusColors[payment.status] || ""}`}>{payment.status}</Badge>
                        </td>
                        <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">
                          {payment.bankDetails ? `${payment.bankDetails.bankName} ****${payment.bankDetails.accountNumber?.slice(-4)}` : "—"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {payment.status === "pending" && (
                              <>
                                <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success/10" onClick={() => setApproveTarget(payment)}>
                                  <Check className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setRejectTarget(payment)}>
                                  <X className="w-4 h-4 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                            {payment.status === "approved" && (
                              <Button size="sm" variant="default" disabled={isSubmitting} onClick={() => handleProcess(payment)}>
                                Process
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">Showing {payments.length} of {total}</p>
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

      <Dialog open={!!approveTarget} onOpenChange={() => setApproveTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Approve Payment</DialogTitle>
            <DialogDescription>Approve the payment withdrawal request for {typeof approveTarget?.client === "object" ? (approveTarget?.client as any).storeName : "this client"}?</DialogDescription>
          </DialogHeader>
          <div className="bg-muted/30 p-3 rounded-lg text-sm space-y-1">
            <p>Amount: <strong>{fmt(approveTarget?.amount ?? 0)}</strong></p>
            <p>Description: {approveTarget?.description}</p>
            {approveTarget?.bankDetails && <p>Bank: {approveTarget.bankDetails.bankName} ****{approveTarget.bankDetails.accountNumber?.slice(-4)}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setApproveTarget(null)}>Cancel</Button>
            <Button className="flex-1" disabled={isSubmitting} onClick={handleApprove}>{isSubmitting ? "Approving…" : "Approve"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectTarget} onOpenChange={() => { setRejectTarget(null); setRejectReason(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this payment.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Rejection reason (required)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>Cancel</Button>
            <Button variant="destructive" className="flex-1" disabled={!rejectReason.trim() || isSubmitting} onClick={handleReject}>{isSubmitting ? "Rejecting…" : "Reject"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;
