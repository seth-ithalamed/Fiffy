import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const PhoneVerificationModal: React.FC = () => {
  const {
    isPhoneVerificationModalOpen,
    closePhoneVerificationModal,
    phoneVerificationData,
    currentUser,
    authUser,
    verifyPhoneOtp,
    resendPhoneOtp,
  } = useApp();

  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(25);

  const displayPhone =
    phoneVerificationData?.formattedPhone ||
    currentUser.contactNumber ||
    currentUser.phone ||
    authUser?.contactNumber ||
    authUser?.phone ||
    'your mobile number';

  // Cooldown countdown timer for Resend button
  useEffect(() => {
    if (!isPhoneVerificationModalOpen) return;
    setCooldown(25);
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPhoneVerificationModalOpen, phoneVerificationData]);

  // Pre-fill simulated code in sandbox preview mode if available
  useEffect(() => {
    if (phoneVerificationData?.verificationCode && !code) {
      setCode(phoneVerificationData.verificationCode);
    }
  }, [phoneVerificationData]);

  if (!isPhoneVerificationModalOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length < 4) {
      setError('Please enter the 6-digit code received via SMS.');
      return;
    }

    setLoading(true);
    setError(null);
    const res = await verifyPhoneOtp(code.trim());
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Incorrect or expired verification code.');
    } else {
      setCode('');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    const res = await resendPhoneOtp();
    setResending(false);
    if (res.success) {
      setCooldown(25);
    } else {
      setError(res.error || 'Could not resend SMS. Please try again.');
    }
  };

  return (
    <div
      id="phone-verification-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="phone-verification-modal-card"
        className="relative w-full max-w-md bg-[#130725] border border-pink-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl text-white my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="phone-verify-close-btn"
          onClick={closePhoneVerificationModal}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-600/30 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-lg shadow-pink-500/15">
            <Smartphone className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SMS Dispatched</span>
            </div>
            <h3 className="font-display font-extrabold text-xl text-white">
              Verify Your Mobile Number
            </h3>
            <p className="text-xs text-purple-200/80 mt-1 max-w-xs mx-auto">
              We sent a 6-digit SMS verification code to{' '}
              <strong className="text-pink-300 font-mono">{displayPhone}</strong>.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          {/* Sandbox code pill if simulated */}
          {phoneVerificationData?.simulatedSms && phoneVerificationData?.verificationCode && (
            <div className="p-2.5 rounded-xl bg-purple-900/30 border border-purple-500/30 text-[11px] text-purple-200 flex items-center justify-between">
              <span>
                Sandbox Preview Code:{' '}
                <strong className="font-mono text-pink-300 tracking-wider">
                  {phoneVerificationData.verificationCode}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setCode(phoneVerificationData.verificationCode || '')}
                className="text-[10px] font-bold text-pink-400 hover:text-pink-300 underline"
              >
                Auto-fill
              </button>
            </div>
          )}

          <div className="space-y-1.5 text-center">
            <label
              htmlFor="phone-verify-code-input"
              className="text-xs font-semibold text-purple-200 block"
            >
              Enter 6-Digit SMS Code
            </label>
            <input
              id="phone-verify-code-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              required
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full max-w-[240px] mx-auto text-center font-mono text-2xl tracking-[0.4em] py-3 px-4 bg-white/5 border border-pink-500/40 rounded-2xl text-white placeholder-purple-400/30 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20 transition-all"
            />
          </div>

          <button
            id="phone-verify-submit-btn"
            type="submit"
            disabled={loading || code.length < 4}
            className="w-full py-3.5 rounded-2xl gradient-fiffy text-white font-bold text-sm shadow-xl shadow-pink-500/25 flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying SMS Code...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify Mobile Number</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          {/* Resend SMS and Later Options */}
          <div className="flex items-center justify-between pt-2 text-xs">
            <button
              type="button"
              id="phone-verify-resend-btn"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="text-purple-300 hover:text-white font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {resending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {cooldown > 0 ? `Resend SMS in ${cooldown}s` : 'Resend SMS Code'}
              </span>
            </button>

            <button
              type="button"
              id="phone-verify-later-btn"
              onClick={closePhoneVerificationModal}
              className="text-purple-400/80 hover:text-purple-200 transition-colors font-medium"
            >
              Verify later
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
