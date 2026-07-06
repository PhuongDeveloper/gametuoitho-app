import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#fcfaf2] px-4">
      <div className="cartoon-container bg-white p-8 sm:p-12 border-[3px] border-[#231f20] shadow-[8px_8px_0px_#231f20] rounded-2xl text-center max-w-sm w-full animate-pulse">
        {/* Animated Gamepad Icon */}
        <div className="w-20 h-20 bg-[#ff4757] border-[3px] border-[#231f20] rounded-2xl shadow-[4px_4px_0px_#231f20] mx-auto flex items-center justify-center mb-6 animate-bounce">
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 6H3a1 1 0 00-1 1v10a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1zM7 15a2 2 0 110-4 2 2 0 010 4zm4-3.5a1 1 0 110-2h2a1 1 0 110 2h-2zm0 3a1 1 0 110-2h6a1 1 0 110 2h-6z" />
          </svg>
        </div>
        
        <h2 className="text-xl font-black uppercase text-[#231f20] tracking-wider mb-2">
          Đang tải trò chơi...
        </h2>
        <p className="text-sm font-bold text-[#524d4a]">
          Chuẩn bị hành trang tuổi thơ, vui lòng đợi giây lát!
        </p>

        {/* Loading progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-3 h-3 bg-[#ff4757] border-2 border-[#231f20] rounded-full animate-ping" />
          <div className="w-3 h-3 bg-[#ffa502] border-2 border-[#231f20] rounded-full animate-ping delay-100" />
          <div className="w-3 h-3 bg-[#2ed573] border-2 border-[#231f20] rounded-full animate-ping delay-200" />
        </div>
      </div>
    </div>
  );
}
