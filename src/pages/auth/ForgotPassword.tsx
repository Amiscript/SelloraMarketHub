import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Mail, ArrowLeft, Shield, Store } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/store/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'client'>('client');
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Detect user type from the previous page or URL
  useEffect(() => {
    const from = location.state?.from || '';
    if (from.includes('/admin')) {
      setUserType('admin');
    } else {
      setUserType('client');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions",
      });
    } catch (error) {
      // Error handled by store
    }
  };

  const handleBackToLogin = () => {
    if (userType === 'admin') {
      navigate('/admin/login');
    } else {
      navigate('/client/login');
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
            {userType === 'admin' ? (
              <Shield className="w-10 h-10 text-primary" />
            ) : (
              <Store className="w-10 h-10 text-primary" />
            )}
          </div>
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">
            {userType === 'admin' ? 'Admin Password Reset' : 'Reset Your Password'}
          </h1>
          <p className="text-xl text-primary-foreground/70 max-w-md">
            {userType === 'admin' 
              ? 'Secure your admin account with a new password.'
              : 'We\'ll send you instructions to reset your password.'}
          </p>
        </div>

        <p className="text-primary-foreground/50 text-sm">
          © {new Date().getFullYear()} MarketHub. All rights reserved.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <button
            onClick={handleBackToLogin}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to login
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Forgot Password?</h1>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSubmitted ? (
            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-800">
                  Reset link sent to <strong>{email}</strong>
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsSubmitted(false)}
                className="w-full"
              >
                Try another email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 h-12"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError();
                    }}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>
            </form>
          )}

          <p className="mt-8 text-center text-muted-foreground">
            Remember your password?{" "}
            <button
              onClick={handleBackToLogin}
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

export default ForgotPassword;