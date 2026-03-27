import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, ShoppingCart, CreditCard, Package, Image,
  Settings, TrendingUp, DollarSign, Eye, Wallet, RefreshCw,
  ArrowUpRight, ArrowDownRight, ExternalLink,UserX
} from "lucide-react";
import { useDashboardStore } from "@/store/dashboard.store";
import { useAuthStore } from "@/store/auth.store";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

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

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const ClientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { clientStats, clientRecentSales, clientCharts, clientInfo, isLoadingClient, fetchClientDashboard } = useDashboardStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { fetchClientDashboard(); }, []);

  const chartData = (clientCharts?.monthlyRevenue ?? []).map(m => ({
    month: MONTH_NAMES[(m._id.month || 1) - 1],
    revenue: m.revenue,
    commission: m.commission,
    orders: m.orders,
  }));

  const storeUrl = user?.storeSlug ? `/store/${user.storeSlug}` : null;
  if ((user as any)?.verificationStatus === 'suspended') {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="stat-card max-w-md text-center p-8 space-y-4">
        <UserX className="w-14 h-14 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Account Suspended</h2>
        <p className="text-muted-foreground text-sm">
          Your account has been suspended by an administrator.
          Please contact support for assistance.
        </p>
      </div>
    </div>
  );
}

  return (

    
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Client Portal" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Store Owner"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">

          {/* Welcome Banner */}
          <div className="stat-card bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-display font-bold mb-1">Welcome back, {user?.name || "Store Owner"}!</h1>
                <p className="text-primary-foreground/80">
                  {clientStats ? "Your store is live and running." : "Loading your store data…"}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {storeUrl && (
                  <a href={storeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-foreground/10 text-primary-foreground text-sm hover:bg-primary-foreground/20 transition-colors">
                    <Eye className="w-4 h-4" /> View Store <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <Button variant="outline" size="sm" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20" onClick={fetchClientDashboard} disabled={isLoadingClient}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingClient ? "animate-spin" : ""}`} /> Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {isLoadingClient ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="My Products" value={String(clientStats?.activeProducts ?? 0)} icon={Package} iconColor="from-primary to-primary/70" />
              <StatCard title="Total Sales" value={String(clientStats?.totalSales ?? 0)} icon={TrendingUp} iconColor="from-accent to-accent/70" />
              <StatCard title="Total Revenue" value={fmt(clientStats?.totalRevenue ?? 0)} icon={DollarSign} iconColor="from-success to-success/70" />
              <StatCard title="Pending Orders" value={String(clientStats?.pendingOrders ?? 0)} icon={ShoppingCart} iconColor="from-warning to-warning/70" />
            </div>
          )}

          {/* Wallet Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-success/10"><Wallet className="w-5 h-5 text-success" /></div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
              <p className="text-2xl font-bold">{fmt(clientStats?.totalEarnings ?? 0)}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-warning/10"><DollarSign className="w-5 h-5 text-warning" /></div>
                <p className="text-sm text-muted-foreground">Total Commission Paid</p>
              </div>
              <p className="text-2xl font-bold">{fmt(clientStats?.totalCommission ?? 0)}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10"><CreditCard className="w-5 h-5 text-primary" /></div>
                <p className="text-sm text-muted-foreground">Pending Balance</p>
              </div>
              <p className="text-2xl font-bold">{fmt(clientStats?.pendingBalance ?? 0)}</p>
              <Button variant="link" className="p-0 h-auto text-xs mt-1" onClick={() => navigate("/client/wallet")}>View wallet →</Button>
            </div>
          </div>

          {/* Revenue Chart */}
          {chartData.length > 0 && (
            <div className="stat-card">
              <h2 className="font-semibold mb-4">Monthly Revenue & Commission</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="cRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cComm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#cRev)" strokeWidth={2} name="Revenue" />
                  <Area type="monotone" dataKey="commission" stroke="#f59e0b" fill="url(#cComm)" strokeWidth={2} name="Commission" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Sales + Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Recent Sales</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/client/sales")}>View all</Button>
              </div>
              {(clientRecentSales ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">No recent sales</p>
              ) : (
                <div className="space-y-3">
                  {clientRecentSales.map((sale) => (
                    <div key={sale._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                      <div>
                        <p className="font-medium text-sm">{sale.orderId}</p>
                        <p className="text-xs text-muted-foreground">{sale.customer?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{fmt(sale.payment?.amount ?? 0)}</p>
                        <Badge variant="secondary" className="text-xs capitalize">{sale.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Top Products</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/client/products")}>View all</Button>
              </div>
              {(clientCharts?.topProducts ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">No product data yet</p>
              ) : (
                <div className="space-y-3">
                  {clientCharts!.topProducts.map((p, i) => (
                    <div key={p._id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.totalSold} sold</p>
                      </div>
                      <p className="font-semibold text-sm">{fmt(p.totalRevenue)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
