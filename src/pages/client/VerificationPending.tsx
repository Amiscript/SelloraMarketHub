import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Mail, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/store/hooks/useAuth";

 export const VerificationPending = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="max-w-md w-full bg-background rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>

        <h1 className="text-2xl font-display font-bold mb-2">Verification Pending</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for registering{user?.name ? `, ${user.name}` : ''}!
        </p>

        <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Check your email</p>
              <p className="text-xs text-muted-foreground">
                We've sent a verification link to {user?.email || 'your email'}. 
                Please click the link to verify your account.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">What happens next?</p>
              <ul className="text-xs text-blue-700 list-disc list-inside space-y-1 mt-2">
                <li>Verify your email address</li>
                <li>Our team will review your documents</li>
                <li>You'll receive a confirmation email once verified</li>
                <li>Then you can start selling on MarketHub</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button variant="hero" className="w-full" asChild>
            <Link to="/client/login">
              Return to Login
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/">
              Go to Homepage
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Didn't receive the email? Check your spam folder or{' '}
          <Link to="/client/resend-verification" className="text-primary hover:underline">
            click here to resend
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerificationPending;