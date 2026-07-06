'use client';

import { useEffect, useRef } from 'react';
import type { Game } from '@/types/database';

interface EmulatorPlayerProps {
  game: Game;
  engine?: string;
}

export default function EmulatorPlayer({ game, engine = 'freej2me' }: EmulatorPlayerProps) {
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
      screenRecord: false,
      gamepad: false,
      cheat: false,
      volume: false,
      saveSavFiles: false,
      loadSavFiles: false,
      fastForward: false,
    };

    // Load EmulatorJS script
    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.setAttribute('data-emulator', 'true');
    document.body.appendChild(script);
  };

  if (isJar) {
    // J2ME games use iframe embed with stable CheerpJ / FreeJ2ME / J2ME.js ports
    const jarUrl = encodeURIComponent(game.file_url);
    const iframeSrc =
      engine === 'j2mejs'
        ? `https://ta1902.github.io/j2me.js/?url=${jarUrl}`
        : `https://zb3.github.io/freej2me-web/?url=${jarUrl}`;

    return (
      <div id="emulator-wrapper" className="emulator-container w-full bg-[#1e272e] rounded-t-2xl overflow-hidden">
        <div className="relative w-full" style={{ paddingBottom: '65%', minHeight: '420px' }}>
          <iframe
            src={iframeSrc}
            className="absolute inset-0 w-full h-full border-0 bg-black"
            allow="gamepad; autoplay; fullscreen"
            title={`Play ${game.title}`}
          />
        </div>
        <div className="bg-[#111418] text-[#f8f6ed] p-2 text-center text-xs font-bold border-t border-white/10">
          <p>💡 Mẹo: Nhấn nút hoặc dùng bàn phím số (1-9, Enter = Fire, Q/W = Phím mềm) để chơi game Java!</p>
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
        <p>💡 Mẹo: Dùng thanh công cụ GameTuoiTho phía dưới để Lưu/Tải Game hoặc đổi phím điều khiển!</p>
      </div>
    </div>
  );
}
