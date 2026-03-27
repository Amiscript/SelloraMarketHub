import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp, DollarSign, ShoppingCart, Download, RefreshCw, ChevronLeft, ChevronRight, BarChart2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSalesStore } from "@/store/sales.store";
import { useAuthStore } from "@/store/auth.store";
import { LayoutDashboard, Users, CreditCard, Package, Image, UserCog } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
  pending: "bg-warning/10 text-warning",
  processing: "bg-blue-500/10 text-blue-500",
  shipped: "bg-purple-500/10 text-purple-500",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const SalesManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { sales, adminStats, total, totalPages, currentPage, isLoading, isExporting, fetchAdminStats, fetchAllSales, exportSales } = useSalesStore();
  const { user } = useAuthStore();

  const load = useCallback(() => {
    fetchAllSales({ page, limit: 10, search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined });
  }, [page, search, statusFilter]);

  useEffect(() => { fetchAdminStats(); }, []);
  useEffect(() => { load(); }, [load]);

  const handleExport = async () => {
    try {
      await exportSales();
      toast({ title: "Export Started", description: "Sales report download started." });
    } catch {
      toast({ title: "Export Failed", description: "Could not export sales data", variant: "destructive" });
    }
  };

  const topProductsData = (adminStats?.topProducts ?? []).slice(0, 5).map(p => ({
    name: p.name?.length > 15 ? p.name.slice(0, 15) + "…" : p.name,
    revenue: p.totalRevenue,
    sold: p.totalSold,
  }));

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Admin Panel" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Admin"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold mb-1">Sales Management</h1>
              <p className="text-muted-foreground">Track and analyze all marketplace sales</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button variant="hero" size="sm" onClick={handleExport} disabled={isExporting}>
                <Download className="w-4 h-4 mr-2" /> {isExporting ? "Exporting…" : "Export"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Sales" value={adminStats?.totalSales?.toLocaleString() ?? "—"} change={`${adminStats?.salesChange?.toFixed(1) ?? 0}%`} changeType={adminStats?.salesChange && adminStats.salesChange >= 0 ? "positive" : "negative"} icon={ShoppingCart} iconColor="from-primary to-primary/70" />
            <StatCard title="Today's Sales" value={adminStats?.todaySales?.toLocaleString() ?? "—"} icon={TrendingUp} iconColor="from-accent to-accent/70" />
            <StatCard title="Total Revenue" value={fmt(adminStats?.totalRevenue ?? 0)} icon={DollarSign} iconColor="from-success to-success/70" />
            <StatCard title="Today's Revenue" value={fmt(adminStats?.todayRevenue ?? 0)} icon={DollarSign} iconColor="from-warning to-warning/70" />
          </div>

          {/* Top Products chart */}
          {topProductsData.length > 0 && (
            <div className="stat-card">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-primary" /> Top Products by Revenue</h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={topProductsData}>
                  <defs>
                    <linearGradient id="colorSaleRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#colorSaleRev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Client Store</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Customer</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Revenue</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Commission</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b">
                        {[...Array(6)].map((_, j) => <td key={j} className="p-4"><Skeleton className="h-4 w-full" /></td>)}
                      </tr>
                    ))
                  ) : sales.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No sales found</td></tr>
                  ) : (
                    sales.map((sale) => {
                      const clientName = typeof sale.client === "object" ? (sale.client as any).storeName || (sale.client as any).name : "—";
                      return (
                        <tr key={sale._id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <p className="font-medium text-sm">{sale.orderId}</p>
                            <p className="text-xs text-muted-foreground">{new Date(sale.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4 hidden md:table-cell text-sm">{clientName}</td>
                          <td className="p-4 hidden lg:table-cell">
                            <p className="text-sm">{sale.customer.name}</p>
                            <p className="text-xs text-muted-foreground">{sale.customer.email}</p>
                          </td>
                          <td className="p-4"><p className="font-semibold text-sm">{fmt(sale.payment.amount)}</p></td>
                          <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">{fmt(sale.payment.commission)}</td>
                          <td className="p-4"><Badge className={`capitalize ${statusColors[sale.status] || ""}`}>{sale.status}</Badge></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">Showing {sales.length} of {total}</p>
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

export default SalesManagement;

