'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { Game } from '@/types/database';
import { formatPlayCount, randomOnlinePlayers } from '@/lib/utils';
import StarRating from '@/components/ui/StarRating';

interface GameCardProps {
  game: Game;
  index?: number;
}

export default function GameCard({ game }: GameCardProps) {
  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setOnlinePlayers(randomOnlinePlayers());
  }, []);

  return (
    <Link href={`/game/${game.slug}`} className="block group h-full">
      <div className="cartoon-card bg-white overflow-hidden flex flex-col h-full border-[3px] border-[#231f20] shadow-[6px_6px_0px_#231f20] group-hover:-translate-y-1.5 group-hover:shadow-[10px_10px_0px_#231f20] transition-all duration-200">
        
        {/* Thumbnail Box */}
        <div className="relative aspect-[4/3] bg-[#f8f6ed] border-b-[3px] border-[#231f20] overflow-hidden">
          {game.thumbnail_url ? (
            <Image
              src={game.thumbnail_url}
              alt={game.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-transform duration-300 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#f8f6ed] to-[#fffef9]">
              <svg className="w-12 h-12 text-[#8c8580]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 6H3a1 1 0 00-1 1v10a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zM7 15a2 2 0 110-4 2 2 0 010 4zm4-3.5a1 1 0 110-2h2a1 1 0 110 2h-2zm0 3a1 1 0 110-2h6a1 1 0 110 2h-6z"/>
              </svg>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <span className="pill-badge bg-[#f8f6ed] text-[#231f20] border-2 border-[#231f20] shadow-[2px_2px_0px_#231f20]">
              {game.genre || game.category}
            </span>
            {game.is_vip_only && (
              <span className="pill-badge pill-vip shadow-[2px_2px_0px_#231f20]">
                VIP PRO
              </span>
            )}
          </div>

          {/* Online status indicator */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#231f20] text-white px-2.5 py-1 rounded-lg text-xs font-black border-2 border-white/20 z-10 shadow-sm">
            <span className="w-2 h-2 bg-[#2ed573] rounded-full animate-pulse" />
            <span>{onlinePlayers}</span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4 bg-white">
          <div>
            <h3 className="font-black text-base sm:text-lg text-[#231f20] line-clamp-1 group-hover:text-[#ff4757] transition-colors leading-snug">
              {game.title}
            </h3>

            <div className="flex items-center justify-between mt-2 text-xs sm:text-sm font-bold text-[#6e6053]">
              <span>{game.genre || 'Hành động'}</span>
              <span>{formatPlayCount(game.total_plays)} lượt</span>
            </div>
          </div>

          <div className="pt-3 border-t-2 border-[#f8f6ed] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <StarRating rating={game.rating} size="sm" />
              <span className="text-xs font-extrabold text-[#2ed573]">Miễn phí</span>
            </div>
            
            {/* Big Tactile Play Button */}
            <div className="w-full py-2.5 rounded-xl bg-[#ff4757] group-hover:bg-[#ff2e43] text-white border-2 border-[#231f20] text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-[3px_3px_0px_#231f20] group-hover:shadow-[4px_4px_0px_#231f20] flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>Chơi Ngay</span>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
