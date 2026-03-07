import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/hooks/useAuth";

type VerifyState = "loading" | "success" | "failed";

const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerifyState>("loading");

  useEffect(() => {
    if (!token) { setStatus("failed"); return; }
    verifyEmail(token).then(ok => {
      setStatus(ok ? "success" : "failed");
      if (ok) setTimeout(() => navigate("/client/login"), 3000);
    });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-background rounded-2xl shadow-xl p-8 text-center">

        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Verifying your email...</h1>
            <p className="text-muted-foreground text-sm">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Your email has been verified successfully. Your account is now pending admin review.
              You'll receive an email once it's approved. Redirecting to login...
            </p>
            <Button asChild className="w-full">
              <Link to="/client/login">Go to Login</Link>
            </Button>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-muted-foreground text-sm mb-6">
              This verification link is invalid or has expired. Please request a new one.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/client/resend-verification">
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/client/login">Back to Login</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
