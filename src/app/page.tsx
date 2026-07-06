export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import type { Game, Category } from '@/types/database';
import GameGrid from '@/components/game/GameGrid';
import GameCarousel from '@/components/game/GameCarousel';
import HomeHero from '@/components/home/HomeHero';
import CategoryTabs from '@/components/home/CategoryTabs';

interface HomePageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Fetch dynamic categories/genres safely
  const { data: rawCategories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  const categories: Category[] = rawCategories || [];

  // Fetch games safely
  let query = supabase.from('games').select('*').order('created_at', { ascending: false });

  if (params.category === 'VIP') {
    query = query.eq('is_vip_only', true);
  } else if (params.category && params.category !== 'ALL') {
    // Filter by genre category slug
    query = query.eq('category', params.category);
  }

  if (params.search) {
    query = query.ilike('title', `%${params.search}%`);
  }

  const { data: rawGames } = await query;
  const games: Game[] = rawGames || [];

  // Fetch top games for carousel safely
  const { data: rawTopGames } = await supabase
    .from('games')
    .select('*')
    .order('total_plays', { ascending: false })
    .limit(10);
  const topGames: Game[] = rawTopGames || [];

  // Fetch newest games safely
  const { data: rawNewGames } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  const newGames: Game[] = rawNewGames || [];

  const activeCategory = params.category || 'ALL';

  // Find active genre name for title display safely
  const activeCatObj = categories.find((c) => c.slug === activeCategory);
  const gridTitle = params.search
    ? undefined
    : activeCategory === 'ALL'
    ? 'Tất Cả Game Tuổi Thơ'
    : activeCategory === 'VIP'
    ? 'Danh Sách Game VIP Pro'
    : activeCatObj
    ? `Thể Loại: ${activeCatObj.name}`
    : `Thể Loại: ${activeCategory}`;

  return (
    <div className="w-full">
      {/* Hero Section */}
      {!params.search && activeCategory === 'ALL' && <HomeHero />}

      <div className="py-2">
        {/* Search results header */}
        {params.search && (
          <div className="mb-8 cartoon-box bg-[#fff8e1] p-6 border-[3px] border-[#231f20] shadow-[6px_6px_0px_#231f20]">
            <h1 className="text-2xl sm:text-3xl font-black text-[#231f20] uppercase tracking-wide">
              Kết Quả Tìm Kiếm: &ldquo;{params.search}&rdquo;
            </h1>
            <p className="text-sm sm:text-base font-bold text-[#524d4a] mt-1">
              Tìm thấy {games.length} trò chơi phù hợp
            </p>
          </div>
        )}

        {/* Top Games Carousel */}
        {!params.search && activeCategory === 'ALL' && topGames.length > 0 && (
          <div className="mb-12">
            <GameCarousel games={topGames} title="Được Chơi Nhiều Nhất" />
          </div>
        )}

        {/* Category Tabs */}
        <CategoryTabs activeCategory={activeCategory} categories={categories} />

        {/* New Games */}
        {!params.search && activeCategory === 'ALL' && newGames.length > 0 && (
          <div className="mb-12">
            <GameCarousel games={newGames} title="Mới Cập Nhật" />
          </div>
        )}

        {/* Main Game Grid */}
        <div className="mt-6">
          <GameGrid
            games={games}
            title={gridTitle}
          />
        </div>
      </div>
    </div>
  );
}
