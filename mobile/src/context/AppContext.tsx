import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CurrentUser,
  UserProfile,
  Match,
  Message,
  SubscriptionPlan,
  DiscoveryFilters,
  ToastItem,
  AuthUser,
} from '../types';
import {
  INITIAL_CURRENT_USER,
  MOCK_PROFILES,
  INITIAL_MATCHES,
  INITIAL_MESSAGES,
  DEFAULT_SUBSCRIPTION_PLANS,
} from '../data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

export type InAppTab = 'discover' | 'matches' | 'chat' | 'profile';

interface AppContextType {
  // Auth
  authUser: AuthUser | null;
  isLoggedIn: boolean;
  loginUser: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signupUser: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;

  // Navigation tab
  inAppTab: InAppTab;
  setInAppTab: (tab: InAppTab) => void;

  // Current user profile
  currentUser: CurrentUser;
  updateCurrentUser: (updates: Partial<CurrentUser>) => void;
  verifySelfie: () => void;

  // Discovery
  deckProfiles: UserProfile[];
  filteredProfiles: UserProfile[];
  activeCard: UserProfile | null;
  currentCardIndex: number;
  filters: DiscoveryFilters;
  updateFilters: (updates: Partial<DiscoveryFilters>) => void;
  viewMode: 'swipe' | 'grid';
  setViewMode: (mode: 'swipe' | 'grid') => void;

  // Swiping
  handleSwipe: (action: 'like' | 'pass' | 'superlike', profile?: UserProfile) => void;
  undoLastSwipe: () => void;
  canUndo: boolean;

  // Matches & celebration
  matches: Match[];
  activeMatchCelebration: { user: UserProfile; isSuperMatch?: boolean } | null;
  closeMatchCelebration: () => void;

  // Chat
  activeChatMatchId: string | null;
  setActiveChatMatchId: (id: string | null) => void;
  activeChatMatch: Match | null;
  messages: Record<string, Message[]>;
  sendMessage: (matchId: string, text: string, imageUrl?: string) => void;
  isPartnerTyping: boolean;
  unmatchUser: (matchId: string) => void;
  blockUser: (userId: string) => void;
  reportUser: (userId: string, reason: string, details: string) => void;

  // Monetization
  subscriptionPlans: SubscriptionPlan[];
  isMonetizationOpen: boolean;
  setMonetizationOpen: (open: boolean) => void;
  activateBoost: () => void;
  boostTimeRemaining: number;
  isBoostActive: boolean;

  // Profile inspect
  inspectedProfile: UserProfile | null;
  setInspectedProfile: (p: UserProfile | null) => void;

  // Safety
  isSafetyModalOpen: boolean;
  setSafetyModalOpen: (open: boolean) => void;

  // Toast
  toasts: ToastItem[];
  showToast: (title: string, message: string, type?: ToastItem['type']) => void;
  dismissToast: (id: string) => void;

  // Paywall payment modal
  isPaymentModalOpen: boolean;
  selectedPlan: SubscriptionPlan | null;
  openPaymentModal: (plan: SubscriptionPlan) => void;
  closePaymentModal: () => void;
  completePayment: () => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: DiscoveryFilters = {
  genderPreference: 'everyone',
  targetCountry: 'all',
  ageRange: [20, 45],
  maxDistance: 15000,
  verifiedOnly: false,
  selectedInterests: [],
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

// Hard-coded API base — point at your local dev server or deployed URL
const API_BASE = 'http://localhost:3000';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(INITIAL_CURRENT_USER);
  const [inAppTab, setInAppTab] = useState<InAppTab>('discover');
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('swipe');

  const [deckProfiles, setDeckProfiles] = useState<UserProfile[]>(MOCK_PROFILES);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipedHistory, setSwipedHistory] = useState<
    { profile: UserProfile; action: 'like' | 'pass' | 'superlike' }[]
  >([]);

  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [activeMatchCelebration, setActiveMatchCelebration] = useState<{
    user: UserProfile;
    isSuperMatch?: boolean;
  } | null>(null);

