import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ShoppingBag, X } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface DashboardSidebarProps {
  navItems: NavItem[];
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const DashboardSidebar = ({ navItems, isOpen, onClose, title }: DashboardSidebarProps) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-display font-bold gradient-text"> Sellora MarketHub</span>
                <span className="block text-xs text-muted-foreground">{title}</span>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "sidebar-item",
                    isActive && "sidebar-item-active"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <p className="text-sm font-medium mb-1">Need Help?</p>
              <p className="text-xs text-muted-foreground mb-3">Contact our support team</p>
              <Link
                to="/#contact"
                className="text-xs text-primary hover:underline font-medium"
              >
                Get Support →
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
