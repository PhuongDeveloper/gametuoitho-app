'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

export default function Header() {
  const [user, setUser] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        if (profile) setUser(profile);
      }
    };
    getUser();
  }, [supabase]);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#fcfaf2] border-b-[3px] border-[#231f20] shadow-[0_4px_0_rgba(35,31,32,0.05)]">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-12 h-12 bg-[#ff4757] border-[3px] border-[#231f20] rounded-2xl shadow-[3px_3px_0px_#231f20] flex items-center justify-center transition-transform group-hover:-translate-y-0.5">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 6H3a1 1 0 00-1 1v10a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zM7 15a2 2 0 110-4 2 2 0 010 4zm4-3.5a1 1 0 110-2h2a1 1 0 110 2h-2zm0 3a1 1 0 110-2h6a1 1 0 110 2h-6z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-[#231f20] tracking-tight leading-none">
                GameTuoiTho
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#ff4757] mt-1">
                Huyền Thoại 2D
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Pills */}
          <nav className="hidden lg:flex items-center gap-3">
            <Link
              href="/"
              className={`px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wide transition-all border-2 ${pathname === '/' && !pathname.includes('category')
                ? 'bg-[#ff4757] text-white border-[#231f20] shadow-[3px_3px_0px_#231f20]'
                : 'bg-white text-[#231f20] border-[#231f20] hover:bg-[#fff8e1] shadow-[2px_2px_0px_#231f20]'
                }`}
            >
              Trang Chủ
            </Link>
            <Link
              href="/vip"
              className="px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wide bg-[#ffa502] text-[#231f20] border-2 border-[#231f20] hover:bg-[#ff9f1a] shadow-[3px_3px_0px_#231f20] transition-all flex items-center gap-1.5"
            >
              <span>VIP Pro</span>
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xs relative">
            <input
              type="text"
              placeholder="Tìm kiếm trò chơi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border-2 border-[#231f20] rounded-xl text-sm font-bold text-[#231f20] placeholder-[#8c8580] shadow-[2px_2px_0px_#231f20] focus:outline-none focus:border-[#ff4757] transition-all"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#231f20] hover:text-[#ff4757] p-1"
              aria-label="Tìm kiếm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Account / Actions */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 bg-[#1e90ff] text-white rounded-xl text-xs font-black uppercase border-2 border-[#231f20] shadow-[2px_2px_0px_#231f20]"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/vip"
                  className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border-2 border-[#231f20] shadow-[2px_2px_0px_#231f20] hover:bg-[#fff8e1] transition-all"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#ffa502] border border-[#231f20] flex items-center justify-center text-white text-xs font-black">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-black text-[#231f20]">{user.username || 'Game Thủ'}</span>
                  {user.is_vip && <span className="pill-badge pill-vip text-[10px] py-0.5 px-1.5">VIP</span>}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-white hover:bg-[#fde8e8] text-[#231f20] rounded-xl text-xs font-black uppercase border-2 border-[#231f20] shadow-[2px_2px_0px_#231f20] transition-all"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-white hover:bg-[#fff8e1] text-[#231f20] rounded-xl font-black text-sm uppercase tracking-wide border-2 border-[#231f20] shadow-[3px_3px_0px_#231f20] transition-all"
                >
                  Đăng Nhập
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-[#ff4757] hover:bg-[#ff2e43] text-white rounded-xl font-black text-sm uppercase tracking-wide border-2 border-[#231f20] shadow-[3px_3px_0px_#231f20] transition-all"
                >
                  Đăng Ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 bg-white border-2 border-[#231f20] rounded-xl text-[#231f20] shadow-[2px_2px_0px_#231f20]"
            aria-label="Mở menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="lg:hidden py-4 border-t-2 border-[#231f20] space-y-3 bg-[#fcfaf2]">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Tìm kiếm trò chơi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border-2 border-[#231f20] rounded-xl text-sm font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#ff4757] text-white font-black rounded-xl border-2 border-[#231f20] shadow-[2px_2px_0px_#231f20]"
              >
                Tìm
              </button>
            </form>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/" onClick={() => setMenuOpen(false)} className="p-2.5 bg-white border-2 border-[#231f20] rounded-xl text-center font-black text-sm shadow-[2px_2px_0px_#231f20]">
                Trang Chủ
              </Link>
              <Link href="/vip" onClick={() => setMenuOpen(false)} className="p-2.5 bg-[#ffa502] border-2 border-[#231f20] rounded-xl text-center font-black text-sm shadow-[2px_2px_0px_#231f20]">
                VIP Pro
              </Link>
            </div>
            {!user ? (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#231f20]/20">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="p-2.5 bg-white border-2 border-[#231f20] rounded-xl text-center font-black text-sm shadow-[2px_2px_0px_#231f20]">
                  Đăng Nhập
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="p-2.5 bg-[#ff4757] text-white border-2 border-[#231f20] rounded-xl text-center font-black text-sm shadow-[2px_2px_0px_#231f20]">
                  Đăng Ký
                </Link>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#231f20]/20 flex justify-between items-center">
                <span className="font-black text-sm">Xin chào, {user.username}</span>
                <button onClick={handleSignOut} className="px-3 py-1.5 bg-[#ff4757] text-white rounded-xl text-xs font-black border-2 border-[#231f20]">
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