  const [activeChatMatchId, setActiveChatMatchId] = useState<string | null>('match-1');
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const [filters, setFilters] = useState<DiscoveryFilters>(DEFAULT_FILTERS);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(
    DEFAULT_SUBSCRIPTION_PLANS
  );

  const [isMonetizationOpen, setMonetizationOpen] = useState(false);
  const [boostTimeRemaining, setBoostTimeRemaining] = useState(0);
  const [inspectedProfile, setInspectedProfile] = useState<UserProfile | null>(null);
  const [isSafetyModalOpen, setSafetyModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // ── Hydrate auth from storage on mount ──────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem('fiffy_auth_user').then((raw) => {
      if (raw) {
        try {
          const saved: AuthUser = JSON.parse(raw);
          setAuthUser(saved);
          setCurrentUser((prev) => ({ ...prev, ...saved }));
        } catch {}
      }
    });

    // Try to fetch live profiles from the backend
    fetch(`${API_BASE}/api/profiles`)
      .then((r) => r.json())
      .then((d) => {
        if (d.profiles?.length) setDeckProfiles(d.profiles);
      })
      .catch(() => {});

    fetch(`${API_BASE}/api/plans`)
      .then((r) => r.json())
      .then((d) => {
        if (d.plans?.length) setSubscriptionPlans(d.plans);
      })
      .catch(() => {});
  }, []);

  // ── Boost countdown ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (boostTimeRemaining <= 0) return;
    const id = setInterval(() => {
      setBoostTimeRemaining((p) => (p <= 1 ? 0 : p - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [boostTimeRemaining]);

  const isBoostActive = boostTimeRemaining > 0;

  // ── Filtered deck ────────────────────────────────────────────────────────────
  const filteredProfiles = useMemo(() => {
    return deckProfiles.filter((p) => {
      if (filters.targetCountry !== 'all') {
        const pc = (p.country || '').toLowerCase();
        const tc = filters.targetCountry.toLowerCase();
        if (!pc.includes(tc) && !tc.includes(pc)) return false;
      }
      if (filters.genderPreference !== 'everyone') {
        if (filters.genderPreference === 'women' && p.gender !== 'woman') return false;
        if (filters.genderPreference === 'men' && p.gender !== 'man') return false;
        if (filters.genderPreference === 'non-binary' && p.gender !== 'non-binary') return false;
      }
      if (p.age < filters.ageRange[0] || p.age > filters.ageRange[1]) return false;
      if (p.distanceKm > filters.maxDistance) return false;
      if (filters.verifiedOnly && !p.verified) return false;
      if (filters.selectedInterests.length > 0) {
        const hit = filters.selectedInterests.some((t) => (p.interests || []).includes(t));
        if (!hit) return false;
      }
      return true;
    });
  }, [deckProfiles, filters]);

  const activeCard = filteredProfiles[currentCardIndex] ?? null;

  // ── Auth ─────────────────────────────────────────────────────────────────────
  const loginUser = async (identifier: string, pass: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, email: identifier, phone: identifier, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setAuthUser(data.user);
        setCurrentUser((prev) => ({ ...prev, ...data.user }));
        await AsyncStorage.setItem('fiffy_auth_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch {
      // Offline fallback — demo accounts
      const demos: Record<string, { email: string; name: string }> = {
        'lerato.khumalo@fiffys.com': { email: 'lerato.khumalo@fiffys.com', name: 'Lerato Khumalo' },
        'amara.okafor@demo.fiffys.com': { email: 'amara.okafor@demo.fiffys.com', name: 'Amara Okafor' },
        'thabo.ndlovu@demo.fiffys.com': { email: 'thabo.ndlovu@demo.fiffys.com', name: 'Thabo Ndlovu' },
        'kwame.mensah@demo.fiffys.com': { email: 'kwame.mensah@demo.fiffys.com', name: 'Kwame Mensah' },
      };
      const id = identifier.toLowerCase();
      if (demos[id] && pass === 'password123') {
        const user: AuthUser = {
          id: `demo-${Date.now()}`,
          name: demos[id].name,
          email: demos[id].email,
          role: 'user',
          token: `demo-${Date.now()}`,
        };
        setAuthUser(user);
        setCurrentUser((prev) => ({ ...prev, ...user }));
        await AsyncStorage.setItem('fiffy_auth_user', JSON.stringify(user));
        return { success: true };
      }
      return { success: false, error: 'Server unavailable. Check your connection.' };
    }
  };

  const signupUser = async (userData: any) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setAuthUser(data.user);
        setCurrentUser((prev) => ({ ...prev, ...data.user }));
        await AsyncStorage.setItem('fiffy_auth_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch {
      return { success: false, error: 'Server unavailable. Please try again later.' };
    }
  };

  const logoutUser = async () => {
    setAuthUser(null);
    setCurrentUser(INITIAL_CURRENT_USER);
    setInAppTab('discover');
    await AsyncStorage.removeItem('fiffy_auth_user');
    showToast('Signed Out', 'You have been safely signed out.', 'info');
  };

  // ── Profile ──────────────────────────────────────────────────────────────────
  const updateCurrentUser = (updates: Partial<CurrentUser>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  const verifySelfie = () => {
    setCurrentUser((prev) => ({ ...prev, verified: true }));
    showToast('Photo Verified! 🛡️', 'Your profile now features the African Gold badge.', 'success');
  };

  // ── Filters ──────────────────────────────────────────────────────────────────
  const updateFilters = (updates: Partial<DiscoveryFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setCurrentCardIndex(0);
  };

  // ── Swipe engine ─────────────────────────────────────────────────────────────
  const handleSwipe = async (action: 'like' | 'pass' | 'superlike', targetProfile?: UserProfile) => {
    const profile = targetProfile ?? activeCard;
    if (!profile) return;

    const isFreeTier = !currentUser.isPremium && !currentUser.isExempt;

    if (isFreeTier && (action === 'like' || action === 'superlike')) {
      setMonetizationOpen(true);
      showToast('Upgrade to Like & Match', 'Free members can only view profiles.', 'info');
      return;
    }

    setSwipedHistory((prev) => [...prev, { profile, action }]);
    setCurrentCardIndex((prev) => prev + 1);

    if (isFreeTier) return;

    if (action === 'superlike') {
      setCurrentUser((prev) => ({
        ...prev,
        superLikesRemaining: Math.max(0, prev.superLikesRemaining - 1),
      }));
    }

    try {
      const res = await fetch(`${API_BASE}/api/swipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ swiperId: currentUser.id, swipedId: profile.id, action }),
      });
      const data = await res.json();
      if (data.isMatch && data.match) {
        setMatches((prev) => [data.match, ...prev]);
        setActiveMatchCelebration({ user: profile, isSuperMatch: action === 'superlike' });
        return;
      }
    } catch {}

    // Local match fallback
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
    }
  };

  const undoLastSwipe = () => {
    if (swipedHistory.length === 0) return;
    setSwipedHistory((prev) => prev.slice(0, -1));
    setCurrentCardIndex((prev) => Math.max(0, prev - 1));
  };

  const canUndo = swipedHistory.length > 0;

  const closeMatchCelebration = () => setActiveMatchCelebration(null);

  // ── Chat ─────────────────────────────────────────────────────────────────────
  const activeChatMatch = matches.find((m) => m.id === activeChatMatchId) ?? null;

  const sendMessage = (matchId: string, text: string, imageUrl?: string) => {
    const isFreeTier = !currentUser.isPremium && !currentUser.isExempt;
    if (isFreeTier) {
      setMonetizationOpen(true);
      return;
    }

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      matchId,
      senderId: 'me',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl,
      isRead: true,
    };

    setMessages((prev) => ({
      ...prev,
      [matchId]: [...(prev[matchId] ?? []), newMsg],
    }));

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, lastMessage: text, lastMessageTime: 'Just now' } : m
      )
    );

    // Simulate partner typing then replying
    setIsPartnerTyping(true);
    setTimeout(() => {
      setIsPartnerTyping(false);
      const replies = [
        'That is so true! Tell me more 😊',
        'Haha I love that! Same here 🔥',
        'You sound amazing! When are we meeting? ✨',
        'I was thinking the same thing! 💖',
        'Yes! That is exactly how I feel 🌍',
      ];
      const reply: Message = {
        id: `msg-r-${Date.now()}`,
        matchId,
        senderId: activeChatMatch?.userId ?? 'other',
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
      };
      setMessages((prev) => ({
        ...prev,
        [matchId]: [...(prev[matchId] ?? []), reply],
      }));
    }, 2000 + Math.random() * 1500);
  };

  const unmatchUser = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    setActiveChatMatchId(null);
    showToast('Unmatched', 'This connection has been removed.', 'info');
  };

  const blockUser = (userId: string) => {
    setDeckProfiles((prev) => prev.filter((p) => p.id !== userId));
    setMatches((prev) => prev.filter((m) => m.userId !== userId));
    showToast('User Blocked', 'This user will no longer appear in your discovery.', 'info');
  };

  const reportUser = (userId: string, reason: string, _details: string) => {
    showToast('Report Submitted', `Thank you. We will review this account for: ${reason}`, 'info');
  };

  // ── Monetization ─────────────────────────────────────────────────────────────
  const activateBoost = () => {
    if (currentUser.boostsRemaining > 0) {
      setCurrentUser((prev) => ({ ...prev, boostsRemaining: prev.boostsRemaining - 1 }));
      setBoostTimeRemaining(30 * 60); // 30 minutes
      showToast('Boost Activated! ⚡', 'Your profile is now 10x more visible for 30 minutes.', 'success');
    }
  };

  // ── Payment ───────────────────────────────────────────────────────────────────
  const openPaymentModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPlan(null);
  };

  const completePayment = () => {
    if (!selectedPlan) return;
    const tier =
      selectedPlan.id === 'plan-gold' ? 'gold' : selectedPlan.id === 'plan-elite' ? 'elite' : 'plus';
    setCurrentUser((prev) => ({ ...prev, isPremium: true, premiumTier: tier }));
    closePaymentModal();
    showToast(
      `${selectedPlan.name} Activated! 🎉`,
      'Welcome to VIP. Enjoy unlimited matching across Africa.',
      'success'
    );
  };

  // ── Toast ─────────────────────────────────────────────────────────────────────
  const showToast = (title: string, description: string, type: ToastItem['type'] = 'info') => {
    const toast: ToastItem = { id: `t-${Date.now()}`, title, description, type };
    setToasts((prev) => [toast, ...prev.slice(0, 3)]);
    setTimeout(() => dismissToast(toast.id), 4000);
  };

  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Context value ─────────────────────────────────────────────────────────────
  const value: AppContextType = {
    authUser,
    isLoggedIn: !!authUser,
    loginUser,
    signupUser,
    logoutUser,

    inAppTab,
    setInAppTab,

    currentUser,
    updateCurrentUser,
    verifySelfie,

    deckProfiles,
    filteredProfiles,
    activeCard,
    currentCardIndex,
    filters,
    updateFilters,
    viewMode,
    setViewMode,

    handleSwipe,
    undoLastSwipe,
    canUndo,

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

    subscriptionPlans,
    isMonetizationOpen,
    setMonetizationOpen,
    activateBoost,
    boostTimeRemaining,
    isBoostActive,

    inspectedProfile,
    setInspectedProfile,

    isSafetyModalOpen,
    setSafetyModalOpen,

    toasts,
    showToast,
    dismissToast,

    isPaymentModalOpen,
    selectedPlan,
    openPaymentModal,
    closePaymentModal,
    completePayment,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
