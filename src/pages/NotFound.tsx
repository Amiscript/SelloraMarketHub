import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, ShoppingBag } from "lucide-react";

const quickLinks = [
  { label: "Homepage", href: "/" },
  { label: "Client Login", href: "/client/login" },
  { label: "Register as Seller", href: "/client/register" },
  { label: "Admin Login", href: "/admin/login" },
  { label: "Track an Order", href: "/order/track" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 — route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold">MarketHub</span>
        </div>
        <div className="relative mb-8">
          <p className="text-9xl font-black text-primary/10 select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-16 h-16 text-primary/30" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-2 text-sm">
          The page <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{location.pathname}</code> doesn't exist.
        </p>
        <p className="text-muted-foreground mb-8 text-sm">It may have been moved or you may have mistyped the URL.</p>
        <div className="flex gap-3 justify-center mb-8">
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />Go Back
          </Button>
          <Button asChild>
            <Link to="/"><Home className="w-4 h-4 mr-2" />Homepage</Link>
          </Button>
        </div>
        <div className="bg-background rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Quick Links</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {quickLinks.map(l => (
              <Link key={l.href} to={l.href} className="text-sm text-primary hover:underline px-3 py-1 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
