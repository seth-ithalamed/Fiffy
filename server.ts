import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_CURRENT_USER,
  MOCK_PROFILES,
  INITIAL_MATCHES,
  INITIAL_MESSAGES,
  INITIAL_REPORTED_ITEMS,
  DEFAULT_SUBSCRIPTION_PLANS,
  DEFAULT_PAYFAST_CONFIG,
  INITIAL_ADMIN_SETTINGS,
  INITIAL_TESTIMONIALS,
} from './src/data/mockData';

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'database.json');

// Interface for persistent DB structure
interface DatabaseSchema {
  users: any[];
  subscriptionPlans: any[];
  payfastConfig: any;
  adminSettings: any;
  swipes: any[];
  matches: any[];
  messages: Record<string, any[]>;
  reports: any[];
  transactions: any[];
  broadcasts: any[];
  testimonials: any[];
}

function getInitialDbState(): DatabaseSchema {
  const adminUser = {
    id: 'admin-1',
    name: 'Fiffy Executive Admin',
    email: 'admin@fiffys.com',
    password: 'admin2026',
    role: 'admin',
    verified: true,
    country: 'South Africa',
    countryCode: 'ZA',
    countryFlag: '🇿🇦',
    city: 'Johannesburg',
    isPremium: true,
    premiumTier: 'elite',
    isExempt: true,
    createdAt: new Date().toISOString(),
  };

  const initialUsers = [
    {
      ...INITIAL_CURRENT_USER,
      password: 'password123',
      role: 'user',
      isDemo: true,
      createdAt: new Date().toISOString(),
    },
    ...MOCK_PROFILES.map((p) => ({
      ...p,
      email: `${p.name.toLowerCase().replace(/\s+/g, '.')}@demo.fiffys.com`,
      password: 'password123',
      phone: '+27 82 000 0000',
      role: 'user',
      isPremium: false,
      premiumTier: 'free',
      isExempt: false,
      dailySwipesUsed: 0,
      boostsRemaining: 1,
      superLikesRemaining: 3,
      boostExpiresAt: null,
      incognito: false,
      hideAge: false,
      hideDistance: false,
      readReceipts: true,
      isDemo: true,
      createdAt: new Date().toISOString(),
    })),
    adminUser,
  ];

  return {
    users: initialUsers,
    subscriptionPlans: DEFAULT_SUBSCRIPTION_PLANS,
    payfastConfig: DEFAULT_PAYFAST_CONFIG,
    adminSettings: INITIAL_ADMIN_SETTINGS,
    swipes: [],
    matches: INITIAL_MATCHES,
    messages: INITIAL_MESSAGES,
    reports: INITIAL_REPORTED_ITEMS,
    testimonials: INITIAL_TESTIMONIALS,
    transactions: [
      {
        id: 'tx-101',
        userId: 'user-2',
        userName: 'Thabo Ndlovu',
        planId: 'plan-gold',
        planName: 'VIP Gold Pan-African',
        amountUsd: 19.99,
        amountZar: 299,
        paymentMethod: 'Instant Bank Transfer (EFT)',
        paymentId: 'TX-9823412',
        status: 'COMPLETE',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'tx-102',
        userId: 'user-6',
        userName: 'Kofi Asante',
        planId: 'plan-elite',
        planName: 'Diaspora Elite Concierge',
        amountUsd: 39.99,
        amountZar: 599,
        paymentMethod: 'Visa / Mastercard Credit',
        paymentId: 'TX-9823413',
        status: 'COMPLETE',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ],
    broadcasts: [],
  };
}

// Load or initialize DB
function loadDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded = JSON.parse(raw);
      if (!loaded.testimonials || loaded.testimonials.length === 0) {
        loaded.testimonials = INITIAL_TESTIMONIALS;
      }
      return loaded;
    }
  } catch (err) {
    console.error('Failed reading DB file, re-initializing...', err);
  }
  const initial = getInitialDbState();
  saveDb(initial);
  return initial;
}

function saveDb(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving DB file', err);
  }
}

