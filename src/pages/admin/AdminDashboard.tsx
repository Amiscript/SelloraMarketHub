import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard, ShoppingCart, Users, CreditCard,
  Package, Image, UserCog, TrendingUp, DollarSign,
  UserCheck, BarChart2, RefreshCw,
} from "lucide-react";
import { useDashboardStore } from "@/store/dashboard.store";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

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

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PIE_COLORS = ["#6366f1","#8b5cf6","#a78bfa","#c4b5fd","#ddd6fe","#ede9fe"];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { adminStats, adminRecentSales, adminCharts, isLoadingAdmin, fetchAdminDashboard } = useDashboardStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { fetchAdminDashboard(); }, []);

  const chartData = (adminCharts?.monthlyRevenue ?? []).map((m) => ({
    month: MONTH_NAMES[(m._id.month || 1) - 1],
    revenue: m.revenue,
    orders: m.orders,
  }));
  const pieData = (adminCharts?.productCategories ?? []).map((c) => ({ name: c._id, value: c.count }));

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar navItems={navItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Admin Panel" />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName={user?.name || "Admin"} />
        <main className="flex-1 p-4 lg:p-6 space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold mb-1">Welcome back, {user?.name || "Admin"}!</h1>
              <p className="text-muted-foreground">Here's what's happening with your marketplace today.</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAdminDashboard} disabled={isLoadingAdmin}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingAdmin ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          {isLoadingAdmin ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Active Clients" value={adminStats?.activeClients.value?.toLocaleString() ?? "0"} change={`${adminStats?.activeClients.change ?? 0}%`} changeType={adminStats?.activeClients.changeType ?? "positive"} icon={Users} iconColor="from-primary to-primary/70" />
              <StatCard title="Total Products" value={adminStats?.totalProducts.value?.toLocaleString() ?? "0"} change={`${adminStats?.totalProducts.change ?? 0}%`} changeType={adminStats?.totalProducts.changeType ?? "positive"} icon={Package} iconColor="from-accent to-accent/70" />
              <StatCard title="Total Sales" value={adminStats?.totalSales.value?.toLocaleString() ?? "0"} change={`${adminStats?.totalSales.change ?? 0}%`} changeType={adminStats?.totalSales.changeType ?? "positive"} icon={TrendingUp} iconColor="from-success to-success/70" />
              <StatCard title="Total Revenue" value={fmt(adminStats?.totalRevenue.value ?? 0)} change={`${adminStats?.totalRevenue.change ?? 0}%`} changeType={adminStats?.totalRevenue.changeType ?? "positive"} icon={DollarSign} iconColor="from-warning to-warning/70" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10"><UserCheck className="w-6 h-6 text-primary" /></div>
              <div><p className="text-sm text-muted-foreground">Verified Clients</p><p className="text-2xl font-bold">{adminStats?.verifiedClients.value?.toLocaleString() ?? "—"}</p></div>
            </div>
            <div className="stat-card flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10"><CreditCard className="w-6 h-6 text-warning" /></div>
              <div><p className="text-sm text-muted-foreground">Pending Payouts</p><p className="text-2xl font-bold">{fmt(adminStats?.pendingPayments.value ?? 0)}</p></div>
            </div>
            <div className="stat-card flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10"><UserCog className="w-6 h-6 text-accent" /></div>
              <div><p className="text-sm text-muted-foreground">Active Sub-Admins</p><p className="text-2xl font-bold">{adminStats?.subAdmins.value ?? "—"}</p></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="stat-card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2"><BarChart2 className="w-5 h-5 text-primary" /> Monthly Revenue</h2>
              </div>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#colorRev)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No revenue data yet</div>
              )}
            </div>

            <div className="stat-card">
              <h2 className="font-semibold mb-4">Product Categories</h2>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
              )}
              <div className="mt-2 flex flex-col gap-1">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-muted-foreground truncate">{d.name}</span>
                    <span className="ml-auto font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Recent Sales</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/sales")}>View all</Button>
              </div>
              {adminRecentSales.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">No recent sales</p>
              ) : (
                <div className="space-y-3">
                  {adminRecentSales.map((sale) => (
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
                <h2 className="font-semibold">Top Clients</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin/clients")}>View all</Button>
              </div>
              {(adminCharts?.topClients ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {(adminCharts?.topClients ?? []).map((client, i) => (
                    <div key={client._id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.orderCount} orders</p>
                      </div>
                      <p className="font-semibold text-sm">{fmt(client.totalSpent)}</p>
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

export default AdminDashboard;
