import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, ShoppingBag } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference') || searchParams.get('trxref');
      const orderId = searchParams.get('orderId');
      const store = searchParams.get('store');

      console.log('Verifying payment:', { reference, orderId, store });

      if (!reference && !orderId) {
        setStatus('failed');
        setError('No payment reference found');
        return;
      }

      try {
        // Call your backend verification endpoint
        const response = await api.post('/api/v1/orders/verify-payment', {
          reference: reference || '',
          orderId: orderId || '',
        });

        if (response.data.success) {
          setStatus('success');
          setOrder(response.data.order);
          toast({
            title: "Payment Successful! 🎉",
            description: `Your order #${response.data.order.orderId} has been confirmed.`,
          });
          
          // Clear cart from localStorage
          localStorage.removeItem('cart');
          sessionStorage.removeItem('pendingOrder');
          
          // Redirect after 3 seconds
          setTimeout(() => {
            if (store) {
              navigate(`/store/${store}`);
            } else {
              navigate('/');
            }
          }, 3000);
        } else {
          setStatus('failed');
          setError(response.data.error || 'Payment verification failed');
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setStatus('failed');
        setError(err.response?.data?.error || 'Failed to verify payment');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold dark:text-white">Verifying Payment...</h2>
          <p className="text-muted-foreground mt-2">Please wait while we confirm your transaction</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold dark:text-white mb-2">Payment Successful! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            Your order has been confirmed and is being processed.
          </p>
          {order && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono font-medium dark:text-white mb-2">{order.orderId}</p>
              <p className="text-sm text-muted-foreground">Amount Paid</p>
              <p className="text-xl font-bold text-primary">
                ₦{order.payment?.amount?.toLocaleString()}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-4">
            Redirecting to store...
          </p>
          <Button 
            onClick={() => {
              const store = searchParams.get('store');
              navigate(store ? `/store/${store}` : '/');
            }} 
            className="w-full rounded-full"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold dark:text-white mb-2">Payment Failed</h2>
        <p className="text-muted-foreground mb-6">{error || 'Unable to verify your payment'}</p>
        <Button 
          onClick={() => {
            const store = searchParams.get('store');
            navigate(store ? `/store/${store}` : '/');
          }} 
          className="w-full rounded-full"
        >
          Return to Store
        </Button>
      </div>
    </div>
  );
};

export default PaymentVerify;