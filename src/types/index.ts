export type Gender = 'woman' | 'man' | 'non-binary' | 'genderfluid' | 'agender' | 'transgender' | 'other';

export type SexualOrientation = 'straight' | 'gay' | 'lesbian' | 'bisexual' | 'pansexual' | 'queer' | 'asexual' | 'questioning';

export type ShowMePreference = 'everyone' | 'women' | 'men' | 'non-binary';

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
  datingGoal: 'Long-term relationship' | 'Casual dating' | 'Marriage' | 'New friends' | 'Still figuring it out';
  spotifyTopArtist?: string;
  childrenStatus?: ChildrenStatus;
  superLikedMe?: boolean;
  likedMe?: boolean;
  dateOfBirth?: string;
  phone?: string;
  contactNumber?: string;
  isExempt?: boolean; // Admin VIP Exception
}

export interface CurrentUser extends UserProfile {
  email?: string;
  phone: string;
  contactNumber?: string;
  dateOfBirth?: string;
  isPremium: boolean;
  premiumTier: 'free' | 'plus' | 'gold' | 'elite';
  isExempt?: boolean; // Admin VIP Exception
  dailySwipesUsed?: number;
  boostsRemaining: number;
  superLikesRemaining: number;
  boostExpiresAt: number | null; // timestamp
  incognito: boolean;
  hideAge: boolean;
  hideDistance: boolean;
  readReceipts: boolean;
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
  senderId: string; // 'me' or user.id
  text: string;
  timestamp: string;
  imageUrl?: string;
  isRead: boolean;
  reactions?: string[];
}

export interface ReportedItem {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserPhoto: string;
  reporterId: string;
  reporterName: string;
  reason: 'Inappropriate Photos' | 'Harassment / Abusive Messages' | 'Spam or Bot' | 'Impersonation' | 'Underage' | 'Other';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  reportedAt: string;
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
  payfastItemCode?: string;
  itemCode?: string;
  isActive: boolean;
  isPopular?: boolean;
}

export interface Testimonial {
  id: string;
  coupleNames: string;
  locations?: string;
  location?: string;
  photoUrl?: string;
  userPhoto?: string;
  partnerPhoto?: string;
  quote?: string;
  story?: string;
  storyDetails?: string;
  weddingDate?: string;
  metDate?: string;
  country?: string;
  countryFlag?: string;
  rating?: number;
  isFeatured?: boolean;
  verified: boolean;
  status: 'published' | 'pending';
  submittedBy?: string;
  createdAt: string;
}

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passPhrase: string;
  isSandbox: boolean;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export interface PayFastPaymentPayload {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  name_last: string;
  email_address: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description: string;
  signature: string;
}

export interface AdminSettings {
  paymentsEnabled: boolean;
  paymentModel: 'subscription' | 'once-off' | 'freemium-hybrid';
  currency: 'ZAR' | 'USD' | 'EUR' | 'GBP';
  payfastMerchantId: string;
  payfastMerchantKey: string;
  payfastPassphrase: string;
  payfastSandbox: boolean;
  requireIdVerification: boolean;
  minimumAge: number;
  maxDistanceKm: number;
  freeDailySwipes: number;
}

export interface DiscoveryFilters {
  genderPreference: ShowMePreference;
  targetCountry: string; // 'all' or specific country
  ageRange: [number, number];
  maxDistance: number;
  verifiedOnly: boolean;
  selectedInterests: string[];
  datingGoals: string[];
}

export interface PushNotificationBroadcast {
  id: string;
  title: string;
  body: string;
  targetAudience: 'all' | 'premium' | 'free' | 'women' | 'men' | 'inactive';
  sentAt: string;
  deliveredCount: number;
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

export interface ActiveSinglesCountry {
  country: string;
  countryCode: string;
  countryFlag: string;
  count: number;
}

export interface ActiveSinglesStats {
  totalActive: number;
  hubCount: number;
  activeCountries: ActiveSinglesCountry[];
}


