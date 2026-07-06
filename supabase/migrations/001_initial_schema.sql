-- ============================================
-- GameTuoiTho.online - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. PROFILES TABLE
-- Linked to auth.users, stores VIP status and role
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  is_vip BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. GAMES TABLE
CREATE TABLE IF NOT EXISTS public.games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('GBA', 'JAR')),
  thumbnail_url TEXT,
  file_url TEXT NOT NULL,
  is_vip_only BOOLEAN DEFAULT FALSE,
  release_year INTEGER,
  genre TEXT,
  total_plays INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  description TEXT,
  controls_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Games policies
CREATE POLICY "Games are viewable by everyone"
  ON public.games FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert games"
  ON public.games FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update games"
  ON public.games FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete games"
  ON public.games FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_slug ON public.games(slug);
CREATE INDEX IF NOT EXISTS idx_games_category ON public.games(category);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON public.games(created_at DESC);

-- 3. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  code TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  gateway TEXT,
  transaction_date TIMESTAMPTZ,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role can insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

-- 4. PLAY_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.play_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.play_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own play logs"
  ON public.play_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own play logs"
  ON public.play_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all play logs"
  ON public.play_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_play_logs_game_id ON public.play_logs(game_id);
CREATE INDEX IF NOT EXISTS idx_play_logs_created_at ON public.play_logs(created_at DESC);

-- ============================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Increment play count
-- ============================================
CREATE OR REPLACE FUNCTION public.increment_play_count(game_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.games
  SET total_plays = total_plays + 1
  WHERE id = game_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STORAGE: Create bucket for game ROMs
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-roms', 'game-roms', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Anyone can read game ROMs
CREATE POLICY "Public read access for game-roms"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'game-roms');

-- Storage policy: Only admins can upload
CREATE POLICY "Admin upload access for game-roms"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'game-roms' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Storage policy: Only admins can delete
CREATE POLICY "Admin delete access for game-roms"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'game-roms' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- STORAGE: Create bucket for cloud saves (VIP)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('cloud-saves', 'cloud-saves', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "VIP users can read own saves"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cloud-saves' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "VIP users can upload own saves"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cloud-saves' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_vip = true
    )
  );
