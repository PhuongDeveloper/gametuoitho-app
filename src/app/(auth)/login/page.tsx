'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Email hoặc mật khẩu không chính xác.'
        : authError.message);
      setLoading(false);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-14 h-14 bg-[#ff4757] border-[3px] border-[#231f20] rounded-2xl shadow-[4px_4px_0px_#231f20] flex items-center justify-center transition-transform group-hover:-translate-y-1">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 6H3a1 1 0 00-1 1v10a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zM7 15a2 2 0 110-4 2 2 0 010 4zm4-3.5a1 1 0 110-2h2a1 1 0 110 2h-2zm0 3a1 1 0 110-2h6a1 1 0 110 2h-6z"/>
              </svg>
            </div>
          </Link>
          <h1 className="mt-4 text-3xl font-black text-[#231f20] uppercase tracking-wide">Đăng Nhập</h1>
          <p className="text-sm sm:text-base text-[#524d4a] mt-1 font-bold">Chào mừng trở lại, chiến hữu game thủ!</p>
        </div>

        <div className="cartoon-container bg-white p-8 sm:p-10 shadow-[8px_8px_0px_#231f20] border-[3px] border-[#231f20]">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-[#ffebee] border-[3px] border-[#ff4757] text-[#ff4757] text-sm px-4 py-3 rounded-xl font-bold">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-black uppercase tracking-wide text-[#231f20] mb-2">Email tài khoản</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="gamer@email.com"
                className="input-cartoon"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-black uppercase tracking-wide text-[#231f20] mb-2">Mật khẩu</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
                className="input-cartoon"
              />
            </div>
            <div className="pt-2">
              <Button type="submit" loading={loading} className="w-full" size="lg">Vào Chơi Ngay</Button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t-[3px] border-[#f8f6ed] text-center">
            <span className="text-sm font-bold text-[#524d4a]">Chưa có tài khoản? </span>
            <Link href="/register" className="text-sm font-black text-[#ff4757] hover:underline uppercase tracking-wide">Đăng ký mới</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
