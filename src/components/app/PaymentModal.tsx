import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  Globe,
  ExternalLink,
} from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const {
    isPayFastModalOpen,
    closePayFastCheckout,
    selectedPayFastPlan,
    completePayFastPayment,
    showToast,
    currentUser,
  } = useApp();

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isPayFastModalOpen || !selectedPayFastPlan) return null;

  // Determine if buyer is in Zimbabwe (use ClicknPay / OpenAPI Africa) or elsewhere (PayFast)
  const isZimbabwe =
    (currentUser?.country || '').toLowerCase().includes('zimbabwe') ||
    (currentUser?.countryCode || '').toUpperCase() === 'ZW' ||
    (currentUser?.location || '').toLowerCase().includes('zimbabwe') ||
    (currentUser?.location || '').toLowerCase().includes('harare') ||
    (currentUser?.location || '').toLowerCase().includes('bulawayo') ||
    (currentUser?.phone || '').startsWith('+263');

  const isBoostPlan =
    selectedPayFastPlan.id === 'plan-boost' ||
    selectedPayFastPlan.name.toLowerCase().includes('boost');

  const planPriceUsd = selectedPayFastPlan.priceUsd
    ? selectedPayFastPlan.priceUsd.toFixed(2)
    : selectedPayFastPlan.price
    ? Number(selectedPayFastPlan.price).toFixed(2)
    : isBoostPlan
    ? '2.99'
    : '14.99';

  const gatewayName = isZimbabwe ? 'ClicknPay / OpenAPI Africa' : 'PayFast Gateway';

  const handleProceedToGateway = async () => {
    setIsProcessing(true);

    const paymentMethodDecoded = isZimbabwe
      ? 'ClicknPay / OpenAPI Africa (Zimbabwe Gateway)'
      : 'PayFast Hosted Gateway';

    const res = await completePayFastPayment(paymentMethodDecoded);
    setIsProcessing(false);

    if (res.success) {
      if (isBoostPlan) {
        showToast(
          'Boost Active! ⚡',
          `Payment verified by ${gatewayName}. 10x visibility spotlight active for 30 minutes!`,
          'boost'
        );
      } else {
        showToast(
          'Subscription Activated! 🎉',
          `Payment verified by ${gatewayName}. Welcome to ${selectedPayFastPlan.name}!`,
          'match'
        );
      }
      closePayFastCheckout();
    } else {
      showToast('Payment Notice', res.error || 'Gateway could not process transaction.', 'info');
    }
  };

  return (
    <div
      id="checkout-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="checkout-modal-content"
        className="relative w-full max-w-md bg-[#120824] border border-pink-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          id="checkout-close-btn"
          onClick={closePayFastCheckout}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Security & Gateway Badge */}
        <div className="flex items-center justify-between mb-5 pr-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center">
              {isBoostPlan ? (
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-pink-400" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-gray-200">
                {isBoostPlan ? 'Spotlight Boost Checkout' : 'VIP Membership Checkout'}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>{gatewayName} &bull; 256-Bit SSL</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold">
            {isZimbabwe ? 'ZW Hub (USD)' : 'Global (USD)'}
          </span>
        </div>

        {/* Selected Plan Summary */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-white/10 mb-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                {isBoostPlan ? 'Paid Feature' : 'Selected Plan'}
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">{selectedPayFastPlan.name}</h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-300">
                ${planPriceUsd}
              </div>
              <span className="text-[10px] text-gray-400 font-medium">
                {selectedPayFastPlan.billingCycle === 'one-time' ? 'one-time payment' : 'per month (USD)'}
              </span>
            </div>
          </div>
          <p className="text-xs text-purple-200/70 mt-2">{selectedPayFastPlan.description}</p>
        </div>

        {/* Plan Features Included */}
        <div className="space-y-2 mb-6">
          <p className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">Included Perks:</p>
          {(selectedPayFastPlan.features || []).slice(0, 4).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-gray-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Gateway Decoding Notice - User does NOT select payment methods inside app */}
        <div className="p-4 rounded-2xl bg-[#190d33] border border-purple-800/60 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center shrink-0 text-pink-400 mt-0.5">
              <Globe className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <span>{isZimbabwe ? 'ClicknPay / OpenAPI Africa' : 'PayFast Secure Gateway'}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Direct Engine
                </span>
              </div>
              <p className="text-[11px] text-purple-200/80 mt-1 leading-relaxed">
                {isZimbabwe
                  ? 'All Zimbabwe payment methods (EcoCash, OneMoney, ZimSwitch, InnBucks & Cards) are decoded directly by ClicknPay & OpenAPI Africa.'
                  : 'PayFast automatically decodes and presents your optimal payment method (Credit/Debit Card, Instant EFT, Masterpass, SnapScan, Zapper) on secure checkout.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            id="checkout-confirm-btn"
            type="button"
            onClick={handleProceedToGateway}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-2xl gradient-fiffy text-white font-bold text-sm shadow-lg shadow-pink-500/30 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Connecting to {isZimbabwe ? 'ClicknPay / OpenAPI Africa' : 'PayFast'}...</span>
              </div>
            ) : (
              <>
                <span>
                  {isZimbabwe
                    ? `Proceed to ClicknPay / OpenAPI Africa ($${planPriceUsd})`
                    : `Proceed to PayFast Secure Checkout ($${planPriceUsd})`}
                </span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 pt-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>
              {isZimbabwe
                ? 'Secured by ClicknPay / OpenAPI Africa &bull; PCI-DSS Certified'
                : 'Secured by PayFast Hosted Engine &bull; PCI-DSS Level 1 Certified'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
