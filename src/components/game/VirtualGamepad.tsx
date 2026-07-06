'use client';

import { useState, useEffect, useCallback } from 'react';

interface VirtualGamepadProps {
  platform: 'GBA' | 'JAR';
  visible?: boolean;
  onClose?: () => void;
}

export default function VirtualGamepad({ platform, visible = true, onClose }: VirtualGamepadProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  const [keyMap, setKeyMap] = useState<Record<string, string>>({});

  // Load custom keybindings from localStorage
  useEffect(() => {
    const storageKey = `keybindings_${platform}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setKeyMap(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load keybindings', e);
      }
    } else {
      // Default key mappings
      if (platform === 'GBA') {
        setKeyMap({
          UP: 'ArrowUp',
          DOWN: 'ArrowDown',
          LEFT: 'ArrowLeft',
          RIGHT: 'ArrowRight',
          A: 'KeyZ',
          B: 'KeyX',
          L: 'KeyA',
          R: 'KeyS',
          SELECT: 'Backspace',
          START: 'Enter',
        });
      } else {
        // JAR Numpad and Softkeys
        setKeyMap({
          UP: 'ArrowUp',
          DOWN: 'ArrowDown',
          LEFT: 'ArrowLeft',
          RIGHT: 'ArrowRight',
          FIRE: 'Enter',
          SOFT_LEFT: 'KeyQ',
          SOFT_RIGHT: 'KeyW',
          KEY_1: 'Digit1',
          KEY_2: 'Digit2',
          KEY_3: 'Digit3',
          KEY_4: 'Digit4',
          KEY_5: 'Digit5',
          KEY_6: 'Digit6',
          KEY_7: 'Digit7',
          KEY_8: 'Digit8',
          KEY_9: 'Digit9',
          KEY_0: 'Digit0',
          KEY_STAR: '8', // *
          KEY_POUND: '3', // #
        });
      }
    }
  }, [platform]);

  // Dispatch keyboard event to window, document, and iframe
  const dispatchKey = useCallback((btnName: string, isDown: boolean) => {
    const code = keyMap[btnName] || (platform === 'GBA' ? defaultGbaCode(btnName) : defaultJarCode(btnName));
    
    setActiveKeys((prev) => ({ ...prev, [btnName]: isDown }));

    const eventType = isDown ? 'keydown' : 'keyup';
    const eventObj = new KeyboardEvent(eventType, {
      code: code,
      key: code.replace('Key', '').replace('Digit', '').replace('Arrow', ''),
      bubbles: true,
      cancelable: true,
    });

    // Dispatch to main window
    window.dispatchEvent(eventObj);
    document.dispatchEvent(eventObj);

    // Also dispatch into iframe if present (for JAR/J2ME)
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.dispatchEvent(eventObj);
      } catch (e) {
        // CORS might prevent direct access if external, but freej2me/j2me.js handles window events
      }
    }

    // For EmulatorJS internal engine if accessible
    if (platform === 'GBA' && (window as any).EJS_emulator) {
      // EmulatorJS listens to document/window key events by default
    }
  }, [keyMap, platform]);

  const defaultGbaCode = (btn: string) => {
    const map: Record<string, string> = {
      UP: 'ArrowUp', DOWN: 'ArrowDown', LEFT: 'ArrowLeft', RIGHT: 'ArrowRight',
      A: 'KeyZ', B: 'KeyX', L: 'KeyA', R: 'KeyS', SELECT: 'Backspace', START: 'Enter',
    };
    return map[btn] || 'Enter';
  };

  const defaultJarCode = (btn: string) => {
    const map: Record<string, string> = {
      UP: 'ArrowUp', DOWN: 'ArrowDown', LEFT: 'ArrowLeft', RIGHT: 'ArrowRight',
      FIRE: 'Enter', SOFT_LEFT: 'KeyQ', SOFT_RIGHT: 'KeyW',
      KEY_1: 'Digit1', KEY_2: 'Digit2', KEY_3: 'Digit3', KEY_4: 'Digit4',
      KEY_5: 'Digit5', KEY_6: 'Digit6', KEY_7: 'Digit7', KEY_8: 'Digit8',
      KEY_9: 'Digit9', KEY_0: 'Digit0',
    };
    return map[btn] || 'Enter';
  };

  if (!visible) return null;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-[#ff4757]/80 hover:bg-[#ff4757] text-white font-black text-sm rounded-full border-2 border-white shadow-[0_0_15px_rgba(255,71,87,0.5)] backdrop-blur-md transition-all flex items-center gap-2"
      >
        <span>🕹️ Hiện Tay Cầm Ảo</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40 flex flex-col justify-end p-4 pb-6 select-none touch-none">
      {/* Top bar controls for Gamepad */}
      <div className="flex justify-between items-center mb-auto pointer-events-auto w-full max-w-4xl mx-auto pt-2 px-2">
        <span className="text-xs font-black text-white bg-black/40 px-3 py-1 rounded-full border border-white/30 backdrop-blur-sm">
          🕹️ Nút Ảo {platform} (Chạm để điều khiển)
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="px-3 py-1 bg-black/50 hover:bg-black/70 text-white text-xs font-bold rounded-full border border-white/40 backdrop-blur-sm transition-all"
          >
            Thu gọn ⬇️
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 bg-[#ff4757]/80 hover:bg-[#ff4757] text-white text-xs font-bold rounded-full border border-white/40 backdrop-blur-sm transition-all"
            >
              Tắt ✖
            </button>
          )}
        </div>
      </div>

      {/* Main Controller Area */}
      <div className="flex justify-between items-end w-full max-w-6xl mx-auto gap-4">
        
        {/* Left Side: D-PAD */}
        <div className="pointer-events-auto relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          {/* UP */}
          <button
            onTouchStart={(e) => { e.preventDefault(); dispatchKey('UP', true); }}
            onTouchEnd={(e) => { e.preventDefault(); dispatchKey('UP', false); }}
            onMouseDown={() => dispatchKey('UP', true)}
            onMouseUp={() => dispatchKey('UP', false)}
            onMouseLeave={() => dispatchKey('UP', false)}
            className={`absolute top-0 w-12 h-12 sm:w-14 sm:h-14 rounded-t-2xl border-2 border-white/60 font-black text-white text-lg flex items-center justify-center backdrop-blur-sm transition-transform ${
              activeKeys['UP'] ? 'bg-[#ff4757]/90 scale-90' : 'bg-[#ff4757]/40 hover:bg-[#ff4757]/60'
            }`}
          >
            ▲
          </button>
          {/* DOWN */}
          <button
            onTouchStart={(e) => { e.preventDefault(); dispatchKey('DOWN', true); }}
            onTouchEnd={(e) => { e.preventDefault(); dispatchKey('DOWN', false); }}
            onMouseDown={() => dispatchKey('DOWN', true)}
            onMouseUp={() => dispatchKey('DOWN', false)}
            onMouseLeave={() => dispatchKey('DOWN', false)}
            className={`absolute bottom-0 w-12 h-12 sm:w-14 sm:h-14 rounded-b-2xl border-2 border-white/60 font-black text-white text-lg flex items-center justify-center backdrop-blur-sm transition-transform ${
              activeKeys['DOWN'] ? 'bg-[#ff4757]/90 scale-90' : 'bg-[#ff4757]/40 hover:bg-[#ff4757]/60'
            }`}
          >
            ▼
          </button>
          {/* LEFT */}
          <button
            onTouchStart={(e) => { e.preventDefault(); dispatchKey('LEFT', true); }}
            onTouchEnd={(e) => { e.preventDefault(); dispatchKey('LEFT', false); }}
            onMouseDown={() => dispatchKey('LEFT', true)}
            onMouseUp={() => dispatchKey('LEFT', false)}
            onMouseLeave={() => dispatchKey('LEFT', false)}
            className={`absolute left-0 w-12 h-12 sm:w-14 sm:h-14 rounded-l-2xl border-2 border-white/60 font-black text-white text-lg flex items-center justify-center backdrop-blur-sm transition-transform ${
              activeKeys['LEFT'] ? 'bg-[#ff4757]/90 scale-90' : 'bg-[#ff4757]/40 hover:bg-[#ff4757]/60'
            }`}
          >
            ◀
          </button>
          {/* RIGHT */}
          <button
            onTouchStart={(e) => { e.preventDefault(); dispatchKey('RIGHT', true); }}
            onTouchEnd={(e) => { e.preventDefault(); dispatchKey('RIGHT', false); }}
            onMouseDown={() => dispatchKey('RIGHT', true)}
            onMouseUp={() => dispatchKey('RIGHT', false)}
            onMouseLeave={() => dispatchKey('RIGHT', false)}
            className={`absolute right-0 w-12 h-12 sm:w-14 sm:h-14 rounded-r-2xl border-2 border-white/60 font-black text-white text-lg flex items-center justify-center backdrop-blur-sm transition-transform ${
              activeKeys['RIGHT'] ? 'bg-[#ff4757]/90 scale-90' : 'bg-[#ff4757]/40 hover:bg-[#ff4757]/60'
            }`}
          >
            ▶
          </button>
          {/* Center piece */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ff4757]/30 border border-white/30 rounded-full" />
        </div>

        {/* Center: START / SELECT */}
        <div className="pointer-events-auto flex gap-4 sm:gap-6 mb-2">
          <button
            onTouchStart={(e) => { e.preventDefault(); dispatchKey('SELECT', true); }}
            onTouchEnd={(e) => { e.preventDefault(); dispatchKey('SELECT', false); }}
            onMouseDown={() => dispatchKey('SELECT', true)}
            onMouseUp={() => dispatchKey('SELECT', false)}
            className={`px-4 sm:px-6 py-2 rounded-full border-2 border-white/60 font-black text-white text-xs tracking-wider uppercase backdrop-blur-sm transition-all ${
              activeKeys['SELECT'] ? 'bg-[#ffa502]/90 scale-95' : 'bg-[#ffa502]/50 hover:bg-[#ffa502]/70'
            }`}
          >
            Select
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); dispatchKey('START', true); }}
            onTouchEnd={(e) => { e.preventDefault(); dispatchKey('START', false); }}
            onMouseDown={() => dispatchKey('START', true)}
            onMouseUp={() => dispatchKey('START', false)}
            className={`px-4 sm:px-6 py-2 rounded-full border-2 border-white/60 font-black text-white text-xs tracking-wider uppercase backdrop-blur-sm transition-all ${
              activeKeys['START'] ? 'bg-[#2ed573]/90 scale-95' : 'bg-[#2ed573]/50 hover:bg-[#2ed573]/70'
            }`}
          >
            Start
          </button>
        </div>

        {/* Right Side: ACTION BUTTONS (GBA vs JAR) */}
        <div className="pointer-events-auto">
          {platform === 'GBA' ? (
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
              {/* B Button */}
              <button
                onTouchStart={(e) => { e.preventDefault(); dispatchKey('B', true); }}
                onTouchEnd={(e) => { e.preventDefault(); dispatchKey('B', false); }}
                onMouseDown={() => dispatchKey('B', true)}
                onMouseUp={() => dispatchKey('B', false)}
                className={`absolute left-0 bottom-4 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/80 font-black text-white text-xl flex items-center justify-center backdrop-blur-sm transition-transform shadow-[0_4px_10px_rgba(0,0,0,0.3)] ${
                  activeKeys['B'] ? 'bg-[#ff4757]/95 scale-90' : 'bg-[#ff4757]/50 hover:bg-[#ff4757]/70'
                }`}
              >
                B
              </button>
              {/* A Button */}
              <button
                onTouchStart={(e) => { e.preventDefault(); dispatchKey('A', true); }}
                onTouchEnd={(e) => { e.preventDefault(); dispatchKey('A', false); }}
                onMouseDown={() => dispatchKey('A', true)}
                onMouseUp={() => dispatchKey('A', false)}
                className={`absolute right-0 top-4 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/80 font-black text-white text-xl flex items-center justify-center backdrop-blur-sm transition-transform shadow-[0_4px_10px_rgba(0,0,0,0.3)] ${
                  activeKeys['A'] ? 'bg-[#ff4757]/95 scale-90' : 'bg-[#ff4757]/50 hover:bg-[#ff4757]/70'
                }`}
              >
                A
              </button>
              {/* L Button */}
              <button
                onTouchStart={(e) => { e.preventDefault(); dispatchKey('L', true); }}
                onTouchEnd={(e) => { e.preventDefault(); dispatchKey('L', false); }}
                onMouseDown={() => dispatchKey('L', true)}
                onMouseUp={() => dispatchKey('L', false)}
                className={`absolute top-0 left-4 px-4 py-1.5 rounded-full border border-white/60 font-black text-white text-xs uppercase backdrop-blur-sm ${
                  activeKeys['L'] ? 'bg-[#3742fa]/90' : 'bg-[#3742fa]/50'
                }`}
              >
                L
              </button>
              {/* R Button */}
              <button
                onTouchStart={(e) => { e.preventDefault(); dispatchKey('R', true); }}
                onTouchEnd={(e) => { e.preventDefault(); dispatchKey('R', false); }}
                onMouseDown={() => dispatchKey('R', true)}
                onMouseUp={() => dispatchKey('R', false)}
                className={`absolute bottom-0 right-4 px-4 py-1.5 rounded-full border border-white/60 font-black text-white text-xs uppercase backdrop-blur-sm ${
                  activeKeys['R'] ? 'bg-[#3742fa]/90' : 'bg-[#3742fa]/50'
                }`}
              >
                R
              </button>
            </div>
          ) : (
            /* JAR J2ME Numpad & Softkeys */
            <div className="grid grid-cols-3 gap-2 w-44 sm:w-52 bg-black/40 p-2 rounded-2xl border border-white/30 backdrop-blur-md">
              <button
                onTouchStart={(e) => { e.preventDefault(); dispatchKey('SOFT_LEFT', true); }}
                onTouchEnd={(e) => { e.preventDefault(); dispatchKey('SOFT_LEFT', false); }}
                onMouseDown={() => dispatchKey('SOFT_LEFT', true)}
                onMouseUp={() => dispatchKey('SOFT_LEFT', false)}
                className="col-span-1 py-2 bg-[#ffa502]/60 hover:bg-[#ffa502] text-white font-black text-xs rounded-xl border border-white/40 active:scale-95 transition-all"
              >
                L.Soft
              </button>
              <button
                onTouchStart={(e) => { e.preventDefault(); dispatchKey('FIRE', true); }}
                onTouchEnd={(e) => { e.preventDefault(); dispatchKey('FIRE', false); }}
                onMouseDown={() => dispatchKey('FIRE', true)}
                onMouseUp={() => dispatchKey('FIRE', false)}
                className="col-span-1 py-2 bg-[#ff4757]/70 hover:bg-[#ff4757] text-white font-black text-xs rounded-xl border border-white/60 active:scale-95 transition-all"
              >
                FIRE
              </button>
              <button
                onTouchStart={(e) => { e.preventDefault(); dispatchKey('SOFT_RIGHT', true); }}
                onTouchEnd={(e) => { e.preventDefault(); dispatchKey('SOFT_RIGHT', false); }}
                onMouseDown={() => dispatchKey('SOFT_RIGHT', true)}
                onMouseUp={() => dispatchKey('SOFT_RIGHT', false)}
                className="col-span-1 py-2 bg-[#ffa502]/60 hover:bg-[#ffa502] text-white font-black text-xs rounded-xl border border-white/40 active:scale-95 transition-all"
              >
                R.Soft
              </button>

              {/* Numpad 1-9 */}
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onTouchStart={(e) => { e.preventDefault(); dispatchKey(`KEY_${num}`, true); }}
                  onTouchEnd={(e) => { e.preventDefault(); dispatchKey(`KEY_${num}`, false); }}
                  onMouseDown={() => dispatchKey(`KEY_${num}`, true)}
                  onMouseUp={() => dispatchKey(`KEY_${num}`, false)}
                  className="py-2 sm:py-2.5 bg-[#ff4757]/40 hover:bg-[#ff4757]/70 text-white font-black text-sm rounded-xl border border-white/50 active:bg-[#ff4757] active:scale-95 transition-all shadow-sm"
                >
                  {num}
                </button>
              ))}

              <button
                onTouchStart={(e) => { e.preventDefault(); dispatchKey('KEY_STAR', true); }}
                onTouchEnd={(e) => { e.preventDefault(); dispatchKey('KEY_STAR', false); }}
                onMouseDown={() => dispatchKey('KEY_STAR', true)}
                onMouseUp={() => dispatchKey('KEY_STAR', false)}
                className="py-2 bg-[#ff4757]/40 hover:bg-[#ff4757]/70 text-white font-black text-sm rounded-xl border border-white/50 active:scale-95 transition-all"
              >
                *
              </button>
              <button
                onTouchStart={(e) => { e.preventDefault(); dispatchKey('KEY_0', true); }}
                onTouchEnd={(e) => { e.preventDefault(); dispatchKey('KEY_0', false); }}
                onMouseDown={() => dispatchKey('KEY_0', true)}
                onMouseUp={() => dispatchKey('KEY_0', false)}
                className="py-2 bg-[#ff4757]/40 hover:bg-[#ff4757]/70 text-white font-black text-sm rounded-xl border border-white/50 active:scale-95 transition-all"
              >
                0
              </button>
              <button
                onTouchStart={(e) => { e.preventDefault(); dispatchKey('KEY_POUND', true); }}
                onTouchEnd={(e) => { e.preventDefault(); dispatchKey('KEY_POUND', false); }}
                onMouseDown={() => dispatchKey('KEY_POUND', true)}
                onMouseUp={() => dispatchKey('KEY_POUND', false)}
                className="py-2 bg-[#ff4757]/40 hover:bg-[#ff4757]/70 text-white font-black text-sm rounded-xl border border-white/50 active:scale-95 transition-all"
              >
                #
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
