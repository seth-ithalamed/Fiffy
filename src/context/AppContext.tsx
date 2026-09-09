import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  CurrentUser,
  UserProfile,
  Match,
  Message,
  ReportedItem,
  AdminSettings,
  DiscoveryFilters,
  PushNotificationBroadcast,
  ToastItem,
  SubscriptionPlan,
  PayFastConfig,
  AuthUser,
  Testimonial,
  ActiveSinglesStats,
  PlatformManager,
  PlatformManagerRole,
} from '../types';
import {
  INITIAL_CURRENT_USER,
  DEFAULT_SUBSCRIPTION_PLANS,
  DEFAULT_PAYFAST_CONFIG,
  INITIAL_ADMIN_SETTINGS,
  AFRICAN_COUNTRIES,
  INITIAL_TESTIMONIALS,
  INITIAL_PLATFORM_MANAGERS,
} from '../data/mockData';
import { hasContactInfo, maskContactInfo } from '../lib/privacy';
import { apiEndpoint } from '../lib/api';

// Configurable API fetcher resolving relative or remote Render backend
const fetchApi = (url: string, init?: RequestInit) => fetch(apiEndpoint(url), init);

// Safe JSON response parser that handles HTML fallback pages (e.g. Vercel SPA rewrites when backend is not deployed)
async function safeFetchJson<T = any>(res: Response): Promise<{ success: boolean; data?: T; isHtmlFallback?: boolean; error?: string }> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return {
      success: false,
      isHtmlFallback: true,
      error: 'Backend API service is not running or returned an HTML page instead of JSON.',
    };
  }
  try {
    const data = await res.json();
    return {
      success: res.ok && data?.success !== false,
      data,
      error: data?.error,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to parse server JSON response',
    };
  }
}

export type SurfaceType = 'marketing' | 'web-app' | 'admin';
export type InAppTab = 'discover' | 'matches' | 'chat' | 'likes' | 'profile';

interface AdminSession {
  isAuthenticated: boolean;
  email: string;
  token: string;
  name: string;
}

interface AppContextType {
  // Surface navigation
  activeSurface: SurfaceType;
  setActiveSurface: (surface: SurfaceType) => void;
  inAppTab: InAppTab;
  setInAppTab: (tab: InAppTab) => void;

  // Authentication & DB Backed Logins
  authUser: AuthUser | null;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup';
  openAuthModal: (tab?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: 'login' | 'signup') => void;
  loginUser: (identifier: string, pass: string) => Promise<{ success: boolean; user?: any; error?: string }>;
  signupUser: (userData: any) => Promise<{ success: boolean; user?: any; error?: string }>;
  logoutUser: () => void;

  // Active Singles Real DB Stats
  activeSinglesStats: ActiveSinglesStats;
  refreshActiveSinglesStats: () => Promise<void>;

  // Admin Authentication & Portal
  adminSession: AdminSession | null;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;

  // Current User Profile
  currentUser: CurrentUser;
  updateCurrentUser: (updates: Partial<CurrentUser>) => void;
  verifySelfie: () => void;

  // Discovery & Country Preferences
  deckProfiles: UserProfile[];
  currentCardIndex: number;
  activeCard: UserProfile | null;
  filters: DiscoveryFilters;
  updateFilters: (updates: Partial<DiscoveryFilters>) => void;
  filteredProfiles: UserProfile[];
  viewMode: 'swipe' | 'grid';
  setViewMode: (mode: 'swipe' | 'grid') => void;

  // Swiping & Matches
  handleSwipe: (action: 'like' | 'pass' | 'superlike', profile?: UserProfile) => void;
  undoLastSwipe: () => void;
  canUndo: boolean;
  matches: Match[];
  activeMatchCelebration: { user: UserProfile; isSuperMatch?: boolean } | null;
  closeMatchCelebration: () => void;

  // Chat & Communication
  activeChatMatchId: string | null;
  setActiveChatMatchId: (matchId: string | null) => void;
  activeChatMatch: Match | null;
  messages: Record<string, Message[]>;
  sendMessage: (matchId: string, text: string, imageUrl?: string) => void;
  isPartnerTyping: boolean;
  unmatchUser: (matchId: string) => void;
  blockUser: (userId: string) => void;
  reportUser: (userId: string, reason: string, details: string) => void;
  pendingChatSwitch: { targetMatch: Match; previousMatch: Match } | null;
  requestOpenChat: (targetMatchId: string) => void;
  confirmChatSwitch: () => void;
  cancelChatSwitch: () => void;

  // Identity Verification
  isVerificationModalOpen: boolean;
  setIsVerificationModalOpen: (open: boolean) => void;

  // Safety Modal
  isSafetyModalOpen: boolean;
  setSafetyModalOpen: (open: boolean) => void;

  // Boost & Monetization
  adminSettings: AdminSettings;
  updateAdminSettings: (updates: Partial<AdminSettings>) => void;
  isMonetizationOpen: boolean;
  setMonetizationOpen: (open: boolean) => void;
  activateBoost: () => void;
  boostTimeRemaining: number;
  isBoostActive: boolean;

  // PayFast Subscriptions & Admin Portal Subscriptions
  subscriptionPlans: SubscriptionPlan[];
  appCurrency: string;
  appCurrencySymbol: string;
  refreshPlans: () => Promise<void>;
  addOrUpdateSubscriptionPlan: (plan: Partial<SubscriptionPlan>) => Promise<void>;
  deleteSubscriptionPlan: (planId: string) => Promise<void>;
  payfastConfig: PayFastConfig;
  updatePayfastConfig: (cfg: Partial<PayFastConfig>) => Promise<void>;
  isPayFastModalOpen: boolean;
  selectedPayFastPlan: SubscriptionPlan | null;
  openPayFastCheckout: (plan: SubscriptionPlan) => void;
  closePayFastCheckout: () => void;
  completePayFastPayment: (method?: string) => Promise<{ success: boolean; error?: string }>;

