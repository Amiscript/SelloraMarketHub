import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Mail, Lock, ArrowRight, Store } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/store/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ClientLogin = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showError, setShowError] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/client/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error && !showError) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive",
      });
      clearError();
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  }, [error, clearError, showError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    
    try {
      await login({ email: formData.email, password: formData.password }, 'client');
      toast({ 
        title: "Login Successful", 
        description: "Welcome back!" 
      });
    } catch (error) {
      // Error is handled by the store and useEffect above
    }
  };

  return (
    <div className="min-h-screen flex hero-gradient">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold text-primary-foreground">MarketHub</span>
        </Link>

        <div>
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-8">
            <Store className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">
            Your Store Awaits
          </h1>
          <p className="text-xl text-primary-foreground/70 max-w-md">
            Access your dashboard to manage products, track sales, and grow your business.
          </p>
        </div>

        <p className="text-primary-foreground/50 text-sm">
          © {new Date().getFullYear()} MarketHub. All rights reserved.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold gradient-text">MarketHub</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold mb-2">Client Login</h2>
            <p className="text-muted-foreground">
              Sign in to manage your storefront and products
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 h-12"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                state={{ from: '/client/login' }}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button variant="hero" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/client/register" className="text-primary hover:underline font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;