import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound, AlertCircle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ForcePasswordChangeModal: React.FC = () => {
  const {
    isPasswordChangeModalOpen,
    closePasswordChangeModal,
    passwordChangeData,
    changeInitialPassword,
    authUser,
  } = useApp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isPasswordChangeModalOpen) return null;

  const displayName = passwordChangeData?.name || authUser?.name || 'VIP Member';

  // Basic validation rules
  const hasMinLength = newPassword.length >= 6;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isFormValid = hasMinLength && passwordsMatch && currentPassword.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentPassword.trim()) {
      setErrorMessage('Please enter the temporary password sent to your phone via SMS.');
      return;
    }

    if (!hasMinLength) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('New passwords do not match. Please verify and try again.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage('Your new password cannot be the same as your temporary password.');
      return;
    }

    setLoading(true);
    const result = await changeInitialPassword(currentPassword, newPassword);
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to update password. Please check your temporary password.');
    }
  };

  return (
    <div
      id="force-password-change-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="force-password-change-card"
        className="bg-white dark:bg-stone-900 border border-amber-200/40 dark:border-amber-500/20 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 p-6 text-white relative">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full text-amber-100">
                <Sparkles className="w-3 h-3 mr-1" /> First Time Access
              </span>
              <h2 className="text-xl font-bold font-serif leading-snug">Set Your Personal Password</h2>
            </div>
          </div>
          <p className="text-amber-50 text-xs leading-relaxed">
            Welcome, <strong className="text-white font-semibold">{displayName}</strong>! Your VIP profile was added by
            your matchmaking agency. For your personal privacy and security, you must replace your temporary SMS password
            before proceeding to your deck.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div
              id="password-change-error"
              className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-start space-x-2 animate-shake"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current / Temporary Password */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Temporary Password (from SMS invitation)
            </label>
            <div className="relative">
              <input
                id="temp-password-input"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="e.g. VIPPass1234!"
                required
                className="w-full pl-9 pr-10 py-2.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <button
                type="button"
                id="toggle-current-password-btn"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              New Personal Password
            </label>
            <div className="relative">
              <input
                id="new-password-input"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a strong password"
                required
                className="w-full pl-9 pr-10 py-2.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
              <ShieldCheck className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <button
                type="button"
                id="toggle-new-password-btn"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Requirement Badges */}
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px]">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md ${
                  hasMinLength
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                }`}
              >
                <CheckCircle2 className={`w-3 h-3 mr-1 ${hasMinLength ? 'text-emerald-600' : 'text-stone-400'}`} />
                6+ Chars
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md ${
                  hasUppercase
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                }`}
              >
                <CheckCircle2 className={`w-3 h-3 mr-1 ${hasUppercase ? 'text-emerald-600' : 'text-stone-400'}`} />
                Uppercase
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md ${
                  hasNumberOrSpecial
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                }`}
              >
                <CheckCircle2 className={`w-3 h-3 mr-1 ${hasNumberOrSpecial ? 'text-emerald-600' : 'text-stone-400'}`} />
                Number/Symbol
              </span>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirm-password-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type your new password"
                required
                className={`w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-800/80 border rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:ring-2 transition-all ${
                  confirmPassword && !passwordsMatch
                    ? 'border-red-400 focus:ring-red-400'
                    : confirmPassword && passwordsMatch
                    ? 'border-emerald-500 focus:ring-emerald-500'
                    : 'border-stone-300 dark:border-stone-700 focus:ring-amber-500'
                }`}
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
            {confirmPassword && passwordsMatch && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Passwords match perfectly
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="confirm-password-change-btn"
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Securing Profile...</span>
                </div>
              ) : (
                <>
                  <span>Save Password & Enter App</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Privacy Note */}
          <p className="text-center text-[11px] text-stone-400 leading-tight pt-1">
            Fiffy’s Match Making uses banking-grade encryption. Your password will never be visible to your matchmaker or
            anyone else.
          </p>
        </form>
      </div>
    </div>
  );
};
