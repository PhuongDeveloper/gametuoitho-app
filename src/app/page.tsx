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

  // Build filtered query for main games grid
  let gamesQuery = supabase.from('games').select('*').order('created_at', { ascending: false });

  if (params.category === 'VIP') {
    gamesQuery = gamesQuery.eq('is_vip_only', true);
  } else if (params.category && params.category !== 'ALL') {
    // Filter by genre category slug
    gamesQuery = gamesQuery.eq('category', params.category);
  }

  if (params.search) {
    gamesQuery = gamesQuery.ilike('title', `%${params.search}%`);
  }

  // Fetch all queries in parallel to drastically improve page transition fluidity
  const [
    { data: rawCategories },
    { data: rawGames },
    { data: rawTopGames },
    { data: rawNewGames },
  ] = await Promise.all([
    supabase.from('categories').select('*').order('name', { ascending: true }),
    gamesQuery,
    supabase.from('games').select('*').order('total_plays', { ascending: false }).limit(10),
    supabase.from('games').select('*').order('created_at', { ascending: false }).limit(10),
  ]);

  const categories: Category[] = rawCategories || [];
  const games: Game[] = rawGames || [];
  const topGames: Game[] = rawTopGames || [];
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
