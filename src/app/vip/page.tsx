'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

export default function VipPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
        if (profile) setUser(profile);
      }
    };
    getUser();
  }, [supabase]);

  const transferContent = user ? `VIP ${user.id.slice(0, 8)}` : 'VIP_[dang nhap truoc]';
  const copyContent = () => {
    navigator.clipboard.writeText(transferContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    { title: 'Tắt Toàn Bộ Quảng Cáo', desc: 'Trải nghiệm mượt mà không bị làm phiền 100%', icon: (
      <svg className="w-8 h-8 text-[#ff4757]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
    )},
    { title: 'Kho Game VIP Độc Quyền', desc: 'Truy cập các bản hiếm, bản Hack, Việt hóa độc quyền', icon: (
      <svg className="w-8 h-8 text-[#ffa502]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
    )},
    { title: 'Lưu Game Trên Cloud', desc: 'Đồng bộ hóa file save, tiếp tục chơi trên mọi thiết bị', icon: (
      <svg className="w-8 h-8 text-[#1e90ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
    )},
    { title: 'Huy Hiệu VIP Vinh Dự', desc: 'Hiển thị huy hiệu VIP vàng óng trên toàn hệ thống', icon: (
      <svg className="w-8 h-8 text-[#2ed573]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    )},
  ];

  return (
    <div className="w-full py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {user?.is_vip && (
          <div className="cartoon-container bg-[#fff8e1] p-8 text-center mb-10 border-[3px] border-[#231f20] shadow-[8px_8px_0px_#231f20]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#ffa502]/20 border-[3px] border-[#231f20] flex items-center justify-center text-[#ffa502] shadow-[4px_4px_0px_#231f20]">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#231f20] uppercase tracking-wide mb-2">Tài Khoản Đã Là VIP PRO!</h2>
            <p className="text-base sm:text-lg text-[#524d4a] font-bold">Cảm ơn chiến hữu đã đồng hành. Hãy tận hưởng mọi đặc quyền VIP trọn đời nhé!</p>
          </div>
        )}

        <div className="text-center mb-12">
          <span className="pill-badge pill-vip px-4 py-2 text-sm shadow-[3px_3px_0px_#231f20] mb-4">
            Gói Thành Viên VIP Pro Trọn Đời
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#231f20] uppercase tracking-tight mt-2 mb-4">
            Nâng Cấp <span className="text-[#ff4757]">VIP Pro</span>
          </h1>
          <p className="text-base sm:text-lg text-[#524d4a] max-w-xl mx-auto font-bold leading-relaxed">
            Chỉ với khoản tài trợ <span className="text-[#ff4757] font-black underline">50.000đ</span> duy nhất một lần, bạn sở hữu ngay toàn bộ đặc quyền VIP trọn đời không giới hạn!
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {features.map((f, i) => (
            <div key={i} className="cartoon-box bg-white p-6 flex items-start gap-5 border-[3px] border-[#231f20] shadow-[6px_6px_0px_#231f20]">
              <div className="w-14 h-14 rounded-2xl bg-[#f8f6ed] border-[3px] border-[#231f20] flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#231f20]">
                {f.icon}
              </div>
              <div>
                <h3 className="font-black text-[#231f20] text-base uppercase tracking-wide">{f.title}</h3>
                <p className="text-sm text-[#524d4a] mt-1 font-bold leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {!user?.is_vip && (
          <div className="cartoon-container bg-white p-8 sm:p-12 max-w-xl mx-auto border-[3px] border-[#231f20] shadow-[10px_10px_0px_#231f20]">
            <div className="text-center mb-8 border-b-[3px] border-[#f8f6ed] pb-8">
              <div className="text-4xl sm:text-5xl font-black text-[#ff4757] tracking-tight mb-2">50.000đ</div>
              <div className="text-sm font-black uppercase tracking-wider text-[#8c8580]">Thanh toán tự động qua VietQR / Chuyển khoản</div>
            </div>

            <div className="bg-[#f8f6ed] rounded-2xl p-6 space-y-4 mb-8 border-[3px] border-[#231f20] shadow-[4px_4px_0px_#231f20]">
              <div className="flex items-center justify-between text-sm font-bold"><span className="text-[#8c8580]">Ngân hàng:</span><span className="font-black text-[#231f20] text-base">MB Bank</span></div>
              <div className="flex items-center justify-between text-sm font-bold"><span className="text-[#8c8580]">Số tài khoản:</span><span className="font-black text-[#231f20] text-base font-mono">0123456789</span></div>
              <div className="flex items-center justify-between text-sm font-bold"><span className="text-[#8c8580]">Chủ tài khoản:</span><span className="font-black text-[#231f20] text-base">GAME TUOI THO</span></div>
              <div className="flex items-center justify-between text-sm font-bold"><span className="text-[#8c8580]">Số tiền chuyển:</span><span className="font-black text-[#ff4757] text-lg">50,000đ</span></div>
              
              <div className="border-t-[3px] border-[#231f20]/20 pt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-sm text-[#8c8580] font-bold">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <code className="flex-1 sm:flex-initial bg-white text-[#ff4757] px-3.5 py-2 rounded-xl text-sm font-black border-2 border-[#231f20] shadow-sm font-mono text-center">{transferContent}</code>
                    <button
                      onClick={copyContent}
                      className="px-5 py-2 bg-[#ff4757] hover:bg-[#ff2e43] text-white rounded-xl text-xs font-black uppercase transition-colors shrink-0 border-2 border-[#231f20] shadow-[2px_2px_0px_#231f20]"
                    >
                      {copied ? 'Đã chép!' : 'Sao chép'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {!user && (
              <div className="bg-[#ffebee] border-[3px] border-[#ff4757] rounded-2xl p-4 mb-6 text-center shadow-sm">
                <p className="text-sm text-[#231f20] font-bold">
                  Chiến hữu cần <a href="/login" className="font-black underline text-[#ff4757]">đăng nhập tài khoản</a> trước để nhận mã nội dung chuyển khoản tự động!
                </p>
              </div>
            )}

            <div className="text-center text-xs sm:text-sm font-bold text-[#8c8580] space-y-1">
              <p>Hệ thống tự động kích hoạt VIP tức thì trong 1&ndash;3 phút sau khi nhận chuyển khoản.</p>
              <p className="text-xs text-[#8c8580]/80">Cung cấp bởi cổng tự động SePay Webhook</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
