export default function HomeHero() {
  return (
    <section className="my-8">
      <div className="cartoon-container bg-white p-8 sm:p-12 lg:p-14 border-[3px] border-[#231f20] shadow-[10px_10px_0px_#231f20]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Headline & Big Tactile Buttons */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2.5 bg-[#e8f5e9] px-4 py-2 rounded-full border-2 border-[#231f20] shadow-[2px_2px_0px_#231f20]">
              <span className="w-3 h-3 bg-[#2ed573] rounded-full animate-pulse" />
              <span className="text-[#231f20] text-xs sm:text-sm font-black uppercase tracking-wide">
                Cổng Game Trực Tuyến &mdash; Hoạt Động 24/7
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#231f20] leading-[1.1] tracking-tight">
              CHƠI GAME TUỔI THƠ{' '}
              <span className="text-[#ff4757] uppercase block sm:inline">GBA &amp; JAVA ONLINE</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#524d4a] font-bold max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Cánh cổng hoài niệm đã mở &mdash; bước vào thế giới điện tử 4 nút, Game Boy Advance và Java (J2ME) huyền thoại. Chơi trực tiếp trên trình duyệt siêu tốc độ, không cần cài đặt và hoàn toàn miễn phí!
            </p>

            {/* Big Tactile 2D Buttons matching Hoi Uc 2018 */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a href="#games" className="btn-cartoon-red w-full sm:w-auto text-center text-base sm:text-lg px-8 py-4">
                <span>Vào Chơi Ngay</span>
              </a>
              <a href="/register" className="btn-cartoon-white w-full sm:w-auto text-center text-base sm:text-lg px-8 py-4">
                <span>Đăng Ký Tài Khoản</span>
              </a>
            </div>
          </div>

          {/* Right Column: Visual Game Showcase Frame matching Hoi Uc 2018 */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] rounded-2xl border-[3px] border-[#231f20] shadow-[8px_8px_0px_#231f20] overflow-hidden bg-gradient-to-br from-[#231f20] to-[#3e332a] group">
              
              {/* Graphic background simulation */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="w-20 h-20 mb-4 bg-[#ff4757] border-[3px] border-white rounded-2xl shadow-[4px_4px_0px_#000] flex items-center justify-center transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 6H3a1 1 0 00-1 1v10a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zM7 15a2 2 0 110-4 2 2 0 010 4zm4-3.5a1 1 0 110-2h2a1 1 0 110 2h-2zm0 3a1 1 0 110-2h6a1 1 0 110 2h-6z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-wider text-white drop-shadow-md">
                  Huyền Thoại 2000s
                </h3>
                <p className="text-sm font-bold text-white/90 mt-1 max-w-xs drop-shadow">
                  Pokemon, Ninja School, Avatar, KOF, Mario... và hơn 500+ game bất hủ!
                </p>

                {/* Simulated Game UI Overlay */}
                <div className="mt-6 flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-[#ffa502] text-[#231f20] font-black text-xs border-2 border-[#231f20] shadow-sm">
                    60 FPS
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#2ed573] text-white font-black text-xs border-2 border-[#231f20] shadow-sm">
                    Cloud Save
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#1e90ff] text-white font-black text-xs border-2 border-[#231f20] shadow-sm">
                    Gamepad
                  </span>
                </div>
              </div>

              {/* Top border decoration */}
              <div className="absolute top-0 inset-x-0 h-8 bg-[#231f20] border-b-2 border-[#231f20] flex items-center px-3 gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff4757] border border-white/20" />
                <span className="w-3 h-3 rounded-full bg-[#ffa502] border border-white/20" />
                <span className="w-3 h-3 rounded-full bg-[#2ed573] border border-white/20" />
                <span className="ml-auto text-[10px] font-mono font-bold text-white/60">emulator_engine_v3.js</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
