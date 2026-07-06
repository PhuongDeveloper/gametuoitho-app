'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Game, Profile } from '@/types/database';
import EmulatorPlayer from '@/components/game/EmulatorPlayer';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface GamePlayerClientProps {
  game: Game;
}

export default function GamePlayerClient({ game }: GamePlayerClientProps) {
  const [user, setUser] = useState<Profile | null>(null);
  const [canPlay, setCanPlay] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const supabase = createClient();

  useEffect(() => {
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
  }, [supabase, game.id, game.is_vip_only, startTime, user]);

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

  return (
    <div className="space-y-6">
      <div className="cartoon-container bg-[#1a1a1a] p-3 sm:p-4 rounded-3xl shadow-[10px_10px_0px_#231f20] border-[3px] border-[#231f20]">
        <EmulatorPlayer game={game} />
      </div>
      <div className="flex items-center justify-between cartoon-box bg-white rounded-2xl p-5 border-[3px] border-[#231f20] shadow-[6px_6px_0px_#231f20]">
        <div className="flex items-center gap-3">
          <span className="pill-badge bg-[#f8f6ed] text-[#231f20] border-2 border-[#231f20] shadow-[2px_2px_0px_#231f20]">
            {game.genre || game.category}
          </span>
          <span className="text-lg sm:text-2xl font-black text-[#231f20] line-clamp-1">{game.title}</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#2ed573] font-black bg-[#f8f6ed] px-4 py-2 rounded-xl border-2 border-[#231f20] shadow-[2px_2px_0px_#231f20]">
          <span className="w-3 h-3 bg-[#2ed573] rounded-full animate-pulse" />
          <span>Trình Giả Lập Trực Tuyến</span>
        </div>
      </div>
    </div>
  );
}
