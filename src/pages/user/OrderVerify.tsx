import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/store/api/axiosInstance";

type VerifyStatus = "loading" | "success" | "failed";

interface OrderSummary {
  orderId: string;
  amount: number;
  customerName: string;
  products: Array<{ name: string; quantity: number; price: number }>;
}

const OrderVerify = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const reference = searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setErrorMessage("No payment reference found. Please contact support.");
      return;
    }

    const verify = async () => {
      try {
        const res = await api.post("/orders/verify", { reference });
        const { order: o } = res.data;
        setOrder({
          orderId: o.orderId || o._id,
          amount: o.payment?.amount || 0,
          customerName: o.customer?.name || "",
          products: (o.products || []).map((p: { name: string; quantity: number; price: number }) => ({
            name: p.name,
            quantity: p.quantity,
            price: p.price,
          })),
        });
        setStatus("success");
      } catch (err: unknown) {
        const e = err as { response?: { data?: { error?: string } } };
        setErrorMessage(e?.response?.data?.error || "Payment verification failed. Please contact support.");
        setStatus("failed");
      }
    };

    verify();
  }, [reference]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-background rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-accent p-6 text-white text-center">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-2">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold">Sellora MarketHub</h1>
        </div>

        <div className="p-8 text-center">

          {/* Loading */}
          {status === "loading" && (
            <div>
              <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Verifying Payment...</h2>
              <p className="text-muted-foreground text-sm">Please wait while we confirm your payment with Paystack.</p>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div>
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Payment Successful!</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Thank you{order?.customerName ? `, ${order.customerName}` : ""}! Your order has been placed.
              </p>

              {order && (
                <div className="bg-muted/50 rounded-xl p-4 text-left mb-6">
                  <div className="flex justify-between text-sm mb-3 pb-3 border-b border-border">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono font-semibold text-xs">{order.orderId}</span>
                  </div>
                  {order.products.map((p, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span>{p.name} × {p.quantity}</span>
                      <span>₦{(p.price * p.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-sm mt-3 pt-3 border-t border-border">
                    <span>Total Paid</span>
                    <span className="text-primary">₦{order.amount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground mb-6">
                A confirmation email has been sent to your email address. The store owner will process your order shortly.
              </p>

              <Button asChild className="w-full">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          )}

          {/* Failed */}
          {status === "failed" && (
            <div>
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
              <p className="text-muted-foreground text-sm mb-6">{errorMessage}</p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 mb-6 text-left">
                <p className="font-semibold mb-1">What to do next:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Check your email for a payment receipt from Paystack</li>
                  <li>If money was deducted, contact support with your reference</li>
                  <li>Otherwise, go back and try placing your order again</li>
                </ul>
                {reference && (
                  <p className="mt-2 text-xs font-mono bg-amber-100 px-2 py-1 rounded">
                    Ref: {reference}
                  </p>
                )}
              </div>

              <Button asChild className="w-full" variant="outline">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderVerify;
