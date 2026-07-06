import React from 'react';

export default function GameLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb Skeleton */}
      <div className="h-6 w-48 bg-gray-200 border-2 border-[#231f20] rounded-lg mb-6 animate-pulse" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Player Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="w-full bg-[#1e272e] border-[3px] border-[#231f20] rounded-2xl shadow-[6px_6px_0px_#231f20] aspect-video flex flex-col items-center justify-center p-8 animate-pulse">
            <div className="w-16 h-16 bg-[#ff4757] border-[3px] border-[#231f20] rounded-2xl flex items-center justify-center animate-bounce mb-4">
              <span className="text-white font-black text-2xl">2D</span>
            </div>
            <p className="text-white font-black uppercase tracking-wider text-base">
              Đang kết nối phòng chơi...
            </p>
          </div>
          <div className="h-16 w-full bg-white border-[3px] border-[#231f20] rounded-xl shadow-[4px_4px_0px_#231f20] animate-pulse" />
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="bg-white border-[3px] border-[#231f20] rounded-2xl p-6 shadow-[6px_6px_0px_#231f20] animate-pulse space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 border-2 border-[#231f20] rounded-lg" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-5/6 bg-gray-200 rounded" />
            <div className="h-12 w-full bg-[#ff4757] border-2 border-[#231f20] rounded-xl mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
