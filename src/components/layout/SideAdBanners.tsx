'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface SideAdBannersProps {
  children: React.ReactNode;
}

export default function SideAdBanners({ children }: SideAdBannersProps) {
  const [isVip, setIsVip] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkStatus = async () => {
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
    };
    checkStatus();
  }, [supabase]);

  // Hidden on admin pages or if VIP
  if (isAdmin || isVip) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 flex justify-center items-start gap-6 lg:gap-8">
      
      {/* LEFT FLANK: Skyscraper Promo Banner (Only visible on wide desktop 1600px+) */}
      <aside className="w-[180px] shrink-0 hidden xl:block pt-4 sticky top-24">
        <div className="cartoon-box bg-white p-3.5 text-center flex flex-col items-center justify-between min-h-[520px] border-[3px] border-[#231f20] shadow-[6px_6px_0px_#231f20]">
          <div>
            <span className="pill-badge pill-vip text-[10px] mb-3">Tài Trợ Đặc Quyền</span>
            <div className="w-16 h-16 mx-auto mb-3 bg-[#fff8e1] border-2 border-[#231f20] rounded-2xl flex items-center justify-center text-[#ffa502] shadow-[3px_3px_0px_#231f20]">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h4 className="font-black text-[#231f20] text-sm uppercase leading-tight">Nâng Cấp VIP PRO</h4>
            <p className="text-xs text-[#524d4a] font-bold mt-2 leading-relaxed">
              Tắt 100% quảng cáo và mở khóa kho game hiếm trọn đời!
            </p>
          </div>

          <div className="w-full space-y-3 mt-6">
            <div className="bg-[#f8f6ed] p-2.5 rounded-xl border-2 border-[#231f20] text-xs font-black text-[#ff4757]">
              Chỉ 50.000đ / Vĩnh viễn
            </div>
            <Link href="/vip" className="w-full py-2.5 bg-[#ff4757] hover:bg-[#ff2e43] text-white font-black text-xs uppercase rounded-xl border-2 border-[#231f20] shadow-[3px_3px_0px_#231f20] block transition-transform active:translate-y-0.5">
              Nâng Cấp Ngay
            </Link>
          </div>
        </div>
      </aside>

      {/* CENTER MAIN CONTENT: Perfect 1200px container */}
      <div className="flex-1 max-w-6xl w-full min-w-0">
        {children}
      </div>

      {/* RIGHT FLANK: Skyscraper Community Banner (Only visible on wide desktop 1600px+) */}
      <aside className="w-[180px] shrink-0 hidden xl:block pt-4 sticky top-24">
        <div className="cartoon-box bg-white p-3.5 text-center flex flex-col items-center justify-between min-h-[520px] border-[3px] border-[#231f20] shadow-[6px_6px_0px_#231f20]">
          <div>
            <span className="pill-badge pill-gba text-[10px] mb-3">Cộng Đồng 2D</span>
            <div className="w-16 h-16 mx-auto mb-3 bg-[#e1f5fe] border-2 border-[#231f20] rounded-2xl flex items-center justify-center text-[#1e90ff] shadow-[3px_3px_0px_#231f20]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h4 className="font-black text-[#231f20] text-sm uppercase leading-tight">Giao Lưu Game Thủ</h4>
            <p className="text-xs text-[#524d4a] font-bold mt-2 leading-relaxed">
              Hơn 50,000 chiến hữu đang chờ bạn tranh tài và chia sẻ ký ức!
            </p>
          </div>

          <div className="w-full space-y-3 mt-6">
            <div className="bg-[#f8f6ed] p-2.5 rounded-xl border-2 border-[#231f20] text-xs font-black text-[#231f20]">
              Online 24/7
            </div>
            <a href="https://zalo.me" target="_blank" rel="noreferrer" className="w-full py-2.5 bg-[#1e90ff] hover:bg-[#187bcd] text-white font-black text-xs uppercase rounded-xl border-2 border-[#231f20] shadow-[3px_3px_0px_#231f20] block transition-transform active:translate-y-0.5">
              Vào Zalo Group
            </a>
          </div>
        </div>
      </aside>

    </div>
  );
}
