'use client';

import { useEffect, useState } from 'react';
import AdsterraAd from './AdsterraAd';
import { createClient } from '@/lib/supabase/client';

interface AdModalProps {
  onClose: () => void;
}

export default function AdModal({ onClose }: AdModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isVip, setIsVip] = useState(true); // Default true to prevent flash
  const supabase = createClient();

  useEffect(() => {
    const checkVip = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_vip, role')
          .eq('id', user.id)
          .single();
        if (profile?.is_vip || profile?.role === 'admin') {
          setIsVip(true);
          onClose(); // Automatically close if VIP
        } else {
          setIsVip(false);
          setIsVisible(true);
        }
      } else {
        setIsVip(false);
        setIsVisible(true);
      }
    };
    checkVip();
  }, [supabase, onClose]);

  if (!isVisible || isVip) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative bg-white cartoon-box border-[4px] border-[#231f20] shadow-[12px_12px_0px_#231f20] p-4 flex flex-col items-center animate-in zoom-in-95 duration-200 rounded-2xl max-w-full">
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase text-[#8c8580]">Quảng Cáo Tài Trợ</span>
            <span className="text-[10px] font-bold text-[#ff4757]">Ủng hộ server duy trì game!</span>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center bg-[#ff4757] hover:bg-[#ff2e43] text-white border-2 border-[#231f20] rounded-lg shadow-[2px_2px_0px_#231f20] active:translate-y-0.5 transition-all"
            aria-label="Đóng quảng cáo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* We use Native Banner or 300x250 for this popup. Using 300x250 */}
        <div className="bg-[#f8f6ed] border-2 border-[#231f20] rounded-xl overflow-hidden min-w-[300px] min-h-[250px] flex items-center justify-center">
          <AdsterraAd idKey="4474942bb9f79a7f02d823d1e06dde59" width={300} height={250} />
        </div>
        
        <div className="mt-4 text-center">
          <a href="/vip" className="text-xs font-black text-[#524d4a] hover:text-[#ff4757] underline decoration-[2px] underline-offset-4">
            Nâng cấp VIP (50K) để tắt hoàn toàn quảng cáo
          </a>
        </div>
      </div>
    </div>
  );
}
