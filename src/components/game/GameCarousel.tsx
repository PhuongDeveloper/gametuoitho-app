'use client';

import { useRef, useState } from 'react';
import type { Game } from '@/types/database';
import GameCard from './GameCard';

interface GameCarouselProps {
  games: Game[];
  title: string;
}

export default function GameCarousel({ games, title }: GameCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 400);
  };

  if (games.length === 0) return null;

  return (
    <section className="relative my-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b-[3px] border-[#231f20] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-4 h-8 bg-[#ffa502] rounded-lg border-2 border-[#231f20] shadow-[2px_2px_0px_#231f20]" />
          <h2 className="text-2xl sm:text-3xl font-black text-[#231f20] uppercase tracking-tight">
            {title}
          </h2>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Cuộn sang trái"
            className="w-11 h-11 rounded-xl border-[3px] border-[#231f20] bg-white hover:bg-[#fff8e1] text-[#231f20] disabled:opacity-30 disabled:hover:bg-white transition-all shadow-[4px_4px_0px_#231f20] flex items-center justify-center active:translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Cuộn sang phải"
            className="w-11 h-11 rounded-xl border-[3px] border-[#231f20] bg-white hover:bg-[#fff8e1] text-[#231f20] disabled:opacity-30 disabled:hover:bg-white transition-all shadow-[4px_4px_0px_#231f20] flex items-center justify-center active:translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {games.map((game, index) => (
          <div key={game.id} className="flex-none w-[260px] sm:w-[280px] snap-start">
            <GameCard game={game} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}
