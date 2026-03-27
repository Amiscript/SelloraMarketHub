import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, CreditCard, Clock, CheckCircle, XCircle, DollarSign, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import { usePaymentStore } from "@/store/payment.store";
import { useAuthStore } from "@/store/auth.store";
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, Wallet, Image, Settings } from "lucide-react";

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
  approved: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  paid: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const ClientPayments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { payments, total, totalPages, currentPage, isLoading, fetchClientPayments } = usePaymentStore();
  const { user } = useAuthStore();

  const load = useCallback(() => {
    fetchClientPayments({ page, limit: 10, search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined });
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const pendingTotal = payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const paidTotal = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingCount = payments.filter(p => p.status === "pending").length;
  const paidCount = payments.filter(p => p.status === "paid").length;

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Client Portal" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Store Owner"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold mb-1">My Payments</h1>
              <p className="text-muted-foreground">Track your commission payout history</p>
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Pending Amount" value={fmt(pendingTotal)} icon={Clock} iconColor="from-warning to-warning/70" />
            <StatCard title="Pending Count" value={String(pendingCount)} icon={DollarSign} iconColor="from-primary to-primary/70" />
            <StatCard title="Total Paid Out" value={fmt(paidTotal)} icon={CheckCircle} iconColor="from-success to-success/70" />
            <StatCard title="Paid Count" value={String(paidCount)} icon={CreditCard} iconColor="from-accent to-accent/70" />
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Bank</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Paid Date</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => <tr key={i} className="border-b">{[...Array(6)].map((_, j) => <td key={j} className="p-4"><Skeleton className="h-4 w-full" /></td>)}</tr>)
                  ) : payments.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No payment records found</td></tr>
                  ) : payments.map((payment) => (
                    <tr key={payment._id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm">{payment.description}</td>
                      <td className="p-4"><p className="font-semibold text-sm">{fmt(payment.amount)}</p></td>
                      <td className="p-4"><Badge className={`capitalize border text-xs ${statusColors[payment.status] || ""}`}>{payment.status}</Badge></td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                        {payment.bankDetails ? `${payment.bankDetails.bankName} ****${payment.bankDetails.accountNumber?.slice(-4)}` : "—"}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">{payments.length} of {total}</p>
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
    </div>
  );
};

export default ClientPayments;
