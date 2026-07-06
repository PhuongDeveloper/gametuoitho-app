export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Game } from '@/types/database';
import AdBanner from '@/components/ui/AdBanner';
import GamePlayerClient from './GamePlayerClient';

interface GamePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: game } = await supabase
    .from('games')
    .select('title, description, genre, thumbnail_url')
    .eq('slug', slug)
    .single();

  if (!game) return { title: 'Game không tồn tại' };

  return {
    title: `${game.title} - Chơi Online Miễn Phí | GameTuoiTho`,
    description: game.description || `Chơi ${game.title} online miễn phí trên trình duyệt.`,
    openGraph: {
      title: `${game.title} - GameTuoiTho.online`,
      description: game.description || `Chơi ${game.title} online miễn phí.`,
      images: game.thumbnail_url ? [game.thumbnail_url] : undefined,
    },
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch game data
  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!game) notFound();

  // Fetch related games (same category)
  const { data: relatedGames = [] } = await supabase
    .from('games')
    .select('*')
    .eq('category', game.category)
    .neq('id', game.id)
    .order('total_plays', { ascending: false })
    .limit(6);

  // Increment play count
  await supabase.rpc('increment_play_count', { game_id_input: game.id });

  return (
    <div className="w-full py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main: Emulator Player */}
        <div className="lg:col-span-8">
          <GamePlayerClient game={game as Game} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Game info card */}
          <div className="cartoon-container bg-white p-6 sm:p-8 border-[3px] border-[#231f20] shadow-[8px_8px_0px_#231f20]">
            <h1 className="text-2xl sm:text-3xl font-black text-[#231f20] mb-4 uppercase tracking-wide border-b-[3px] border-[#231f20] pb-3">
              {game.title}
            </h1>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-sm sm:text-base">
                <span className="text-[#8c8580] font-bold">Thể loại:</span>
                <span className="font-black text-[#231f20]">{game.genre || game.category || 'Hành động'}</span>
              </div>
              <div className="flex items-center justify-between text-sm sm:text-base">
                <span className="text-[#8c8580] font-bold">Nền tảng:</span>
                <span className="pill-badge bg-[#f8f6ed] text-[#231f20] border-2 border-[#231f20] shadow-[2px_2px_0px_#231f20]">
                  {game.platform || (game.file_url?.toLowerCase().endsWith('.jar') ? 'JAR (Java)' : 'GBA')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm sm:text-base">
                <span className="text-[#8c8580] font-bold">Năm phát hành:</span>
                <span className="font-black text-[#231f20]">{game.release_year || '2005'}</span>
              </div>
              <div className="flex items-center justify-between text-sm sm:text-base">
                <span className="text-[#8c8580] font-bold">Lượt chơi:</span>
                <span className="font-black text-[#ff4757]">{(game.total_plays + 1).toLocaleString()} lượt</span>
              </div>
              {game.is_vip_only && (
                <div className="flex items-center justify-center gap-2 bg-[#fff8e1] px-4 py-3 rounded-xl text-sm text-[#ffa502] font-black border-2 border-[#231f20] mt-4 shadow-[3px_3px_0px_#231f20]">
                  <svg className="w-5 h-5 text-[#ffa502]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <span>Trò chơi độc quyền VIP Pro</span>
                </div>
              )}
            </div>

            {/* Controls info */}
            {game.controls_info && (
              <div className="mt-6 pt-5 border-t-[3px] border-[#231f20]">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#231f20] mb-2">Hướng Dẫn Điều Khiển</h3>
                <div className="bg-[#f8f6ed] rounded-xl p-3.5 border-2 border-[#231f20]">
                  <p className="text-xs sm:text-sm text-[#524d4a] font-bold whitespace-pre-line leading-relaxed">
                    {game.controls_info}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            {game.description && (
              <div className="mt-6 pt-5 border-t-[3px] border-[#231f20]">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#231f20] mb-2">Giới Thiệu Trò Chơi</h3>
                <p className="text-xs sm:text-sm text-[#524d4a] font-bold leading-relaxed">
                  {game.description}
                </p>
              </div>
            )}
          </div>

          {/* Ad Banner */}
          <AdBanner format="rectangle" slot="game-sidebar" />

          {/* Related games */}
          {(relatedGames as Game[]).length > 0 && (
            <div className="cartoon-container bg-white p-6 sm:p-8 border-[3px] border-[#231f20] shadow-[8px_8px_0px_#231f20]">
              <h3 className="text-lg font-black uppercase tracking-wide text-[#231f20] mb-5 border-b-[3px] border-[#231f20] pb-2.5">Trò Chơi Cùng Thể Loại</h3>
              <div className="grid grid-cols-2 gap-4">
                {(relatedGames as Game[]).map((rg) => (
                  <a
                    key={rg.id}
                    href={`/game/${rg.slug}`}
                    className="group flex flex-col gap-2 bg-[#f8f6ed] p-2.5 rounded-xl border-2 border-[#231f20] hover:-translate-y-1 transition-all shadow-[4px_4px_0px_#231f20]"
                  >
                    <div className="aspect-[4/3] bg-[#fffef9] rounded-lg overflow-hidden border-2 border-[#231f20]">
                      {rg.thumbnail_url ? (
                        <img
                          src={rg.thumbnail_url}
                          alt={rg.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#fffef9]">
                          <svg className="w-6 h-6 text-[#8c8580]" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3a1 1 0 00-1 1v10a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zM7 15a2 2 0 110-4 2 2 0 010 4z"/></svg>
                        </div>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-black text-[#231f20] line-clamp-1 group-hover:text-[#ff4757] transition-colors px-1">
                      {rg.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
