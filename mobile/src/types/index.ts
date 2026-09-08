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

export type ChildrenStatus = 'has_children' | 'no_children' | 'prefer_not_to_say';

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export const MAX_PROFILE_PHOTOS = 5;

export const CHILDREN_STATUS_LABELS: Record<ChildrenStatus, string> = {
  has_children: 'Has children',
  no_children: 'Does not have children',
  prefer_not_to_say: 'Prefers not to say',
};

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
