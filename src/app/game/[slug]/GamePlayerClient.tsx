'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Game, Profile } from '@/types/database';
import EmulatorPlayer from '@/components/game/EmulatorPlayer';
import GameControlBar from '@/components/game/GameControlBar';
import VirtualGamepad from '@/components/game/VirtualGamepad';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface GamePlayerClientProps {
  game: Game;
}

export default function GamePlayerClient({ game }: GamePlayerClientProps) {
  const [user, setUser] = useState<Profile | null>(null);
  const [canPlay, setCanPlay] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [isGamepadVisible, setIsGamepadVisible] = useState<boolean>(false);
  const [isMobileImmersive, setIsMobileImmersive] = useState<boolean>(false);
  const supabase = createClient();

  const platform: 'GBA' | 'JAR' =
    game.platform === 'JAR' ||
    game.file_url?.toLowerCase().endsWith('.jar') ||
    game.file_url?.toLowerCase().endsWith('.jad') ||
    game.category === 'JAR'
      ? 'JAR'
      : 'GBA';

  useEffect(() => {
    // Auto-detect mobile/touch devices to enable gamepad by default and trigger mobile immersive landscape mode
    if (typeof window !== 'undefined') {
      const isTouch = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;
      if (isTouch) {
        setIsGamepadVisible(true);
        setIsMobileImmersive(true);
        // Automatically try locking landscape and requesting fullscreen on touch/click
        const triggerLandscape = () => {
          try {
            if (screen && (screen.orientation as any) && (screen.orientation as any).lock) {
              (screen.orientation as any).lock('landscape').catch(() => {});
            }
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen().catch(() => {});
            }
          } catch (e) {}
        };
        triggerLandscape();
        window.addEventListener('touchstart', triggerLandscape, { once: true });
        window.addEventListener('click', triggerLandscape, { once: true });
      }
    }

    const checkAccess = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
        if (profile) {
          setUser(profile);
          setCanPlay(!(game.is_vip_only && !profile.is_vip));
        }
      } else {
        setCanPlay(!game.is_vip_only);
      }
    };
    checkAccess();
    setStartTime(Date.now());
    return () => {
      if (user && startTime > 0) {
        const durationMinutes = Math.round((Date.now() - startTime) / 60000);
        if (durationMinutes > 0) {
          supabase.from('play_logs').insert({ user_id: user.id, game_id: game.id, duration_minutes: durationMinutes });
        }
      }
    };
  }, [supabase, game.id, game.is_vip_only, startTime, user, platform]);

  if (game.is_vip_only && !canPlay) {
    return (
      <div className="cartoon-container bg-white p-10 sm:p-14 text-center shadow-[10px_10px_0px_#231f20] max-w-2xl mx-auto my-8 border-[3px] border-[#231f20]">
        <div className="w-20 h-20 mx-auto mb-5 bg-[#fff8e1] border-[3px] border-[#231f20] rounded-2xl shadow-[4px_4px_0px_#231f20] flex items-center justify-center text-[#ffa502]">
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <span className="pill-badge pill-vip mb-3">Đặc Quyền VIP Pro</span>
        <h2 className="text-2xl sm:text-4xl font-black text-[#231f20] uppercase tracking-wide mt-2 mb-4">Trò Chơi Độc Quyền VIP Pro</h2>
        <p className="text-base sm:text-lg text-[#524d4a] mb-8 max-w-lg mx-auto font-bold leading-relaxed">
          Trò chơi này được bảo lưu riêng cho thành viên VIP. Nâng cấp VIP trọn đời với tài trợ chỉ <span className="text-[#ff4757] font-black underline">50.000đ</span> để mở khóa toàn bộ kho game hiếm!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/vip" className="w-full sm:w-auto"><Button variant="primary" size="lg" className="w-full">Nâng Cấp VIP Ngay - 50K</Button></Link>
          <Link href="/" className="w-full sm:w-auto"><Button variant="secondary" size="lg" className="w-full">Quay Lại Trang Chủ</Button></Link>
        </div>
      </div>
    );
  }

  // Mobile Immersive Fullscreen Mode (Hides website Header, Footer, and Banners leaving ONLY the game)
  if (isMobileImmersive) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black w-screen h-screen flex flex-col justify-between overflow-hidden select-none">
        {/* Minimal Immersive Top Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a]/95 text-white z-50 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black bg-[#ff4757] px-2 py-0.5 rounded-md uppercase tracking-wide">
              {platform}
            </span>
            <span className="text-xs sm:text-sm font-black truncate max-w-[180px] sm:max-w-md">{game.title}</span>
          </div>
          <div className="flex items-center gap-2">
            {platform === 'JAR' && (
              <button
                onClick={() => setIsGamepadVisible(!isGamepadVisible)}
                className={`px-2.5 py-1 rounded-lg font-black text-[11px] uppercase border border-white/20 transition-all ${
                  isGamepadVisible ? 'bg-[#ff4757] text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Nút: {isGamepadVisible ? 'Bật' : 'Tắt'}
              </button>
            )}
            <button
              onClick={() => {
                try {
                  if (screen && (screen.orientation as any) && (screen.orientation as any).lock) {
                    (screen.orientation as any).lock('landscape').catch(() => {});
                  }
                  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                } catch (e) {}
              }}
              className="px-2.5 py-1 bg-[#3742fa] hover:bg-[#2f35ca] text-white text-[11px] font-black rounded-lg border border-white/20 transition-all uppercase"
            >
              Xoay Ngang
            </button>
            <button
              onClick={() => {
                setIsMobileImmersive(false);
                try {
                  if (document.fullscreenElement && document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                  }
                  if (screen && (screen.orientation as any) && (screen.orientation as any).unlock) {
                    (screen.orientation as any).unlock();
                  }
                } catch (e) {}
              }}
              className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-white text-[11px] font-black rounded-lg border border-white/20 transition-all uppercase"
            >
              Thoát
            </button>
          </div>
        </div>

        {/* Game Canvas / Iframe Fullscreen Area */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <EmulatorPlayer game={game} />
          </div>
        </div>

        {/* Dedicated Virtual Gamepad for JAR Only */}
        {platform === 'JAR' && (
          <VirtualGamepad
            platform={platform}
            visible={isGamepadVisible}
            onClose={() => setIsGamepadVisible(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Emulator & Custom Controls Box */}
      <div className="cartoon-container bg-[#1a1a1a] p-3 sm:p-4 rounded-3xl shadow-[10px_10px_0px_#231f20] border-[3px] border-[#231f20] space-y-4">
        <EmulatorPlayer game={game} />
        
        <GameControlBar
          slug={game.slug}
          platform={platform}
          onToggleGamepad={() => setIsGamepadVisible(!isGamepadVisible)}
          isGamepadVisible={isGamepadVisible}
        />
      </div>

      {/* Game Title & Platform Info Header */}
      <div className="flex items-center justify-between cartoon-box bg-white rounded-2xl p-5 border-[3px] border-[#231f20] shadow-[6px_6px_0px_#231f20] flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="pill-badge bg-[#f8f6ed] text-[#231f20] border-2 border-[#231f20] shadow-[2px_2px_0px_#231f20]">
            {game.genre || game.category}
          </span>
          <span className="text-lg sm:text-2xl font-black text-[#231f20] line-clamp-1">{game.title}</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#2ed573] font-black bg-[#f8f6ed] px-4 py-2 rounded-xl border-2 border-[#231f20] shadow-[2px_2px_0px_#231f20]">
          <span className="w-3 h-3 bg-[#2ed573] rounded-full animate-pulse" />
          <span>Hệ Máy: {platform === 'GBA' ? 'GameBoy Advance' : 'Java J2ME'}</span>
        </div>
      </div>

      {/* Virtual On-Screen Gamepad for JAR Only */}
      {platform === 'JAR' && (
        <VirtualGamepad
          platform={platform}
          visible={isGamepadVisible}
          onClose={() => setIsGamepadVisible(false)}
        />
      )}
    </div>
  );
}
