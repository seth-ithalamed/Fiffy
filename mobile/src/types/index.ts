export type Gender =
  | 'woman'
  | 'man'
  | 'non-binary'
  | 'genderfluid'
  | 'agender'
  | 'transgender'
  | 'other';

export type SexualOrientation =
  | 'straight'
  | 'gay'
  | 'lesbian'
  | 'bisexual'
  | 'pansexual'
  | 'queer'
  | 'asexual'
  | 'questioning';

export type ShowMePreference = 'everyone' | 'women' | 'men' | 'non-binary';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type ChildrenStatus =
  | 'no_children'
  | 'have_children_living'
  | 'have_children_not_living'
  | 'want_children'
  | 'not_want_children'
  | 'prefer_not_to_say';

export const CHILDREN_STATUS_CONFIG: { value: ChildrenStatus; label: string; icon: string }[] = [
  { value: 'no_children', label: 'No children', icon: '👶' },
  { value: 'want_children', label: 'Wants children in future', icon: '🍼' },
  { value: 'have_children_living', label: 'Has children (living with me)', icon: '🏡' },
  { value: 'have_children_not_living', label: 'Has children (not living with me)', icon: '🎈' },
  { value: 'not_want_children', label: 'Does not want children', icon: '🚫' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: '🔒' },
];

export interface PromptAnswer {
  id: string;
  question: string;
  answer: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  genderCustom?: string;
  orientation: SexualOrientation;
  showMe: ShowMePreference;
  bio: string;
  photos: string[];
  job: string;
  company?: string;
  education: string;
  location: string;
  city: string;
  country: string;
  countryCode: string;
  countryFlag: string;
  preferredCountries?: string[];
  distanceKm: number;
  interests: string[];
  prompts: PromptAnswer[];
  verified: boolean;
  online: boolean;
  lastActive: string;
  height?: string;
  starSign?: string;
  drinking?: string;
  smoking?: string;
  datingGoal:
    | 'Long-term relationship'
    | 'Casual dating'
    | 'Marriage'
    | 'New friends'
    | 'Still figuring it out';
  hasChildren?: ChildrenStatus;
  verificationStatus?: VerificationStatus;
  spotifyTopArtist?: string;
  childrenStatus?: ChildrenStatus;
  superLikedMe?: boolean;
  likedMe?: boolean;
  dateOfBirth?: string;
  phone?: string;
  contactNumber?: string;
  isExempt?: boolean;
}

export interface CurrentUser extends UserProfile {
  email?: string;
  phone: string;
  contactNumber?: string;
  dateOfBirth?: string;
  isPremium: boolean;
  premiumTier: 'free' | 'plus' | 'gold' | 'elite';
  isExempt?: boolean;
  dailySwipesUsed?: number;
  boostsRemaining: number;
  superLikesRemaining: number;
  boostExpiresAt: number | null;
  incognito: boolean;
  hideAge: boolean;
  hideDistance: boolean;
  readReceipts: boolean;
  exclusiveChatMatchId?: string | null;
}

export interface Match {
  id: string;
  userId: string;
  user: UserProfile;
  matchedAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isSuperMatch?: boolean;
  chatStatus?: 'active' | 'closed';
  closedReason?: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: string;
  imageUrl?: string;
  isRead: boolean;
  reactions?: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceUsd: number;
  priceZar?: number;
  billingCycle: 'monthly' | 'quarterly' | 'annual' | 'one-time';
  description: string;
  features: string[];
  badge?: string;
  isActive: boolean;
  isPopular?: boolean;
}

export interface DiscoveryFilters {
  genderPreference: ShowMePreference;
  targetCountry: string;
  ageRange: [number, number];
  maxDistance: number;
  verifiedOnly: boolean;
  selectedInterests: string[];
}

export interface ToastItem {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'error' | 'info';
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  contactNumber?: string;
  name: string;
  role: 'user' | 'admin';
  token: string;
  avatarUrl?: string;
  country?: string;
}

// ─── Firebase Cloud Messaging (FCM) Types ─────────────────────────────────────
export type FCMChannelId = 'fiffy_sparks' | 'fiffy_messages' | 'fiffy_safety' | 'fiffy_system';

export type FCMNotificationType =
  | 'new_match'
  | 'new_message'
  | 'safety_alert'
  | 'boost_activated'
  | 'single_active_chat'
  | 'admin_broadcast'
  | 'test_alert';

export interface FCMNotificationPayload {
  id: string;
  channelId: FCMChannelId;
  type: FCMNotificationType;
  title: string;
  body: string;
  sentAt: string;
  data?: {
    matchId?: string;
    userId?: string;
    senderName?: string;
    senderPhoto?: string;
    url?: string;
    [key: string]: any;
  };
  avatarUrl?: string;
  actionLabel?: string;
}

export interface FCMNotificationPreferences {
  sparksAndMatches: boolean;
  directMessages: boolean;
  safetyReminders: boolean;
  promotionsAndBoosts: boolean;
  seriousDatingAudits: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}