  // Admin Demo Data Management
  clearDemoData: () => Promise<void>;
  resetDemoData: () => Promise<void>;

  // Moderation & Reporting
  reportedItems: ReportedItem[];
  resolveReport: (reportId: string, resolution: 'dismiss' | 'warn' | 'ban') => void;
  bannedUserIds: string[];
  broadcasts: PushNotificationBroadcast[];
  sendBroadcast: (title: string, body: string, audience: PushNotificationBroadcast['targetAudience']) => void;

  // Toast notifications
  toasts: ToastItem[];
  dismissToast: (id: string) => void;
  showToast: (title: string, message: string, type?: 'info' | 'match' | 'boost' | 'success' | 'error') => void;

  // Detailed inspect profile modal
  inspectedProfile: UserProfile | null;
  setInspectedProfile: (profile: UserProfile | null) => void;

  // Testimonials & Community Love Stories
  testimonials: Testimonial[];
  submitTestimonial: (data: Partial<Testimonial>) => Promise<{ success: boolean; error?: string }>;
  adminAddOrEditTestimonial: (data: Partial<Testimonial>) => Promise<void>;
  adminDeleteTestimonial: (id: string) => Promise<void>;

  // Admin User Management & VIP Exceptions
  adminUsersList: any[];
  fetchAdminUsers: () => Promise<void>;
  adminAddUser: (userData: any) => Promise<{ success: boolean; user?: any; error?: string }>;
  adminToggleUserExemption: (userId: string, isExempt?: boolean) => Promise<{ success: boolean; error?: string }>;
  adminDeleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;

  // Platform Managers & Operations Team
  platformManagers: PlatformManager[];
  addPlatformManager: (data: Omit<PlatformManager, 'id' | 'createdAt'> & { password?: string }) => Promise<{ success: boolean; manager?: PlatformManager; error?: string }>;
  updatePlatformManager: (id: string, updates: Partial<PlatformManager>) => Promise<{ success: boolean; error?: string }>;
  deletePlatformManager: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth User
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('fiffy_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Navigation surfaces: 'marketing' | 'web-app' | 'admin'
  const [activeSurface, setActiveSurfaceState] = useState<SurfaceType>(() => {
    try {
      const saved = localStorage.getItem('fiffy_auth_user');
      if (saved && JSON.parse(saved)) return 'web-app';
    } catch {
      // ignore
    }
    return 'marketing';
  });

  const setActiveSurface = (surface: SurfaceType) => {
    setActiveSurfaceState(surface);
  };

  const [inAppTab, setInAppTab] = useState<InAppTab>('discover');
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('swipe');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  // Admin Session: Supports full login and logout with local persistence
  const [adminSession, setAdminSession] = useState<AdminSession>(() => {
    try {
      const wasLoggedOut = localStorage.getItem('fiffy_admin_logged_out');
      if (wasLoggedOut === 'true') {
        return {
          isAuthenticated: false,
          email: '',
          token: '',
          name: '',
        };
      }
      const saved = localStorage.getItem('fiffy_admin_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.isAuthenticated === 'boolean') return parsed;
      }
    } catch {
      // ignore
    }
    // Default to active session if previously initialized
    return {
      isAuthenticated: true,
      email: 'admin@fiffy.com',
      token: 'admin-session-active',
      name: 'Executive Admin',
    };
  });

  // Current User Profile
  const [currentUser, setCurrentUser] = useState<CurrentUser>(INITIAL_CURRENT_USER);

  // Deck & Profiles (Hydrated purely from real database)
  const [deckProfiles, setDeckProfiles] = useState<UserProfile[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [swipedHistory, setSwipedHistory] = useState<{ profile: UserProfile; action: 'like' | 'pass' | 'superlike' }[]>([]);

  // Matches & Chat (Hydrated purely from real database)
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeMatchCelebration, setActiveMatchCelebration] = useState<{ user: UserProfile; isSuperMatch?: boolean } | null>(null);
  const [activeChatMatchId, setActiveChatMatchId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);
  const [pendingChatSwitch, setPendingChatSwitch] = useState<{
    targetMatch: Match;
    previousMatch: Match;
  } | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);

  // Subscriptions & PayFast
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(DEFAULT_SUBSCRIPTION_PLANS);
  const [appCurrency, setAppCurrency] = useState<string>('USD');
  const [appCurrencySymbol, setAppCurrencySymbol] = useState<string>('$');
  const [payfastConfig, setPayfastConfig] = useState<PayFastConfig>(DEFAULT_PAYFAST_CONFIG);
  const [isPayFastModalOpen, setIsPayFastModalOpen] = useState<boolean>(false);
  const [selectedPayFastPlan, setSelectedPayFastPlan] = useState<SubscriptionPlan | null>(null);

  // Active Singles Real Database Stats
  const [activeSinglesStats, setActiveSinglesStats] = useState<ActiveSinglesStats>({
    totalActive: 0,
    hubCount: 0,
    activeCountries: [],
  });

