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
  FCMNotificationPayload,
} from '../types';
import { fcmService } from '../services/fcmService';
import {
  INITIAL_CURRENT_USER,
  MOCK_PROFILES,
  INITIAL_MATCHES,
  INITIAL_MESSAGES,
  DEFAULT_SUBSCRIPTION_PLANS,
  getDemoAccount,
  DEMO_ACCOUNTS_CONFIG,
} from '../data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

export type InAppTab = 'discover' | 'matches' | 'chat' | 'profile';

interface AppContextType {
  // Auth
  authUser: AuthUser | null;
  isLoggedIn: boolean;
  authLoading: boolean;
  loginUser: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signupUser: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => Promise<void>;
  switchDemoAccount: (identifier: string) => Promise<{ success: boolean; error?: string }>;

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
  pendingChatSwitch: { targetMatch: Match; previousMatch: Match } | null;
  requestOpenChat: (targetMatchId: string) => void;
  confirmChatSwitch: () => void;
  cancelChatSwitch: () => void;

  // Identity Verification
  isVerificationModalOpen: boolean;
  setIsVerificationModalOpen: (open: boolean) => void;

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

  // FCM Push Notifications
  isFcmModalOpen: boolean;
  setIsFcmModalOpen: (open: boolean) => void;
  triggerFcmAlert: (payload: Omit<FCMNotificationPayload, 'id' | 'sentAt'>) => Promise<FCMNotificationPayload>;
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
  const [authLoading, setAuthLoading] = useState(true);
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
  const [pendingChatSwitch, setPendingChatSwitch] = useState<{
    targetMatch: Match;
    previousMatch: Match;
  } | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

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
  const [isFcmModalOpen, setIsFcmModalOpen] = useState(false);

  // ── Initialize FCM Push Notifications ─────────────────────────────────────
  useEffect(() => {
    fcmService.init(API_BASE).catch((err) => {
      console.warn('FCM Mobile init warning:', err);
    });
  }, []);

  // ── Hydrate auth from storage on mount ──────────────────────────────────────
  useEffect(() => {
    const hydrate = async () => {
      try {
        const raw = await AsyncStorage.getItem('fiffy_auth_user');
        if (raw) {
          const saved: AuthUser = JSON.parse(raw);
          setAuthUser(saved);
          try {
            const rawProf = await AsyncStorage.getItem('fiffy_current_user');
            if (rawProf) {
              const savedProf: CurrentUser = JSON.parse(rawProf);
              setCurrentUser(savedProf);
            } else {
              const demo = getDemoAccount(saved.email || saved.name || '');
              if (demo) {
                setCurrentUser(demo.user);
                setMatches(demo.matches);
                setMessages(demo.messages);
              } else {
                setCurrentUser((prev) => ({ ...prev, ...saved }));
              }
            }
          } catch {}
        }
      } catch (err) {
        console.warn('Auth hydration error:', err);
      } finally {
        setAuthLoading(false);
      }
    };
    hydrate();

    // Try to fetch live profiles from the backend with abort timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    fetch(`${API_BASE}/api/profiles`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        clearTimeout(timeout);
        if (d.profiles?.length) setDeckProfiles(d.profiles);
      })
      .catch(() => {});

