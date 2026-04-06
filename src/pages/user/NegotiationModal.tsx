
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useChatStore } from '@/store/chat.store';
import { useNegotiationStore } from '@/store/negotiation.store';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface NegotiationModalProps {
  open: boolean;
  onClose: () => void;
  product: any;
  storeSlug: string;
  storeOwnerId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export const NegotiationModal: React.FC<NegotiationModalProps> = ({
  open,
  onClose,
  product,
  storeSlug,
  storeOwnerId,
  customerName = '',
  customerEmail = '',
  customerPhone = '',
}) => {
  const [offerPrice, setOfferPrice] = useState('');
  const [message, setMessage] = useState('');
  const { createChat } = useChatStore();
  const { createNegotiation, isSubmitting, error, clearError } = useNegotiationStore();
  const { toast } = useToast();

  const originalPrice = product?.price || 0;
  const offer = Number(offerPrice) || 0;
  const discount = originalPrice - offer;
  const discountPercent =
    originalPrice > 0 ? ((discount / originalPrice) * 100).toFixed(1) : '0';

  const isValidOffer =
    offer > 0 && offer < originalPrice && message.trim().length > 0;

  const handleReset = () => {
    setOfferPrice('');
    setMessage('');
    clearError();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!offerPrice || Number(offerPrice) <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid offer price',
        variant: 'destructive',
      });
      return;
    }

    if (Number(offerPrice) >= originalPrice) {
      toast({
        title: 'Invalid Offer',
        description: 'Your offer must be less than the original price',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please tell the seller why they should accept your offer',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Step 1: Create negotiation record using the store
      console.log('📝 Creating negotiation offer...');
      const negotiation = await createNegotiation(storeSlug, {
        productId: product._id,
        productName: product.name,
        originalPrice,
        offerPrice: Number(offerPrice),
        message: message.trim(),
        customerName: customerName || 'Anonymous Customer',
        customerEmail: customerEmail || 'contact@example.com',
        customerPhone: customerPhone || 'Not provided',
      });

      console.log('✅ Negotiation created:', negotiation._id);

      // Step 2: Open chat with store owner
      console.log('💬 Opening chat with store owner...');
      const chatMessage = `🤝 **NEGOTIATION OFFER**\n\n📦 Product: ${product.name}\n💰 Original Price: ₦${originalPrice.toLocaleString()}\n🎯 Your Offer: ₦${Number(offerPrice).toLocaleString()}\n💵 Your Discount: ₦${discount.toLocaleString()} (${discountPercent}%)\n\n📝 Message: ${message}`;

      await createChat(
        {
          participantId: storeOwnerId,
          participantModel: 'Client',
          message: chatMessage,
          orderId: negotiation._id,
        },
        'store',
        storeSlug
      );

      console.log('✅ Chat created and offer sent');

      toast({
        title: '🎉 Offer Sent Successfully!',
        description: `Your ₦${discount.toLocaleString()} discount offer has been sent. The seller will respond in the chat.`,
      });

      handleReset();
      onClose();
    } catch (err: any) {
      console.error('❌ Negotiation error:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to send offer',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🤝 Negotiate Price
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Information Card */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-sm text-gray-800">{product?.name}</h4>
            <p className="text-xs text-gray-600 mt-1">Original Price</p>
            <p className="text-2xl font-bold text-green-600">
              ₦{originalPrice.toLocaleString()}
            </p>
          </div>

          {/* Negotiation Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Your Offer Price Input */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Your Offer Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">
                  ₦
                </span>
                <Input
                  type="number"
                  placeholder="Enter your offer price"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  min="0"
                  step="1000"
                  className="pl-7"
                  disabled={isSubmitting}
                />
              </div>

              {/* Discount Display */}
              {offerPrice && (
                <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Your Offer:</span>
                    <span className="font-bold text-yellow-600">
                      ₦{Number(offerPrice).toLocaleString()}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-700">You Save:</span>
                      <span className="font-bold text-green-600">
                        ₦{discount.toLocaleString()} ({discountPercent}%)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Message to Seller */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Message to Seller *
              </label>
              <Textarea
                placeholder="Example: I'm a loyal customer... / This is urgent... / Bulk order..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px] text-sm resize-none"
                disabled={isSubmitting}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/500 characters
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-sm text-red-700">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm text-blue-900 space-y-1">
              <p className="flex items-start gap-2">
                <span>✅</span>
                <span>Your offer will be sent via chat</span>
              </p>
              <p className="flex items-start gap-2">
                <span>💬</span>
                <span>You can discuss with the seller in real-time</span>
              </p>
              <p className="flex items-start gap-2">
                <span>⏰</span>
                <span>Offer expires in 7 days if no response</span>
              </p>
              <p className="flex items-start gap-2">
                <span>📋</span>
                <span>All negotiation history is saved</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValidOffer || isSubmitting}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    📨 Send Offer
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NegotiationModal;