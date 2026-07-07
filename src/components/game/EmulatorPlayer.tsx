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

    // Performance & Hardware Acceleration Optimizations for GBA
    (window as any).EJS_multithread = false; // Prevent thread lockups & memory overhead on mobile
    (window as any).EJS_forceWebAssembly = true; // Use pure WebAssembly execution
    (window as any).EJS_videoSync = false; // Disable V-Sync lock on 120Hz/144Hz screens to stop heating & battery drain
    (window as any).EJS_fpsLimit = 60; // Cap at 60 FPS for smooth gameplay without thermal throttling
    (window as any).EJS_audioResampler = 'linear'; // Lightweight audio resampler to prevent stutter on weak CPUs

    // Force hide default EmulatorJS bottom button bar but KEEP touch controls for mobile
    (window as any).EJS_hideButtonBar = true;
    (window as any).EJS_hideControls = false;
    (window as any).EJS_Buttons = {
      playPause: false,
      restart: false,
      mute: false,
      settings: false,
      fullscreen: false,
      saveState: false,
      loadState: false,
      gamepad: true,
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
      <div id="emulator-wrapper" className="emulator-container w-full bg-[#1e272e] rounded-t-2xl overflow-hidden p-2 sm:p-4">
        <div className="relative w-full border-[3px] border-[#231f20] rounded-xl overflow-hidden bg-black shadow-[4px_4px_0px_#231f20] h-[75vh] sm:h-[650px] min-h-[320px] max-h-[85vh]">
          <iframe
            src={`/freej2me/web/run.html?url=${encodeURIComponent(game.file_url)}`}
            className="absolute inset-0 w-full h-full border-0 bg-black"
            style={{ transform: 'translateZ(0)', willChange: 'transform', backfaceVisibility: 'hidden' }}
            allow="gamepad; autoplay; fullscreen"
            title={`Play ${game.title}`}
          />
        </div>
      </div>
    );
  }

  // GBA EmulatorJS with custom CSS to hide any residual default bars while preserving touch controls
  return (
    <div id="emulator-wrapper" className="emulator-container w-full bg-[#1e272e] rounded-t-2xl overflow-hidden space-y-3 p-2 sm:p-4">
      <style jsx global>{`
        /* Hide default EmulatorJS control bar if EJS_hideButtonBar fails in some versions */
        #emulator-game .ejs--control-bar,
        #emulator-game .ejs--bottom-bar {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          height: 0 !important;
        }
        #emulator-game canvas {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          margin: 0 auto !important;
          display: block !important;
          image-rendering: -moz-crisp-edges !important;
          image-rendering: -webkit-optimize-contrast !important;
          image-rendering: pixelated !important;
          image-rendering: crisp-edges !important;
          transform: translateZ(0) !important;
          will-change: transform, contents !important;
          backface-visibility: hidden !important;
        }
      `}</style>
      <div
        id="emulator-game"
        ref={containerRef}
        className="relative w-full border-[3px] border-[#231f20] rounded-xl overflow-hidden bg-black shadow-[4px_4px_0px_#231f20] h-[75vh] sm:h-[650px] min-h-[320px] max-h-[85vh] flex items-center justify-center"
      />
      <div className="hidden lg:block bg-[#111418] text-[#f8f6ed] p-2 text-center text-xs font-bold rounded-xl border border-white/10">
        <p>Mẹo: Dùng thanh công cụ phía dưới để Lưu/Tải Game hoặc đổi phím điều khiển!</p>
      </div>
    </div>
  );
}
