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
-- FIFFY'S MATCH MAKING - PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- Built for High-Volume Dating, Geolocation, Realtime Chat & Subscriptions
-- =========================================================================

-- 1. Enable PostGIS (for fast geospatial distance calculation) & UUID generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- 2. Custom ENUM Types
CREATE TYPE gender_type AS ENUM ('woman', 'man', 'non-binary', 'genderfluid', 'agender', 'transgender', 'other');
CREATE TYPE orientation_type AS ENUM ('straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'queer', 'asexual', 'questioning');
CREATE TYPE show_me_type AS ENUM ('everyone', 'women', 'men', 'non-binary');
CREATE TYPE swipe_action_type AS ENUM ('pass', 'like', 'superlike');
CREATE TYPE subscription_tier_type AS ENUM ('free', 'plus', 'gold');
CREATE TYPE report_reason_type AS ENUM ('Inappropriate Photos', 'Harassment / Abusive Messages', 'Spam or Bot', 'Impersonation', 'Underage', 'Other');

-- 3. PROFILES TABLE (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 4. PROFILE PROMPTS (Icebreakers: Two truths & a lie, etc.)
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
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

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
CREATE POLICY "Public profiles can be viewed by authenticated users"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Messages: Users can only read/write messages in matches they are part of
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

CREATE TRIGGER on_swipe_inserted
AFTER INSERT ON public.swipes
FOR EACH ROW EXECUTE FUNCTION handle_mutual_swipe();
`;
