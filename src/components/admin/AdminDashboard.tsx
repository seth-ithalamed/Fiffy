import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Users,
  BarChart3,
  Bell,
  CheckCircle2,
  Ban,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  Key,
  Database,
  RefreshCw,
  LogOut,
  Send,
  Eye,
  Check,
  Heart,
  Star,
  Crown,
  UserPlus,
  Globe2,
  Sparkles,
  Calendar,
  Phone,
  Compass,
  UserCheck,
  UserCog,
  Shield,
} from 'lucide-react';
import {
  SubscriptionPlan,
  PushNotificationBroadcast,
  Testimonial,
  PlatformManager,
  PlatformManagerRole,
} from '../../types';
import { AFRICAN_COUNTRIES } from '../../data/mockData';

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

export const AdminDashboard: React.FC = () => {
  const {
    adminSession,
    loginAdmin,
    logoutAdmin,
    subscriptionPlans,
    addOrUpdateSubscriptionPlan,
    deleteSubscriptionPlan,
    payfastConfig,
    updatePayfastConfig,
    clearDemoData,
    resetDemoData,
    reportedItems,
    resolveReport,
    broadcasts,
    sendBroadcast,
    showToast,
    testimonials,
    adminAddOrEditTestimonial,
    adminDeleteTestimonial,
    adminUsersList,
    fetchAdminUsers,
    adminAddUser,
    adminToggleUserExemption,
    adminDeleteUser,
    platformManagers,
    addPlatformManager,
    updatePlatformManager,
    deletePlatformManager,
  } = useApp();

  // Admin login form states
  const [adminEmail, setAdminEmail] = useState<string>('admin@fiffy.com');
  const [adminPassword, setAdminPassword] = useState<string>('admin123');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Tabs inside admin portal - includes dedicated platform managers tab
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'gateway' | 'users' | 'managers' | 'testimonials' | 'moderation' | 'broadcast' | 'database'>('users');

  // Platform Manager create modal state
  const [isAddManagerModalOpen, setIsAddManagerModalOpen] = useState(false);
  const [newManagerForm, setNewManagerForm] = useState({
    name: '',
    email: '',
    phone: '+263 77 ',
    role: 'co_admin' as PlatformManagerRole,
    department: 'Platform Operations & Safety Hub',
    password: 'manager2026',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  });

  // Subscription plan edit/create modal state
  const [isEditingPlan, setIsEditingPlan] = useState<boolean>(false);
  const [planForm, setPlanForm] = useState<Partial<SubscriptionPlan>>({
    name: "Fiffy's VIP Gold",
    price: 19.99,
    priceUsd: 19.99,
    currency: 'USD',
    billingCycle: 'monthly',
    isPopular: false,
    features: ['Unlimited Swipes Worldwide', 'Global African Passport', 'See Who Liked You', '5 Free SuperLikes/day'],
  });
  const [featureInput, setFeatureInput] = useState<string>('');

  // Modal for Adding a new User with VIP Exemption
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    contactNumber: '',
    phone: '',
    dob: '1998-04-12',
    dateOfBirth: '1998-04-12',
    password: 'password123',
    age: 27,
    gender: 'woman' as 'woman' | 'man' | 'non-binary',
    city: 'London',
    country: 'United Kingdom',
    countryFlag: '🇬🇧',
    bio: 'Proud African diaspora connecting with rich culture, laughter, and lifelong partnership.',
    photos: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80'],
    isExempt: true, // Default to true because admin adding user is specifically for exceptions
    interests: ['Afrobeats', 'Travel', 'Fashion', 'Tech', 'Foodie'],
  });

  // Modal for Testimonials
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState<Partial<Testimonial>>({
    coupleNames: 'Amara & Kwame',
    userPhoto: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
    partnerPhoto: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=600&q=80',
    location: 'Accra, Ghana & London, UK',
    country: 'Ghana / UK',
    countryFlag: '🇬🇭',
    story: 'We met across continents on Fiffy’s. The connection was instant, and we tied the knot in Accra last spring!',
    metDate: 'Matched on Fiffy',
    status: 'Married',
    rating: 5,
    isFeatured: true,
  });

  // Gateway config state: PayFast (Primary) + ClicknPay/OpenAPI Africa (Zimbabwe)
  const [payfastForm, setPayfastForm] = useState({
    merchantId: payfastConfig?.merchantId || '10000100',
    merchantKey: payfastConfig?.merchantKey || '46f0cd694581a',
    passPhrase: payfastConfig?.passPhrase || 'fiffy_secret_gateway_pass',
    isSandbox: payfastConfig?.isSandbox ?? true,
    openApiAfricaClientId: 'openapi_af_live_zw_8829',
    openApiAfricaSecret: 'sec_af_openapi_9921_prod',
  });

  useEffect(() => {
    if (payfastConfig) {
      setPayfastForm((prev) => ({
        ...prev,
        merchantId: payfastConfig.merchantId || prev.merchantId,
        merchantKey: payfastConfig.merchantKey || prev.merchantKey,
        passPhrase: payfastConfig.passPhrase || prev.passPhrase,
        isSandbox: payfastConfig.isSandbox ?? prev.isSandbox,
      }));
    }
  }, [payfastConfig]);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState<string>('Global African Match Night! 🌍');
  const [broadcastBody, setBroadcastBody] = useState<string>('High activity in London, Atlanta, Johannesburg, Nairobi, and Lagos. Find your match!');
  const [targetAudience, setTargetAudience] = useState<PushNotificationBroadcast['targetAudience']>('all');

  useEffect(() => {
    if (adminSession?.isAuthenticated) {
      fetchAdminUsers();
    }
  }, [adminSession?.isAuthenticated]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const result = await loginAdmin(adminEmail, adminPassword);
    setIsLoggingIn(false);
    if (!result.success) {
      setLoginError(result.error || 'Invalid credentials');
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name || !planForm.price) {
      showToast('Validation Error', 'Please specify a plan name and price in USD.');
      return;
    }
    const priceNum = Number(planForm.price);
    await addOrUpdateSubscriptionPlan({
      ...planForm,
      price: priceNum,
      priceUsd: priceNum,
      currency: 'USD',
    });
    setIsEditingPlan(false);
    setPlanForm({
      name: '',
      price: 19.99,
      priceUsd: 19.99,
      currency: 'USD',
      billingCycle: 'monthly',
      isPopular: false,
      features: ['Unlimited Swipes Worldwide'],
    });
  };

  const handleSaveGatewayConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePayfastConfig({
      merchantId: payfastForm.merchantId,
      merchantKey: payfastForm.merchantKey,
      passPhrase: payfastForm.passPhrase,
      isSandbox: payfastForm.isSandbox,
    });
    showToast('Payment Gateways Saved', 'PayFast & ClicknPay/OpenAPI Africa live settings updated.');
  };

  const handleCreateUserWithExemption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name.trim()) {
      showToast('Validation Error', 'Full Name is required.');
      return;
    }
    if (!newUserForm.contactNumber.trim()) {
      showToast('Validation Error', 'Contact number is required.');
      return;
    }
    const calculatedAge = calculateAge(newUserForm.dateOfBirth);
    if (calculatedAge < 18) {
      showToast('Validation Error', 'User must be at least 18 years old (calculated from date of birth).');
      return;
    }

    const res = await adminAddUser({
      ...newUserForm,
      age: calculatedAge,
      dob: newUserForm.dateOfBirth,
      phone: newUserForm.contactNumber.trim(),
      contactNumber: newUserForm.contactNumber.trim(),
      email: newUserForm.email.trim() || undefined,
      isPremium: newUserForm.isExempt,
    });
    if (res.success) {
      setIsAddUserModalOpen(false);
      setNewUserForm({
        name: '',
        email: '',
        contactNumber: '',
        phone: '',
        dob: '1998-04-12',
        dateOfBirth: '1998-04-12',
        password: 'password123',
        age: 27,
        gender: 'woman',
        city: 'Nairobi',
        country: 'Kenya',
        countryFlag: '🇰🇪',
        bio: 'Tech enthusiast and music lover connecting with intentional partners.',
        photos: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80'],
        isExempt: true,
        interests: ['Afrobeats', 'Travel', 'Foodie'],
      });
      showToast('Member Added', `User created successfully with VIP Exemption ${newUserForm.isExempt ? 'ENABLED' : 'DISABLED'}.`, 'match');
    } else {
      showToast('Error', res.error || 'Failed to create user');
    }
  };

  const handleAddPlatformManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManagerForm.name.trim() || !newManagerForm.email.trim()) {
      showToast('Validation Error', 'Name and email are required to authorize a manager.');
      return;
    }
    const res = await addPlatformManager({
      name: newManagerForm.name,
      email: newManagerForm.email,
      phone: newManagerForm.phone,
      role: newManagerForm.role,
      department: newManagerForm.department,
      password: newManagerForm.password,
      avatarUrl: newManagerForm.avatarUrl,
      status: 'active',
      isRootAdmin: false,
    });
    if (res.success) {
      setIsAddManagerModalOpen(false);
      setNewManagerForm({
        name: '',
        email: '',
        phone: '+263 77 ',
        role: 'co_admin',
        department: 'Platform Operations & Safety Hub',
        password: 'manager2026',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      });
    } else {
      showToast('Error', res.error || 'Failed to authorize platform manager');
    }
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialForm.coupleNames || !testimonialForm.story) {
      showToast('Validation Error', 'Names and story are required.');
      return;
    }
    await adminAddOrEditTestimonial(testimonialForm);
    setIsTestimonialModalOpen(false);
    showToast('Love Story Saved', 'Testimonial updated and visible on marketing surface.');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    sendBroadcast(broadcastTitle.trim(), broadcastBody.trim(), targetAudience);
    setBroadcastTitle('');
    setBroadcastBody('');
  };

  // IF NOT AUTHENTICATED AS ADMIN: RENDER SECURE LOGIN
  if (!adminSession?.isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-[#080310] text-slate-100">
        <div className="w-full max-w-md bg-[#130726] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-pink-500/30 mx-auto shadow-lg shadow-pink-500/30 bg-[#0c051a] flex items-center justify-center">
              <img src="/assets/favicon.png" alt="Fiffy Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold font-display text-white">Administrator Portal</h2>
            <p className="text-xs text-purple-300/80">
              Sign in with executive credentials to manage subscription tiers, payment gateways, VIP member exemptions, and testimonials.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Admin Email Address
              </label>
              <input
                id="admin-login-email"
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Admin Password
              </label>
              <input
                id="admin-login-password"
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/30 text-[11px] text-purple-300/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-pink-400">Quick Test Credentials:</span>
                <span className="text-[10px] text-purple-400">Click to fill</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  id="auto-fill-admin-creds-btn"
                  onClick={() => {
                    setAdminEmail('admin@fiffy.com');
                    setAdminPassword('admin123');
                  }}
                  className="p-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-left text-pink-200 border border-pink-500/30 transition-all cursor-pointer"
                >
                  <div className="font-bold text-[11px] text-pink-300">Executive Admin</div>
                  <div className="text-[10px] text-gray-300 font-mono">admin@fiffy.com</div>
                </button>
                <button
                  type="button"
                  id="auto-fill-manager-creds-btn"
                  onClick={() => {
                    setAdminEmail('kudzi.moyo@fiffys.com');
                    setAdminPassword('manager2026');
                  }}
                  className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-left text-purple-200 border border-purple-500/30 transition-all cursor-pointer"
                >
                  <div className="font-bold text-[11px] text-purple-300">Staff Manager</div>
                  <div className="text-[10px] text-gray-300 font-mono">kudzi.moyo@fiffys.com</div>
                </button>
              </div>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl gradient-fiffy text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? 'Verifying...' : 'Sign In as Administrator'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-[#080310] text-slate-100 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/40">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-pink-500/30 shadow flex items-center justify-center bg-[#0c051a]">
                <img src="/assets/favicon.png" alt="Fiffy Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="font-display font-black text-2xl text-white">
                Fiffy Global Administration
              </h1>
            </div>
            <p className="text-xs text-purple-300/80 mt-1">
              Live database management for worldwide subscriptions, registered members, VIP exceptions, testimonies, and diaspora messaging.
            </p>
          </div>

          {/* Admin user bar with Sign Out button */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>{adminSession.name}</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold flex items-center justify-end gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Admin Session • Live</span>
              </div>
            </div>

            {/* Logout button */}
            <button
              id="admin-logout-btn"
              onClick={logoutAdmin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Sign Out of Administrator Console"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-[11px] font-bold">Sign Out</span>
            </button>
          </div>
        </div>

        {/* METRIC CARDS - Service deployment card removed, balanced 3-card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#130726] border border-white/10 shadow-sm">
            <div className="text-xs text-purple-300/80 font-medium">Subscription Revenue</div>
            <div className="text-2xl font-black text-white mt-1">$ 84,250</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">Worldwide Subscriptions • USD</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#130726] border border-white/10 shadow-sm">
            <div className="text-xs text-purple-300/80 font-medium">Active Plans</div>
            <div className="text-2xl font-black text-white mt-1">{subscriptionPlans.length} VIP Tiers</div>
            <div className="text-[11px] text-pink-400 font-semibold mt-1">Pricing in USD ($)</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#130726] border border-white/10 shadow-sm">
            <div className="text-xs text-purple-300/80 font-medium">Registered Members</div>
            <div className="text-2xl font-black text-white mt-1">{adminUsersList.length} Users</div>
            <div className="text-[11px] text-amber-400 font-semibold mt-1">
              {adminUsersList.filter(u => u.isExempt).length} VIP Exceptions
            </div>
          </div>
        </div>

        {/* DASHBOARD WORKSPACE WITH NAVIGATION ITEMS POSITIONED ON THE RIGHT */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Main Content Area (Left/Center) */}
          <main className="flex-1 w-full min-w-0 order-2 lg:order-1 space-y-6">
            {/* Active Module Status Header */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#130726]/70 border border-white/10 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shrink-0" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {
                    {
                      users: `Members & VIP Exceptions (${adminUsersList.length})`,
                      managers: `Platform Managers & Staff Team (${platformManagers.length})`,
                      testimonials: `Love Stories & Testimonies (${testimonials.length})`,
                      subscriptions: 'Subscription Plans & Pricing (USD)',
                      gateway: 'PayFast & Zimbabwe Payment Gateways',
                      moderation: `Safety & Moderation Queue (${reportedItems.length})`,
                      broadcast: 'Push Broadcast Notifications',
                      database: 'Demo Data Management',
                    }[activeTab] || 'Executive Module'
                  }
                </span>
              </div>
              <div className="text-[11px] text-purple-300/70 hidden sm:flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                <span>Executive Management</span>
              </div>
            </div>

            {/* 1. SUBSCRIPTIONS TAB */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Membership Plans &amp; Pricing (USD)</h3>
                <p className="text-xs text-purple-300/80">
                  Plans modified here update the in-app VIP upgrade flow and checkout prices in USD ($).
                </p>
              </div>
              <button
                id="create-new-plan-btn"
                onClick={() => {
                  setPlanForm({
                    name: 'VIP Executive Passport',
                    price: 24.99,
                    priceUsd: 24.99,
                    currency: 'USD',
                    billingCycle: 'monthly',
                    isPopular: false,
                    features: ['Unlimited Worldwide Swipes', 'Diaspora City Teleport', 'Priority Customer Concierge'],
                  });
                  setIsEditingPlan(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gradient-fiffy text-white text-xs font-bold shadow-md shadow-pink-500/25 hover:brightness-110"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Plan</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptionPlans.map((plan) => {
                const planPriceUsd = plan.priceUsd
                  ? plan.priceUsd.toFixed(2)
                  : plan.price
                  ? Number(plan.price).toFixed(2)
                  : '14.99';

                return (
                  <div
                    key={plan.id}
                    id={`admin-plan-card-${plan.id}`}
                    className={`p-5 rounded-2xl bg-[#130726] border transition-all relative ${
                      plan.isPopular ? 'border-pink-500/80 shadow-lg shadow-pink-500/10' : 'border-white/10'
                    }`}
                  >
                    {plan.isPopular && (
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold gradient-fiffy text-white shadow">
                        MOST POPULAR
                      </span>
                    )}

                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-base">{plan.name}</h4>
                        {plan.description && (
                          <p className="text-xs text-purple-300/80 mt-0.5">{plan.description}</p>
                        )}
                        <div className="text-xl font-black text-pink-400 mt-1">
                          ${planPriceUsd} <span className="text-xs text-purple-300 font-normal">/ {plan.billingCycle} (USD)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          id={`edit-plan-btn-${plan.id}`}
                          onClick={() => {
                            setPlanForm(plan);
                            setIsEditingPlan(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-purple-200 hover:text-white"
                          title="Edit Plan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`delete-plan-btn-${plan.id}`}
                          onClick={() => deleteSubscriptionPlan(plan.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300"
                          title="Delete Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2 border-t border-white/10 pt-3">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-purple-100">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* EDIT PLAN MODAL */}
            {isEditingPlan && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-[#130726] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4">
                  <h3 className="font-bold text-base text-white">
                    {planForm.id ? 'Edit Subscription Plan' : 'Add New Subscription Plan'}
                  </h3>

                  <form onSubmit={handleSavePlan} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">
                        Plan Name
                      </label>
                      <input
                        id="plan-form-name"
                        type="text"
                        required
                        value={planForm.name || ''}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">
                        Plan Tagline / Subtitle
                      </label>
                      <input
                        id="plan-form-description"
                        type="text"
                        placeholder="e.g. Essential upgrades for active singles seeking romance in their city"
                        value={planForm.description || ''}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Price in USD ($)
                        </label>
                        <input
                          id="plan-form-price"
                          type="number"
                          step="0.01"
                          required
                          value={planForm.price || 0}
                          onChange={(e) => setPlanForm((prev) => ({ ...prev, price: Number(e.target.value), priceUsd: Number(e.target.value) }))}
                          className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Billing Cycle
                        </label>
                        <select
                          id="plan-form-billing"
                          value={planForm.billingCycle || 'monthly'}
                          onChange={(e) => setPlanForm((prev) => ({ ...prev, billingCycle: e.target.value as any }))}
                          className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="annual">Annual</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        id="plan-form-is-popular"
                        type="checkbox"
                        checked={planForm.isPopular || false}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, isPopular: e.target.checked }))}
                        className="accent-pink-500 w-4 h-4 rounded cursor-pointer"
                      />
                      <label htmlFor="plan-form-is-popular" className="text-xs font-semibold text-purple-200 cursor-pointer">
                        Mark as &quot;Most Popular&quot; / Recommended
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">
                        Benefits / Features
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          placeholder="e.g. 10 Free Boosts/month"
                          className="flex-1 px-3 py-1.5 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (featureInput.trim()) {
                              setPlanForm((prev) => ({
                                ...prev,
                                features: [...(prev.features || []), featureInput.trim()],
                              }));
                              setFeatureInput('');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 text-xs font-bold border border-pink-500/30"
                        >
                          Add
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(planForm.features || []).map((feat, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-white/10 text-purple-200"
                          >
                            <span>{feat}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setPlanForm((prev) => ({
                                  ...prev,
                                  features: (prev.features || []).filter((_, i) => i !== idx),
                                }))
                              }
                              className="text-gray-400 hover:text-white ml-0.5"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsEditingPlan(false)}
                        className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
                      >
                        Cancel
                      </button>
                      <button
                        id="save-plan-submit-btn"
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl gradient-fiffy text-white text-xs font-bold shadow-lg shadow-pink-500/25"
                      >
                        Save to Database
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. PAYFAST & ZIMBABWE CLICKNPAY GATEWAY SETTINGS */}
        {activeTab === 'gateway' && (
          <div className="max-w-2xl bg-[#130726] border border-white/10 rounded-3xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-pink-400" />
                <span>Payment Gateways &bull; PayFast &amp; ClicknPay / OpenAPI Africa</span>
              </h3>
              <p className="text-xs text-purple-300/80 mt-1">
                Payments everywhere use PayFast (or ClicknPay / OpenAPI Africa for Zimbabwe members). The gateway decodes payment methods automatically &mdash; members never select payment methods in the app.
              </p>
            </div>

            <form onSubmit={handleSaveGatewayConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Settlement Currency
                </label>
                <input
                  type="text"
                  disabled
                  value="USD ($) - United States Dollar (Global Standard)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 text-sm font-semibold cursor-not-allowed"
                />
              </div>

              {/* PayFast Primary Gateway */}
              <div className="p-4 rounded-2xl bg-[#1a0b2e]/60 border border-purple-800/40 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                    <span>PayFast Hosted Gateway (Global &amp; Pan-Africa)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold">
                    Decodes Payment Methods
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    PayFast Merchant ID
                  </label>
                  <input
                    type="text"
                    required
                    value={payfastForm.merchantId}
                    onChange={(e) => setPayfastForm((prev) => ({ ...prev, merchantId: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    PayFast Merchant Key
                  </label>
                  <input
                    type="text"
                    required
                    value={payfastForm.merchantKey}
                    onChange={(e) => setPayfastForm((prev) => ({ ...prev, merchantKey: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    PayFast Security Passphrase
                  </label>
                  <input
                    type="password"
                    value={payfastForm.passPhrase}
                    onChange={(e) => setPayfastForm((prev) => ({ ...prev, passPhrase: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-purple-300">Sandbox / Test Mode</span>
                  <button
                    type="button"
                    onClick={() => setPayfastForm((prev) => ({ ...prev, isSandbox: !prev.isSandbox }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      payfastForm.isSandbox
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {payfastForm.isSandbox ? 'Sandbox (Test)' : 'Live Production'}
                  </button>
                </div>
              </div>

              {/* ClicknPay / OpenAPI Africa for Zimbabwe */}
              <div className="p-4 rounded-2xl bg-[#1a0b2e]/60 border border-purple-800/40 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>ClicknPay / OpenAPI Africa (Zimbabwe Gateway)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    Auto-Route 🇿🇼
                  </span>
                </div>
                <p className="text-[11px] text-purple-300/80">
                  Automatically activated for all Zimbabwean users to decode EcoCash, OneMoney, ZimSwitch, InnBucks, and local cards.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    OpenAPI Africa Client ID
                  </label>
                  <input
                    type="text"
                    value={payfastForm.openApiAfricaClientId}
                    onChange={(e) => setPayfastForm((prev) => ({ ...prev, openApiAfricaClientId: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    OpenAPI Africa Secret Key
                  </label>
                  <input
                    type="password"
                    value={payfastForm.openApiAfricaSecret}
                    onChange={(e) => setPayfastForm((prev) => ({ ...prev, openApiAfricaSecret: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
              </div>

              <button
                id="save-gateway-btn"
                type="submit"
                className="w-full py-3 rounded-xl gradient-fiffy text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:brightness-110 transition-all"
              >
                Save Payment Gateway Parameters
              </button>
            </form>
          </div>
        )}

        {/* 3. REGISTERED USERS & VIP EXCEPTIONS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-400" />
                  <span>Members &amp; VIP Exceptions ({adminUsersList.length})</span>
                </h3>
                <p className="text-xs text-purple-300/80">
                  Manage registered users. Admin-added users or exemptions receive 100% free VIP privileges (unlimited swipes &amp; elite status) without payment.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="tab-open-add-manager-btn"
                  onClick={() => {
                    setNewManagerForm({
                      name: '',
                      email: '',
                      phone: '+263 77 ',
                      role: 'co_admin',
                      department: 'Platform Operations & Safety Hub',
                      password: 'manager2026',
                      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
                    });
                    setIsAddManagerModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-900 text-purple-200 hover:text-white border border-purple-700/50 text-xs font-bold transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-pink-400" />
                  <span>+ Add Platform Manager</span>
                </button>
                <button
                  id="add-admin-user-btn"
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gradient-fiffy text-white text-xs font-bold shadow-md shadow-pink-500/25 hover:brightness-110"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Member / VIP Exception</span>
                </button>
                <button
                  id="refresh-users-btn"
                  onClick={fetchAdminUsers}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-purple-200 border border-white/10"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* USERS TABLE */}
            <div className="bg-[#130726] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1e0e38] text-purple-200 border-b border-white/10">
                    <tr>
                      <th className="p-3.5">Member</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Status &amp; Limits</th>
                      <th className="p-3.5">VIP Exemption Control</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {adminUsersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">
                          No users registered yet. Use &quot;Add Member / VIP Exception&quot; above to create the first member!
                        </td>
                      </tr>
                    ) : (
                      adminUsersList.map((u) => {
                        const isExempt = Boolean(u.isExempt);
                        const isSubscribed = Boolean(u.isPremium && !u.isExempt);
                        const isFree = !u.isPremium && !u.isExempt;

                        return (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={u.photos?.[0] || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80'}
                                  alt={u.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-sm shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    <span className="text-gray-400 font-normal">, {u.age || 25}</span>
                                    {isExempt && (
                                      <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Admin VIP Exemption" />
                                    )}
                                  </div>
                                  <div className="text-[11px] text-purple-300/80 flex items-center gap-1 mt-0.5">
                                    <Lock className="w-3 h-3 text-pink-400 shrink-0" />
                                    <span>Contact &amp; email hidden for privacy</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5 text-purple-200">
                              <div className="flex items-center gap-1.5">
                                <span>{u.countryFlag || '🌍'}</span>
                                <span>{u.city ? `${u.city}, ${u.country || ''}` : u.country || 'Global'}</span>
                              </div>
                            </td>

                            <td className="p-3.5">
                              {isExempt ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                                  <Crown className="w-3 h-3" />
                                  <span>VIP EXEMPT (Unlimited)</span>
                                </span>
                              ) : isSubscribed ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                  <Sparkles className="w-3 h-3" />
                                  <span>Paid VIP Member</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 text-gray-400 border border-white/10">
                                  <span>Free Tier (5 Swipes Limit)</span>
                                </span>
                              )}
                            </td>

                            <td className="p-3.5">
                              <button
                                id={`toggle-exempt-${u.id}`}
                                onClick={() => adminToggleUserExemption(u.id, !isExempt)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                  isExempt
                                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                                    : 'bg-white/5 hover:bg-white/10 text-purple-200 border-white/10'
                                }`}
                              >
                                {isExempt ? 'Revoke VIP Exemption' : 'Grant VIP Exemption'}
                              </button>
                            </td>

                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  id={`promote-manager-${u.id}`}
                                  onClick={() => {
                                    setNewManagerForm({
                                      name: u.name,
                                      email: u.email || `${u.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@fiffys.com`,
                                      phone: u.phone || u.contactNumber || '+263 77 000 0000',
                                      role: 'moderator',
                                      department: `${u.city || 'Regional'} Safety & Operations Hub`,
                                      password: 'manager2026',
                                      avatarUrl: u.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
                                    });
                                    setIsAddManagerModalOpen(true);
                                  }}
                                  className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-pink-300 transition-colors border border-purple-500/20 cursor-pointer"
                                  title="Promote Member to Platform Manager"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                                <button
                                  id={`delete-user-${u.id}`}
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete user ${u.name}?`)) {
                                      adminDeleteUser(u.id);
                                    }
                                  }}
                                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ADD USER MODAL (With VIP Exemption Checkbox) */}
            {isAddUserModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="w-full max-w-lg bg-[#130726] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-4 my-8 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <h3 className="font-bold text-base text-white flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-pink-400" />
                        <span>Add Member / VIP Exception</span>
                      </h3>
                      <p className="text-xs text-purple-300/70 mt-0.5">
                        Create user directly in the database with optional VIP Exemption status.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddUserModalOpen(false)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreateUserWithExemption} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={newUserForm.name}
                          onChange={(e) => setNewUserForm((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Zola Dlamini"
                          className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-purple-200">Date of Birth *</label>
                          <span className="text-[10px] font-bold text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded-full">
                            Age: {calculateAge(newUserForm.dateOfBirth) || '--'}
                          </span>
                        </div>
                        <input
                          type="date"
                          required
                          value={newUserForm.dateOfBirth}
                          onChange={(e) =>
                            setNewUserForm((prev) => ({
                              ...prev,
                              dateOfBirth: e.target.value,
                              age: calculateAge(e.target.value),
                            }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500 [color-scheme:dark]"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Contact Number * <span className="text-pink-400 font-normal">(Required)</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={newUserForm.contactNumber}
                          onChange={(e) =>
                            setNewUserForm((prev) => ({
                              ...prev,
                              contactNumber: e.target.value,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="+27 82 459 9021"
                          className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">
                          Email Address <span className="text-purple-300/60 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="email"
                          value={newUserForm.email}
                          onChange={(e) => setNewUserForm((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="zola@example.com (optional)"
                          className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-pink-300/90 flex items-center gap-1.5 p-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
                      <Lock className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span>Contact numbers and emails are strictly hidden from everyone on Fiffy to protect user identity.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">Gender</label>
                        <select
                          value={newUserForm.gender}
                          onChange={(e) => setNewUserForm((prev) => ({ ...prev, gender: e.target.value as any }))}
                          className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                        >
                          <option value="woman">Woman</option>
                          <option value="man">Man</option>
                          <option value="non-binary">Non-Binary</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={newUserForm.city}
                          onChange={(e) => setNewUserForm((prev) => ({ ...prev, city: e.target.value }))}
                          placeholder="e.g. London"
                          className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">Country / Region</label>
                        <select
                          value={newUserForm.country}
                          onChange={(e) => {
                            const found = AFRICAN_COUNTRIES.find((c) => c.name === e.target.value);
                            setNewUserForm((prev) => ({
                              ...prev,
                              country: e.target.value,
                              countryFlag: found ? found.flag : '🌍',
                            }));
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                        >
                          {AFRICAN_COUNTRIES.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.flag} {c.name}
                            </option>
                          ))}
                          <option value="United Kingdom">🇬🇧 United Kingdom</option>
                          <option value="United States">🇺🇸 United States</option>
                          <option value="Canada">🇨🇦 Canada</option>
                          <option value="France">🇫🇷 France</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">Photo URL (Portrait of Person)</label>
                        <input
                          type="url"
                          required
                          value={newUserForm.photos[0]}
                          onChange={(e) => setNewUserForm((prev) => ({ ...prev, photos: [e.target.value] }))}
                          className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Bio</label>
                      <textarea
                        rows={2}
                        value={newUserForm.bio}
                        onChange={(e) => setNewUserForm((prev) => ({ ...prev, bio: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    {/* Prominent VIP Exemption Checkbox (User Requirement) */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-900/30 to-pink-500/20 border border-amber-500/40 flex items-start gap-3">
                      <input
                        id="new-user-is-exempt"
                        type="checkbox"
                        checked={newUserForm.isExempt}
                        onChange={(e) => setNewUserForm((prev) => ({ ...prev, isExempt: e.target.checked }))}
                        className="w-5 h-5 accent-amber-500 rounded cursor-pointer mt-0.5 shrink-0"
                      />
                      <div>
                        <label htmlFor="new-user-is-exempt" className="text-xs font-bold text-white cursor-pointer flex items-center gap-1.5">
                          <Crown className="w-4 h-4 text-amber-400" />
                          <span>Grant VIP Exemption (Admin Exception)</span>
                        </label>
                        <p className="text-[11px] text-purple-200/80 mt-1">
                          This user will have unlimited swipes, unrestricted messaging, and the VIP badge with zero payments required. Perfect for ambassadors, VIP clients, and admin exceptions.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsAddUserModalOpen(false)}
                        className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl gradient-fiffy text-white text-xs font-bold shadow-lg shadow-pink-500/25"
                      >
                        Create User in DB
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PLATFORM MANAGERS & STAFF TEAM TAB */}
        {activeTab === 'managers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-pink-400" />
                  <span>Platform Managers &amp; Operations Team ({platformManagers.length})</span>
                </h3>
                <p className="text-xs text-purple-300/80 mt-0.5">
                  Executive administrators can add, authorize, and manage staff members to help govern subscriptions, safety, user exceptions, and diaspora love stories.
                </p>
              </div>
              <button
                id="add-platform-manager-btn"
                onClick={() => {
                  setNewManagerForm({
                    name: '',
                    email: '',
                    phone: '+263 77 ',
                    role: 'co_admin',
                    department: 'Platform Operations & Safety Hub',
                    password: 'manager2026',
                    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
                  });
                  setIsAddManagerModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-fiffy text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:brightness-110 shrink-0 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add Platform Manager</span>
              </button>
            </div>

            {/* Team Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#130726] border border-white/10 shadow-sm">
                <div className="text-[11px] text-purple-300/70 font-semibold">Total Staff</div>
                <div className="text-xl font-black text-white mt-0.5">{platformManagers.length} Team Members</div>
                <div className="text-[10px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Permanent Operations</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#130726] border border-white/10 shadow-sm">
                <div className="text-[11px] text-purple-300/70 font-semibold">Co-Admins</div>
                <div className="text-xl font-black text-white mt-0.5">
                  {platformManagers.filter((m) => m.role === 'co_admin').length} Executive
                </div>
                <div className="text-[10px] text-purple-300/80 mt-1">Full System Authority</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#130726] border border-white/10 shadow-sm">
                <div className="text-[11px] text-purple-300/70 font-semibold">Safety &amp; Moderation</div>
                <div className="text-xl font-black text-white mt-0.5">
                  {platformManagers.filter((m) => m.role === 'moderator').length} Officers
                </div>
                <div className="text-[10px] text-amber-300/80 mt-1">Chat &amp; Profile Safety</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#130726] border border-white/10 shadow-sm">
                <div className="text-[11px] text-purple-300/70 font-semibold">Concierge &amp; Stories</div>
                <div className="text-xl font-black text-white mt-0.5">
                  {platformManagers.filter((m) => m.role === 'content_manager' || m.role === 'support_vip').length} Leads
                </div>
                <div className="text-[10px] text-pink-300/80 mt-1">Love Stories &amp; VIP Support</div>
              </div>
            </div>

            {/* Platform Managers List Table */}
            <div className="bg-[#130726] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Authorized Platform Managers &amp; Operations Team
                  </span>
                </div>
                <div className="text-xs text-purple-300/80 font-medium">
                  Authorized Operations Team • Secure Role-Based Access
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-purple-300/70 font-semibold uppercase tracking-wider text-[10px] bg-white/[0.02]">
                      <th className="p-3.5">Manager Profile</th>
                      <th className="p-3.5">Role &amp; Responsibilities</th>
                      <th className="p-3.5">Department / Regional Hub</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Date Authorized</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {platformManagers.map((mgr) => {
                      const roleMeta: Record<
                        PlatformManagerRole,
                        { label: string; bg: string; text: string; border: string; desc: string }
                      > = {
                        co_admin: {
                          label: 'Platform Co-Admin',
                          bg: 'bg-purple-500/20',
                          text: 'text-purple-300',
                          border: 'border-purple-500/40',
                          desc: 'Full administrative authority across all modules',
                        },
                        moderator: {
                          label: 'Trust & Safety Moderator',
                          bg: 'bg-emerald-500/20',
                          text: 'text-emerald-300',
                          border: 'border-emerald-500/40',
                          desc: 'Reviews reported chats & enforces member bans',
                        },
                        content_manager: {
                          label: 'Content & Stories Editor',
                          bg: 'bg-pink-500/20',
                          text: 'text-pink-300',
                          border: 'border-pink-500/40',
                          desc: 'Curates couple love stories & marketing copy',
                        },
                        support_vip: {
                          label: 'VIP Concierge & Support',
                          bg: 'bg-amber-500/20',
                          text: 'text-amber-300',
                          border: 'border-amber-500/40',
                          desc: 'Handles VIP status exceptions & member inquiries',
                        },
                      };

                      const currentRole = roleMeta[mgr.role] || roleMeta.co_admin;
                      const isActive = mgr.status === 'active';

                      return (
                        <tr key={mgr.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={mgr.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                                alt={mgr.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-sm shrink-0"
                              />
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{mgr.name}</span>
                                  {mgr.isRootAdmin && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-pink-500/30 text-pink-200 border border-pink-500/40">
                                      Primary Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-purple-300/80 font-mono mt-0.5">
                                  {mgr.email}
                                </div>
                                {mgr.phone && (
                                  <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                    <Phone className="w-2.5 h-2.5" />
                                    <span>{mgr.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div>
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${currentRole.bg} ${currentRole.text} ${currentRole.border}`}
                              >
                                <ShieldCheck className="w-3 h-3" />
                                <span>{currentRole.label}</span>
                              </span>
                              <div className="text-[10px] text-gray-400 mt-1 max-w-xs">
                                {currentRole.desc}
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 text-purple-200 font-medium">
                            {mgr.department || 'Operations Hub'}
                          </td>

                          <td className="p-3.5">
                            <button
                              id={`toggle-manager-status-${mgr.id}`}
                              disabled={mgr.isRootAdmin}
                              onClick={() =>
                                updatePlatformManager(mgr.id, {
                                  status: isActive ? 'suspended' : 'active',
                                })
                              }
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                                isActive
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                              } ${mgr.isRootAdmin ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                              title={mgr.isRootAdmin ? 'Primary admin cannot be suspended' : 'Click to toggle active status'}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                                }`}
                              />
                              <span>{isActive ? 'Active' : 'Suspended'}</span>
                            </button>
                          </td>

                          <td className="p-3.5 text-gray-400 text-[11px]">
                            {new Date(mgr.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <select
                                id={`change-role-${mgr.id}`}
                                value={mgr.role}
                                disabled={mgr.isRootAdmin}
                                onChange={(e) =>
                                  updatePlatformManager(mgr.id, {
                                    role: e.target.value as PlatformManagerRole,
                                  })
                                }
                                className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-[11px] focus:outline-none focus:border-pink-500 disabled:opacity-50"
                                title="Change Role"
                              >
                                <option value="co_admin" className="bg-[#130726]">Platform Co-Admin</option>
                                <option value="moderator" className="bg-[#130726]">Trust Moderator</option>
                                <option value="content_manager" className="bg-[#130726]">Content Editor</option>
                                <option value="support_vip" className="bg-[#130726]">VIP Concierge</option>
                              </select>

                              <button
                                id={`delete-manager-${mgr.id}`}
                                disabled={mgr.isRootAdmin}
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Are you sure you want to revoke platform management permissions for ${mgr.name}?`
                                    )
                                  ) {
                                    deletePlatformManager(mgr.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                title={mgr.isRootAdmin ? 'Root administrator cannot be deleted' : 'Revoke Management Access'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. LOVE STORIES & TESTIMONIES TAB */}
        {activeTab === 'testimonials' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                  <span>Love Stories &amp; Testimonies ({testimonials.length})</span>
                </h3>
                <p className="text-xs text-purple-300/80">
                  Real testimonials and love stories from couples across Africa and the global diaspora. These populate the landing page and community proof sections.
                </p>
              </div>

              <button
                id="add-testimonial-btn"
                onClick={() => {
                  setTestimonialForm({
                    coupleNames: 'New Couple Story',
                    userPhoto: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
                    partnerPhoto: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=600&q=80',
                    location: 'Johannesburg & London',
                    country: 'South Africa / UK',
                    countryFlag: '🇿🇦',
                    story: 'We met on Fiffy’s and celebrated our wedding last summer. Uniting across the diaspora was our dream come true!',
                    metDate: 'Matched on Fiffy',
                    status: 'Married',
                    rating: 5,
                    isFeatured: true,
                  });
                  setIsTestimonialModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl gradient-fiffy text-white text-xs font-bold shadow-md shadow-pink-500/25 hover:brightness-110"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Success Story</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl bg-[#130726] border border-white/10 hover:border-pink-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Couple portraits */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center -space-x-2">
                        <img
                          src={t.userPhoto || t.photoUrl || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80'}
                          alt={t.coupleNames}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#130726]"
                        />
                        {t.partnerPhoto && (
                          <img
                            src={t.partnerPhoto}
                            alt="Partner"
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border-2 border-[#130726]"
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{t.coupleNames}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">
                        {t.status || 'Married'}
                      </span>
                    </div>

                    <div className="text-[11px] text-purple-300/80 mt-1 flex items-center gap-1">
                      <span>{t.countryFlag || '🌍'}</span>
                      <span>{t.location || t.locations || 'Global Community'}</span>
                    </div>

                    <p className="text-xs text-purple-100/90 italic mt-3 line-clamp-4 leading-relaxed">
                      &quot;{t.story || t.quote || t.storyDetails}&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4 text-xs">
                    <button
                      onClick={() => adminAddOrEditTestimonial({ ...t, isFeatured: !t.isFeatured })}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${
                        t.isFeatured
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/5 text-gray-400 border-white/10'
                      }`}
                    >
                      {t.isFeatured ? '★ Featured on Landing' : 'Standard'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setTestimonialForm(t);
                          setIsTestimonialModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-200 hover:text-white"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => adminDeleteTestimonial(t.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* TESTIMONIAL MODAL */}
            {isTestimonialModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="w-full max-w-md bg-[#130726] border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-4 my-8 max-h-[90vh] overflow-y-auto">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                    <span>{testimonialForm.id ? 'Edit Love Story' : 'Add New Couple Testimonial'}</span>
                  </h3>

                  <form onSubmit={handleSaveTestimonial} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Couple Names</label>
                      <input
                        type="text"
                        required
                        value={testimonialForm.coupleNames || ''}
                        onChange={(e) => setTestimonialForm((prev) => ({ ...prev, coupleNames: e.target.value }))}
                        placeholder="e.g. Nia &amp; Chidi"
                        className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">Location</label>
                        <input
                          type="text"
                          required
                          value={testimonialForm.location || ''}
                          onChange={(e) => setTestimonialForm((prev) => ({ ...prev, location: e.target.value }))}
                          placeholder="Lagos &amp; Atlanta"
                          className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-purple-200 mb-1">Status</label>
                        <input
                          type="text"
                          value={testimonialForm.status || 'Married'}
                          onChange={(e) => setTestimonialForm((prev) => ({ ...prev, status: e.target.value }))}
                          placeholder="Married / Engaged / In Love"
                          className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Portrait URL (Photo 1)</label>
                      <input
                        type="url"
                        required
                        value={testimonialForm.userPhoto || ''}
                        onChange={(e) => setTestimonialForm((prev) => ({ ...prev, userPhoto: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Portrait URL (Photo 2 - Optional)</label>
                      <input
                        type="url"
                        value={testimonialForm.partnerPhoto || ''}
                        onChange={(e) => setTestimonialForm((prev) => ({ ...prev, partnerPhoto: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-purple-200 mb-1">Their Story</label>
                      <textarea
                        rows={3}
                        required
                        value={testimonialForm.story || ''}
                        onChange={(e) => setTestimonialForm((prev) => ({ ...prev, story: e.target.value }))}
                        placeholder="How they met on Fiffy and fell in love..."
                        className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        id="test-featured"
                        type="checkbox"
                        checked={testimonialForm.isFeatured || false}
                        onChange={(e) => setTestimonialForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                        className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                      />
                      <label htmlFor="test-featured" className="text-xs font-semibold text-purple-200 cursor-pointer">
                        Feature prominently on marketing surface
                      </label>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setIsTestimonialModalOpen(false)}
                        className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl gradient-fiffy text-white text-xs font-bold shadow-lg shadow-pink-500/25"
                      >
                        Save Testimonial
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. DATABASE & DEMO DATA MANAGEMENT */}
        {activeTab === 'database' && (
          <div className="max-w-2xl bg-[#130726] border border-white/10 rounded-3xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-pink-400" />
                <span>Demo Data Management</span>
              </h3>
              <p className="text-xs text-purple-300/80 mt-1">
                As required for your executive presentation, you can switch the database to clean live mode or restore the demo African profiles seed anytime.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="text-xs font-bold text-white">Clean Live Mode (No Mock Data)</div>
              <p className="text-[11px] text-purple-200/70">
                Removes the initial demo singles so that only live, authentically registered users who sign up through the application are displayed in discovery.
              </p>
              <button
                id="clear-demo-data-btn"
                onClick={clearDemoData}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
              >
                Clear Demo Singles (Live Database Only)
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="text-xs font-bold text-white">Restore Seed Profiles</div>
              <p className="text-[11px] text-purple-200/70">
                Re-seeds the database with authentic African singles from South Africa, Nigeria, Kenya, Ghana, Rwanda, Senegal, and Zimbabwe with high-resolution portraits.
              </p>
              <button
                id="restore-demo-data-btn"
                onClick={resetDemoData}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
              >
                Restore Demo African Profiles
              </button>
            </div>
          </div>
        )}

        {/* 5. MODERATION TAB */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Safety &amp; Moderation Queue</h3>
            {reportedItems.length === 0 ? (
              <div className="p-8 text-center bg-[#130726] rounded-2xl border border-white/10 text-gray-400 text-xs">
                Zero safety flags pending. All profiles adhere to community guidelines.
              </div>
            ) : (
              <div className="space-y-3">
                {reportedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#130726] border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">Reported: {item.reportedUserName}</div>
                      <div className="text-[11px] text-rose-400 mt-0.5">Reason: {item.reason}</div>
                      <div className="text-[11px] text-gray-300 mt-1">&quot;{item.details}&quot;</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => resolveReport(item.id, 'dismiss')}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-gray-200 font-semibold"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => resolveReport(item.id, 'ban')}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold border border-rose-500/30"
                      >
                        Ban Account
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. BROADCAST TAB */}
        {activeTab === 'broadcast' && (
          <div className="max-w-2xl bg-[#130726] border border-white/10 rounded-3xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-pink-400" />
                <span>Global African Push Notification Broadcast</span>
              </h3>
              <p className="text-xs text-purple-300/80 mt-1">
                Send instant alerts across all devices for weekend match events, zero-distance week, or safety tips.
              </p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-sm focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Notification Message
                </label>
                <textarea
                  rows={3}
                  required
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1e0e38] border border-white/10 text-white text-xs focus:outline-none focus:border-pink-500"
                >
                  <option value="all">All Members (South Africa + Global Diaspora)</option>
                  <option value="free_only">Free Tier Members Only</option>
                  <option value="premium_only">VIP Gold Members Only</option>
                  <option value="inactive_3d">Inactive in Last 3 Days</option>
                </select>
              </div>

              <button
                id="send-broadcast-submit-btn"
                type="submit"
                className="w-full py-3 rounded-xl gradient-fiffy text-white text-xs font-bold shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Broadcast Notification</span>
              </button>
            </form>
          </div>
        )}
          </main>

          {/* RIGHT NAVIGATION MENU PANEL */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 order-1 lg:order-2">
            <div className="sticky top-6 p-4 rounded-2xl bg-[#130726] border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-pink-400" />
                  <span>Navigation Menu</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  8 Modules
                </span>
              </div>

              {/* Navigation Items: 2 columns on small screens, 1 vertical column on lg+ */}
              <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5" aria-label="Executive Navigation">
                {[
                  { id: 'users', label: 'Members & VIP Exceptions', badge: adminUsersList.length, icon: Users },
                  { id: 'managers', label: 'Platform Managers & Staff', badge: platformManagers.length, icon: UserCheck },
                  { id: 'testimonials', label: 'Love Stories & Testimonies', badge: testimonials.length, icon: Heart },
                  { id: 'subscriptions', label: 'Subscription Plans (USD)', badge: subscriptionPlans.length, icon: CreditCard },
                  { id: 'gateway', label: 'PayFast & Zimbabwe Gateways', icon: Key },
                  { id: 'moderation', label: 'Moderation Queue', badge: reportedItems.length, icon: AlertTriangle },
                  { id: 'broadcast', label: 'Push Broadcasts', icon: Bell },
                  { id: 'database', label: 'Demo Data Management', icon: Database },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`admin-tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer group ${
                        isActive
                          ? 'gradient-fiffy text-white shadow-md shadow-pink-500/25 ring-1 ring-pink-400/50'
                          : 'text-purple-200/80 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-white/5 text-purple-400 group-hover:text-pink-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                            isActive
                              ? 'bg-white/25 text-white'
                              : 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>

        {/* ADD PLATFORM MANAGER MODAL (Accessible across all tabs & actions) */}
        {isAddManagerModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-lg bg-[#130726] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl text-white space-y-4 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-pink-400" />
                    <span>Authorize Platform Manager</span>
                  </h3>
                  <p className="text-xs text-purple-300/70 mt-0.5">
                    Add team member with delegated access to help manage Fiffy’s worldwide operations.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddManagerModalOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddPlatformManager} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-purple-200 mb-1">
                    Manager Full Name *
                  </label>
                  <input
                    id="new-manager-name"
                    type="text"
                    required
                    value={newManagerForm.name}
                    onChange={(e) => setNewManagerForm({ ...newManagerForm, name: e.target.value })}
                    placeholder="e.g. Tariro Chikore"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-purple-200 mb-1">
                      Staff Email Address *
                    </label>
                    <input
                      id="new-manager-email"
                      type="email"
                      required
                      value={newManagerForm.email}
                      onChange={(e) => setNewManagerForm({ ...newManagerForm, email: e.target.value })}
                      placeholder="name@fiffys.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-purple-200 mb-1">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      id="new-manager-phone"
                      type="text"
                      value={newManagerForm.phone}
                      onChange={(e) => setNewManagerForm({ ...newManagerForm, phone: e.target.value })}
                      placeholder="+263 77 123 4567"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-purple-200 mb-1">
                    Assigned Platform Role *
                  </label>
                  <select
                    id="new-manager-role"
                    value={newManagerForm.role}
                    onChange={(e) =>
                      setNewManagerForm({
                        ...newManagerForm,
                        role: e.target.value as PlatformManagerRole,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1a0c33] border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="co_admin">Platform Co-Admin (Full Authority)</option>
                    <option value="moderator">Trust &amp; Safety Moderator (Bans &amp; Flags)</option>
                    <option value="content_manager">Content &amp; Stories Manager (Testimonials)</option>
                    <option value="support_vip">VIP Concierge &amp; Exceptions (Member Support)</option>
                  </select>
                  <p className="text-[11px] text-purple-300/70 mt-1">
                    {newManagerForm.role === 'co_admin' && '• Has executive permission across plans, gateways, users and moderation.'}
                    {newManagerForm.role === 'moderator' && '• Manages reported conversations, suspicious media, and member bans.'}
                    {newManagerForm.role === 'content_manager' && '• Approves love stories, updates diaspora couples and promotional copy.'}
                    {newManagerForm.role === 'support_vip' && '• Handles VIP status exceptions, subscription issues, and push notifications.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-purple-200 mb-1">
                      Department or Location Hub
                    </label>
                    <input
                      id="new-manager-department"
                      type="text"
                      value={newManagerForm.department}
                      onChange={(e) => setNewManagerForm({ ...newManagerForm, department: e.target.value })}
                      placeholder="e.g. Harare Trust & Safety Hub"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-purple-200 mb-1">
                      Console Access Password
                    </label>
                    <input
                      id="new-manager-password"
                      type="text"
                      value={newManagerForm.password}
                      onChange={(e) => setNewManagerForm({ ...newManagerForm, password: e.target.value })}
                      placeholder="manager2026"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-purple-200 mb-1">
                    Staff Avatar Photo URL
                  </label>
                  <input
                    id="new-manager-avatar"
                    type="url"
                    value={newManagerForm.avatarUrl}
                    onChange={(e) => setNewManagerForm({ ...newManagerForm, avatarUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>This manager will be immediately authorized to sign into the Administrator Console.</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddManagerModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-add-manager-btn"
                    type="submit"
                    className="px-5 py-2 rounded-xl gradient-fiffy text-white font-bold shadow-lg shadow-pink-500/25 hover:brightness-110 cursor-pointer"
                  >
                    Authorize Manager
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
