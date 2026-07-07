'use client';

import { useState } from 'react';
import KeyConfigModal from './KeyConfigModal';

interface GameControlBarProps {
  slug: string;
  platform: 'GBA' | 'JAR';
  onToggleGamepad: () => void;
  isGamepadVisible: boolean;
}

export default function GameControlBar({
  slug,
  platform,
  onToggleGamepad,
  isGamepadVisible,
}: GameControlBarProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [volume, setVolume] = useState(80);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle Save State to LocalStorage
  const handleSaveState = () => {
    if (platform === 'JAR') {
      showToast('Game Java JAR tự động lưu tiến trình trong bộ nhớ giả lập!', 'success');
      return;
    }

    const emu = (window as any).EJS_emulator;
    if (emu && typeof emu.saveState === 'function') {
      try {
        // Register transient callback to catch save state data
        (window as any).EJS_onSaveState = function (data: any) {
          localStorage.setItem(`savestate_${slug}`, JSON.stringify(data));
          showToast('Đã lưu game vào bộ nhớ trình duyệt!');
        };
        emu.saveState();
      } catch (e) {
        showToast('Không thể lưu state lúc này. Vui lòng thử lại!', 'error');
      }
    } else {
      showToast('Đang khởi tạo trình giả lập, vui lòng đợi giây lát...', 'error');
    }
  };

  // Handle Load State from LocalStorage
  const handleLoadState = () => {
    if (platform === 'JAR') {
      showToast('Game Java JAR tự động nạp tiến trình khi mở lại!', 'success');
      return;
    }

    const savedData = localStorage.getItem(`savestate_${slug}`);
    if (!savedData) {
      showToast('Chưa có bản lưu nào cho trò chơi này!', 'error');
      return;
    }

    const emu = (window as any).EJS_emulator;
    if (emu && typeof emu.loadState === 'function') {
      try {
        const parsed = JSON.parse(savedData);
        emu.loadState(parsed);
        showToast('Đã tải lại bản lưu thành công!');
      } catch (e) {
        showToast('Bản lưu bị lỗi hoặc không tương thích!', 'error');
      }
    } else {
      showToast('Đang khởi tạo trình giả lập, vui lòng đợi...', 'error');
    }
  };

  // Handle Volume Change
  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    const emu = (window as any).EJS_emulator;
    if (emu && typeof emu.setVolume === 'function') {
      emu.setVolume(newVal / 100);
    } else {
      // Try setting volume on any media element inside emulator
      const media = document.querySelector('#emulator-game audio, #emulator-game video') as HTMLMediaElement;
      if (media) media.volume = newVal / 100;
    }
  };

  // Handle Fullscreen
  const handleFullscreen = () => {
    const container = document.getElementById('emulator-wrapper') || document.getElementById('emulator-game');
    if (container) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      }
    }
  };

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3 rounded-xl border-[3px] border-[#231f20] shadow-[4px_4px_0px_#231f20] font-black text-sm text-white ${toast.type === 'success' ? 'bg-[#2ed573]' : 'bg-[#ff4757]'
              }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="bg-[#231f20] border-[3px] border-[#231f20] rounded-b-2xl p-3 px-4 sm:px-6 shadow-[6px_6px_0px_#231f20] flex flex-wrap items-center justify-between gap-3 text-white">

        {/* Left: Save/Load State (GBA Only) or Engine Label (JAR) */}
        <div className="flex items-center gap-2 flex-wrap">
          {platform === 'GBA' ? (
            <>
              <button
                onClick={handleSaveState}
                className="px-4 py-2 bg-[#2ed573] hover:bg-[#26af5f] text-white rounded-xl font-black text-xs uppercase tracking-wide border-2 border-white/20 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] active:translate-y-0.5 transition-all flex items-center gap-1.5"
              >
                <span>Lưu Game</span>
              </button>
              <button
                onClick={handleLoadState}
                className="px-4 py-2 bg-[#ffa502] hover:bg-[#e59400] text-white rounded-xl font-black text-xs uppercase tracking-wide border-2 border-white/20 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] active:translate-y-0.5 transition-all flex items-center gap-1.5"
              >
                <span>Tải Game</span>
              </button>
            </>
          ) : null}
        </div>

        {/* Center: Volume Slider */}
        <div className="hidden sm:flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
          <span className="text-xs font-black text-gray-300">Âm Lượng:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-20 sm:w-28 accent-[#ff4757] cursor-pointer"
          />
          <span className="text-xs font-bold w-7 text-right">{volume}%</span>
        </div>

        {/* Right: Config, Gamepad Toggle (JAR Only), Fullscreen */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          <button
            onClick={() => setIsConfigOpen(true)}
            className="px-3.5 py-2 bg-[#3742fa] hover:bg-[#2f35ca] text-white rounded-xl font-black text-xs uppercase border-2 border-white/20 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] active:translate-y-0.5 transition-all flex items-center gap-1"
          >
            <span>Đổi Phím</span>
          </button>

          {platform === 'JAR' && (
            <button
              onClick={onToggleGamepad}
              className={`px-3.5 py-2 rounded-xl font-black text-xs uppercase border-2 border-white/20 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] active:translate-y-0.5 transition-all flex items-center gap-1 ${isGamepadVisible ? 'bg-[#ff4757] text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
            >
              <span>Nút Ảo: {isGamepadVisible ? 'Bật' : 'Tắt'}</span>
            </button>
          )}

          <button
            onClick={handleFullscreen}
            className="px-3.5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-black text-xs uppercase border-2 border-white/20 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] active:translate-y-0.5 transition-all"
            title="Toàn Màn Hình"
          >
            <span>Toàn Màn Hình</span>
          </button>
        </div>

      </div>

      {/* Modal Cấu hình phím */}
      <KeyConfigModal
        platform={platform}
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSaved={() => showToast('Đã lưu cấu hình phím thành công!')}
      />
    </div>
  );
}
