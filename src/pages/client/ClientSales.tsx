import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp, DollarSign, ShoppingCart, Download, RefreshCw, ChevronLeft, ChevronRight, CreditCard, Package, Wallet, Image, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSalesStore } from "@/store/sales.store";
import { useAuthStore } from "@/store/auth.store";
import { LayoutDashboard } from "lucide-react";

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
  pending: "bg-warning/10 text-warning",
  processing: "bg-blue-500/10 text-blue-500",
  shipped: "bg-purple-500/10 text-purple-500",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const ClientSales = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { sales, clientStats, total, totalPages, currentPage, isLoading, isExporting, fetchClientSales, exportSales } = useSalesStore();
  const { user } = useAuthStore();

  const load = useCallback(() => {
    fetchClientSales({ page, limit: 10, search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined });
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async () => {
    try {
      await exportSales();
      toast({ title: "Export Started", description: "Your sales report download has started." });
    } catch {
      toast({ title: "Export Failed", variant: "destructive" });
    }
  };

  const statusCount = (s: string) => clientStats?.salesByStatus?.find(x => x._id === s)?.count ?? 0;

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Client Portal" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Store Owner"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold mb-1">My Sales</h1>
              <p className="text-muted-foreground">Track all sales from your store</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={load} disabled={isLoading}><RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh</Button>
              <Button variant="hero" size="sm" onClick={handleExport} disabled={isExporting}><Download className="w-4 h-4 mr-2" />{isExporting ? "Exporting…" : "Export"}</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Sales" value={clientStats?.totalSales?.toLocaleString() ?? "0"} icon={ShoppingCart} iconColor="from-primary to-primary/70" />
            <StatCard title="Total Revenue" value={fmt(clientStats?.totalRevenue ?? 0)} icon={DollarSign} iconColor="from-success to-success/70" />
            <StatCard title="Total Commission" value={fmt(clientStats?.totalCommission ?? 0)} icon={TrendingUp} iconColor="from-warning to-warning/70" />
            <StatCard title="Net Earnings" value={fmt((clientStats?.totalRevenue ?? 0) - (clientStats?.totalCommission ?? 0))} icon={Wallet} iconColor="from-accent to-accent/70" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search sales…" className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Revenue</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Commission</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Net</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => <tr key={i} className="border-b">{[...Array(6)].map((_, j) => <td key={j} className="p-4"><Skeleton className="h-4 w-full" /></td>)}</tr>)
                  ) : sales.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No sales found</td></tr>
                  ) : sales.map((sale) => (
                    <tr key={sale._id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4"><p className="font-medium text-sm">{sale.orderId}</p><p className="text-xs text-muted-foreground">{new Date(sale.createdAt).toLocaleDateString()}</p></td>
                      <td className="p-4 hidden md:table-cell"><p className="text-sm">{sale.customer.name}</p><p className="text-xs text-muted-foreground">{sale.customer.email}</p></td>
                      <td className="p-4"><p className="font-semibold text-sm">{fmt(sale.payment.amount)}</p></td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">{fmt(sale.payment.commission)}</td>
                      <td className="p-4 hidden md:table-cell"><p className="font-semibold text-sm text-success">{fmt(sale.payment.amount - sale.payment.commission)}</p></td>
                      <td className="p-4"><Badge className={`capitalize text-xs ${statusColors[sale.status] || ""}`}>{sale.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">{sales.length} of {total}</p>
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

export default ClientSales;
