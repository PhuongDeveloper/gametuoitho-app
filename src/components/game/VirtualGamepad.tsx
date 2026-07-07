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
          SOFT_LEFT: 'F1',
          SOFT_RIGHT: 'F2',
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
          KEY_STAR: 'NumpadMultiply', // *
          KEY_POUND: 'NumpadDivide', // #
        });
      }
    }
  }, [platform]);

  // Dispatch keyboard event to window, document, and iframe
  const dispatchKey = useCallback((btnName: string, isDown: boolean) => {
    const code = keyMap[btnName] || (platform === 'GBA' ? defaultGbaCode(btnName) : defaultJarCode(btnName));
    
    setActiveKeys((prev) => ({ ...prev, [btnName]: isDown }));

    const eventType = isDown ? 'keydown' : 'keyup';
    let keyChar = code.startsWith('Key') ? code.replace('Key', '') : code.startsWith('Digit') ? code.replace('Digit', '') : code;
    if (code === 'NumpadMultiply' || code === 'NumpadAsterisk') keyChar = '*';
    if (code === 'NumpadDivide') keyChar = '#';

    const keyCodeMap: Record<string, number> = {
      ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39,
      Enter: 13, F1: 112, F2: 113, Backspace: 8, Escape: 27, Space: 32,
      Digit0: 48, Digit1: 49, Digit2: 50, Digit3: 51, Digit4: 52, Digit5: 53, Digit6: 54, Digit7: 55, Digit8: 56, Digit9: 57,
      NumpadMultiply: 106, NumpadAsterisk: 106, NumpadDivide: 111, KeyZ: 90, KeyX: 88, KeyA: 65, KeyS: 83, KeyQ: 81, KeyW: 87,
    };
    const keyCodeVal = keyCodeMap[code] || 0;

    const eventObj = new KeyboardEvent(eventType, {
      code: code,
      key: keyChar,
      keyCode: keyCodeVal,
      which: keyCodeVal,
      bubbles: true,
      cancelable: true,
    });

    // Dispatch to main window
    window.dispatchEvent(eventObj);
    document.dispatchEvent(eventObj);

    // Also dispatch into iframe if present (for JAR/J2ME)
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.dispatchEvent(eventObj);
        }
        if (iframe.contentDocument) {
          iframe.contentDocument.dispatchEvent(eventObj);
          const displayEl = iframe.contentDocument.getElementById('display') || iframe.contentDocument.querySelector('canvas');
          if (displayEl) {
            displayEl.dispatchEvent(eventObj);
          }
        }
      } catch (e) {
        // CORS might prevent direct access if external
      }
    });

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
      FIRE: 'Enter', SOFT_LEFT: 'F1', SOFT_RIGHT: 'F2',
      KEY_1: 'Digit1', KEY_2: 'Digit2', KEY_3: 'Digit3', KEY_4: 'Digit4',
      KEY_5: 'Digit5', KEY_6: 'Digit6', KEY_7: 'Digit7', KEY_8: 'Digit8',
      KEY_9: 'Digit9', KEY_0: 'Digit0', KEY_STAR: 'NumpadMultiply', KEY_POUND: 'NumpadDivide'
    };
    return map[btn] || 'Enter';
  };

  // Virtual gamepad is dedicated to GBA & JAR where same-origin DOM keyboard events work flawlessly
  if (!visible) return null;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 px-5 py-2.5 bg-[#ff4757] hover:bg-[#ff2e43] text-white font-black text-sm rounded-xl border-[3px] border-[#231f20] shadow-[4px_4px_0px_#231f20] active:translate-y-0.5 transition-all flex items-center gap-2 uppercase tracking-wide"
      >
        <span>Hiện Tay Cầm Ảo</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40 flex flex-col justify-end p-4 pb-6 select-none touch-none">
      {/* Top bar controls for Gamepad */}
      <div className="flex justify-between items-center mb-auto pointer-events-auto w-full max-w-4xl mx-auto pt-2 px-2">
        <span className="text-xs font-black text-[#231f20] bg-[#fff8e1] px-3.5 py-1.5 rounded-xl border-[3px] border-[#231f20] shadow-[3px_3px_0px_#231f20] uppercase tracking-wide">
          Nút Ảo {platform} (Chạm để điều khiển)
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-[#fff8e1] text-[#231f20] text-xs font-black uppercase rounded-xl border-[3px] border-[#231f20] shadow-[3px_3px_0px_#231f20] active:translate-y-0.5 transition-all"
          >
            Thu gọn
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-[#ff4757] hover:bg-[#ff2e43] text-white text-xs font-black uppercase rounded-xl border-[3px] border-[#231f20] shadow-[3px_3px_0px_#231f20] active:translate-y-0.5 transition-all"
            >
              Tắt
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
            onPointerDown={() => dispatchKey('UP', true)}
            onPointerUp={() => dispatchKey('UP', false)}
            onPointerLeave={() => dispatchKey('UP', false)}
            onPointerCancel={() => dispatchKey('UP', false)}
            className={`absolute top-0 w-12 h-12 sm:w-14 sm:h-14 rounded-t-xl border-[3px] border-[#231f20] font-black text-lg flex items-center justify-center transition-transform shadow-[3px_3px_0px_#231f20] ${
              activeKeys['UP'] ? 'bg-[#ff4757] text-white translate-y-0.5 shadow-[1px_1px_0px_#231f20]' : 'bg-white hover:bg-[#fff8e1] text-[#231f20]'
            }`}
          >
            ▲
          </button>
          {/* DOWN */}
          <button
            onPointerDown={() => dispatchKey('DOWN', true)}
            onPointerUp={() => dispatchKey('DOWN', false)}
            onPointerLeave={() => dispatchKey('DOWN', false)}
            onPointerCancel={() => dispatchKey('DOWN', false)}
            className={`absolute bottom-0 w-12 h-12 sm:w-14 sm:h-14 rounded-b-xl border-[3px] border-[#231f20] font-black text-lg flex items-center justify-center transition-transform shadow-[3px_3px_0px_#231f20] ${
              activeKeys['DOWN'] ? 'bg-[#ff4757] text-white translate-y-0.5 shadow-[1px_1px_0px_#231f20]' : 'bg-white hover:bg-[#fff8e1] text-[#231f20]'
            }`}
          >
            ▼
          </button>
          {/* LEFT */}
          <button
            onPointerDown={() => dispatchKey('LEFT', true)}
            onPointerUp={() => dispatchKey('LEFT', false)}
            onPointerLeave={() => dispatchKey('LEFT', false)}
            onPointerCancel={() => dispatchKey('LEFT', false)}
            className={`absolute left-0 w-12 h-12 sm:w-14 sm:h-14 rounded-l-xl border-[3px] border-[#231f20] font-black text-lg flex items-center justify-center transition-transform shadow-[3px_3px_0px_#231f20] ${
              activeKeys['LEFT'] ? 'bg-[#ff4757] text-white translate-y-0.5 shadow-[1px_1px_0px_#231f20]' : 'bg-white hover:bg-[#fff8e1] text-[#231f20]'
            }`}
          >
            ◀
          </button>
          {/* RIGHT */}
          <button
            onPointerDown={() => dispatchKey('RIGHT', true)}
            onPointerUp={() => dispatchKey('RIGHT', false)}
            onPointerLeave={() => dispatchKey('RIGHT', false)}
            onPointerCancel={() => dispatchKey('RIGHT', false)}
            className={`absolute right-0 w-12 h-12 sm:w-14 sm:h-14 rounded-r-xl border-[3px] border-[#231f20] font-black text-lg flex items-center justify-center transition-transform shadow-[3px_3px_0px_#231f20] ${
              activeKeys['RIGHT'] ? 'bg-[#ff4757] text-white translate-y-0.5 shadow-[1px_1px_0px_#231f20]' : 'bg-white hover:bg-[#fff8e1] text-[#231f20]'
            }`}
          >
            ▶
          </button>
          {/* Center piece */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#231f20] border-[3px] border-[#231f20] rounded-xl" />
        </div>

        {/* Center: START / SELECT */}
        <div className="pointer-events-auto flex gap-4 sm:gap-6 mb-2">
          <button
            onPointerDown={() => dispatchKey('SELECT', true)}
            onPointerUp={() => dispatchKey('SELECT', false)}
            onPointerLeave={() => dispatchKey('SELECT', false)}
            onPointerCancel={() => dispatchKey('SELECT', false)}
            className={`px-4 sm:px-6 py-2 rounded-xl border-[3px] border-[#231f20] font-black text-xs tracking-wider uppercase transition-all shadow-[3px_3px_0px_#231f20] ${
              activeKeys['SELECT'] ? 'bg-[#ffa502] text-white translate-y-0.5 shadow-[1px_1px_0px_#231f20]' : 'bg-white hover:bg-[#fff8e1] text-[#231f20]'
            }`}
          >
            Select
          </button>
          <button
            onPointerDown={() => dispatchKey('START', true)}
            onPointerUp={() => dispatchKey('START', false)}
            onPointerLeave={() => dispatchKey('START', false)}
            onPointerCancel={() => dispatchKey('START', false)}
            className={`px-4 sm:px-6 py-2 rounded-xl border-[3px] border-[#231f20] font-black text-xs tracking-wider uppercase transition-all shadow-[3px_3px_0px_#231f20] ${
              activeKeys['START'] ? 'bg-[#2ed573] text-white translate-y-0.5 shadow-[1px_1px_0px_#231f20]' : 'bg-white hover:bg-[#fff8e1] text-[#231f20]'
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
                onPointerDown={() => dispatchKey('B', true)}
                onPointerUp={() => dispatchKey('B', false)}
                onPointerLeave={() => dispatchKey('B', false)}
                onPointerCancel={() => dispatchKey('B', false)}
                className={`absolute left-0 bottom-4 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-[3px] border-[#231f20] font-black text-xl flex items-center justify-center transition-all shadow-[4px_4px_0px_#231f20] ${
                  activeKeys['B'] ? 'bg-[#ff4757] text-white translate-y-0.5 shadow-[2px_2px_0px_#231f20]' : 'bg-white hover:bg-[#fff8e1] text-[#231f20]'
                }`}
              >
                B
              </button>
              {/* A Button */}
              <button
                onPointerDown={() => dispatchKey('A', true)}
                onPointerUp={() => dispatchKey('A', false)}
                onPointerLeave={() => dispatchKey('A', false)}
                onPointerCancel={() => dispatchKey('A', false)}
                className={`absolute right-0 top-4 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-[3px] border-[#231f20] font-black text-xl flex items-center justify-center transition-all shadow-[4px_4px_0px_#231f20] ${
                  activeKeys['A'] ? 'bg-[#ff4757] text-white translate-y-0.5 shadow-[2px_2px_0px_#231f20]' : 'bg-white hover:bg-[#fff8e1] text-[#231f20]'
                }`}
              >
                A
              </button>
              {/* L Button */}
              <button
                onPointerDown={() => dispatchKey('L', true)}
                onPointerUp={() => dispatchKey('L', false)}
                onPointerLeave={() => dispatchKey('L', false)}
                onPointerCancel={() => dispatchKey('L', false)}
                className={`absolute top-0 left-4 px-4 py-1.5 rounded-xl border-[3px] border-[#231f20] font-black text-xs uppercase shadow-[3px_3px_0px_#231f20] transition-all ${
                  activeKeys['L'] ? 'bg-[#3742fa] text-white translate-y-0.5 shadow-[1px_1px_0px_#231f20]' : 'bg-white hover:bg-[#fff8e1] text-[#231f20]'
                }`}
              >
                L
              </button>
              {/* R Button */}
              <button
                onPointerDown={() => dispatchKey('R', true)}
                onPointerUp={() => dispatchKey('R', false)}
                onPointerLeave={() => dispatchKey('R', false)}
                onPointerCancel={() => dispatchKey('R', false)}
                className={`absolute bottom-0 right-4 px-4 py-1.5 rounded-xl border-[3px] border-[#231f20] font-black text-xs uppercase shadow-[3px_3px_0px_#231f20] transition-all ${
                  activeKeys['R'] ? 'bg-[#3742fa] text-white translate-y-0.5 shadow-[1px_1px_0px_#231f20]' : 'bg-white hover:bg-[#fff8e1] text-[#231f20]'
                }`}
              >
                R
              </button>
            </div>
          ) : (
            /* JAR J2ME Numpad & Softkeys */
            <div className="grid grid-cols-3 gap-2 w-44 sm:w-52 bg-[#fff8e1] p-3 rounded-2xl border-[3px] border-[#231f20] shadow-[6px_6px_0px_#231f20]">
              <button
                onPointerDown={() => dispatchKey('SOFT_LEFT', true)}
                onPointerUp={() => dispatchKey('SOFT_LEFT', false)}
                onPointerLeave={() => dispatchKey('SOFT_LEFT', false)}
                onPointerCancel={() => dispatchKey('SOFT_LEFT', false)}
                className="col-span-1 py-2 bg-[#ffa502] hover:bg-[#e59400] text-white font-black text-xs rounded-xl border-[3px] border-[#231f20] shadow-[2px_2px_0px_#231f20] active:translate-y-0.5 transition-all"
              >
                L.Soft
              </button>
              <button
                onPointerDown={() => dispatchKey('FIRE', true)}
                onPointerUp={() => dispatchKey('FIRE', false)}
                onPointerLeave={() => dispatchKey('FIRE', false)}
                onPointerCancel={() => dispatchKey('FIRE', false)}
                className="col-span-1 py-2 bg-[#ff4757] hover:bg-[#ff2e43] text-white font-black text-xs rounded-xl border-[3px] border-[#231f20] shadow-[2px_2px_0px_#231f20] active:translate-y-0.5 transition-all"
              >
                FIRE
              </button>
              <button
                onPointerDown={() => dispatchKey('SOFT_RIGHT', true)}
                onPointerUp={() => dispatchKey('SOFT_RIGHT', false)}
                onPointerLeave={() => dispatchKey('SOFT_RIGHT', false)}
                onPointerCancel={() => dispatchKey('SOFT_RIGHT', false)}
                className="col-span-1 py-2 bg-[#ffa502] hover:bg-[#e59400] text-white font-black text-xs rounded-xl border-[3px] border-[#231f20] shadow-[2px_2px_0px_#231f20] active:translate-y-0.5 transition-all"
              >
                R.Soft
              </button>

              {/* Numpad 1-9 */}
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onPointerDown={() => dispatchKey(`KEY_${num}`, true)}
                  onPointerUp={() => dispatchKey(`KEY_${num}`, false)}
                  onPointerLeave={() => dispatchKey(`KEY_${num}`, false)}
                  onPointerCancel={() => dispatchKey(`KEY_${num}`, false)}
                  className="py-2 sm:py-2.5 bg-white hover:bg-[#fff8e1] text-[#231f20] font-black text-sm rounded-xl border-[3px] border-[#231f20] shadow-[2px_2px_0px_#231f20] active:bg-[#ff4757] active:text-white active:translate-y-0.5 transition-all"
                >
                  {num}
                </button>
              ))}

              <button
                onPointerDown={() => dispatchKey('KEY_STAR', true)}
                onPointerUp={() => dispatchKey('KEY_STAR', false)}
                onPointerLeave={() => dispatchKey('KEY_STAR', false)}
                onPointerCancel={() => dispatchKey('KEY_STAR', false)}
                className="py-2 bg-white hover:bg-[#fff8e1] text-[#231f20] font-black text-sm rounded-xl border-[3px] border-[#231f20] shadow-[2px_2px_0px_#231f20] active:bg-[#ff4757] active:text-white active:translate-y-0.5 transition-all"
              >
                *
              </button>
              <button
                onPointerDown={() => dispatchKey('KEY_0', true)}
                onPointerUp={() => dispatchKey('KEY_0', false)}
                onPointerLeave={() => dispatchKey('KEY_0', false)}
                onPointerCancel={() => dispatchKey('KEY_0', false)}
                className="py-2 bg-white hover:bg-[#fff8e1] text-[#231f20] font-black text-sm rounded-xl border-[3px] border-[#231f20] shadow-[2px_2px_0px_#231f20] active:bg-[#ff4757] active:text-white active:translate-y-0.5 transition-all"
              >
                0
              </button>
              <button
                onPointerDown={() => dispatchKey('KEY_POUND', true)}
                onPointerUp={() => dispatchKey('KEY_POUND', false)}
                onPointerLeave={() => dispatchKey('KEY_POUND', false)}
                onPointerCancel={() => dispatchKey('KEY_POUND', false)}
                className="py-2 bg-white hover:bg-[#fff8e1] text-[#231f20] font-black text-sm rounded-xl border-[3px] border-[#231f20] shadow-[2px_2px_0px_#231f20] active:bg-[#ff4757] active:text-white active:translate-y-0.5 transition-all"
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
