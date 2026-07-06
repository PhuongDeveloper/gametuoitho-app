'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface AdBannerProps {
  format?: 'banner' | 'rectangle' | 'sidebar';
  slot?: string;
  className?: string;
}

export default function AdBanner({ format = 'banner', slot, className = '' }: AdBannerProps) {
  const [isVip, setIsVip] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_vip, role')
          .eq('id', user.id)
          .single();
        if (profile?.is_vip || profile?.role === 'admin') {
          setIsVip(true);
        }
        if (profile?.role === 'admin') {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    };
    checkUserStatus();
  }, [supabase]);

  // If loading or VIP or Admin -> hide ads completely
  if (loading || isVip || isAdmin) {
    return null;
  }

  if (format === 'banner') {
    return (
      <div className={`my-8 max-w-4xl mx-auto cartoon-box bg-white p-5 border-[3px] border-[#231f20] shadow-[6px_6px_0px_#231f20] flex flex-col sm:flex-row items-center justify-between gap-5 transition-all ${className}`}>
        <div className="flex items-center gap-4 text-left">
          <div className="w-14 h-14 rounded-2xl bg-[#fff8e1] border-2 border-[#231f20] flex items-center justify-center text-[#ffa502] shrink-0 shadow-[3px_3px_0px_#231f20]">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="pill-badge pill-vip text-[10px]">Quảng Cáo Tài Trợ</span>
              <span className="text-xs font-black text-[#8c8580]">Tắt với VIP</span>
            </div>
            <h4 className="font-black text-[#231f20] text-base uppercase mt-1">
              Chơi Game Mượt &mdash; Không Làm Phiền
            </h4>
            <p className="text-xs sm:text-sm text-[#524d4a] font-bold mt-0.5">
              Nâng cấp VIP PRO chỉ 50.000đ để tắt quảng cáo vĩnh viễn và mở khóa game độc quyền!
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <Link
            href="/vip"
            className="flex-1 sm:flex-initial text-center px-6 py-3 btn-cartoon-gold text-xs sm:text-sm uppercase shadow-[3px_3px_0px_#231f20]"
          >
            <span>Nâng Cấp VIP Ngay</span>
          </Link>
        </div>
      </div>
    );
  }

  // Rectangle / Sidebar format
  return (
    <div className={`my-6 w-full cartoon-box bg-white border-[3px] border-[#231f20] p-5 shadow-[6px_6px_0px_#231f20] text-center ${className}`}>
      <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#8c8580] mb-4 border-b-2 border-[#231f20] pb-2">
        <span>Khuyến Mãi Game Thủ</span>
        <span className="pill-badge pill-vip text-[10px] py-0.5 px-2">Ad</span>
      </div>
      
      <div className="bg-[#f8f6ed] p-5 rounded-2xl border-2 border-[#231f20] my-4 shadow-sm flex flex-col items-center justify-center min-h-[160px]">
        <div className="w-12 h-12 bg-[#ff4757] border-2 border-[#231f20] rounded-2xl flex items-center justify-center text-white mb-3 shadow-[2px_2px_0px_#231f20]">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <span className="text-sm font-black text-[#231f20] uppercase tracking-wide">Kho Game GBA &amp; Java</span>
        <span className="text-xs text-[#524d4a] font-bold mt-1">Hơn 500+ game không quảng cáo khi là VIP!</span>
      </div>

      <div className="mt-4">
        <Link
          href="/vip"
          className="block w-full py-3 btn-cartoon-red text-xs sm:text-sm uppercase text-center shadow-[3px_3px_0px_#231f20]"
        >
          <span>Tắt Quảng Cáo Này</span>
        </Link>
      </div>
    </div>
  );
}
