'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#fcfaf2] border-t-[3px] border-[#231f20] mt-20">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#ff4757] border-[3px] border-[#231f20] rounded-2xl shadow-[3px_3px_0px_#231f20] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 6H3a1 1 0 00-1 1v10a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zM7 15a2 2 0 110-4 2 2 0 010 4zm4-3.5a1 1 0 110-2h2a1 1 0 110 2h-2zm0 3a1 1 0 110-2h6a1 1 0 110 2h-6z"/>
                </svg>
              </div>
              <span className="text-2xl font-black text-[#231f20] tracking-tight">
                GameTuoiTho.online
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-[#524d4a] max-w-md leading-relaxed">
              Cổng game điện tử 4 nút, Game Boy Advance (GBA), và Java (J2ME) huyền thoại chạy trực tiếp trên web. Hoàn toàn miễn phí, không cần cài đặt ứng dụng phức tạp!
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-[#231f20] mb-4 border-b-2 border-[#231f20] inline-block pb-1">
              Thể Loại Game
            </h4>
            <ul className="space-y-3 text-sm font-black text-[#524d4a]">
              <li>
                <Link href="/?category=hanh-dong" className="hover:text-[#ff4757] transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff4757] border border-[#231f20]" />
                  Game Hành Động
                </Link>
              </li>
              <li>
                <Link href="/?category=phieu-luu" className="hover:text-[#1e90ff] transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1e90ff] border border-[#231f20]" />
                  Game Phiêu Lưu
                </Link>
              </li>
              <li>
                <Link href="/?category=nhap-vai" className="hover:text-[#2ed573] transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2ed573] border border-[#231f20]" />
                  Nhập Vai (RPG)
                </Link>
              </li>
              <li>
                <Link href="/?category=VIP" className="hover:text-[#ffa502] transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ffa502] border border-[#231f20]" />
                  Kho Game VIP Pro
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: VIP & Account */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-[#231f20] mb-4 border-b-2 border-[#231f20] inline-block pb-1">
              Tài Khoản
            </h4>
            <ul className="space-y-3 text-sm font-black text-[#524d4a]">
              <li>
                <Link href="/vip" className="hover:text-[#ff4757] transition-colors">
                  Nâng Cấp VIP Trọn Đời
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#ff4757] transition-colors">
                  Đăng Nhập Tài Khoản
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#ff4757] transition-colors">
                  Đăng Ký Miễn Phí
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t-2 border-[#231f20]/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm font-bold text-[#8c8580]">
          <p>
            &copy; {new Date().getFullYear()} GameTuoiTho.online &mdash; Phát triển vì tình yêu với game cổ điển.
          </p>
          <div className="flex items-center gap-4">
            <a href="#top" className="hover:text-[#231f20] underline font-black">
              Lên đầu trang &uarr;
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
