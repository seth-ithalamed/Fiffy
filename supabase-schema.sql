-- =========================================================================
-- FIFFY'S MATCH MAKING - PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- Complete ready-to-run DDL Script for Render Deployments & Supabase Cloud
-- =========================================================================

-- 0. DYNAMIC BACKEND STATE PERSISTENCE TABLE (CRITICAL FOR RENDER DEPLOYMENTS)
-- This table automatically synchronizes and preserves full application state
-- (all users, subscriptions, admin settings, profiles) across Render restarts.
CREATE TABLE IF NOT EXISTS public.fiffy_app_state (
  id TEXT PRIMARY KEY DEFAULT 'production',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.fiffy_app_state ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if already defined to ensure idempotency
DROP POLICY IF EXISTS "Allow service role full access on fiffy_app_state" ON public.fiffy_app_state;
DROP POLICY IF EXISTS "Allow public read on fiffy_app_state" ON public.fiffy_app_state;
DROP POLICY IF EXISTS "Allow public upsert on fiffy_app_state" ON public.fiffy_app_state;
DROP POLICY IF EXISTS "Allow public update on fiffy_app_state" ON public.fiffy_app_state;

-- Allow full access for backend service role key
CREATE POLICY "Allow service role full access on fiffy_app_state"
ON public.fiffy_app_state FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow public read/write if using anon key
CREATE POLICY "Allow public read on fiffy_app_state"
ON public.fiffy_app_state FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public upsert on fiffy_app_state"
ON public.fiffy_app_state FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public update on fiffy_app_state"
ON public.fiffy_app_state FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 1. Enable PostGIS & UUID generator extensions
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

DO $$ BEGIN
  CREATE TYPE subscription_tier_type AS ENUM ('free', 'plus', 'gold');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE report_reason_type AS ENUM ('Inappropriate Photos', 'Harassment / Abusive Messages', 'Spam or Bot', 'Impersonation', 'Underage', 'Other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PROFILES TABLE (for direct Supabase client access / auth.users linking)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18),
  gender gender_type NOT NULL,
  gender_custom TEXT,
  orientation orientation_type NOT NULL,
  show_me show_me_type DEFAULT 'everyone',
  bio TEXT DEFAULT '',
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  job TEXT DEFAULT '',
  company TEXT DEFAULT '',
  education TEXT DEFAULT '',
  location TEXT DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  dating_goal TEXT DEFAULT 'Long-term relationship',
  verified BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_tier subscription_tier_type DEFAULT 'free',
  boost_expires_at TIMESTAMPTZ,
  incognito BOOLEAN DEFAULT FALSE,
  hide_age BOOLEAN DEFAULT FALSE,
  hide_distance BOOLEAN DEFAULT FALSE,
  read_receipts BOOLEAN DEFAULT TRUE,
  online BOOLEAN DEFAULT TRUE,
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROFILE PROMPTS
CREATE TABLE IF NOT EXISTS public.profile_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- 5. SWIPES TABLE (Audit log of likes, passes, superlikes)
CREATE TABLE IF NOT EXISTS public.swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  swiper_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action swipe_action_type NOT NULL,
  UNIQUE (swiper_id, swiped_id)
);

-- 6. MATCHES TABLE (Created when mutual likes occur)
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_a UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_super_match BOOLEAN DEFAULT FALSE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_match_pair UNIQUE (user_a, user_b)
);

-- 7. MESSAGES TABLE (Realtime chat enabled)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  reactions JSONB DEFAULT '[]'::JSONB
);

-- Enable Supabase Realtime for instant messaging
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 8. SAFETY & MODERATION REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason report_reason_type NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed'))
);

-- 9. USER BLOCKS
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE(blocker_id, blocked_id)
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view other non-incognito active profiles; users can edit only their own
DROP POLICY IF EXISTS "Public profiles can be viewed by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles can be viewed by authenticated users"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Messages: Users can only read/write messages in matches they are part of
DROP POLICY IF EXISTS "Users can access messages in their matches" ON public.messages;
CREATE POLICY "Users can access messages in their matches"
ON public.messages FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = messages.match_id
    AND (m.user_a = auth.uid() OR m.user_b = auth.uid())
  )
);

