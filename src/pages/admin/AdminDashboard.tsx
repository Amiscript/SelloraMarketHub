import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  CreditCard,
  Package,
  Image,
  UserCog,
  TrendingUp,
  DollarSign,
  UserCheck,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Sales Management", href: "/admin/dashboard/sales", icon: ShoppingCart },
  { name: "Client Management", href: "/admin/dashboard/clients", icon: Users },
  { name: "Payment Management", href: "/admin/dashboard/payments", icon: CreditCard },
  { name: "Product Management", href: "/admin/dashboard/products", icon: Package },
  { name: "Carousel Management", href: "/admin/dashboard/carousel", icon: Image },
  { name: "Sub-Admin Management", href: "/admin/dashboard/sub-admins", icon: UserCog },
];

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMainDashboard = location.pathname === "/admin/dashboard";

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar
        navItems={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title="Admin Panel"
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName="Super Admin" />

        <main className="flex-1 p-4 lg:p-6">
          {isMainDashboard ? (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div>
                <h1 className="text-2xl font-display font-bold mb-1">Welcome back, Admin!</h1>
                <p className="text-muted-foreground">Here's what's happening with your marketplace today.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Active Clients"
                  value="1,234"
                  change="+12%"
                  changeType="positive"
                  icon={Users}
                  iconColor="from-primary to-primary/70"
                />
                <StatCard
                  title="Total Products"
                  value="5,678"
                  change="+8%"
                  changeType="positive"
                  icon={Package}
                  iconColor="from-accent to-accent/70"
                />
                <StatCard
                  title="Total Sales"
                  value="12,456"
                  change="+23%"
                  changeType="positive"
                  icon={TrendingUp}
                  iconColor="from-success to-success/70"
                />
                <StatCard
                  title="Total Revenue"
                  value="$234,567"
                  change="+18%"
                  changeType="positive"
                  icon={DollarSign}
                  iconColor="from-warning to-warning/70"
                />
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  title="Verified Clients"
                  value="892"
                  icon={UserCheck}
                  iconColor="from-success to-success/70"
                />
                <StatCard
                  title="Pending Payments"
                  value="$12,345"
                  icon={CreditCard}
                  iconColor="from-warning to-warning/70"
                />
                <StatCard
                  title="Sub Admins"
                  value="8"
                  icon={UserCog}
                  iconColor="from-accent to-accent/70"
                />
              </div>

              {/* Recent Activity Table */}
              <div className="stat-card">
                <h2 className="text-lg font-display font-semibold mb-4">Recent Sales</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Client</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { product: "Premium Widget", client: "Store A", customer: "John Doe", amount: "$129.99", status: "Delivered" },
                        { product: "Basic Bundle", client: "Store B", customer: "Jane Smith", amount: "$79.99", status: "Shipped" },
                        { product: "Pro Package", client: "Store C", customer: "Bob Wilson", amount: "$199.99", status: "Processing" },
                        { product: "Starter Kit", client: "Store D", customer: "Alice Brown", amount: "$49.99", status: "Delivered" },
                        { product: "Enterprise Suite", client: "Store E", customer: "Charlie Davis", amount: "$299.99", status: "Shipped" },
                      ].map((sale, index) => (
                        <tr key={index} className="table-row-hover border-b border-border/50 last:border-0">
                          <td className="py-3 px-4 font-medium">{sale.product}</td>
                          <td className="py-3 px-4 text-muted-foreground">{sale.client}</td>
                          <td className="py-3 px-4 text-muted-foreground">{sale.customer}</td>
                          <td className="py-3 px-4 font-medium">{sale.amount}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              sale.status === "Delivered" ? "bg-success/10 text-success" :
                              sale.status === "Shipped" ? "bg-primary/10 text-primary" :
                              "bg-warning/10 text-warning"
                            }`}>
                              {sale.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
