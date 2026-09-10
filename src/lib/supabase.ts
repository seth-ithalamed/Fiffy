import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default / fallback configuration
const DEFAULT_SUPABASE_URL = 'https://fiffys-matchmaking.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fiffy-demo-placeholder-anon-key';

let cachedClient: SupabaseClient | null = null;

export function getStoredSupabaseConfig(): { url: string; anonKey: string; isConnected: boolean } {
  try {
    const raw = localStorage.getItem('fiffy_supabase_config');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read Supabase config from storage', e);
  }
  return {
    url: DEFAULT_SUPABASE_URL,
    anonKey: DEFAULT_SUPABASE_ANON_KEY,
    isConnected: false,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  try {
    localStorage.setItem(
      'fiffy_supabase_config',
      JSON.stringify({ url, anonKey, isConnected: true })
    );
    cachedClient = createClient(url, anonKey);
  } catch (e) {
    console.error('Failed to save Supabase config', e);
  }
}

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const { url, anonKey } = getStoredSupabaseConfig();
  try {
    cachedClient = createClient(url || DEFAULT_SUPABASE_URL, anonKey || DEFAULT_SUPABASE_ANON_KEY);
  } catch {
    cachedClient = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
  }
  return cachedClient;
}

// Complete ready-to-run Supabase PostgreSQL Schema DDL script
export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- FIFFY'S MATCH MAKING - PRODUCTION RELATIONAL SUPABASE SCHEMA
-- Built for High-Volume Dating, Geolocation, Realtime Chat & Subscriptions
-- All entities are stored in dedicated relational tables with Foreign Keys
-- =========================================================================

-- Clean up any legacy single-blob state table
DROP TABLE IF EXISTS public.fiffy_app_state CASCADE;