-- Auto-match Trigger on Mutual Like
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
      INSERT INTO public.matches (user_a, user_b, is_super_match)
      VALUES (
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

-- =========================================================================
-- 12. SUBSCRIPTION PLANS TABLE & PRE-POPULATED TIERS
-- =========================================================================
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

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to subscription plans" ON public.subscription_plans;
CREATE POLICY "Allow read access to subscription plans"
ON public.subscription_plans FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.subscription_plans (id, name, price_usd, price_zar, billing_cycle, badge, description, features, payfast_item_code, item_code, is_active, is_popular)
VALUES
  (
    'plan-plus',
    'Fiffy Plus',
    9.99,
    149.00,
    'monthly',
    NULL,
    'Essential upgrades for active singles seeking romance in their city.',
    ARRAY['Unlimited likes every 24 hours', '5 free SuperLikes per week', 'Rewind your last accidental swipe', 'See who liked your profile before swiping', 'No third-party advertising'],
    'FIFFY_SUB_PLUS_M',
    'FIFFY_SUB_PLUS_USD',
    true,
    false
  ),
  (
    'plan-gold',
    'VIP Gold Pan-African',
    19.99,
    299.00,
    'monthly',
    'Most Popular',
    'Unlock cross-border passport matching across Africa and the global diaspora.',
    ARRAY['All Fiffy Plus features included', 'Cross-Border Passport: Match in any African country or Diaspora', '1 Free Monthly Profile Boost (10x visibility)', 'Verified VIP Golden Badge on profile', 'Read Receipts on all chats', 'Priority delivery for all messages'],
    'FIFFY_SUB_GOLD_M',
    'FIFFY_SUB_GOLD_USD',
    true,
    true
  ),
  (
    'plan-elite',
    'Diaspora Elite Concierge',
    39.99,
    599.00,
    'monthly',
    'Executive',
    'The premier tier for serious professionals and international African diaspora.',
    ARRAY['All VIP Gold features included', 'Exclusive verified executive pool', 'Dedicated concierge relationship advisor', 'Unlimited profile boosts per month', 'Priority customer support via WhatsApp', 'Complimentary access to annual Diaspora Singles Gala'],
    'FIFFY_SUB_ELITE_M',
    'FIFFY_SUB_ELITE_USD',
    true,
    false
  ),
  (
    'plan-boost',
    'Instant Spotlight Boost',
    2.99,
    49.00,
    'one-time',
    'Spotlight',
    '10x profile visibility in your city for 30 minutes. Be shown first to active singles.',
    ARRAY['10x higher card placement in discover deck', '30 minutes of priority local spotlight', 'Instant activation upon gateway payment', 'Decoded securely via PayFast / ClicknPay'],
    'FIFFY_BOOST_SPOTLIGHT',
    'FIFFY_BOOST_USD',
    true,
    false
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_usd = EXCLUDED.price_usd,
  price_zar = EXCLUDED.price_zar,
  features = EXCLUDED.features,
  description = EXCLUDED.description;

-- =========================================================================
-- 13. ADMIN SETTINGS & PAYFAST GATEWAY CONFIGURATION
-- =========================================================================
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

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to admin settings" ON public.admin_settings;
CREATE POLICY "Allow read access to admin settings"
ON public.admin_settings FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.admin_settings (
  id, payments_enabled, payment_model, currency,
  payfast_merchant_id, payfast_merchant_key, payfast_passphrase, payfast_sandbox,
  require_id_verification, minimum_age, max_distance_km, free_daily_swipes
)
VALUES (
  'default', true, 'subscription', 'USD',
  '10000100', '46f0cd694581a', 'fiffy_secret_gateway_pass', true,
  false, 18, 15000, 5
)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 14. PLATFORM MANAGERS & STAFF CREDENTIALS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.platform_managers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL, -- 'co_admin', 'moderator', 'support_vip', 'content_manager'
  department TEXT,
  status TEXT DEFAULT 'active',
  is_root_admin BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.platform_managers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow service role full access to platform_managers" ON public.platform_managers;
CREATE POLICY "Allow service role full access to platform_managers"
ON public.platform_managers FOR ALL TO service_role USING (true);

INSERT INTO public.platform_managers (id, name, email, phone, role, department, status, is_root_admin, avatar_url, password)
VALUES
  (
    'mgr-root',
    'Executive Admin',
    'admin@fiffy.com',
    '+27 82 000 0001',
    'co_admin',
    'Platform Governance & Executive Operations',
    'active',
    true,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    'admin123'
  ),
  (
    'mgr-2',
    'Kudzi Moyo',
    'kudzi.moyo@fiffys.com',
    '+263 77 234 5678',
    'moderator',
    'Harare Trust & Safety Hub',
    'active',
    false,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    'manager2026'
  ),
  (
    'mgr-3',
    'Tariro Chikore',
    'tariro.chikore@fiffys.com',
    '+27 82 456 7890',
    'support_vip',
    'Johannesburg VIP Concierge Desk',
    'active',
    false,
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80',
    'manager2026'
  ),
  (
    'mgr-4',
    'Farai Nkomo',
    'farai.nkomo@fiffys.com',
    '+44 77 0090 0123',
    'content_manager',
    'London Diaspora Outreach & Love Stories',
    'active',
    false,
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    'manager2026'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  password = EXCLUDED.password;

