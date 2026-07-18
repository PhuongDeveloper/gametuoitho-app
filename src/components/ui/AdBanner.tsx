'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import AdsterraAd from '@/components/ui/AdsterraAd';

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
      <div className={`my-8 w-full max-w-4xl mx-auto flex flex-col items-center gap-2 ${className}`}>
        <div className="flex items-center justify-between w-full max-w-[728px] px-2">
          <span className="text-[10px] font-black text-[#8c8580] uppercase">Quảng Cáo Tài Trợ</span>
          <Link href="/vip" title="Tắt quảng cáo"><span className="pill-badge pill-vip text-[9px] px-1 py-0.5">VIP Đóng</span></Link>
        </div>
        <div className="hidden sm:block">
          <AdsterraAd idKey="27886c4df8bc381c73e9ea8b1dc4e192" width={728} height={90} />
        </div>
        <div className="block sm:hidden">
          <AdsterraAd idKey="f5a241bd0bdda66b97c0c9ab4180a720" width={320} height={50} />
        </div>
      </div>
    );
  }

  // Rectangle / Sidebar format
  return (
    <div className={`my-6 w-full cartoon-box bg-white border-[3px] border-[#231f20] p-4 shadow-[6px_6px_0px_#231f20] text-center ${className}`}>
      <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#8c8580] mb-3 pb-2 border-b-2 border-[#231f20]">
        <span>Quảng Cáo</span>
        <Link href="/vip" title="Tắt quảng cáo"><span className="pill-badge pill-vip text-[9px] px-1 py-0.5">VIP Đóng</span></Link>
      </div>
      
      <div className="flex items-center justify-center">
        <AdsterraAd idKey="4474942bb9f79a7f02d823d1e06dde59" width={300} height={250} />
      </div>
    </div>
  );
}