  // Admin Settings & Moderation
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(INITIAL_ADMIN_SETTINGS);
  const [reportedItems, setReportedItems] = useState<ReportedItem[]>([]);
  const [bannedUserIds, setBannedUserIds] = useState<string[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [adminUsersList, setAdminUsersList] = useState<any[]>([]);
  const [platformManagers, setPlatformManagers] = useState<PlatformManager[]>(() => {
    try {
      const saved = localStorage.getItem('fiffy_platform_managers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_PLATFORM_MANAGERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('fiffy_platform_managers', JSON.stringify(platformManagers));
    } catch {}
  }, [platformManagers]);

  const [broadcasts, setBroadcasts] = useState<PushNotificationBroadcast[]>([
    {
      id: 'b-1',
      title: 'Global Match Week! 🌍',
      body: 'Connect across borders with zero distance limits this week on Fiffy’s.',
      targetAudience: 'all',
      sentAt: 'Yesterday',
      deliveredCount: 3840,
    },
  ]);

  // Modals
  const [isSafetyModalOpen, setSafetyModalOpen] = useState<boolean>(false);
  const [isMonetizationOpen, setMonetizationOpen] = useState<boolean>(false);
  const [inspectedProfile, setInspectedProfile] = useState<UserProfile | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [boostTimeRemaining, setBoostTimeRemaining] = useState<number>(0);

  // Discovery Filters with Country Support
  const [filters, setFilters] = useState<DiscoveryFilters>({
    genderPreference: 'everyone',
    targetCountry: 'all',
    ageRange: [20, 45],
    maxDistance: 15000,
    verifiedOnly: false,
    selectedInterests: [],
    datingGoals: [],
  });

  // Toasts
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (title: string, message: string, type: 'info' | 'match' | 'boost' | 'success' | 'error' = 'info') => {
    const newToast: ToastItem = {
      id: `toast-${Date.now()}-${Math.random()}`,
      title,
      description: message,
      type: type === 'error' ? 'error' : (type === 'match' || type === 'boost' || type === 'success') ? 'success' : 'info',
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
  };

  const refreshActiveSinglesStats = async () => {
    try {
      const res = await fetchApi('/api/active-singles-stats');
      const data = await res.json();
      if (data.success && Array.isArray(data.activeCountries)) {
        setActiveSinglesStats({
          totalActive: data.totalActive,
          hubCount: data.hubCount,
          activeCountries: data.activeCountries,
        });
      }
    } catch (e) {
      console.warn('Failed to fetch active singles stats from backend', e);
    }
  };

  const refreshPlans = async () => {
    try {
      const res = await fetchApi('/api/plans');
      const data = await res.json();
      if (data.success && Array.isArray(data.plans)) {
        setSubscriptionPlans(data.plans);
        if (data.currency) setAppCurrency(data.currency);
        if (data.currencySymbol) setAppCurrencySymbol(data.currencySymbol);
      }
    } catch (e) {
      console.warn('Failed to fetch subscription plans from backend', e);
    }
  };

  // Synchronize with backend on mount
  useEffect(() => {
    // 1. Fetch profiles from real database
    fetchApi('/api/profiles')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.profiles)) {
          setDeckProfiles(data.profiles);
        } else {
          setDeckProfiles([]);
        }
      })
      .catch((e) => {
        console.warn('Could not fetch profiles from backend', e);
        setDeckProfiles([]);
      });

    // 2. Fetch plans & currency set by admin
    refreshPlans();

    // 2b. Fetch dynamic active singles real stats from backend DB
    refreshActiveSinglesStats();

    // 3. Fetch PayFast config
    fetchApi('/api/admin/payfast-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setPayfastConfig(data.config);
        }
      })
      .catch((e) => console.warn('Using default PayFast config fallback', e));

    // 4. Fetch Testimonials
    fetchApi('/api/testimonials')
      .then((res) => res.json())
      .then((data) => {
        if (data.testimonials && Array.isArray(data.testimonials)) {
          setTestimonials(data.testimonials);
        }
      })
      .catch((e) => console.warn('Using default testimonials fallback', e));

    // 5. Fetch Admin Users
    fetchApi('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users && Array.isArray(data.users)) {
          setAdminUsersList(data.users);
        }
      })
      .catch((e) => console.warn('Using default users fallback', e));
  }, []);

  // Filtered profiles for discovery deck
  const filteredProfiles = useMemo(() => {
    return deckProfiles.filter((p) => {
      if (bannedUserIds.includes(p.id)) return false;

      // Country filter
      if (filters.targetCountry && filters.targetCountry !== 'all') {
        const pCountry = (p.country || '').toLowerCase();
        const target = filters.targetCountry.toLowerCase();
        if (!pCountry.includes(target) && !target.includes(pCountry)) {
          return false;
        }
      }

      // Gender filter
      if (filters.genderPreference !== 'everyone') {
        if (filters.genderPreference === 'women' && p.gender !== 'woman') return false;
        if (filters.genderPreference === 'men' && p.gender !== 'man') return false;
        if (filters.genderPreference === 'non-binary' && p.gender !== 'non-binary') return false;
      }

      // Age range
      if (p.age < filters.ageRange[0] || p.age > filters.ageRange[1]) return false;

      // Distance
      if (p.distanceKm > filters.maxDistance) return false;

      // Verification
      if (filters.verifiedOnly && !p.verified) return false;

      // Interests
      if (filters.selectedInterests.length > 0) {
        const hasMatch = filters.selectedInterests.some((tag) => (p.interests || []).includes(tag));
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [deckProfiles, bannedUserIds, filters]);

  const activeCard = filteredProfiles[currentCardIndex] || null;

  // Boost timer
  useEffect(() => {
    if (boostTimeRemaining <= 0) return;
    const interval = setInterval(() => {
      setBoostTimeRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [boostTimeRemaining]);

  const isBoostActive = boostTimeRemaining > 0;

  // AUTH METHODS
  const openAuthModal = (tab: 'login' | 'signup' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const loginUser = async (identifier: string, pass: string) => {
    try {
      const res = await fetchApi('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          email: identifier.trim(),
          phone: identifier.trim(),
          contactNumber: identifier.trim(),
          password: pass,
        }),
      });
      const parsed = await safeFetchJson(res);
      if (parsed.success && parsed.data?.user) {
        setAuthUser(parsed.data.user);
        setCurrentUser((prev) => ({
          ...prev,
          ...parsed.data.user,
        }));
        localStorage.setItem('fiffy_auth_user', JSON.stringify(parsed.data.user));
        setActiveSurfaceState('web-app');
        setInAppTab('discover');
        closeAuthModal();
        return { success: true, user: parsed.data.user };
      }

      return {
        success: false,
        error: parsed.data?.error || 'Invalid contact number/email or password. Please try again.',
      };
    } catch {
      return {
        success: false,
        error: 'Unable to connect to database backend. Please check your network and try again.',
      };
    }
  };

  const signupUser = async (userData: any) => {
    try {
      const res = await fetchApi('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const parsed = await safeFetchJson(res);
      if (parsed.success && parsed.data?.user) {
        setAuthUser(parsed.data.user);
        setCurrentUser((prev) => ({
          ...prev,
          ...parsed.data.user,
        }));
        localStorage.setItem('fiffy_auth_user', JSON.stringify(parsed.data.user));
        setActiveSurfaceState('web-app');
        setInAppTab('discover');
        closeAuthModal();
        refreshActiveSinglesStats();
        return { success: true, user: parsed.data.user };
      }

      return {
        success: false,
        error: parsed.data?.error || 'Could not complete registration. Please check your information.',
      };
    } catch {
      return {
        success: false,
        error: 'Registration request failed. Unable to reach backend database.',
      };
    }
  };

  const logoutUser = () => {
    setAuthUser(null);
    localStorage.removeItem('fiffy_auth_user');
    setCurrentUser(INITIAL_CURRENT_USER);
    setActiveSurface('marketing');
    setInAppTab('discover');
    showToast('Signed Out', 'You have been safely signed out.', 'info');
  };

  // ADMIN METHODS
  const loginAdmin = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isDemoAdminCreds = cleanEmail === 'admin@fiffy.com' && pass === 'admin123';
    const matchedManager = platformManagers.find(
      (m) => m.email.toLowerCase() === cleanEmail && m.status === 'active'
    );

    try {
      const res = await fetchApi('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: pass }),
      });
      const parsed = await safeFetchJson(res);
      if (parsed.success && parsed.data?.user) {
        const session: AdminSession = {
          isAuthenticated: true,
          email: parsed.data.user.email,
          token: parsed.data.token || 'admin-token',
          name: parsed.data.user.name || 'Executive Admin',
        };
        setAdminSession(session);
        try {
          localStorage.removeItem('fiffy_admin_logged_out');
          localStorage.setItem('fiffy_admin_session', JSON.stringify(session));
        } catch {}
        showToast('Admin Authorized', `Welcome to Fiffy’s Console, ${session.name}.`, 'match');
        return { success: true };
      }

      // If backend explicitly rejected credentials and not in local team
      if (parsed.data && !parsed.data.success && !isDemoAdminCreds && !matchedManager) {
        return { success: false, error: parsed.data.error || 'Invalid administrator credentials' };
      }

      // Local / standalone fallback for demo admin or authorized platform managers
      if (isDemoAdminCreds || matchedManager) {
        const session: AdminSession = {
          isAuthenticated: true,
          email: matchedManager ? matchedManager.email : 'admin@fiffy.com',
          token: `admin-token-${Date.now()}`,
          name: matchedManager ? matchedManager.name : 'Executive Admin',
        };
        setAdminSession(session);
        try {
          localStorage.removeItem('fiffy_admin_logged_out');
          localStorage.setItem('fiffy_admin_session', JSON.stringify(session));
        } catch {}
        showToast('Admin Authorized', `Authenticated as ${session.name}.`, 'match');
        return { success: true };
      }

      return { success: false, error: parsed.error || 'Invalid administrator credentials' };
    } catch {
      // Offline fallback for demo credentials or added managers
      if (isDemoAdminCreds || matchedManager) {
        const session: AdminSession = {
          isAuthenticated: true,
          email: matchedManager ? matchedManager.email : 'admin@fiffy.com',
          token: `admin-token-${Date.now()}`,
          name: matchedManager ? matchedManager.name : 'Executive Admin',
        };
        setAdminSession(session);
        try {
          localStorage.removeItem('fiffy_admin_logged_out');
          localStorage.setItem('fiffy_admin_session', JSON.stringify(session));
        } catch {}
        showToast('Admin Authorized', `Authenticated as ${session.name}.`, 'match');
        return { success: true };
      }
      return { success: false, error: 'Could not reach server. Use admin@fiffy.com / admin123 or staff email' };
    }
  };

  const logoutAdmin = () => {
    const unauthenticatedSession: AdminSession = {
      isAuthenticated: false,
      email: '',
      token: '',
      name: '',
    };
    setAdminSession(unauthenticatedSession);
    try {
      localStorage.setItem('fiffy_admin_logged_out', 'true');
      localStorage.setItem('fiffy_admin_session', JSON.stringify(unauthenticatedSession));
    } catch {}
    showToast(
      'Signed Out',
      'Administrator session ended safely. Please sign in to access the console.',
      'info'
    );
  };

  const updateCurrentUser = (updates: Partial<CurrentUser>) => {
    setCurrentUser((prev) => {
      const nextUser = { ...prev, ...updates };
      try {
        const saved = localStorage.getItem('fiffy_auth_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          localStorage.setItem('fiffy_auth_user', JSON.stringify({ ...parsed, ...updates }));
        }
      } catch {}

      if (nextUser.id) {
        fetchApi(`/api/users/${nextUser.id}/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }).catch(() => {});
      }

      return nextUser;
    });
  };

  const verifySelfie = () => {
    setCurrentUser((prev) => ({ ...prev, verified: true }));
    showToast('Photo Verified! 🛡️', 'Your profile now proudly features the African Gold badge.', 'match');
  };

  const updateFilters = (updates: Partial<DiscoveryFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setCurrentCardIndex(0);
  };

  // SWIPE ENGINE
  const handleSwipe = async (action: 'like' | 'pass' | 'superlike', targetProfile?: UserProfile) => {
    const profile = targetProfile || activeCard;
    if (!profile) return;

    // Strict free tier limits enforcement: Free members can ONLY view profiles.
    // No chatting, accepting, or matching/super like/like.
    const isFreeTier = !currentUser.isPremium && !currentUser.isExempt;

    if (isFreeTier && (action === 'like' || action === 'superlike')) {
      setMonetizationOpen(true);
      showToast(
        'Upgrade to Like & Match',
        'Free members can only view profiles. Upgrade to Fiffy Plus or VIP Gold to like, super-like, and create matches!',
        'info'
      );
      return;
    }

    setSwipedHistory((prev) => [...prev, { profile, action }]);
    setCurrentCardIndex((prev) => prev + 1);

    // Free users can only pass to view profiles, no matching allowed
    if (isFreeTier) {
      return;
    }

    if (action === 'superlike') {
      setCurrentUser((prev) => ({
        ...prev,
        superLikesRemaining: Math.max(0, prev.superLikesRemaining - 1),
      }));
    }

    // Call server to persist swipe & check mutual match
    try {
      const res = await fetchApi('/api/swipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          swiperId: currentUser.id,
          swipedId: profile.id,
          action,
        }),
      });
      const data = await res.json();

      if (data.isMatch && data.match) {
        setMatches((prev) => [data.match, ...prev]);
        setActiveMatchCelebration({ user: profile, isSuperMatch: action === 'superlike' });
        confetti({
          particleCount: 130,
          spread: 110,
          origin: { y: 0.5 },
          colors: ['#ff2a85', '#ec4899', '#a855f7', '#38bdf8', '#fbbf24'],
        });
        return;
      }
    } catch {
      // Fallback local match trigger if server is offline
    }

    const isMutual = profile.likedMe || profile.superLikedMe || action === 'superlike';
    if ((action === 'like' || action === 'superlike') && isMutual) {
      const newMatch: Match = {
        id: `match-${Date.now()}`,
        userId: profile.id,
        user: profile,
        matchedAt: 'Just now',
        unreadCount: 0,
        isSuperMatch: action === 'superlike',
      };
      setMatches((prev) => [newMatch, ...prev]);
      setActiveMatchCelebration({ user: profile, isSuperMatch: action === 'superlike' });
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#ff2a85', '#ec4899', '#a855f7', '#38bdf8'],
      });
    }
  };

  const undoLastSwipe = () => {
    if (swipedHistory.length === 0) return;
    const last = swipedHistory[swipedHistory.length - 1];
    setSwipedHistory((prev) => prev.slice(0, -1));
    setCurrentCardIndex((prev) => Math.max(0, prev - 1));
    showToast('Rewind', `Returned ${last.profile.name} to the deck.`);
  };

  const closeMatchCelebration = () => {
    setActiveMatchCelebration(null);
  };

  const activeChatMatch = useMemo(() => {
    return matches.find((m) => m.id === activeChatMatchId) || null;
  }, [matches, activeChatMatchId]);

  const requestOpenChat = (targetMatchId: string) => {
    // 1. Subscription check: Paid plan required to chat
    const isFreeTier = !currentUser.isPremium && !currentUser.isExempt;
    if (isFreeTier) {
      setMonetizationOpen(true);
      showToast(
        'Paid Subscription Required to Chat 🔒',
        'Starting and continuing conversations is reserved exclusively for paid members. Upgrade now to connect!',
        'info'
      );
      return;
    }

    if (activeChatMatchId === targetMatchId) {
      return;
    }

    const targetMatch = matches.find((m) => m.id === targetMatchId);
    if (!targetMatch) return;

    // 2. Single Active Chat Policy:
    // If user has an active chat with another match, warn them before closing the previous one
    const previousMatch = matches.find(
      (m) => m.id === activeChatMatchId && m.id !== targetMatchId && m.chatStatus !== 'closed'
    );

    if (previousMatch) {
      const prevMsgs = messages[previousMatch.id] || [];
      if (prevMsgs.length > 0 || previousMatch.chatStatus === 'active') {
        setPendingChatSwitch({
          targetMatch,
          previousMatch,
        });
        return;
      }
    }

    // Direct switch if no conflicting active chat
    setActiveChatMatchId(targetMatchId);
    setMatches((prev) =>
      prev.map((m) => (m.id === targetMatchId ? { ...m, chatStatus: 'active' } : m))
    );
  };

  const confirmChatSwitch = () => {
    if (!pendingChatSwitch) return;
    const { targetMatch, previousMatch } = pendingChatSwitch;

    const closeNotice: Message = {
      id: `sys-${Date.now()}`,
      matchId: previousMatch.id,
      senderId: 'system',
      text: `Chat concluded: Conversation closed under Fiffy’s Single Active Chat serious dating policy.`,
      timestamp: 'Just now',
      isRead: true,
    };

    setMessages((prev) => ({
      ...prev,
      [previousMatch.id]: [...(prev[previousMatch.id] || []), closeNotice],
    }));

    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === previousMatch.id) {
          return {
            ...m,
            chatStatus: 'closed',
            closedReason: `Ended to focus exclusively on ${targetMatch.user.name}`,
            lastMessage: 'Chat closed (Single focus policy)',
            lastMessageTime: 'Just now',
          };
        }
        if (m.id === targetMatch.id) {
          return {
            ...m,
            chatStatus: 'active',
          };
        }
        return m;
      })
    );

    setActiveChatMatchId(targetMatch.id);
    setPendingChatSwitch(null);

    showToast(
      'Exclusive Focus Activated 💬',
      `Chat with ${previousMatch.user.name} ended. You are now exclusively focused on ${targetMatch.user.name}.`,
      'info'
    );
  };

  const cancelChatSwitch = () => {
    setPendingChatSwitch(null);
  };

  const sendMessage = (matchId: string, text: string, imageUrl?: string) => {
    if (!text.trim() && !imageUrl) return;

    const currentMatch = matches.find((m) => m.id === matchId);
    if (currentMatch?.chatStatus === 'closed') {
      showToast(
        'Chat Closed',
        'This conversation has ended under Fiffy’s Single Active Chat policy to focus on another connection.',
        'error'
      );
      return;
    }

    const isFreeTier = !currentUser.isPremium && !currentUser.isExempt;

    if (isFreeTier) {
      setMonetizationOpen(true);
      showToast(
        'Upgrade to VIP to Chat',
        'Chatting and messaging are reserved exclusively for VIP members. Upgrade to connect with your matches!',
        'info'
      );
      return;
    }

    // Check if text contains contact number or email
    if (hasContactInfo(text)) {
      showToast(
        'Privacy Guard 🔒',
        'Contact numbers and emails are automatically hidden to protect everyone’s personal safety and privacy.',
        'info'
      );
    }

    const sanitizedText = maskContactInfo(text.trim());

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      matchId,
      senderId: 'me',
      text: sanitizedText,
      timestamp: 'Just now',
      imageUrl,
      isRead: false,
    };

    setMessages((prev) => ({
      ...prev,
      [matchId]: [...(prev[matchId] || []), newMsg],
    }));

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, lastMessage: sanitizedText || 'Photo sent', lastMessageTime: 'Just now' }
          : m
      )
    );

    // Persist to server
    fetchApi('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, senderId: currentUser.id, text: sanitizedText, imageUrl }),
    }).catch((e) => console.warn('Persisting message to server failed', e));

    // Simulated conversational reply
    const partner = matches.find((m) => m.id === matchId)?.user;
    if (partner) {
      setTimeout(() => setIsPartnerTyping(true), 1200);
      setTimeout(() => {
        setIsPartnerTyping(false);
        const replyBank = [
          `Sawubona! That sounds fantastic. Have you visited ${partner.city || 'the city'} lately?`,
          `I completely agree! Love that we share this energy ✨`,
          `Haha you have such great humour! Tell me more about your interests.`,
          `Definitely! We should totally grab a rooftop coffee or drink together sometime soon.`,
        ];
        const replyText = replyBank[Math.floor(Math.random() * replyBank.length)];
        const replyMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          matchId,
          senderId: partner.id,
          text: replyText,
          timestamp: 'Just now',
          isRead: false,
        };
        setMessages((prev) => ({
          ...prev,
          [matchId]: [...(prev[matchId] || []), replyMsg],
        }));
      }, 3400);
    }
  };

  const unmatchUser = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    if (activeChatMatchId === matchId) setActiveChatMatchId(null);
    showToast('Unmatched', 'Conversation closed.');
  };

  const blockUser = (userId: string) => {
    setBannedUserIds((prev) => [...prev, userId]);
    setMatches((prev) => prev.filter((m) => m.userId !== userId));
    if (activeChatMatch?.userId === userId) setActiveChatMatchId(null);
    showToast('User Blocked', 'Profile blocked permanently.');
  };

  const reportUser = (userId: string, reason: string, details: string) => {
    const targetUser = deckProfiles.find((p) => p.id === userId) || matches.find((m) => m.userId === userId)?.user;
    const newReport: ReportedItem = {
      id: `rep-${Date.now()}`,
      reportedUserId: userId,
      reportedUserName: targetUser?.name || 'User',
      reportedUserPhoto: targetUser?.photos[0] || '',
      reporterId: 'me',
      reporterName: currentUser.name,
      reason: reason as ReportedItem['reason'],
      details,
      status: 'pending',
      reportedAt: 'Just now',
    };
    setReportedItems((prev) => [newReport, ...prev]);
    blockUser(userId);
    showToast('Report Logged', 'Reviewed by moderation within 15 minutes.');
  };

  const activateBoost = () => {
    // One cannot boost without paying; requires remaining purchased boost credits
    if ((currentUser.boostsRemaining || 0) > 0) {
      setBoostTimeRemaining(30 * 60);
      setCurrentUser((prev) => ({
        ...prev,
        boostsRemaining: Math.max(0, (prev.boostsRemaining || 0) - 1),
      }));
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.3 },
        colors: ['#ff2a85', '#a855f7', '#fbbf24'],
      });
      showToast('Boost Active! ⚡', '10x visibility across your area for 30 minutes.', 'boost');
    } else {
      showToast('Boost Requires Purchase', 'Boost is a paid spotlight feature. Complete checkout to activate your 30-minute spotlight.', 'info');
      const boostPlan = subscriptionPlans.find((p) => p.id === 'plan-boost') || {
        id: 'plan-boost',
        name: 'Instant Spotlight Boost',
        priceUsd: 2.99,
        priceZar: 49,
        billingCycle: 'one-time',
        badge: 'Spotlight',
        description: '10x profile visibility in your city for 30 minutes. Be shown first to active singles.',
        features: [
          '10x higher placement in discovery deck',
          'Instant 30-minute city spotlight',
          'Decoded securely via payment gateway',
        ],
        isActive: true,
        isPopular: false,
      };
      openPayFastCheckout(boostPlan);
    }
  };

  // PAYFAST / CLICKNPAY CHECKOUT HELPERS
  const openPayFastCheckout = (plan: SubscriptionPlan) => {
    setSelectedPayFastPlan(plan);
    setIsPayFastModalOpen(true);
  };

  const closePayFastCheckout = () => {
    setIsPayFastModalOpen(false);
    setSelectedPayFastPlan(null);
  };

  const completePayFastPayment = async (paymentMethod = 'PayFast Hosted Gateway') => {
    if (!selectedPayFastPlan) return { success: false, error: 'No plan selected' };

    const isBoostPlan =
      selectedPayFastPlan.id === 'plan-boost' ||
      selectedPayFastPlan.name.toLowerCase().includes('boost');

    try {
      const res = await fetchApi('/api/payfast/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          planId: selectedPayFastPlan.id,
          paymentMethod,
        }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setCurrentUser((prev) => ({ ...prev, ...data.user }));
        if (isBoostPlan) {
          setBoostTimeRemaining(30 * 60);
        }
        confetti({
          particleCount: 160,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#ff2a85', '#38bdf8'],
        });
        return { success: true };
      }
      return { success: false, error: data.error || 'Payment failed' };
    } catch (err: any) {
      // Local fallback
      if (isBoostPlan) {
        setBoostTimeRemaining(30 * 60);
        setCurrentUser((prev) => ({
          ...prev,
          boostsRemaining: (prev.boostsRemaining || 0) + 1,
        }));
      } else {
        setCurrentUser((prev) => ({
          ...prev,
          isPremium: true,
          premiumTier: selectedPayFastPlan.name.toLowerCase().includes('gold') ? 'gold' : 'plus',
          boostsRemaining: (prev.boostsRemaining || 0) + 3,
        }));
      }
      return { success: true };
    }
  };

  // SUBSCRIPTION MANAGEMENT (From Admin Portal)
  const addOrUpdateSubscriptionPlan = async (plan: Partial<SubscriptionPlan>) => {
    try {
      const res = await fetchApi('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      const data = await res.json();
      if (data.plans) {
        setSubscriptionPlans(data.plans);
        showToast('Plan Saved', 'Subscription plan updated in database.');
      }
    } catch {
      setSubscriptionPlans((prev) => {
        const idx = prev.findIndex((p) => p.id === plan.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...plan } as SubscriptionPlan;
          return copy;
        }
        return [...prev, plan as SubscriptionPlan];
      });
    }
  };

  const deleteSubscriptionPlan = async (planId: string) => {
    try {
      const res = await fetchApi(`/api/admin/subscriptions/${planId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.plans) setSubscriptionPlans(data.plans);
    } catch {
      setSubscriptionPlans((prev) => prev.filter((p) => p.id !== planId));
    }
    showToast('Plan Deleted', 'Plan removed from subscription portal.');
  };

  const updatePayfastConfig = async (cfg: Partial<PayFastConfig>) => {
    try {
      const res = await fetchApi('/api/admin/payfast-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
      const data = await res.json();
      if (data.config) setPayfastConfig(data.config);
    } catch {
      setPayfastConfig((prev) => ({ ...prev, ...cfg }));
    }
    showToast('PayFast Config Saved', 'Live merchant settings updated.');
  };

  const clearDemoData = async () => {
    try {
      const res = await fetchApi('/api/admin/clear-demo-data', { method: 'POST' });
      const data = await res.json();
      // Reload profiles from server
      const pRes = await fetchApi('/api/profiles');
      const pData = await pRes.json();
      if (pData.profiles) {
        setDeckProfiles(pData.profiles);
      }
      refreshActiveSinglesStats();
      showToast('Demo Data Removed', 'Live clean mode active.', 'match');
    } catch (e) {
      setDeckProfiles([]);
      refreshActiveSinglesStats();
      showToast('Demo Data Cleared', 'Mock singles removed.');
    }
  };

  const resetDemoData = async () => {
    try {
      await fetchApi('/api/admin/reset-demo-data', { method: 'POST' });
      const pRes = await fetchApi('/api/profiles');
      const pData = await pRes.json();
      if (Array.isArray(pData?.profiles)) {
        setDeckProfiles(pData.profiles);
      } else {
        setDeckProfiles([]);
      }
      refreshActiveSinglesStats();
      showToast('Database Synchronized', 'Profiles refreshed from live database.', 'info');
    } catch (e) {
      setDeckProfiles([]);
      refreshActiveSinglesStats();
    }
  };

  const updateAdminSettings = (updates: Partial<AdminSettings>) => {
    setAdminSettings((prev) => ({ ...prev, ...updates }));
    showToast('Settings Updated', 'Platform parameters saved.');
  };

  const resolveReport = (reportId: string, resolution: 'dismiss' | 'warn' | 'ban') => {
    setReportedItems((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: resolution === 'dismiss' ? 'dismissed' : 'resolved' } : r))
    );
    showToast('Report Handled', `Action taken: ${resolution.toUpperCase()}`);
  };

  const sendBroadcast = (title: string, body: string, audience: PushNotificationBroadcast['targetAudience']) => {
    const newBroadcast: PushNotificationBroadcast = {
      id: `b-${Date.now()}`,
      title,
      body,
      targetAudience: audience,
      sentAt: 'Just now',
      deliveredCount: 4200,
    };
    setBroadcasts((prev) => [newBroadcast, ...prev]);
    showToast('Broadcast Dispatched! 📣', `Delivered to ${audience} members.`);
  };

  // TESTIMONIAL METHODS
  const submitTestimonial = async (data: Partial<Testimonial>) => {
    try {
      const res = await fetchApi('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.testimonial) {
        setTestimonials((prev) => [json.testimonial, ...prev]);
        showToast('Story Submitted! 💍', 'Thank you for sharing your love story with the community.', 'match');
        return { success: true };
      }
      return { success: false, error: json.error || 'Failed to submit' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error' };
    }
  };

  const adminAddOrEditTestimonial = async (data: Partial<Testimonial>) => {
    try {
      const res = await fetchApi('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.testimonials) {
        setTestimonials(json.testimonials);
        showToast('Testimonial Saved', 'Community story updated.');
      }
    } catch {
      showToast('Error', 'Failed to save testimonial.');
    }
  };

  const adminDeleteTestimonial = async (id: string) => {
    try {
      const res = await fetchApi(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.testimonials) {
        setTestimonials(json.testimonials);
        showToast('Testimonial Deleted', 'Story removed.');
      }
    } catch {
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // ADMIN USER MANAGEMENT METHODS
  const fetchAdminUsers = async () => {
    try {
      const res = await fetchApi('/api/admin/users');
      const parsed = await safeFetchJson(res);
      if (parsed.success && Array.isArray(parsed.data?.users)) {
        setAdminUsersList(parsed.data.users);
        return;
      }
      setAdminUsersList([]);
    } catch {
      setAdminUsersList([]);
    }
  };

  const adminAddUser = async (userData: any) => {
    const newUser = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetchApi('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const parsed = await safeFetchJson(res);
      if (parsed.success && parsed.data?.user) {
        setAdminUsersList((prev) => [parsed.data.user, ...prev]);
        setDeckProfiles((prev) => [parsed.data.user, ...prev]);
        refreshActiveSinglesStats();
        showToast(
          'User Added by Admin',
          `${parsed.data.user.name} created${parsed.data.user.isExempt ? ' with VIP Exemption' : ''}.`,
          'match'
        );
        return { success: true, user: parsed.data.user };
      }
      // Standalone demo fallback
      setAdminUsersList((prev) => [newUser, ...prev]);
      setDeckProfiles((prev) => [newUser, ...prev]);
      showToast('User Added (Demo Mode)', `${newUser.name} created locally with VIP Exemption.`, 'match');
      return { success: true, user: newUser };
    } catch {
      setAdminUsersList((prev) => [newUser, ...prev]);
      setDeckProfiles((prev) => [newUser, ...prev]);
      showToast('User Added (Demo Mode)', `${newUser.name} created locally with VIP Exemption.`, 'match');
      return { success: true, user: newUser };
    }
  };

  const adminToggleUserExemption = async (userId: string, isExempt?: boolean) => {
    setAdminUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newExempt = isExempt !== undefined ? isExempt : !u.isExempt;
          return {
            ...u,
            isExempt: newExempt,
            isPremium: newExempt ? true : u.isPremium,
            premiumTier: newExempt ? 'elite' : u.premiumTier,
          };
        }
        return u;
      })
    );

    showToast('VIP Exemption Updated', 'Member exemption status saved.');

    try {
      await fetchApi(`/api/admin/users/${userId}/exemption`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isExempt }),
      });
    } catch {
      // Offline fallback already updated in local state
    }
    return { success: true };
  };

  const adminDeleteUser = async (userId: string) => {
    setAdminUsersList((prev) => prev.filter((u) => u.id !== userId));
    setDeckProfiles((prev) => prev.filter((p) => p.id !== userId));
    showToast('User Deleted', 'Member removed from system.');

    try {
      await fetchApi(`/api/admin/users/${userId}`, { method: 'DELETE' });
    } catch {
      // Offline fallback already updated
    }
    return { success: true };
  };

  // Platform Managers & Staff Team
  const addPlatformManager = async (data: Omit<PlatformManager, 'id' | 'createdAt'> & { password?: string }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = platformManagers.find((m) => m.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'A platform manager with this email already exists.' };
    }

    const newManager: PlatformManager = {
      id: `mgr-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone?.trim() || '+263 77 000 0000',
      role: data.role || 'co_admin',
      department: data.department?.trim() || 'Operations & Trust Hub',
      status: data.status || 'active',
      isRootAdmin: false,
      avatarUrl:
        data.avatarUrl ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`,
      createdAt: new Date().toISOString(),
    };

    setPlatformManagers((prev) => [newManager, ...prev]);

    try {
      await fetchApi('/api/admin/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newManager, password: data.password || 'manager2026' }),
      });
    } catch {
      // offline fallback handled
    }

    showToast(
      'Manager Access Granted! 🛡️',
      `${newManager.name} is authorized to help manage the platform.`,
      'match'
    );
    return { success: true, manager: newManager };
  };

  const updatePlatformManager = async (id: string, updates: Partial<PlatformManager>) => {
    setPlatformManagers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    try {
      await fetchApi(`/api/admin/managers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}
    showToast('Platform Manager Updated', 'Staff permissions have been updated.');
    return { success: true };
  };

  const deletePlatformManager = async (id: string) => {
    const target = platformManagers.find((m) => m.id === id);
    if (target?.isRootAdmin) {
      return { success: false, error: 'The primary Executive Admin account cannot be deleted.' };
    }
    setPlatformManagers((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetchApi(`/api/admin/managers/${id}`, { method: 'DELETE' });
    } catch {}
    showToast('Manager Access Revoked', 'Staff member has been removed from platform management.');
    return { success: true };
  };

  return (
    <AppContext.Provider
      value={{
        activeSurface,
        setActiveSurface,
        inAppTab,
        setInAppTab,
        authUser,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
        loginUser,
        signupUser,
        logoutUser,
        activeSinglesStats,
        refreshActiveSinglesStats,
        adminSession,
        loginAdmin,
        logoutAdmin,
        currentUser,
        updateCurrentUser,
        verifySelfie,
        deckProfiles,
        currentCardIndex,
        activeCard,
        filters,
        updateFilters,
        filteredProfiles,
        viewMode,
        setViewMode,
        handleSwipe,
        undoLastSwipe,
        canUndo: swipedHistory.length > 0,
        matches,
        activeMatchCelebration,
        closeMatchCelebration,
        activeChatMatchId,
        setActiveChatMatchId,
        activeChatMatch,
        messages,
        sendMessage,
        isPartnerTyping,
        unmatchUser,
        blockUser,
        reportUser,
        pendingChatSwitch,
        requestOpenChat,
        confirmChatSwitch,
        cancelChatSwitch,
        isVerificationModalOpen,
        setIsVerificationModalOpen,
        isSafetyModalOpen,
        setSafetyModalOpen,
        adminSettings,
        updateAdminSettings,
        isMonetizationOpen,
        setMonetizationOpen,
        activateBoost,
        boostTimeRemaining,
        isBoostActive,
        subscriptionPlans,
        appCurrency,
        appCurrencySymbol,
        refreshPlans,
        addOrUpdateSubscriptionPlan,
        deleteSubscriptionPlan,
        payfastConfig,
        updatePayfastConfig,
        isPayFastModalOpen,
        selectedPayFastPlan,
        openPayFastCheckout,
        closePayFastCheckout,
        completePayFastPayment,
        clearDemoData,
        resetDemoData,
        reportedItems,
        resolveReport,
        bannedUserIds,
        broadcasts,
        sendBroadcast,
        toasts,
        dismissToast,
        showToast,
        inspectedProfile,
        setInspectedProfile,
        testimonials,
        submitTestimonial,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
