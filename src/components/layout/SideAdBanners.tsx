'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import AdsterraAd from '@/components/ui/AdsterraAd';

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
        <div className="bg-white p-2.5 text-center flex flex-col items-center justify-between min-h-[620px] border-[3px] border-[#231f20] shadow-[6px_6px_0px_#231f20]">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-[10px] font-black text-[#8c8580] uppercase">Quảng Cáo</span>
            <Link href="/vip" title="Tắt quảng cáo"><span className="pill-badge pill-vip text-[9px] px-1 py-0.5">VIP Đóng</span></Link>
          </div>
          <AdsterraAd idKey="99dc43e6924e870d0c7a5b075e8c26a7" width={160} height={600} />
        </div>
      </aside>

      {/* CENTER MAIN CONTENT: Perfect 1200px container */}
      <div className="flex-1 max-w-6xl w-full min-w-0">
        {children}
      </div>

      {/* RIGHT FLANK: Skyscraper Community Banner (Only visible on wide desktop 1600px+) */}
      <aside className="w-[180px] shrink-0 hidden xl:block pt-4 sticky top-24">
        <div className="bg-white p-2.5 text-center flex flex-col items-center justify-between min-h-[320px] border-[3px] border-[#231f20] shadow-[6px_6px_0px_#231f20]">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-[10px] font-black text-[#8c8580] uppercase">Quảng Cáo</span>
            <Link href="/vip" title="Tắt quảng cáo"><span className="pill-badge pill-vip text-[9px] px-1 py-0.5">VIP Đóng</span></Link>
          </div>
          <AdsterraAd idKey="d369df8d759bee8d3b01657bf48f8b0d" width={160} height={300} />
        </div>
      </aside>

    </div>
  );
}