    fetch(`${API_BASE}/api/plans`, { signal: controller.signal })
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
      // Exclude logged in user
      if (p.id === currentUser.id || p.name === currentUser.name) return false;

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
  }, [deckProfiles, filters, currentUser.id, currentUser.name]);

  const activeCard = filteredProfiles[currentCardIndex] ?? null;

  // ── Auth ─────────────────────────────────────────────────────────────────────
  const loginUser = async (identifier: string, pass: string) => {
    // 1. Instant check for Demo accounts (works 100% offline without backend)
    const demoCfg = getDemoAccount(identifier);
    if (demoCfg) {
      const user: AuthUser = {
        id: demoCfg.user.id,
        name: demoCfg.user.name,
        email: demoCfg.user.email || identifier,
        role: 'user',
        token: `demo-token-${demoCfg.user.id}`,
      };
      setAuthUser(user);
      setCurrentUser(demoCfg.user);
      setMatches(demoCfg.matches);
      setMessages(demoCfg.messages);
      setActiveChatMatchId(demoCfg.matches[0]?.id || null);
      setDeckProfiles(MOCK_PROFILES.filter((p) => p.id !== demoCfg.user.id && p.name !== demoCfg.user.name));
      setCurrentCardIndex(0);
      await AsyncStorage.setItem('fiffy_auth_user', JSON.stringify(user));
      await AsyncStorage.setItem('fiffy_current_user', JSON.stringify(demoCfg.user));
      return { success: true };
    }

    // 2. Demo Executive Admin login
    if (identifier.toLowerCase().includes('admin') && pass === 'admin123') {
      const adminUser: AuthUser = {
        id: 'admin-1',
        name: 'Executive Admin',
        email: identifier,
        role: 'admin',
        token: 'demo-admin-token',
      };
      setAuthUser(adminUser);
      setCurrentUser({
        ...INITIAL_CURRENT_USER,
        name: 'Executive Admin',
        email: identifier,
        isPremium: true,
        premiumTier: 'elite',
        isExempt: true,
      });
      await AsyncStorage.setItem('fiffy_auth_user', JSON.stringify(adminUser));
      return { success: true };
    }

    // 3. Try backend if available with a short timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, email: identifier, phone: identifier, password: pass }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.success && data.user) {
        setAuthUser(data.user);
        setCurrentUser((prev) => ({ ...prev, ...data.user }));
        await AsyncStorage.setItem('fiffy_auth_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch {
      // 4. Standalone fallback for any custom credentials when running without backend
      const localId = `user-${Date.now()}`;
      const localName = identifier.includes('@')
        ? identifier.split('@')[0].replace(/[._-]/g, ' ')
        : 'African Single';
      const capitalizedName = localName.replace(/\b\w/g, (c) => c.toUpperCase());
      const localUser: AuthUser = {
        id: localId,
        name: capitalizedName,
        email: identifier.includes('@') ? identifier : undefined,
        phone: !identifier.includes('@') ? identifier : undefined,
        role: 'user',
        token: `token-${localId}`,
      };
      const customProfile: CurrentUser = {
        ...INITIAL_CURRENT_USER,
        id: localId,
        name: capitalizedName,
        email: localUser.email,
        phone: localUser.phone || INITIAL_CURRENT_USER.phone,
        isPremium: true,
        premiumTier: 'gold',
      };
      setAuthUser(localUser);
      setCurrentUser(customProfile);
      setMatches(INITIAL_MATCHES);
      setMessages(INITIAL_MESSAGES);
      await AsyncStorage.setItem('fiffy_auth_user', JSON.stringify(localUser));
      await AsyncStorage.setItem('fiffy_current_user', JSON.stringify(customProfile));
      return { success: true };
    }
  };

  const signupUser = async (userData: any) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.success && data.user) {
        setAuthUser(data.user);
        setCurrentUser((prev) => ({ ...prev, ...data.user }));
        await AsyncStorage.setItem('fiffy_auth_user', JSON.stringify(data.user));
        return { success: true };
      }
    } catch {}

    // Offline / Standalone Fallback: immediately log user in with their custom profile!
    const newId = `user-reg-${Date.now()}`;
    const newUser: AuthUser = {
      id: newId,
      name: userData.name,
      email: userData.email,
      phone: userData.contactNumber || userData.phone,
      role: 'user',
      token: `token-${newId}`,
    };
    const newProfile: CurrentUser = {
      ...INITIAL_CURRENT_USER,
      id: newId,
      name: userData.name,
      email: userData.email,
      phone: userData.contactNumber || userData.phone,
      contactNumber: userData.contactNumber || userData.phone,
      dateOfBirth: userData.dob || userData.dateOfBirth || '2000-01-01',
      age: userData.age || 25,
      gender: userData.gender || 'woman',
      showMe: userData.showMe || 'men',
      country: userData.country || 'South Africa',
      countryCode: userData.countryCode || 'ZA',
      countryFlag: userData.countryFlag || '🇿🇦',
      city: userData.city || 'Johannesburg',
      location: `${userData.city || 'Johannesburg'}, ${userData.country || 'South Africa'}`,
      bio: userData.bio || 'Excited to meet genuine people on Fiffy!',
      isPremium: true,
      premiumTier: 'gold',
      superLikesRemaining: 5,
      boostsRemaining: 2,
    };
    setAuthUser(newUser);
    setCurrentUser(newProfile);
    setMatches(INITIAL_MATCHES);
    setMessages(INITIAL_MESSAGES);
    await AsyncStorage.setItem('fiffy_auth_user', JSON.stringify(newUser));
    await AsyncStorage.setItem('fiffy_current_user', JSON.stringify(newProfile));
    return { success: true };
  };

  const logoutUser = async () => {
    setAuthUser(null);
    setCurrentUser(INITIAL_CURRENT_USER);
    setMatches(INITIAL_MATCHES);
    setMessages(INITIAL_MESSAGES);
    setDeckProfiles(MOCK_PROFILES);
    setInAppTab('discover');
    await AsyncStorage.removeItem('fiffy_auth_user');
    await AsyncStorage.removeItem('fiffy_current_user');
    showToast('Signed Out', 'You have been safely signed out.', 'info');
  };

  const switchDemoAccount = async (identifier: string) => {
    return loginUser(identifier, 'password123');
  };

  // ── Profile ──────────────────────────────────────────────────────────────────
  const updateCurrentUser = (updates: Partial<CurrentUser>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem('fiffy_current_user', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const verifySelfie = () => {
    setCurrentUser((prev) => {
      const updated = { ...prev, verified: true };
      AsyncStorage.setItem('fiffy_current_user', JSON.stringify(updated)).catch(() => {});
      return updated;
    });
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      const res = await fetch(`${API_BASE}/api/swipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ swiperId: currentUser.id, swipedId: profile.id, action }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.isMatch && data.match) {
        setMatches((prev) => [data.match, ...prev]);
        setActiveMatchCelebration({ user: profile, isSuperMatch: action === 'superlike' });
        // Dispatch FCM Push Notification Alert
        fcmService.dispatchNotification({
          channelId: 'fiffy_sparks',
          type: 'new_match',
          title: '🔥 New Spark on Fiffy!',
          body: `You and ${profile.name} liked each other! Start your conversation now.`,
          avatarUrl: profile.photos[0],
          actionLabel: 'View Match',
          data: { type: 'new_match', userId: profile.id },
        });
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

      // Dispatch FCM Push Notification Alert
      fcmService.dispatchNotification({
        channelId: 'fiffy_sparks',
        type: 'new_match',
        title: '🔥 New Spark on Fiffy!',
        body: `You and ${profile.name} liked each other! Start your conversation now.`,
        avatarUrl: profile.photos[0],
        actionLabel: 'View Match',
        data: { type: 'new_match', userId: profile.id },
      });
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

  const requestOpenChat = (targetMatchId: string) => {
    const isFreeTier = !currentUser.isPremium && !currentUser.isExempt;
    if (isFreeTier) {
      setMonetizationOpen(true);
      showToast(
        'Subscription Required',
        'Direct messaging and chatting requires an active paid plan. Upgrade to unlock conversations!',
        'info'
      );
      return;
    }

    const targetMatch = matches.find((m) => m.id === targetMatchId);
    if (!targetMatch) return;

    // Single active chat guard: Check if user already has an active conversation with another match
    const activeMatch = matches.find(
      (m) =>
        m.id !== targetMatchId &&
        (m.chatStatus === 'active' || (m.id === activeChatMatchId && m.chatStatus !== 'closed'))
    );

    if (activeMatch && targetMatch.chatStatus !== 'active') {
      setPendingChatSwitch({ targetMatch, previousMatch: activeMatch });
      return;
    }

    // Open chat directly
    setMatches((prev) =>
      prev.map((m) =>
        m.id === targetMatchId
          ? { ...m, chatStatus: 'active', unreadCount: 0 }
          : m
      )
    );
    setActiveChatMatchId(targetMatchId);
    setInAppTab('chat');
  };

  const confirmChatSwitch = () => {
    if (!pendingChatSwitch) return;
    const { targetMatch, previousMatch } = pendingChatSwitch;

    // Conclude previous chat
    const closeNotice: Message = {
      id: `msg-closed-${Date.now()}`,
      matchId: previousMatch.id,
      senderId: 'system',
      text: '🔒 [System Notice] This conversation was automatically ended and archived because a new match chat was opened. Fiffy is dedicated to serious, cheating-free dating (1 active chat at a time).',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
    };

    setMessages((prev) => ({
      ...prev,
      [previousMatch.id]: [...(prev[previousMatch.id] || []), closeNotice],
    }));

    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === previousMatch.id) {
          return { ...m, chatStatus: 'closed', closedReason: 'Switched to a new match chat' };
        }
        if (m.id === targetMatch.id) {
          return { ...m, chatStatus: 'active', unreadCount: 0 };
        }
        return m;
      })
    );

    setActiveChatMatchId(targetMatch.id);
    setPendingChatSwitch(null);
    setInAppTab('chat');
    showToast(
      'Active Chat Updated',
      `Previous chat with ${previousMatch.user.name} ended. You are now chatting with ${targetMatch.user.name}.`,
      'info'
    );
  };

  const cancelChatSwitch = () => {
    setPendingChatSwitch(null);
  };

  const sendMessage = (matchId: string, text: string, imageUrl?: string) => {
    const isFreeTier = !currentUser.isPremium && !currentUser.isExempt;
    if (isFreeTier) {
      setMonetizationOpen(true);
      showToast('Subscription Required', 'You must be on an active paid plan to send messages.', 'info');
      return;
    }

    const target = matches.find((m) => m.id === matchId);
    if (target?.chatStatus === 'closed') {
      showToast('Chat Ended', 'This conversation has ended. Start a new match chat to connect.', 'info');
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

      // Dispatch FCM Push Notification Alert for incoming direct message
      const partner = activeChatMatch?.user;
      fcmService.dispatchNotification({
        channelId: 'fiffy_messages',
        type: 'new_message',
        title: `💬 ${partner?.name || 'Your Match'}`,
        body: reply.text,
        avatarUrl: partner?.photos[0],
        actionLabel: 'Reply Now',
        data: { type: 'new_message', matchId },
      });
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

      // Dispatch FCM Push Notification Alert for spotlight boost
      fcmService.dispatchNotification({
        channelId: 'fiffy_system',
        type: 'boost_activated',
        title: '⚡ Profile Spotlight Live!',
        body: 'Your profile is boosted 10x in Sparks Deck across Africa & Diaspora for 30 minutes.',
        actionLabel: 'Explore Sparks',
        data: { type: 'boost_activated' },
      });
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
    authLoading,
    loginUser,
    signupUser,
    logoutUser,
    switchDemoAccount,

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
    pendingChatSwitch,
    requestOpenChat,
    confirmChatSwitch,
    cancelChatSwitch,

    isVerificationModalOpen,
    setIsVerificationModalOpen,

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

    isFcmModalOpen,
    setIsFcmModalOpen,
    triggerFcmAlert: (payload) => fcmService.dispatchNotification(payload),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
