import React, { useState } from 'react';
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

  if (!isAuthModalOpen) return null;

  const calculatedAge = calculateAge(signupDob);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const res = await loginUser(loginIdentifier, loginPassword);
    setLoginLoading(false);

    if (res.success) {
      showToast('Welcome back!', 'Successfully signed in.', 'info');
      closeAuthModal();
    } else {
      setLoginError(res.error || 'Invalid credentials or password');
    }
  };

  const handleQuickDemoLogin = async (identifier: string, pass: string) => {
    setLoginIdentifier(identifier);
    setLoginPassword(pass);
    setLoginError(null);
    setLoginLoading(true);

    const res = await loginUser(identifier, pass);
    setLoginLoading(false);

    if (res.success) {
      showToast('Demo Account Loaded', `Signed in as ${res.user?.name || identifier}`, 'info');
      closeAuthModal();
    } else {
      setLoginError(res.error || 'Failed to login with demo profile');
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
    });

    setSignupLoading(false);

    if (res.success) {
      showToast('Account Created!', 'Welcome to Fiffy’s Match Making. Your profile is live!', 'info');
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
          <div className="w-10 h-10 rounded-2xl gradient-fiffy flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Heart className="w-5 h-5 text-white fill-white" />
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

            {/* Quick Demo Logins for reviewers */}
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="text-[11px] uppercase tracking-wider text-purple-300/60 font-semibold mb-2.5">
                Demo Accounts (Quick 1-Click Login):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  id="demo-login-lerato"
                  onClick={() => handleQuickDemoLogin('lerato.khumalo@fiffys.com', 'password123')}
                  className="text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors"
                >
                  <div className="font-semibold text-pink-300">🇿🇦 Lerato Khumalo</div>
                  <div className="text-[10px] text-purple-300/60">Johannesburg, South Africa</div>
                </button>
                <button
                  type="button"
                  id="demo-login-amara"
                  onClick={() => handleQuickDemoLogin('amara.okafor@demo.fiffys.com', 'password123')}
                  className="text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors"
                >
                  <div className="font-semibold text-pink-300">🇳🇬 Amara Okafor</div>
                  <div className="text-[10px] text-purple-300/60">Lagos, Nigeria</div>
                </button>
                <button
                  type="button"
                  id="demo-login-thabo"
                  onClick={() => handleQuickDemoLogin('thabo.ndlovu@demo.fiffys.com', 'password123')}
                  className="text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors"
                >
                  <div className="font-semibold text-pink-300">🇿🇦 Thabo Ndlovu</div>
                  <div className="text-[10px] text-purple-300/60">Sandton, South Africa</div>
                </button>
                <button
                  type="button"
                  id="demo-login-kwame"
                  onClick={() => handleQuickDemoLogin('kwame.mensah@demo.fiffys.com', 'password123')}
                  className="text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors"
                >
                  <div className="font-semibold text-pink-300">🇬🇭 Kwame Mensah</div>
                  <div className="text-[10px] text-purple-300/60">Accra, Ghana</div>
                </button>
              </div>
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
                <span>{signupError}</span>
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

            {/* Contact Number & Optional Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-contact" className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Contact Number * <span className="text-pink-400 text-[10px] font-normal">(Required)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-purple-400/60" />
                  <input
                    id="signup-contact"
                    type="tel"
                    required
                    placeholder="+27 82 459 9021"
                    value={signupContact}
                    onChange={(e) => setSignupContact(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

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
