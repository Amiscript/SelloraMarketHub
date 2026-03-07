import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/store/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SubAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password }, "admin");
      toast({ title: "Welcome back!", description: "Logged in as Sub-Admin." });
      navigate("/admin/dashboard");
    } catch {
      // error shown via store
    }
  };

  return (
    <div className="min-h-screen flex hero-gradient">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold text-primary-foreground">MarketHub</span>
        </Link>
        <div>
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-8">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">Sub-Admin Portal</h1>
          <p className="text-xl text-primary-foreground/70 max-w-md">
            Manage clients, orders and store operations with your delegated access.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {["Client Management", "Order Oversight", "Payment Tracking", "Sales Reports"].map(f => (
              <div key={f} className="flex items-center gap-2 text-primary-foreground/80">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-primary-foreground/50 text-sm">© {new Date().getFullYear()} MarketHub. All rights reserved.</p>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Sub-Admin Sign In</h1>
            <p className="text-muted-foreground text-sm">Use your credentials provided by the admin</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="subadmin@example.com"
                  className="pl-10 h-12"
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearError(); }}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 h-12 pr-10"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError(); }}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" state={{ from: "/admin" }} className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />Signing in...</>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Are you the main admin?{" "}
            <Link to="/admin/login" className="text-primary hover:underline font-medium">Admin Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubAdminLogin;
