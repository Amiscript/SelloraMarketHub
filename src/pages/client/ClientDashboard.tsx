import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Package,
  Image,
  Settings,
  TrendingUp,
  DollarSign,
  Eye,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { name: "My Products", href: "/client/dashboard/products", icon: Package },
  { name: "Sales", href: "/client/dashboard/sales", icon: ShoppingCart },
  { name: "Payments", href: "/client/dashboard/payments", icon: CreditCard },
  { name: "Carousel", href: "/client/dashboard/carousel", icon: Image },
  { name: "Settings", href: "/client/dashboard/settings", icon: Settings },
];

const ClientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMainDashboard = location.pathname === "/client/dashboard";

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar
        navItems={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title="Client Portal"
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userName="Store Owner" />

        <main className="flex-1 p-4 lg:p-6">
          {isMainDashboard ? (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="stat-card bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-display font-bold mb-1">Welcome back, Store Owner!</h1>
                    <p className="text-primary-foreground/80">Your store is performing great today.</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-foreground/10">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Your Store URL: </span>
                    <a href="/store/demo-store" target="_blank" className="font-mono text-sm underline">
                      /store/demo-store
                    </a>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="My Products"
                  value="45"
                  change="+5"
                  changeType="positive"
                  icon={Package}
                  iconColor="from-primary to-primary/70"
                />
                <StatCard
                  title="Total Sales"
                  value="234"
                  change="+18%"
                  changeType="positive"
                  icon={TrendingUp}
                  iconColor="from-success to-success/70"
                />
                <StatCard
                  title="Revenue"
                  value="$12,345"
                  change="+12%"
                  changeType="positive"
                  icon={DollarSign}
                  iconColor="from-warning to-warning/70"
                />
                <StatCard
                  title="Pending Payments"
                  value="$1,234"
                  icon={CreditCard}
                  iconColor="from-accent to-accent/70"
                />
              </div>

              {/* Recent Sales */}
              <div className="stat-card">
                <h2 className="text-lg font-display font-semibold mb-4">Recent Sales</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { product: "Premium Widget", customer: "John Doe", date: "2024-01-15", amount: "$129.99", status: "Delivered" },
                        { product: "Basic Bundle", customer: "Jane Smith", date: "2024-01-14", amount: "$79.99", status: "Shipped" },
                        { product: "Pro Package", customer: "Bob Wilson", date: "2024-01-13", amount: "$199.99", status: "Processing" },
                      ].map((sale, index) => (
                        <tr key={index} className="table-row-hover border-b border-border/50 last:border-0">
                          <td className="py-3 px-4 font-medium">{sale.product}</td>
                          <td className="py-3 px-4 text-muted-foreground">{sale.customer}</td>
                          <td className="py-3 px-4 text-muted-foreground">{sale.date}</td>
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

export default ClientDashboard;
