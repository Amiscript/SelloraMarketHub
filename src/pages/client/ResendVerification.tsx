import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Mail, ArrowLeft, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // You'll need to implement this endpoint in your backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setIsSent(true);
        toast({
          title: "Verification Email Sent",
          description: "Please check your inbox for the verification link",
        });
      } else {
        setError(data.error || "Failed to send verification email");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="max-md:w-full max-w-md w-full bg-background rounded-2xl shadow-xl p-8">
        <Link to="/client/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">Resend Verification Email</h1>
          <p className="text-muted-foreground">
            Enter your email address to receive a new verification link.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isSent ? (
          <div className="text-center">
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-800">
                Verification email sent to <strong>{email}</strong>
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Please check your inbox and follow the instructions to verify your account.
            </p>
            <Button variant="outline" onClick={() => setIsSent(false)} className="w-full">
              Send to another email
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
                    setError("");
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
                "Resend Verification Email"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResendVerification;