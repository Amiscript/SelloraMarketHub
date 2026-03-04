import { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield, Store } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/store/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [userType, setUserType] = useState<'admin' | 'client'>('client');
  
  const { resetPassword, isLoading, error, clearError } = useAuth();

  // Detect user type from the previous page or URL
  useEffect(() => {
    const from = location.state?.from || '';
    if (from.includes('/admin')) {
      setUserType('admin');
    } else {
      setUserType('client');
    }
  }, [location]);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
    }
  }, [token]);

  const validatePassword = () => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/\d/.test(password)) return "Password must contain at least one number";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validatePassword();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    if (!token) return;

    try {
      await resetPassword(token, password);
      toast({
        title: "Password Reset Successful",
        description: "You can now login with your new password",
      });
      
      // Redirect based on user type
      if (userType === 'admin') {
        navigate("/admin/login");
      } else {
        navigate("/client/login");
      }
    } catch (error) {
      // Error handled by store
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <div className="max-w-md w-full bg-background rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">Invalid Reset Link</h1>
          <p className="text-muted-foreground mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Button 
            variant="hero" 
            className="w-full" 
            onClick={() => navigate(userType === 'admin' ? '/admin/forgot-password' : '/client/forgot-password')}
          >
            Request New Link
          </Button>
        </div>
      </div>
    );
  }

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
            {userType === 'admin' ? (
              <Shield className="w-10 h-10 text-primary" />
            ) : (
              <Store className="w-10 h-10 text-primary" />
            )}
          </div>
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">
            {userType === 'admin' ? 'Set New Password' : 'Create New Password'}
          </h1>
          <p className="text-xl text-primary-foreground/70 max-w-md">
            {userType === 'admin' 
              ? 'Choose a strong password for your admin account.'
              : 'Your new password must be different from previous ones.'}
          </p>
        </div>

        <p className="text-primary-foreground/50 text-sm">
          © {new Date().getFullYear()} MarketHub. All rights reserved.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Reset Password</h1>
            <p className="text-muted-foreground">
              Enter your new password below.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  className="pl-10 h-12 pr-10"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="pl-10 h-12 pr-10"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError();
                  }}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {password && confirmPassword && password === confirmPassword && (
              <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-700">Passwords match</p>
              </div>
            )}

            <div className="pt-4">
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Remember your password?{" "}
            <button
              onClick={() => navigate(userType === 'admin' ? '/admin/login' : '/client/login')}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;