// PayFast signature generator
function generatePayFastSignature(
  data: Record<string, string>,
  passPhrase?: string
): string {
  let pfOutput = '';
  // Sort keys alphabetically
  const keys = Object.keys(data).sort();
  for (const key of keys) {
    const val = data[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      pfOutput += `${key}=${encodeURIComponent(String(val).trim()).replace(/%20/g, '+')}&`;
    }
  }
  let pfString = pfOutput.slice(0, -1);
  if (passPhrase) {
    pfString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`;
  }
  return crypto.createHash('md5').update(pfString).digest('hex');
}

// Contact info privacy masking utility: contact numbers and emails must be hidden from everyone
const SERVER_EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
const SERVER_PHONE_PATTERN = /(?:(?:\+?\d{1,4}[-.\s()]*)?(?:\(?\d{2,4}\)?[-.\s()]*)?\d{3,4}[-.\s()]*\d{3,4}(?:[-.\s()]*\d{1,4})?|\b\d{7,15}\b)/g;
const SERVER_SPACED_PHONE_PATTERN = /(?:\b\d[\s.-]){6,}\d\b/g;

function maskContactInfoServer(text: string): string {
  if (!text) return text;
  let masked = text.replace(SERVER_EMAIL_PATTERN, '[Email hidden for privacy]');
  masked = masked.replace(SERVER_SPACED_PHONE_PATTERN, '[Contact number hidden for privacy]');
  masked = masked.replace(SERVER_PHONE_PATTERN, (match) => {
    const digits = match.replace(/\D/g, '');
    if (digits.length >= 7 && digits.length <= 15) {
      return '[Contact number hidden for privacy]';
    }
    return match;
  });
  return masked;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Cross-Origin Resource Sharing (enables Vercel frontend & Expo mobile app access)
  app.use(
    cors({
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // In-memory cache synced with disk
  let db = loadDb();

  // Helper middleware for auth tokens
  const getAuthUser = (req: express.Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '').trim();
    return db.users.find((u) => u.id === token || u.token === token) || null;
  };

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Helper: Calculate age from DOB string (YYYY-MM-DD)
  function calculateAgeFromDob(dobString?: string): number {
    if (!dobString) return 25;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return 25;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // 1. AUTH: Sign Up
  app.post('/api/auth/signup', (req, res) => {
    const {
      name,
      contactNumber,
      phone,
      email,
      dob,
      dateOfBirth,
      password,
      gender,
      orientation,
      showMe,
      country,
      countryCode,
      countryFlag,
      city,
      bio,
      photos,
      interests,
      job,
      company,
      education,
      datingGoal,
    } = req.body;

    const userPhone = (contactNumber || phone || '').trim();
    const userDob = (dob || dateOfBirth || '').trim();

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!userPhone) {
      return res.status(400).json({ error: 'Contact number is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (!userDob) {
      return res.status(400).json({ error: 'Date of birth is required' });
    }

    const calculatedAge = calculateAgeFromDob(userDob);
    if (calculatedAge < 18) {
      return res.status(400).json({ error: 'You must be at least 18 years old to join Fiffy’s Match Making' });
    }

    const userEmail = (email || '').trim().toLowerCase();
    if (userEmail) {
      const existingEmail = db.users.find(
        (u) => u.email && u.email.toLowerCase() === userEmail
      );
      if (existingEmail) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
    }

    // Check if phone already exists
    const existingPhone = db.users.find(
      (u) => (u.phone && u.phone === userPhone) || (u.contactNumber && u.contactNumber === userPhone)
    );
    if (existingPhone) {
      return res.status(409).json({ error: 'An account with this contact number already exists' });
    }

    const newUserId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const defaultPhotos =
      photos && photos.length > 0
        ? photos
        : [
            gender === 'woman'
              ? 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80'
              : 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=800&q=80',
          ];

    // If email was omitted, store an account identifier
    const assignedEmail = userEmail || `${userPhone.replace(/[^0-9]/g, '')}@member.fiffys.com`;

    const newUser = {
      id: newUserId,
      name: name.trim(),
      email: assignedEmail,
      phone: userPhone,
      contactNumber: userPhone,
      dateOfBirth: userDob,
      password, // In real deployment this would be salted bcrypt
      role: 'user',
      age: calculatedAge,
      gender: gender || 'woman',
      orientation: orientation || 'straight',
      showMe: showMe || 'men',
      country: country || 'South Africa',
      countryCode: countryCode || 'ZA',
      countryFlag: countryFlag || '🇿🇦',
      city: city || 'Johannesburg',
      location: `${city || 'Johannesburg'}, ${country || 'South Africa'}`,
      distanceKm: 0,
      bio: bio || 'Excited to meet genuine people on Fiffy’s Match Making!',
      photos: defaultPhotos,
      interests: interests || ['Afrobeats', 'Contemporary Art', 'Specialty Coffee'],
      prompts: [
        {
          id: 'p-new-1',
          question: 'Dating me is like...',
          answer: 'Unwinding after a long week with laughter and great food.',
        },
      ],
      job: job || 'Professional',
      company: company || '',
      education: education || 'Graduate',
      datingGoal: datingGoal || 'Long-term relationship',
      verified: true,
      online: true,
      lastActive: 'Just now',
      isPremium: false,
      premiumTier: 'free',
      boostsRemaining: 1,
      superLikesRemaining: 3,
      boostExpiresAt: null,
      incognito: false,
      hideAge: false,
      hideDistance: false,
      readReceipts: true,
      isDemo: false,
      createdAt: new Date().toISOString(),
      token: newUserId,
    };

    db.users.push(newUser);
    saveDb(db);

    const { password: _, ...userSafe } = newUser;
    res.status(201).json({
      success: true,
      user: userSafe,
      token: newUserId,
    });
  });

  // 2. AUTH: Login (Supports Contact Number or Email)
  app.post('/api/auth/login', (req, res) => {
    const { identifier, email, phone, contactNumber, password } = req.body;
    const loginId = (identifier || email || phone || contactNumber || '').trim().toLowerCase();
    if (!loginId || !password) {
      return res.status(400).json({ error: 'Contact number/email and password are required' });
    }

    const user = db.users.find((u) => {
      const uEmail = (u.email || '').toLowerCase();
      const uPhone = (u.phone || '').trim().toLowerCase();
      const uContact = (u.contactNumber || '').trim().toLowerCase();
      return (
        (uEmail === loginId || uPhone === loginId || uContact === loginId) &&
        u.password === password
      );
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid contact number/email or password' });
    }

    const token = user.id;
    const { password: _, ...userSafe } = user;
    res.json({
      success: true,
      user: userSafe,
      token,
    });
  });

  // 3. AUTH: Admin Login Gate
  app.post('/api/auth/admin-login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Admin email and password required' });
    }

    const admin = db.users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password &&
        u.role === 'admin'
    );

    if (!admin) {
      return res.status(403).json({
        error: 'Invalid administrator credentials. Access restricted to authorized staff.',
      });
    }

    const token = `admin-token-${Date.now()}`;
    const { password: _, ...adminSafe } = admin;
    res.json({
      success: true,
      user: adminSafe,
      token,
    });
  });

  // 4. AUTH: Get Current User
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const user = db.users.find((u) => u.id === token || u.token === token);
    if (!user) {
      return res.status(401).json({ error: 'Session expired' });
    }
    const { password: _, ...userSafe } = user;
    res.json({ user: userSafe });
  });

  // 5. PROFILES: Discovery Deck (filtered by country, gender, etc.)
  app.get('/api/profiles', (req, res) => {
    const { country, gender, showMe } = req.query;
    let profiles = db.users.filter((u) => u.role !== 'admin' && !u.isBanned);

    if (country && country !== 'all') {
      profiles = profiles.filter((p) =>
        p.country?.toLowerCase() === String(country).toLowerCase()
      );
    }

    if (gender && gender !== 'everyone') {
      profiles = profiles.filter((p) => p.gender === gender);
    }

    // Strip passwords, emails, phones, and contactNumbers to ensure contact numbers and emails are hidden from everyone
    const safeProfiles = profiles.map(({ password, email, phone, contactNumber, ...rest }) => ({
      ...rest,
      bio: maskContactInfoServer(rest.bio || ''),
      prompts: (rest.prompts || []).map((pr: any) => ({
        ...pr,
        answer: maskContactInfoServer(pr.answer || ''),
      })),
    }));
    res.json({ profiles: safeProfiles });
  });

  // 6. SWIPES: Record a Swipe & Auto-Match
  app.post('/api/swipes', (req, res) => {
    const { swiperId, swipedId, action } = req.body;
    if (!swiperId || !swipedId || !action) {
      return res.status(400).json({ error: 'Missing required swipe parameters' });
    }

    const swiper = db.users.find((u) => u.id === swiperId);
    const isFreeTier = swiper && !swiper.isPremium && !swiper.isExempt;
    if (isFreeTier && (action === 'like' || action === 'superlike')) {
      return res.status(403).json({
        error: 'Free plan members can only view profiles. Upgrade to Fiffy Plus or VIP Gold to like singles and create matches.',
        requiresUpgrade: true,
      });
    }

    db.swipes.push({
      id: `sw-${Date.now()}`,
      swiperId,
      swipedId,
      action,
      createdAt: new Date().toISOString(),
    });

    let isMatch = false;
    let newMatchObj = null;

    if (action === 'like' || action === 'superlike') {
      // Check if the other person also liked or was a demo profile set to like
      const targetUser = db.users.find((u) => u.id === swipedId);
      const otherLiked =
        targetUser?.likedMe ||
        targetUser?.superLikedMe ||
        db.swipes.some(
          (s) =>
            s.swiperId === swipedId &&
            s.swipedId === swiperId &&
            (s.action === 'like' || s.action === 'superlike')
        );

      if (otherLiked) {
        isMatch = true;
        const matchId = `match-${Date.now()}`;
        const targetSafe = targetUser ? { ...targetUser } : null;
        if (targetSafe) {
          delete (targetSafe as any).password;
          delete (targetSafe as any).email;
          delete (targetSafe as any).phone;
          delete (targetSafe as any).contactNumber;
        }

        newMatchObj = {
          id: matchId,
          userId: swipedId,
          user: targetSafe,
          matchedAt: 'Just now',
          lastMessage: 'You matched! Say Sawubona or send an icebreaker.',
          lastMessageTime: 'Just now',
          unreadCount: 0,
          isSuperMatch: action === 'superlike',
        };

        db.matches.unshift(newMatchObj);
        db.messages[matchId] = [];
      }
    }

    saveDb(db);
    res.json({ success: true, isMatch, match: newMatchObj });
  });

  // 7. MATCHES: Get User Matches
  app.get('/api/matches', (req, res) => {
    const safeMatches = (db.matches || []).map((m) => {
      if (!m.user) return m;
      const { password, email, phone, contactNumber, ...userSafe } = m.user as any;
      return {
        ...m,
        lastMessage: m.lastMessage ? maskContactInfoServer(m.lastMessage) : m.lastMessage,
        user: {
          ...userSafe,
          bio: maskContactInfoServer(userSafe.bio || ''),
        },
      };
    });
    res.json({ matches: safeMatches });
  });

  // 8. MESSAGES: Get & Send
  app.get('/api/messages/:matchId', (req, res) => {
    const { matchId } = req.params;
    const rawMsgs = db.messages[matchId] || [];
    const safeMsgs = rawMsgs.map((m) => ({
      ...m,
      text: maskContactInfoServer(m.text || ''),
    }));
    res.json({ messages: safeMsgs });
  });

  app.post('/api/messages', (req, res) => {
    const { matchId, senderId, text, imageUrl } = req.body;
    if (!matchId || !text) {
      return res.status(400).json({ error: 'matchId and text required' });
    }

    const sender = db.users.find((u) => u.id === senderId);
    const isFreeTier = sender && !sender.isPremium && !sender.isExempt;
    if (isFreeTier) {
      return res.status(403).json({
        error: 'Free plan members cannot chat. Upgrade to VIP to send direct messages.',
        requiresUpgrade: true,
      });
    }

    if (!db.messages[matchId]) {
      db.messages[matchId] = [];
    }

    const sanitizedText = maskContactInfoServer(text);

    const newMsg = {
      id: `msg-${Date.now()}`,
      matchId,
      senderId: senderId || 'me',
      text: sanitizedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: imageUrl || null,
      isRead: true,
      reactions: [],
    };

    db.messages[matchId].push(newMsg);

    // Update match last message
    const match = db.matches.find((m) => m.id === matchId);
    if (match) {
      match.lastMessage = sanitizedText;
      match.lastMessageTime = 'Just now';
    }

    saveDb(db);
    res.status(201).json({ success: true, message: newMsg });
  });

  // 8.5 ACTIVE SINGLES STATS (Backed dynamically by real database records)
  app.get('/api/active-singles-stats', (req, res) => {
    const activeMembers = db.users.filter((u) => u.role !== 'admin' && !u.isBanned);
    const totalActive = activeMembers.length;

    const countryMap: Record<string, { country: string; countryCode: string; countryFlag: string; count: number }> = {};

    for (const u of activeMembers) {
      const cName = u.country || 'South Africa';
      const cCode = u.countryCode || 'ZA';
      const cFlag = u.countryFlag || '🇿🇦';
      if (!countryMap[cName]) {
        countryMap[cName] = { country: cName, countryCode: cCode, countryFlag: cFlag, count: 0 };
      }
      countryMap[cName].count++;
    }

    const activeCountries = Object.values(countryMap).sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      totalActive,
      hubCount: activeCountries.length,
      activeCountries,
    });
  });

  // 8.6 PUBLIC SUBSCRIPTION PLANS & ADMIN-CONFIGURED CURRENCY
  app.get('/api/plans', (req, res) => {
    const currency = db.adminSettings?.currency || 'USD';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    res.json({
      success: true,
      plans: db.subscriptionPlans,
      currency,
      currencySymbol,
    });
  });

  // 9. ADMIN: Get & Manage Subscription Plans
  app.get('/api/admin/subscriptions', (req, res) => {
    const currency = db.adminSettings?.currency || 'USD';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    res.json({ plans: db.subscriptionPlans, currency, currencySymbol });
  });

  app.post('/api/admin/subscriptions', (req, res) => {
    const plan = req.body;
    if (!plan.name || (!plan.priceUsd && !plan.priceZar)) {
      return res.status(400).json({ error: 'Plan name and price in USD are required' });
    }

    const priceUsd = Number(plan.priceUsd) || (Number(plan.priceZar) ? Number(plan.priceZar) / 18 : 19.99);
    const priceZar = Number(plan.priceZar) || Math.round(priceUsd * 18);

    const existingIdx = db.subscriptionPlans.findIndex((p) => p.id === plan.id);
    if (existingIdx >= 0) {
      db.subscriptionPlans[existingIdx] = {
        ...db.subscriptionPlans[existingIdx],
        ...plan,
        priceUsd,
        priceZar,
      };
    } else {
      const newPlan = {
        id: plan.id || `plan-${Date.now()}`,
        name: plan.name,
        priceUsd,
        priceZar,
        billingCycle: plan.billingCycle || 'monthly',
        description: plan.description || '',
        features: plan.features || [],
        badge: plan.badge || '',
        itemCode: plan.itemCode || `FIFFY_${Date.now()}`,
        isActive: plan.isActive !== undefined ? plan.isActive : true,
        isPopular: !!plan.isPopular,
      };
      db.subscriptionPlans.push(newPlan);
    }

    saveDb(db);
    res.json({ success: true, plans: db.subscriptionPlans });
  });

  app.delete('/api/admin/subscriptions/:id', (req, res) => {
    const { id } = req.params;
    db.subscriptionPlans = db.subscriptionPlans.filter((p) => p.id !== id);
    saveDb(db);
    res.json({ success: true, plans: db.subscriptionPlans });
  });

  // 10. ADMIN: Get & Update PayFast Gateway Config
  app.get('/api/admin/payfast-config', (req, res) => {
    res.json({ config: db.payfastConfig });
  });

  app.put('/api/admin/payfast-config', (req, res) => {
    const newConfig = req.body;
    db.payfastConfig = {
      ...db.payfastConfig,
      ...newConfig,
    };
    saveDb(db);
    res.json({ success: true, config: db.payfastConfig });
  });

  // 11. PAYFAST: Initiate Payment Payload with MD5 Signature
  app.post('/api/payfast/initiate', (req, res) => {
    const { planId, userId, returnUrl, cancelUrl } = req.body;
    const plan = db.subscriptionPlans.find((p) => p.id === planId);
    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    const user = db.users.find((u) => u.id === userId) || INITIAL_CURRENT_USER;
    const config = db.payfastConfig || DEFAULT_PAYFAST_CONFIG;

    const mPaymentId = `FIFFY-SUB-${Date.now()}-${user.id}`;
    const amountStr = Number(plan.priceZar).toFixed(2);

    const nameParts = (user.name || 'Fiffy Member').split(' ');
    const firstName = nameParts[0] || 'Valued';
    const lastName = nameParts.slice(1).join(' ') || 'Member';

    // PayFast required parameters
    const paymentData: Record<string, string> = {
      merchant_id: config.merchantId || '10000100',
      merchant_key: config.merchantKey || '46f0cd694581a',
      return_url: returnUrl || 'https://fiffys.app/payment/success',
      cancel_url: cancelUrl || 'https://fiffys.app/payment/cancel',
      notify_url: config.notifyUrl || 'https://fiffys.app/api/payfast/notify',
      name_first: firstName,
      name_last: lastName,
      email_address: user.email || 'customer@fiffys.com',
      m_payment_id: mPaymentId,
      amount: amountStr,
      item_name: plan.name,
      item_description: plan.description || `${plan.name} Monthly Membership`,
    };

    // Calculate official PayFast MD5 signature
    const signature = generatePayFastSignature(
      paymentData,
      config.passPhrase || 'fiffy_payfast_secret_pass'
    );

    const processUrl = config.isSandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';

    res.json({
      success: true,
      processUrl,
      paymentData: {
        ...paymentData,
        signature,
      },
      plan,
    });
  });

  // 12. PAYMENTS: Complete Transaction (Instant Activation)
  app.post('/api/payfast/complete', (req, res) => {
    const { userId, planId, payfastPaymentId, paymentMethod } = req.body;
    let plan = (db.subscriptionPlans || []).find((p) => p.id === planId);
    if (!plan && planId === 'plan-boost') {
      plan = {
        id: 'plan-boost',
        name: 'Instant Spotlight Boost',
        priceUsd: 2.99,
        priceZar: 49,
        billingCycle: 'one-time',
        badge: 'Spotlight',
        description: '10x profile visibility in your city for 30 minutes.',
        features: ['10x placement in discovery deck', 'Instant 30-minute city spotlight'],
        isActive: true,
      };
    }
    const user = (db.users || []).find((u) => u.id === userId);

    if (user && plan) {
      const isBoostPlan = plan.id === 'plan-boost' || plan.name.toLowerCase().includes('boost');

      if (isBoostPlan) {
        user.boostsRemaining = (user.boostsRemaining || 0) + 1;
      } else {
        user.isPremium = true;
        user.premiumTier = plan.name.toLowerCase().includes('elite')
          ? 'elite'
          : plan.name.toLowerCase().includes('gold')
          ? 'gold'
          : 'plus';
        user.boostsRemaining = (user.boostsRemaining || 0) + 3;
        user.superLikesRemaining = (user.superLikesRemaining || 0) + 10;
      }

      const amountUsd = plan.priceUsd || (isBoostPlan ? 2.99 : 19.99);
      // Add to transaction history
      const tx = {
        id: `tx-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        planId: plan.id,
        planName: plan.name,
        amountUsd: amountUsd,
        amountZar: plan.priceZar || Math.round(amountUsd * 18),
        paymentMethod: paymentMethod || 'PayFast Hosted Gateway',
        paymentId: payfastPaymentId || `TX-${Math.floor(1000000 + Math.random() * 9000000)}`,
        status: 'COMPLETE',
        createdAt: new Date().toISOString(),
      };

      db.transactions.unshift(tx);
      saveDb(db);

      const { password: _, ...userSafe } = user;
      return res.json({
        success: true,
        message: isBoostPlan ? 'Spotlight Boost activated!' : 'Subscription successfully activated!',
        user: userSafe,
        transaction: tx,
      });
    }

    res.status(400).json({ error: 'Invalid user or plan for payment activation' });
  });

  // 13. TESTIMONIALS: Public & Submission
  app.get('/api/testimonials', (req, res) => {
    const list = (db.testimonials || []).filter((t) => {
      if (!t) return false;
      if (t.status && t.status !== 'published') return false;
      const text = (t.quote || t.story || t.storyDetails || '').trim();
      return text.length > 0;
    });
    res.json({ testimonials: list });
  });

  app.post('/api/testimonials/submit', (req, res) => {
    const { coupleNames, locations, location, photoUrl, userPhoto, quote, story, storyDetails, weddingDate, metDate, submittedBy } = req.body;
    const resolvedStory = quote || story || '';
    if (!coupleNames || !resolvedStory) {
      return res.status(400).json({ error: 'Couple names and quote/story are required' });
    }

    const resolvedLocation = locations || location || 'Global African Match';
    const resolvedPhoto = photoUrl || userPhoto || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80';

    const newTestimonial = {
      id: `test-${Date.now()}`,
      coupleNames,
      locations: resolvedLocation,
      location: resolvedLocation,
      photoUrl: resolvedPhoto,
      userPhoto: resolvedPhoto,
      quote: resolvedStory,
      story: resolvedStory,
      storyDetails: storyDetails || '',
      weddingDate: weddingDate || metDate || '',
      metDate: metDate || weddingDate || 'Matched on Fiffy',
      verified: true,
      status: 'published',
      submittedBy: submittedBy || 'Community Member',
      createdAt: new Date().toISOString(),
    };

    if (!db.testimonials) db.testimonials = [];
    db.testimonials.unshift(newTestimonial);
    saveDb(db);
    res.status(201).json({ success: true, testimonial: newTestimonial });
  });

  // ADMIN: Testimonials Management
  app.get('/api/admin/testimonials', (req, res) => {
    res.json({ testimonials: db.testimonials || [] });
  });

  app.post('/api/admin/testimonials', (req, res) => {
    const item = req.body;
    if (!db.testimonials) db.testimonials = [];

    const existingIdx = db.testimonials.findIndex((t) => t.id === item.id);
    const resolvedQuote = item.quote || item.story || '';
    const resolvedLocation = item.location || item.locations || 'Global African Community';
    const resolvedPhoto = item.userPhoto || item.photoUrl || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80';

    if (existingIdx >= 0) {
      db.testimonials[existingIdx] = {
        ...db.testimonials[existingIdx],
        ...item,
        quote: resolvedQuote || db.testimonials[existingIdx].quote || '',
        story: resolvedQuote || db.testimonials[existingIdx].story || '',
        location: resolvedLocation,
        locations: resolvedLocation,
        userPhoto: resolvedPhoto,
        photoUrl: resolvedPhoto,
      };
    } else {
      const newItem = {
        id: item.id || `test-${Date.now()}`,
        coupleNames: item.coupleNames || 'Community Couple',
        locations: resolvedLocation,
        location: resolvedLocation,
        photoUrl: resolvedPhoto,
        userPhoto: resolvedPhoto,
        partnerPhoto: item.partnerPhoto || '',
        quote: resolvedQuote,
        story: resolvedQuote,
        storyDetails: item.storyDetails || '',
        weddingDate: item.weddingDate || item.metDate || '',
        metDate: item.metDate || item.weddingDate || 'Matched on Fiffy',
        country: item.country || '',
        countryFlag: item.countryFlag || '🌍',
        rating: item.rating || 5,
        isFeatured: item.isFeatured !== undefined ? item.isFeatured : true,
        verified: item.verified !== undefined ? item.verified : true,
        status: item.status || 'published',
        createdAt: new Date().toISOString(),
      };
      db.testimonials.unshift(newItem);
    }
    saveDb(db);
    res.json({ success: true, testimonials: db.testimonials });
  });

  app.delete('/api/admin/testimonials/:id', (req, res) => {
    const { id } = req.params;
    db.testimonials = (db.testimonials || []).filter((t) => t.id !== id);
    saveDb(db);
    res.json({ success: true, testimonials: db.testimonials });
  });

  // 14. ADMIN: Users Management & VIP Exceptions
  app.post('/api/admin/users', (req, res) => {
    const {
      name,
      contactNumber,
      phone,
      email,
      dob,
      dateOfBirth,
      password,
      age,
      gender,
      orientation,
      job,
      country,
      countryCode,
      countryFlag,
      city,
      bio,
      photos,
      isExempt,
      isPremium,
      premiumTier,
      role,
    } = req.body;

    const userPhone = (contactNumber || phone || `+27 82 ${Math.floor(1000000 + Math.random() * 9000000)}`).trim();
    const userDob = (dob || dateOfBirth || '').trim();
    const calculatedAge = userDob ? calculateAgeFromDob(userDob) : (Number(age) || 28);

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const assignedEmail = (email || '').trim().toLowerCase() || `${userPhone.replace(/[^0-9]/g, '')}@member.fiffys.com`;
    const emailTaken = db.users.some((u) => u.email && u.email.toLowerCase() === assignedEmail);
    if (email && emailTaken) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: assignedEmail,
      password: password || 'fiffy2026',
      phone: userPhone,
      contactNumber: userPhone,
      dateOfBirth: userDob || '1998-05-14',
      age: calculatedAge,
      gender: gender || 'Woman',
      orientation: orientation || 'Straight',
      showMe: gender === 'Woman' ? 'Men' : 'Women',
      job: job || 'Professional',
      country: country || 'South Africa',
      countryCode: countryCode || 'ZA',
      countryFlag: countryFlag || '🇿🇦',
      city: city || 'Johannesburg',
      distanceKm: 0,
      bio: bio || 'Excited to connect with meaningful African singles across the continent and diaspora.',
      photos: photos && photos.length > 0 ? photos : [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      ],
      education: 'Graduate Degree',
      interests: ['Afrobeats', 'Travel in Africa', 'Contemporary Art', 'Cooking'],
      prompts: [
        { id: 'p1', question: 'Dating me is like...', answer: 'A journey of growth, laughter, and cultural pride.' },
      ],
      datingGoal: 'Long-term relationship',
      verified: true,
      online: true,
      lastActive: 'Just now',
      isExempt: !!isExempt,
      isPremium: isExempt ? true : !!isPremium,
      premiumTier: isExempt ? 'elite' : (premiumTier || 'free'),
      dailySwipesUsed: 0,
      boostsRemaining: isExempt ? 99 : 1,
      superLikesRemaining: isExempt ? 99 : 3,
      boostExpiresAt: null,
      incognito: false,
      hideAge: false,
      hideDistance: false,
      readReceipts: true,
      role: role || 'user',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    db.users.unshift(newUser);
    saveDb(db);

    const { password: _, ...userSafe } = newUser;
    res.status(201).json({ success: true, user: userSafe });
  });

  // Toggle VIP Exemption on any user
  app.put('/api/admin/users/:id/exemption', (req, res) => {
    const { id } = req.params;
    const { isExempt } = req.body;
    const user = db.users.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isExempt = isExempt !== undefined ? isExempt : !user.isExempt;
    if (user.isExempt) {
      user.isPremium = true;
      user.premiumTier = 'elite';
      user.boostsRemaining = 99;
      user.superLikesRemaining = 99;
    }

    saveDb(db);
    const { password: _, ...userSafe } = user;
    res.json({ success: true, user: userSafe, isExempt: user.isExempt });
  });

  app.put('/api/admin/users/:id', (req, res) => {
    const { id } = req.params;
    const user = db.users.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    Object.assign(user, req.body);
    saveDb(db);
    const { password: _, ...userSafe } = user;
    res.json({ success: true, user: userSafe });
  });

  app.delete('/api/admin/users/:id', (req, res) => {
    const { id } = req.params;
    if (id === 'admin-1') {
      return res.status(400).json({ error: 'Cannot delete primary admin' });
    }
    db.users = db.users.filter((u) => u.id !== id);
    saveDb(db);
    res.json({ success: true, message: 'User deleted successfully' });
  });

  // 15. ADMIN: Reset or Clear Demo Data
  app.post('/api/admin/clear-demo-data', (req, res) => {
    db.users = db.users.filter((u) => !u.isDemo);
    saveDb(db);
    res.json({
      success: true,
      message: 'Demo profiles removed. Platform is now running in clean live mode with registered users only.',
      remainingUsersCount: db.users.length,
    });
  });

  app.post('/api/admin/reset-demo-data', (req, res) => {
    db = getInitialDbState();
    saveDb(db);
    res.json({
      success: true,
      message: 'Initial African demo profiles, plans, and love stories have been re-seeded.',
    });
  });

  // 16. ADMIN: Business Metrics & Ledger (USD primary)
  app.get('/api/admin/metrics', (req, res) => {
    const totalMembers = db.users.filter((u) => u.role !== 'admin').length;
    const premiumCount = db.users.filter((u) => u.isPremium).length;
    const exemptCount = db.users.filter((u) => u.isExempt).length;
    
    // Revenue in USD ($)
    const totalRevenueUsd = db.transactions.reduce((sum, t) => {
      const amt = Number(t.amountUsd) || (Number(t.amountZar) ? Number(t.amountZar) / 18 : 0);
      return sum + amt;
    }, 0);

    const mrrUsd = db.subscriptionPlans.reduce((sum, p) => {
      const subscribers = db.users.filter(
        (u) => !u.isExempt && u.isPremium && u.premiumTier === (p.name.includes('Gold') ? 'gold' : p.name.includes('Elite') ? 'elite' : 'plus')
      ).length;
      const planPrice = p.priceUsd || (p.priceZar ? p.priceZar / 18 : 19.99);
      return sum + subscribers * planPrice;
    }, 0);

    const countriesCount: Record<string, number> = {};
    for (const u of db.users) {
      if (u.country) {
        countriesCount[u.country] = (countriesCount[u.country] || 0) + 1;
      }
    }

    res.json({
      totalMembers,
      premiumCount,
      exemptCount,
      totalRevenueUsd: Math.round(totalRevenueUsd * 100) / 100,
      mrrUsd: Math.round((mrrUsd || 450) * 100) / 100,
      totalRevenueZar: Math.round(totalRevenueUsd * 18),
      mrrZar: Math.round((mrrUsd || 450) * 18),
      transactions: db.transactions,
      reports: db.reports,
      countryBreakdown: countriesCount,
    });
  });

  // 17. ADMIN: List all registered DB users
  app.get('/api/admin/users', (req, res) => {
    // Contact numbers and emails must be hidden from everyone
    const safeUsers = db.users.map(({ password: _, email: _e, phone: _p, contactNumber: _c, ...u }) => ({
      ...u,
      email: '[Hidden for Privacy]',
      phone: '[Hidden for Privacy]',
      contactNumber: '[Hidden for Privacy]',
    }));
    res.json({ users: safeUsers });
  });

  // -------------------------------------------------------------
  // VITE & STATIC MIDDLEWARE
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fiffy's Match Making server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
