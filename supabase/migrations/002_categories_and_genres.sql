-- ============================================
-- MIGRATION 002: CATEGORIES (GAME GENRES) & PLATFORM
-- ============================================

-- 1. CREATE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update categories"
  ON public.categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete categories"
  ON public.categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 2. SEED INITIAL GENRES
INSERT INTO public.categories (name, slug)
VALUES 
  ('Hành Động', 'hanh-dong'),
  ('Phiêu Lưu', 'phieu-luu'),
  ('Nhập Vai (RPG)', 'nhap-vai'),
  ('Trí Tuệ', 'tri-tue'),
  ('Thể Thao', 'the-thao'),
  ('Chiến Thuật', 'chien-thuat'),
  ('Kinh Điển', 'kinh-dien')
ON CONFLICT (slug) DO NOTHING;

-- 3. ALTER GAMES TABLE
-- Remove GBA/JAR check constraint on category if it exists
ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_category_check;

-- Add platform column (GBA or JAR) for emulator recognition
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'GBA' CHECK (platform IN ('GBA', 'JAR'));

-- Migrate existing games: move GBA/JAR to platform, set category to 'hanh-dong'
UPDATE public.games SET platform = category WHERE category IN ('GBA', 'JAR');
UPDATE public.games SET category = 'hanh-dong', genre = 'Hành Động' WHERE category IN ('GBA', 'JAR');