-- 1. Enable PostGIS (for fast geospatial distance calculation) & UUID generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- 2. Custom ENUM Types (wrapped in idempotent DO blocks)
DO $$ BEGIN
  CREATE TYPE gender_type AS ENUM ('woman', 'man', 'non-binary', 'genderfluid', 'agender', 'transgender', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE orientation_type AS ENUM ('straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'queer', 'asexual', 'questioning');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE show_me_type AS ENUM ('everyone', 'women', 'men', 'non-binary');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE swipe_action_type AS ENUM ('pass', 'like', 'superlike');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. PROFILES TABLE (Core Member Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  contact_number TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  phone_verified_at TIMESTAMPTZ,
  active_session_token TEXT,
  last_login_at TIMESTAMPTZ,
  date_of_birth TEXT,
  password TEXT,
  role TEXT DEFAULT 'user',
  age INTEGER NOT NULL CHECK (age >= 18),
  gender TEXT NOT NULL,
  gender_custom TEXT,
  orientation TEXT NOT NULL,
  show_me TEXT DEFAULT 'everyone',
  bio TEXT DEFAULT '',
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  job TEXT DEFAULT '',
  company TEXT DEFAULT '',
  education TEXT DEFAULT '',
  location TEXT DEFAULT '',
  city TEXT DEFAULT 'Johannesburg',
  country TEXT DEFAULT 'South Africa',
  country_code TEXT DEFAULT 'ZA',
  country_flag TEXT DEFAULT '🇿🇦',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  dating_goal TEXT DEFAULT 'Long-term relationship',
  verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'unverified',
  is_premium BOOLEAN DEFAULT FALSE,
  premium_tier TEXT DEFAULT 'free',
  is_exempt BOOLEAN DEFAULT FALSE,
  daily_swipes_used INTEGER DEFAULT 0,
  boosts_remaining INTEGER DEFAULT 1,
  super_likes_remaining INTEGER DEFAULT 3,
  boost_expires_at TIMESTAMPTZ,
  incognito BOOLEAN DEFAULT FALSE,
  hide_age BOOLEAN DEFAULT FALSE,
  hide_distance BOOLEAN DEFAULT FALSE,
  read_receipts BOOLEAN DEFAULT TRUE,
  online BOOLEAN DEFAULT TRUE,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strict 1-account-per-phone constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique ON public.profiles(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_active_session ON public.profiles(active_session_token) WHERE active_session_token IS NOT NULL;

-- 3. PROFILE PROMPTS TABLE (Icebreakers: 1-to-many relationship with profiles)
CREATE TABLE IF NOT EXISTS public.profile_prompts (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SWIPES TABLE (Audited likes, passes, superlikes with Foreign Keys to profiles)
CREATE TABLE IF NOT EXISTS public.swipes (
  id TEXT PRIMARY KEY,
  swiper_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  swiped_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('pass', 'like', 'superlike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_swiper_swiped UNIQUE (swiper_id, swiped_id)
);

-- 5. MATCHES TABLE (Created on mutual likes; relationships with user_a and user_b)
CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY,
  user_a TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_super_match BOOLEAN DEFAULT FALSE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_match_pair UNIQUE (user_a, user_b)
);

-- 6. MESSAGES TABLE (Realtime chat; 1-to-many relationship with matches and profiles)
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  reactions JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Supabase Realtime for instant messaging
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 7. SUBSCRIPTION PLANS TABLE
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL,
  price_zar NUMERIC(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  badge TEXT,
  description TEXT,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  payfast_item_code TEXT,
  item_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TRANSACTIONS / PAYMENTS TABLE (Linked to profiles and subscription_plans)
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  plan_id TEXT REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  plan_name TEXT,
  amount_usd NUMERIC(10,2),
  amount_zar NUMERIC(10,2),
  payment_method TEXT DEFAULT 'PayFast Hosted Gateway',
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'COMPLETE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. REPORTS TABLE (Safety & Moderation; relationships with reporter & reported profiles)
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  reporter_name TEXT,
  reported_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_name TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BLOCKS TABLE (Relationships between blocker and blocked profiles)
CREATE TABLE IF NOT EXISTS public.blocks (
  id TEXT PRIMARY KEY,
  blocker_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_blocker_blocked UNIQUE (blocker_id, blocked_id)
);

-- 11. ADMIN SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  payments_enabled BOOLEAN DEFAULT TRUE,
  payment_model TEXT DEFAULT 'subscription',
  currency TEXT DEFAULT 'USD',
  payfast_merchant_id TEXT DEFAULT '10000100',
  payfast_merchant_key TEXT DEFAULT '46f0cd694581a',
  payfast_passphrase TEXT DEFAULT 'fiffy_secret_gateway_pass',
  payfast_sandbox BOOLEAN DEFAULT TRUE,
  require_id_verification BOOLEAN DEFAULT FALSE,
  minimum_age INTEGER DEFAULT 18,
  max_distance_km INTEGER DEFAULT 15000,
  free_daily_swipes INTEGER DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PLATFORM MANAGERS TABLE (Staff & Governance Credentials)
CREATE TABLE IF NOT EXISTS public.platform_managers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL,
  department TEXT,
  status TEXT DEFAULT 'active',
  is_root_admin BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. BROADCASTS TABLE (Push Notifications & Announcements; linked to manager)
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_filter TEXT DEFAULT 'all',
  sent_by TEXT REFERENCES public.platform_managers(id) ON DELETE SET NULL,
  delivery_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. TESTIMONIALS TABLE (Success Stories & Reviews)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY,
  couple_names TEXT NOT NULL,
  locations TEXT NOT NULL,
  location TEXT,
  quote TEXT NOT NULL,
  story TEXT,
  story_details TEXT,
  wedding_date TEXT,
  met_date TEXT,
  photo_url TEXT,
  user_photo TEXT,
  partner_photo TEXT,
  country TEXT,
  country_flag TEXT DEFAULT '🌍',
  rating INTEGER DEFAULT 5,
  is_featured BOOLEAN DEFAULT TRUE,
  verified BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'published',
  submitted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. FCM PUSH NOTIFICATION TOKENS TABLE (Linked to profiles)
CREATE TABLE IF NOT EXISTS public.fcm_tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT,
  preferences JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. FOREIGN KEY INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_prompts_profile ON public.profile_prompts(profile_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON public.swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped ON public.swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_a ON public.matches(user_a);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON public.matches(user_b);
CREATE INDEX IF NOT EXISTS idx_messages_match ON public.messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_plan ON public.transactions(plan_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON public.reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON public.blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_broadcasts_sent_by ON public.broadcasts(sent_by);
CREATE INDEX IF NOT EXISTS idx_fcm_user ON public.fcm_tokens(user_id);

-- 17. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Allow full access to backend service role across all tables
DROP POLICY IF EXISTS "service_role_profiles" ON public.profiles;
CREATE POLICY "service_role_profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "service_role_prompts" ON public.profile_prompts;
CREATE POLICY "service_role_prompts" ON public.profile_prompts FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "service_role_swipes" ON public.swipes;
CREATE POLICY "service_role_swipes" ON public.swipes FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "service_role_matches" ON public.matches;
CREATE POLICY "service_role_matches" ON public.matches FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "service_role_messages" ON public.messages;
CREATE POLICY "service_role_messages" ON public.messages FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "service_role_plans" ON public.subscription_plans;
CREATE POLICY "service_role_plans" ON public.subscription_plans FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "service_role_transactions" ON public.transactions;
CREATE POLICY "service_role_transactions" ON public.transactions FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "service_role_reports" ON public.reports;
CREATE POLICY "service_role_reports" ON public.reports FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "service_role_blocks" ON public.blocks;
CREATE POLICY "service_role_blocks" ON public.blocks FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "service_role_settings" ON public.admin_settings;
CREATE POLICY "service_role_settings" ON public.admin_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "service_role_managers" ON public.platform_managers;
CREATE POLICY "service_role_managers" ON public.platform_managers FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "service_role_broadcasts" ON public.broadcasts;
CREATE POLICY "service_role_broadcasts" ON public.broadcasts FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "service_role_testimonials" ON public.testimonials;
CREATE POLICY "service_role_testimonials" ON public.testimonials FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "service_role_fcm" ON public.fcm_tokens;
CREATE POLICY "service_role_fcm" ON public.fcm_tokens FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public read policies for active profiles, plans, testimonials and settings
DROP POLICY IF EXISTS "anon_read_profiles" ON public.profiles;
CREATE POLICY "anon_read_profiles" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_profiles" ON public.profiles;
CREATE POLICY "anon_write_profiles" ON public.profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_profiles" ON public.profiles;
CREATE POLICY "anon_update_profiles" ON public.profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read_prompts" ON public.profile_prompts;
CREATE POLICY "anon_read_prompts" ON public.profile_prompts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_prompts" ON public.profile_prompts;
CREATE POLICY "anon_write_prompts" ON public.profile_prompts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read_plans" ON public.subscription_plans;
CREATE POLICY "anon_read_plans" ON public.subscription_plans FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_settings" ON public.admin_settings;
CREATE POLICY "anon_read_settings" ON public.admin_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_testimonials" ON public.testimonials;
CREATE POLICY "anon_read_testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "anon_read_messages" ON public.messages;
CREATE POLICY "anon_read_messages" ON public.messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_swipes" ON public.swipes;
CREATE POLICY "anon_swipes" ON public.swipes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_matches" ON public.matches;
CREATE POLICY "anon_matches" ON public.matches FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 18. AUTO-MATCH TRIGGER ON MUTUAL LIKE
CREATE OR REPLACE FUNCTION handle_mutual_swipe()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action IN ('like', 'superlike') THEN
    IF EXISTS (
      SELECT 1 FROM public.swipes
      WHERE swiper_id = NEW.swiped_id
        AND swiped_id = NEW.swiper_id
        AND action IN ('like', 'superlike')
    ) THEN
      INSERT INTO public.matches (id, user_a, user_b, is_super_match)
      VALUES (
        'match-' || floor(extract(epoch from now()) * 1000)::text,
        LEAST(NEW.swiper_id, NEW.swiped_id),
        GREATEST(NEW.swiper_id, NEW.swiped_id),
        NEW.action = 'superlike'
      )
      ON CONFLICT (user_a, user_b) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_swipe_inserted ON public.swipes;
CREATE TRIGGER on_swipe_inserted
AFTER INSERT ON public.swipes
FOR EACH ROW EXECUTE FUNCTION handle_mutual_swipe();

-- 19. SEED DEFAULT SUBSCRIPTION TIERS
INSERT INTO public.subscription_plans (id, name, price_usd, price_zar, billing_cycle, badge, description, features, payfast_item_code, item_code, is_active, is_popular)
VALUES
  ('plan-plus', 'Fiffy Plus', 9.99, 149.00, 'monthly', NULL, 'Essential upgrades for active singles seeking romance in their city.', ARRAY['Unlimited likes every 24 hours', '5 free SuperLikes per week', 'Rewind your last accidental swipe', 'See who liked your profile before swiping', 'No third-party advertising'], 'FIFFY_SUB_PLUS_M', 'FIFFY_SUB_PLUS_USD', true, false),
  ('plan-gold', 'VIP Gold Pan-African', 19.99, 299.00, 'monthly', 'Most Popular', 'Unlock cross-border passport matching across Africa and the global diaspora.', ARRAY['All Fiffy Plus features included', 'Cross-Border Passport: Match in any African country or Diaspora', '1 Free Monthly Profile Boost (10x visibility)', 'Verified VIP Golden Badge on profile', 'Read Receipts on all chats', 'Priority delivery for all messages'], 'FIFFY_SUB_GOLD_M', 'FIFFY_SUB_GOLD_USD', true, true),
  ('plan-elite', 'Diaspora Elite Concierge', 39.99, 599.00, 'monthly', 'Executive', 'The premier tier for serious professionals and international African diaspora.', ARRAY['All VIP Gold features included', 'Exclusive verified executive pool', 'Dedicated concierge relationship advisor', 'Unlimited profile boosts per month', 'Priority customer support via WhatsApp', 'Complimentary access to annual Diaspora Singles Gala'], 'FIFFY_SUB_ELITE_M', 'FIFFY_SUB_ELITE_USD', true, false),
  ('plan-boost', 'Instant Spotlight Boost', 2.99, 49.00, 'one-time', 'Spotlight', '10x profile visibility in your city for 30 minutes. Be shown first to active singles.', ARRAY['10x higher card placement in discover deck', '30 minutes of priority local spotlight', 'Instant activation upon gateway payment', 'Decoded securely via PayFast / ClicknPay'], 'FIFFY_BOOST_SPOTLIGHT', 'FIFFY_BOOST_USD', true, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_usd = EXCLUDED.price_usd,
  price_zar = EXCLUDED.price_zar,
  features = EXCLUDED.features,
  description = EXCLUDED.description;

-- 20. SEED DEFAULT ADMIN SETTINGS & PAYFAST GATEWAY CONFIGURATION
INSERT INTO public.admin_settings (id, payments_enabled, payment_model, currency, payfast_merchant_id, payfast_merchant_key, payfast_passphrase, payfast_sandbox, require_id_verification, minimum_age, max_distance_km, free_daily_swipes)
VALUES ('default', true, 'subscription', 'USD', '10000100', '46f0cd694581a', 'fiffy_secret_gateway_pass', true, false, 18, 15000, 5)
ON CONFLICT (id) DO NOTHING;

-- 21. SEED PLATFORM MANAGERS & ROOT ADMIN CREDENTIALS
INSERT INTO public.platform_managers (id, name, email, phone, role, department, status, is_root_admin, avatar_url, password)
VALUES
  ('mgr-root', 'Executive Admin', 'admin@fiffy.com', '+27 82 000 0001', 'co_admin', 'Platform Governance & Executive Operations', 'active', true, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', 'admin123'),
  ('mgr-2', 'Kudzi Moyo', 'kudzi.moyo@fiffys.com', '+263 77 234 5678', 'moderator', 'Harare Trust & Safety Hub', 'active', false, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', 'manager2026'),
  ('mgr-3', 'Tariro Chikore', 'tariro.chikore@fiffys.com', '+27 82 456 7890', 'support_vip', 'Johannesburg VIP Concierge Desk', 'active', false, 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80', 'manager2026'),
  ('mgr-4', 'Farai Nkomo', 'farai.nkomo@fiffys.com', '+44 77 0090 0123', 'content_manager', 'London Diaspora Outreach & Love Stories', 'active', false, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', 'manager2026')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  password = EXCLUDED.password;
`;
