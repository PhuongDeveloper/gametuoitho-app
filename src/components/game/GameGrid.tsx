import type { Game } from '@/types/database';
import GameCard from './GameCard';

interface GameGridProps {
  games: Game[];
  title?: string;
  emptyMessage?: string;
}

export default function GameGrid({
  games,
  title,
  emptyMessage = 'Chưa có trò chơi nào trong danh mục này.',
}: GameGridProps) {
  if (games.length === 0) {
    return (
      <div className="cartoon-card bg-white text-center py-20 px-6 my-8 max-w-xl mx-auto border-[3px] border-[#231f20] shadow-[8px_8px_0px_#231f20]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#fff8e1] border-[3px] border-[#231f20] flex items-center justify-center text-[#ffa502] shadow-[4px_4px_0px_#231f20]">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 6H3a1 1 0 00-1 1v10a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zM7 15a2 2 0 110-4 2 2 0 010 4zm4-3.5a1 1 0 110-2h2a1 1 0 110 2h-2zm0 3a1 1 0 110-2h6a1 1 0 110 2h-6z"/>
          </svg>
        </div>
        <h3 className="text-xl font-black text-[#231f20] uppercase tracking-wide mb-2">
          Kho Game Trống
        </h3>
        <p className="text-[#6e6053] text-sm sm:text-base font-bold">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <section className="my-10">
      {title && (
        <div className="flex items-center justify-between mb-8 border-b-[3px] border-[#231f20] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-4 h-8 bg-[#ff4757] rounded-lg border-2 border-[#231f20] shadow-[2px_2px_0px_#231f20]" />
            <h2 className="text-2xl sm:text-3xl font-black text-[#231f20] uppercase tracking-tight">
              {title}
            </h2>
          </div>
          <span className="pill-badge bg-white text-[#231f20] border-2 border-[#231f20] px-4 py-1.5 text-xs sm:text-sm shadow-[3px_3px_0px_#231f20]">
            Tổng: {games.length} trò chơi
          </span>
        </div>
      )}
      
      {/* Spacious 4-column desktop grid matching Hoi Uc 2018 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
        {games.map((game, index) => (
          <GameCard key={game.id} game={game} index={index} />
        ))}
      </div>
    </section>
  );
}
