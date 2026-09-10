import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AFRICAN_COUNTRIES } from '../../data/mockData';
import {
  X,
  Lock,
  Mail,
  User,
  Heart,
  Globe,
  Sparkles,
  AlertCircle,
  ArrowRight,
  LogIn,
  UserPlus,
  Phone,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

const calculateAge = (dobString: string): number => {
  if (!dobString) return 0;
  const birth = new Date(dobString);
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    loginUser,
    signupUser,
    showToast,
  } = useApp();

  // Login form state - supports email or contact number
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupContact, setSignupContact] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupDob, setSignupDob] = useState('2000-01-15');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupGender, setSignupGender] = useState<'woman' | 'man' | 'non-binary'>('woman');
  const [signupShowMe, setSignupShowMe] = useState<'men' | 'women' | 'everyone'>('men');
  const [signupCountry, setSignupCountry] = useState('South Africa');
  const [signupCity, setSignupCity] = useState('Johannesburg');
  const [signupBio, setSignupBio] = useState('');
  const [signupDatingGoal, setSignupDatingGoal] = useState('Long-term relationship');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Phone Validation & SMS OTP State
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState<{
    checked: boolean;
    valid?: boolean;
    exists?: boolean;
    message?: string;
    formattedPhone?: string;
  } | null>(null);

  const [otpStepOpen, setOtpStepOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedPhoneFormatted, setVerifiedPhoneFormatted] = useState('');

  // Reset OTP status if phone changes
  const handlePhoneChange = (val: string) => {
    setSignupContact(val);
    setPhoneStatus(null);
    if (isPhoneVerified) {
      setIsPhoneVerified(false);
      setVerificationToken(null);
      setVerifiedPhoneFormatted('');
    }
  };

  // Get active country code
  const currentCountryObj = AFRICAN_COUNTRIES.find((c) => c.name === signupCountry);
  const activeCountryCode = currentCountryObj?.code || 'ZA';

  // Real-time Phone Validity & Duplicate Check
  const handleCheckPhone = async (phoneVal = signupContact) => {
    if (!phoneVal.trim() || phoneVal.trim().length < 7) {
      setPhoneStatus(null);
      return;
    }
    setPhoneChecking(true);
    try {
      const res = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneVal.trim(),
          countryCode: activeCountryCode,
        }),
      });
      const data = await res.json();
      setPhoneStatus({
        checked: true,
        valid: data.valid,
        exists: data.exists,
        message: data.message || data.error,
        formattedPhone: data.formattedPhone,
      });
    } catch {
      // Ignore network failure
    } finally {
      setPhoneChecking(false);
    }
  };

  // Send SMS OTP
  const handleSendOtp = async () => {
    setOtpError(null);
    setOtpSentNotice(null);
    if (!signupContact.trim()) {
      setSignupError('Please enter your contact number first.');
      return;
    }
    setOtpSending(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: signupContact.trim(),
          countryCode: activeCountryCode,
          purpose: 'signup',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || 'Failed to send SMS verification code.');
        if (data.error && data.error.includes('already exists')) {
          setSignupError(data.error);
        }
      } else {
        setOtpStepOpen(true);
        setOtpSentNotice(data.message);
        if (data.verificationCode) {
          // Sandbox preview convenience: pre-populate code
          setOtpCode(data.verificationCode);
        }
        showToast('SMS Sent', `Verification code sent to ${data.formattedPhone}`, 'info');
      }
    } catch {
      setOtpError('Could not reach verification server. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  // Verify SMS OTP
  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setOtpError('Please enter the 6-digit code received via SMS.');
      return;
    }
    setOtpVerifying(true);
    setOtpError(null);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: signupContact.trim(),
          code: otpCode.trim(),
          countryCode: activeCountryCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || 'Incorrect or expired verification code.');
      } else {
        setIsPhoneVerified(true);
        setVerificationToken(data.verificationToken);
        setVerifiedPhoneFormatted(data.formattedPhone || signupContact);
        setOtpStepOpen(false);
        setOtpError(null);
        showToast('Verified!', 'Your contact number is verified.', 'success');
      }
    } catch {
      setOtpError('Network error while verifying code.');
    } finally {
      setOtpVerifying(false);
    }
  };

  if (!isAuthModalOpen) return null;

  const calculatedAge = calculateAge(signupDob);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const res = await loginUser(loginIdentifier, loginPassword);
    setLoginLoading(false);

    if (res.success) {
      showToast('Welcome back!', 'Successfully signed in. Previous sessions on other devices terminated.', 'info');
      closeAuthModal();
    } else {
      setLoginError(res.error || 'Invalid credentials or password');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!signupName.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }

    if (!signupContact.trim()) {
      setSignupError('Contact number is required.');
      return;
    }

    if (phoneStatus?.exists) {
      setSignupError('An account with this contact number already exists. Fiffy’s allows only one account per phone number. Please sign in instead.');
      return;
    }

    if (!signupDob) {
      setSignupError('Date of birth is required.');
      return;
    }

    if (calculatedAge < 18) {
      setSignupError('You must be at least 18 years old to join Fiffy’s (calculated from date of birth).');
      return;
    }

    if (!signupPassword.trim()) {
      setSignupError('Please create a password.');
      return;
    }

    setSignupLoading(true);
    const countryObj = AFRICAN_COUNTRIES.find((c) => c.name === signupCountry);

    const res = await signupUser({
      name: signupName.trim(),
      contactNumber: signupContact.trim(),
      phone: signupContact.trim(),
      email: signupEmail.trim() || undefined,
      dob: signupDob,
      dateOfBirth: signupDob,
      age: calculatedAge,
      password: signupPassword,
      gender: signupGender,
      showMe: signupShowMe,
      country: signupCountry,
      countryCode: countryObj?.code || 'ZA',
      countryFlag: countryObj?.flag || '🇿🇦',
      city: signupCity.trim() || 'Johannesburg',
      bio: signupBio.trim() || `Excited to connect with genuine people across ${signupCountry}!`,
      datingGoal: signupDatingGoal,
      verificationToken: verificationToken || undefined,
    });

    setSignupLoading(false);

    if (res.success) {
      showToast('Account Created!', 'Welcome to Fiffy’s Match Making. Your verified profile is live!', 'info');
      closeAuthModal();
    } else {
      setSignupError(res.error || 'Failed to create account.');
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="auth-modal-content"
        className="relative w-full max-w-lg bg-[#140b25] border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          id="auth-modal-close-btn"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl overflow-hidden border border-pink-500/30 shadow-lg shadow-pink-500/25 bg-[#0c051a] flex items-center justify-center">
            <img src="/assets/favicon.png" alt="Fiffy Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-white">
              {authModalTab === 'login' ? 'Welcome Back to Fiffy’s' : 'Join Fiffy’s Match Making'}
            </h2>
            <p className="text-xs text-purple-300/70">
              Connecting African & Diaspora singles with intention and culture
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 mb-6">
          <button
            id="auth-tab-login-btn"
            type="button"
            onClick={() => {
              setAuthModalTab('login');
              setLoginError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              authModalTab === 'login'
                ? 'gradient-fiffy text-white shadow-md shadow-pink-500/25'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            id="auth-tab-signup-btn"
            type="button"
            onClick={() => {
              setAuthModalTab('signup');
              setSignupError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              authModalTab === 'signup'
                ? 'gradient-fiffy text-white shadow-md shadow-pink-500/25'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* LOGIN FORM */}
        {authModalTab === 'login' && (
          <form id="login-form" onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div
                id="login-error-box"
                className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label htmlFor="login-identifier" className="block text-xs font-semibold text-purple-200 mb-1.5">
                Email or Contact Number
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-purple-400/60" />
                <input
                  id="login-identifier"
                  type="text"
                  required
                  placeholder="Email or contact number (e.g. +27 82 459 9021)"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-purple-200 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-purple-400/60" />
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                />
              </div>
            </div>

            {/* Single Session Security Notice in Login */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-900/30 border border-purple-500/20 text-[11px] text-purple-200">
              <ShieldCheck className="w-4 h-4 text-pink-400 shrink-0" />
              <span>
                <strong className="text-white font-semibold">Single Active Session:</strong> Signing in here will automatically sign you out of any other active devices or browser tabs.
              </span>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-2xl gradient-fiffy text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Switch to sign up */}
            <div className="pt-4 mt-2 border-t border-white/10 text-center">
              <p className="text-xs text-purple-200/70">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  id="login-switch-to-signup-btn"
                  onClick={() => {
                    setAuthModalTab('signup');
                    setSignupError(null);
                  }}
                  className="font-bold text-pink-400 hover:text-pink-300 transition-colors underline underline-offset-2"
                >
                  Create one now
                </button>
              </p>
            </div>
          </form>
        )}

        {/* SIGNUP FORM */}
        {authModalTab === 'signup' && (
          <form id="signup-form" onSubmit={handleSignupSubmit} className="space-y-4">
            {signupError && (
              <div
                id="signup-error-box"
                className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{signupError}</span>
                  {signupError.includes('already exists') && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier(signupContact);
                          setAuthModalTab('login');
                          setSignupError(null);
                        }}
                        className="text-xs font-bold text-pink-400 underline underline-offset-2 hover:text-pink-300"
                      >
                        Click here to Sign In instead →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Name & Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-name" className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-purple-400/60" />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    placeholder="e.g. Zola Dlamini"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="signup-dob" className="text-xs font-semibold text-purple-200">
                    Date of Birth *
                  </label>
                  <span
                    id="signup-calculated-age-badge"
                    className="text-[11px] font-bold text-pink-300 bg-pink-500/20 border border-pink-500/30 px-2 py-0.5 rounded-full"
                  >
                    Age: {calculatedAge > 0 ? calculatedAge : '--'}
                  </span>
                </div>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-purple-400/60" />
                  <input
                    id="signup-dob"
                    type="date"
                    required
                    value={signupDob}
                    onChange={(e) => setSignupDob(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500 [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Contact Number with Verification & Duplicate Prevention */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <label htmlFor="signup-contact" className="block text-xs font-semibold text-purple-200">
                  Mobile Contact Number * <span className="text-pink-400 text-[10px] font-normal">(1 account per number)</span>
                </label>
                {isPhoneVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-purple-300/60">
                    Format: +Country Code or Local (e.g. 082 459 9021)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-purple-400/60" />
                  <input
                    id="signup-contact"
                    type="tel"
                    required
                    disabled={isPhoneVerified}
                    placeholder={`e.g. +27 82 459 9021 or 0824599021`}
                    value={signupContact}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onBlur={() => handleCheckPhone(signupContact)}
                    className={`w-full bg-white/5 border rounded-2xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none transition-colors ${
                      isPhoneVerified
                        ? 'border-emerald-500/50 bg-emerald-500/5 cursor-not-allowed text-emerald-200'
                        : phoneStatus?.exists
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-white/10 focus:border-pink-500'
                    }`}
                  />
                </div>

                {!isPhoneVerified && (
                  <button
                    type="button"
                    id="signup-send-otp-btn"
                    onClick={handleSendOtp}
                    disabled={otpSending || !signupContact.trim()}
                    className="px-3.5 py-2.5 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {otpSending ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                    )}
                    <span>{otpStepOpen ? 'Resend SMS' : 'Verify SMS'}</span>
                  </button>
                )}
              </div>

              {/* Duplicate check warning */}
              {phoneStatus?.exists && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs text-red-300">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>This number already has an account.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier(signupContact);
                      setAuthModalTab('login');
                      setSignupError(null);
                    }}
                    className="font-bold text-pink-400 underline underline-offset-2 hover:text-pink-300 ml-2"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* OTP Entry Box */}
              {otpStepOpen && !isPhoneVerified && (
                <div className="p-3 rounded-xl bg-purple-950/60 border border-pink-500/30 space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-pink-300 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" /> Enter 6-digit SMS verification code
                    </span>
                    <span className="text-[10px] text-purple-300/70">Valid for 5 mins</span>
                  </div>

                  {otpSentNotice && (
                    <p className="text-[11px] text-purple-200/90 leading-tight">
                      {otpSentNotice}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      id="signup-otp-input"
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-36 bg-black/40 border border-pink-500/40 rounded-xl px-3 py-2 text-center text-sm tracking-widest font-mono text-white focus:outline-none focus:border-pink-400"
                    />
                    <button
                      type="button"
                      id="signup-verify-otp-btn"
                      onClick={handleVerifyOtp}
                      disabled={otpVerifying || otpCode.length < 4}
                      className="flex-1 py-2 px-3 rounded-xl gradient-fiffy text-white font-bold text-xs shadow-md shadow-pink-500/20 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                    >
                      {otpVerifying ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm & Verify</span>
                        </>
                      )}
                    </button>
                  </div>

                  {otpError && (
                    <p className="text-[11px] text-red-300 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-400 shrink-0" /> {otpError}
                    </p>
                  )}
                </div>
              )}

              {/* Verified Badge */}
              {isPhoneVerified && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Number verified: <strong className="font-semibold text-white">{verifiedPhoneFormatted}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPhoneVerified(false);
                      setVerificationToken(null);
                      setOtpStepOpen(false);
                    }}
                    className="text-[11px] text-purple-300/80 hover:text-white underline ml-2"
                  >
                    Change Number
                  </button>
                </div>
              )}
            </div>

            {/* Optional Email */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold text-purple-200 mb-1.5">
                Email Address <span className="text-purple-300/60 text-[10px] font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-purple-400/60" />
                <input
                  id="signup-email"
                  type="email"
                  placeholder="you@domain.com (optional)"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* 100% Privacy Guarantee Pill */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-[11px] text-pink-200">
              <Lock className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>
                <strong className="text-white font-semibold">Strict Privacy:</strong> Contact numbers and emails are 100% hidden from everyone. Other members will never see your number or email.
              </span>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-xs font-semibold text-purple-200 mb-1.5">
                Create Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-purple-400/60" />
                <input
                  id="signup-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Country & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-country" className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Country *
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-3.5 text-purple-400/60" />
                  <select
                    id="signup-country"
                    value={signupCountry}
                    onChange={(e) => {
                      setSignupCountry(e.target.value);
                      const match = AFRICAN_COUNTRIES.find((c) => c.name === e.target.value);
                      if (match && match.majorCities.length > 0) {
                        setSignupCity(match.majorCities[0]);
                      }
                    }}
                    className="w-full bg-[#1e1338] border border-white/10 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                  >
                    {AFRICAN_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name} className="bg-[#1e1338] text-white">
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="signup-city" className="block text-xs font-semibold text-purple-200 mb-1.5">
                  City / Area *
                </label>
                <input
                  id="signup-city"
                  type="text"
                  required
                  placeholder="e.g. Cape Town, Sandton"
                  value={signupCity}
                  onChange={(e) => setSignupCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Gender & Looking For */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-gender" className="block text-xs font-semibold text-purple-200 mb-1.5">
                  I am a
                </label>
                <select
                  id="signup-gender"
                  value={signupGender}
                  onChange={(e) => setSignupGender(e.target.value as any)}
                  className="w-full bg-[#1e1338] border border-white/10 rounded-2xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="woman">Woman</option>
                  <option value="man">Man</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>
              <div>
                <label htmlFor="signup-showme" className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Show Me
                </label>
                <select
                  id="signup-showme"
                  value={signupShowMe}
                  onChange={(e) => setSignupShowMe(e.target.value as any)}
                  className="w-full bg-[#1e1338] border border-white/10 rounded-2xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="everyone">Everyone</option>
                </select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="signup-bio" className="block text-xs font-semibold text-purple-200 mb-1.5">
                Bio / About You
              </label>
              <textarea
                id="signup-bio"
                rows={2}
                placeholder="What excites you, your favorite music, and what kind of connection you are seeking..."
                value={signupBio}
                onChange={(e) => setSignupBio(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              disabled={signupLoading}
              className="w-full py-3 rounded-2xl gradient-fiffy text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {signupLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create Account & Start Matching</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
