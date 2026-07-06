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
    (window as any).EJS_color = '#dc2626'; // Red theme
    (window as any).EJS_startOnLoaded = true;
    (window as any).EJS_oldCores = false;

    // Load EmulatorJS script
    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.setAttribute('data-emulator', 'true');
    document.body.appendChild(script);
  };

  if (isJar) {
    // J2ME games use iframe embed
    return (
      <div className="emulator-container w-full">
        <div className="relative w-full" style={{ paddingBottom: '75%' }}>
          <iframe
            src={`https://nickeys.github.io/nicj2me/?jar=${encodeURIComponent(game.file_url)}`}
            className="absolute inset-0 w-full h-full border-0 rounded-2xl"
            allow="gamepad; autoplay"
            title={`Play ${game.title}`}
          />
        </div>
        <div className="bg-[#231f20] text-[#f8f6ed] p-3 rounded-b-2xl text-center text-xs font-bold mt-2 border-2 border-[#231f20]">
          <p>Bấm vào game rồi dùng bàn phím để chơi. Phím mũi tên = Di chuyển, Enter = OK, Backspace = Back</p>
        </div>
      </div>
    );
  }

  // GBA EmulatorJS
  return (
    <div className="emulator-container w-full">
      <div
        id="emulator-game"
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden"
        style={{ minHeight: '400px', maxHeight: '600px' }}
      />
      <div className="bg-[#231f20] text-[#f8f6ed] p-3 rounded-b-2xl text-center text-xs font-bold mt-2 border-2 border-[#231f20]">
        <p>
          Bấm vào màn hình game để bắt đầu. Dùng bàn phím hoặc tay cầm Gamepad để điều khiển.
        </p>
      </div>
    </div>
  );
}
