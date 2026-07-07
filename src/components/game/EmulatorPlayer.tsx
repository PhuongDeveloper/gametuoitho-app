'use client';

import { useEffect, useRef } from 'react';
import type { Game } from '@/types/database';

interface EmulatorPlayerProps {
  game: Game;
}

export default function EmulatorPlayer({ game }: EmulatorPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const isJar =
    game.platform === 'JAR' ||
    game.file_url?.toLowerCase().endsWith('.jar') ||
    game.file_url?.toLowerCase().endsWith('.jad') ||
    game.category === 'JAR';

  useEffect(() => {
    if (!isJar) {
      loadEmulatorJS();
    }

    return () => {
      // Cleanup EmulatorJS on unmount
      const scripts = document.querySelectorAll('script[data-emulator]');
      scripts.forEach((s) => s.remove());
    };
  }, [game, isJar]);

  const loadEmulatorJS = () => {
    // Set EmulatorJS global config
    (window as any).EJS_player = '#emulator-game';
    (window as any).EJS_core = 'gba';
    (window as any).EJS_gameUrl = game.file_url;
    (window as any).EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    (window as any).EJS_color = '#ff4757'; // Vibrant red
    (window as any).EJS_startOnLoaded = true;
    (window as any).EJS_oldCores = false;

    // Force hide default EmulatorJS bottom button bar and controls
    (window as any).EJS_hideButtonBar = true;
    (window as any).EJS_hideControls = true;
    (window as any).EJS_Buttons = {
      playPause: false,
      restart: false,
      mute: false,
      settings: false,
      fullscreen: false,
      saveState: false,
      loadState: false,
      gamepad: false,
      cheat: false,
      volume: false,
    };

    // Load EmulatorJS script
    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.setAttribute('data-emulator', 'true');
    document.body.appendChild(script);
  };

  if (isJar) {
    // J2ME games use stable FreeJ2ME CheerpJ Web port hosted locally (same-origin) with auto URL boot
    return (
      <div id="emulator-wrapper" className="emulator-container w-full bg-[#1e272e] rounded-t-2xl overflow-hidden space-y-3 p-2 sm:p-4">
        {/* Helper instructions for CheerpJ FreeJ2ME (Hidden on mobile to save vertical space) */}
        <div className="hidden sm:flex bg-[#fff8e1] border-[3px] border-[#231f20] rounded-xl p-3 sm:p-4 text-[#231f20] shadow-[4px_4px_0px_#231f20] flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs sm:text-sm font-bold space-y-1 text-left">
            <p className="font-black text-[#ff4757] uppercase text-sm">
              Trình giả lập Java J2ME tự động nạp game:
            </p>
            <p>Trò chơi đang được tự động tải và nạp vào bộ nhớ trình giả lập. Bạn không cần chọn file thủ công.</p>
            <p>Sử dụng bàn phím vật lý hoặc bấm nút <span className="font-black underline">Hiện Tay Cầm Ảo</span> phía dưới để điều khiển.</p>
          </div>
          <a
            href={game.file_url}
            download={`${game.title || 'game'}.jar`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3 bg-[#ff4757] hover:bg-[#ff2e43] text-white font-black text-xs sm:text-sm rounded-xl border-[3px] border-[#231f20] shadow-[3px_3px_0px_#231f20] active:translate-y-0.5 transition-all whitespace-nowrap flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            <span>Tải File Game .JAR</span>
          </a>
        </div>

        <div className="relative w-full border-[3px] border-[#231f20] rounded-xl overflow-hidden bg-black shadow-[4px_4px_0px_#231f20] h-[75vh] sm:h-[650px] min-h-[320px] max-h-[85vh]">
          <iframe
            src={`/freej2me/web/run.html?url=${encodeURIComponent(game.file_url)}`}
            className="absolute inset-0 w-full h-full border-0 bg-black"
            allow="gamepad; autoplay; fullscreen"
            title={`Play ${game.title}`}
          />
        </div>
      </div>
    );
  }

  // GBA EmulatorJS with custom CSS to hide any residual default bars
  return (
    <div id="emulator-wrapper" className="emulator-container w-full bg-[#1e272e] rounded-t-2xl overflow-hidden relative">
      <style jsx global>{`
        /* Hide default EmulatorJS control bar if EJS_hideButtonBar fails in some versions */
        #emulator-game .ejs--control-bar,
        #emulator-game .ejs--controls,
        #emulator-game .ejs--bottom-bar,
        #emulator-game > div:nth-child(2) {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          height: 0 !important;
        }
        #emulator-game canvas {
          width: 100% !important;
          height: auto !important;
          max-height: 70vh !important;
          margin: 0 auto !important;
          display: block !important;
        }
      `}</style>
      <div
        id="emulator-game"
        ref={containerRef}
        className="w-full overflow-hidden flex items-center justify-center bg-black"
        style={{ minHeight: '420px', maxHeight: '70vh' }}
      />
      <div className="bg-[#111418] text-[#f8f6ed] p-2 text-center text-xs font-bold border-t border-white/10">
        <p>Mẹo: Dùng thanh công cụ phía dưới để Lưu/Tải Game hoặc đổi phím điều khiển!</p>
      </div>
    </div>
  );
}
