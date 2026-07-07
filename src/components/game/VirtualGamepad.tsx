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

  // Virtual gamepad is dedicated ONLY to JAR (Java J2ME). For GBA, we let EmulatorJS handle its built-in touch controls!
  if (platform === 'GBA' || !visible) return null;

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
    <div className="fixed inset-0 pointer-events-none z-40 select-none touch-none">
      {/* Top bar controls for Gamepad */}
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 pointer-events-auto flex gap-2">
        <button
          onClick={() => setIsMinimized(true)}
          className="px-3 py-1.5 bg-white/90 backdrop-blur hover:bg-[#fff8e1] text-[#231f20] text-xs font-black uppercase rounded-xl border-[3px] border-[#231f20] shadow-[2px_2px_0px_#231f20] active:translate-y-0.5 transition-all"
        >
          Thu gọn Nút
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#ff4757]/90 backdrop-blur hover:bg-[#ff2e43] text-white text-xs font-black uppercase rounded-xl border-[3px] border-[#231f20] shadow-[2px_2px_0px_#231f20] active:translate-y-0.5 transition-all"
          >
            Tắt
          </button>
        )}
      </div>

      {/* Left Corner: D-PAD */}
      <div className="fixed left-3 bottom-3 sm:left-6 sm:bottom-6 z-50 pointer-events-auto flex flex-col items-center">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
          {/* UP */}
          <button
            onPointerDown={() => dispatchKey('UP', true)}
            onPointerUp={() => dispatchKey('UP', false)}
            onPointerLeave={() => dispatchKey('UP', false)}
            onPointerCancel={() => dispatchKey('UP', false)}
            className={`absolute top-0 w-10 h-10 sm:w-12 sm:h-12 rounded-t-xl border-[3px] border-[#231f20] font-black text-base sm:text-lg flex items-center justify-center transition-transform shadow-[2px_2px_0px_#231f20] ${
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
            className={`absolute bottom-0 w-10 h-10 sm:w-12 sm:h-12 rounded-b-xl border-[3px] border-[#231f20] font-black text-base sm:text-lg flex items-center justify-center transition-transform shadow-[2px_2px_0px_#231f20] ${
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
            className={`absolute left-0 w-10 h-10 sm:w-12 sm:h-12 rounded-l-xl border-[3px] border-[#231f20] font-black text-base sm:text-lg flex items-center justify-center transition-transform shadow-[2px_2px_0px_#231f20] ${
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
            className={`absolute right-0 w-10 h-10 sm:w-12 sm:h-12 rounded-r-xl border-[3px] border-[#231f20] font-black text-base sm:text-lg flex items-center justify-center transition-transform shadow-[2px_2px_0px_#231f20] ${
              activeKeys['RIGHT'] ? 'bg-[#ff4757] text-white translate-y-0.5 shadow-[1px_1px_0px_#231f20]' : 'bg-white hover:bg-[#fff8e1] text-[#231f20]'
            }`}
          >
            ▶
          </button>
          {/* Center piece */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#231f20] border-[3px] border-[#231f20] rounded-xl" />
        </div>
      </div>

      {/* Right Corner: JAR J2ME Numpad & Softkeys */}
      <div className="fixed right-3 bottom-3 sm:right-6 sm:bottom-6 z-50 pointer-events-auto">
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5 w-36 sm:w-48 bg-[#fff8e1]/95 backdrop-blur p-2 sm:p-2.5 rounded-2xl border-[3px] border-[#231f20] shadow-[4px_4px_0px_#231f20] max-h-[85vh] overflow-y-auto">
          <button
            onPointerDown={() => dispatchKey('SOFT_LEFT', true)}
            onPointerUp={() => dispatchKey('SOFT_LEFT', false)}
            onPointerLeave={() => dispatchKey('SOFT_LEFT', false)}
            onPointerCancel={() => dispatchKey('SOFT_LEFT', false)}
            className="col-span-1 py-1 sm:py-1.5 bg-[#ffa502] hover:bg-[#e59400] text-white font-black text-[11px] sm:text-xs rounded-lg sm:rounded-xl border-2 border-[#231f20] shadow-[1px_1px_0px_#231f20] active:translate-y-0.5 transition-all"
          >
            L.Soft
          </button>
          <button
            onPointerDown={() => dispatchKey('FIRE', true)}
            onPointerUp={() => dispatchKey('FIRE', false)}
            onPointerLeave={() => dispatchKey('FIRE', false)}
            onPointerCancel={() => dispatchKey('FIRE', false)}
            className="col-span-1 py-1 sm:py-1.5 bg-[#ff4757] hover:bg-[#ff2e43] text-white font-black text-[11px] sm:text-xs rounded-lg sm:rounded-xl border-2 border-[#231f20] shadow-[1px_1px_0px_#231f20] active:translate-y-0.5 transition-all"
          >
            FIRE
          </button>
          <button
            onPointerDown={() => dispatchKey('SOFT_RIGHT', true)}
            onPointerUp={() => dispatchKey('SOFT_RIGHT', false)}
            onPointerLeave={() => dispatchKey('SOFT_RIGHT', false)}
            onPointerCancel={() => dispatchKey('SOFT_RIGHT', false)}
            className="col-span-1 py-1 sm:py-1.5 bg-[#ffa502] hover:bg-[#e59400] text-white font-black text-[11px] sm:text-xs rounded-lg sm:rounded-xl border-2 border-[#231f20] shadow-[1px_1px_0px_#231f20] active:translate-y-0.5 transition-all"
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
              className="py-1 sm:py-1.5 bg-white hover:bg-[#fff8e1] text-[#231f20] font-black text-xs sm:text-sm rounded-lg sm:rounded-xl border-2 border-[#231f20] shadow-[1px_1px_0px_#231f20] active:bg-[#ff4757] active:text-white active:translate-y-0.5 transition-all"
            >
              {num}
            </button>
          ))}

          <button
            onPointerDown={() => dispatchKey('KEY_STAR', true)}
            onPointerUp={() => dispatchKey('KEY_STAR', false)}
            onPointerLeave={() => dispatchKey('KEY_STAR', false)}
            onPointerCancel={() => dispatchKey('KEY_STAR', false)}
            className="py-1 sm:py-1.5 bg-white hover:bg-[#fff8e1] text-[#231f20] font-black text-xs sm:text-sm rounded-lg sm:rounded-xl border-2 border-[#231f20] shadow-[1px_1px_0px_#231f20] active:bg-[#ff4757] active:text-white active:translate-y-0.5 transition-all"
          >
            *
          </button>
          <button
            onPointerDown={() => dispatchKey('KEY_0', true)}
            onPointerUp={() => dispatchKey('KEY_0', false)}
            onPointerLeave={() => dispatchKey('KEY_0', false)}
            onPointerCancel={() => dispatchKey('KEY_0', false)}
            className="py-1 sm:py-1.5 bg-white hover:bg-[#fff8e1] text-[#231f20] font-black text-xs sm:text-sm rounded-lg sm:rounded-xl border-2 border-[#231f20] shadow-[1px_1px_0px_#231f20] active:bg-[#ff4757] active:text-white active:translate-y-0.5 transition-all"
          >
            0
          </button>
          <button
            onPointerDown={() => dispatchKey('KEY_POUND', true)}
            onPointerUp={() => dispatchKey('KEY_POUND', false)}
            onPointerLeave={() => dispatchKey('KEY_POUND', false)}
            onPointerCancel={() => dispatchKey('KEY_POUND', false)}
            className="py-1 sm:py-1.5 bg-white hover:bg-[#fff8e1] text-[#231f20] font-black text-xs sm:text-sm rounded-lg sm:rounded-xl border-2 border-[#231f20] shadow-[1px_1px_0px_#231f20] active:bg-[#ff4757] active:text-white active:translate-y-0.5 transition-all"
          >
            #
          </button>
        </div>
      </div>
    </div>
  );
}
