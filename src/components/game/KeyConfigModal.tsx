'use client';

import { useState, useEffect } from 'react';

interface KeyConfigModalProps {
  platform: 'GBA' | 'JAR';
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const GBA_KEYS = [
  { label: 'Lên (Up)', key: 'UP' },
  { label: 'Xuống (Down)', key: 'DOWN' },
  { label: 'Trái (Left)', key: 'LEFT' },
  { label: 'Phải (Right)', key: 'RIGHT' },
  { label: 'Nút A', key: 'A' },
  { label: 'Nút B', key: 'B' },
  { label: 'Nút L', key: 'L' },
  { label: 'Nút R', key: 'R' },
  { label: 'Select', key: 'SELECT' },
  { label: 'Start', key: 'START' },
];

const JAR_KEYS = [
  { label: 'Lên (Up)', key: 'UP' },
  { label: 'Xuống (Down)', key: 'DOWN' },
  { label: 'Trái (Left)', key: 'LEFT' },
  { label: 'Phải (Right)', key: 'RIGHT' },
  { label: 'Chọn / OK (Fire)', key: 'FIRE' },
  { label: 'Phím Trái (L.Soft)', key: 'SOFT_LEFT' },
  { label: 'Phím Phải (R.Soft)', key: 'SOFT_RIGHT' },
  { label: 'Phím số 1', key: 'KEY_1' },
  { label: 'Phím số 2', key: 'KEY_2' },
  { label: 'Phím số 3', key: 'KEY_3' },
  { label: 'Phím số 4', key: 'KEY_4' },
  { label: 'Phím số 5', key: 'KEY_5' },
  { label: 'Phím số 6', key: 'KEY_6' },
  { label: 'Phím số 7', key: 'KEY_7' },
  { label: 'Phím số 8', key: 'KEY_8' },
  { label: 'Phím số 9', key: 'KEY_9' },
  { label: 'Phím số 0', key: 'KEY_0' },
  { label: 'Phím * (Star)', key: 'KEY_STAR' },
  { label: 'Phím # (Pound)', key: 'KEY_POUND' },
];

export default function KeyConfigModal({ platform, isOpen, onClose, onSaved }: KeyConfigModalProps) {
  const [keyMap, setKeyMap] = useState<Record<string, string>>({});
  const [listeningKey, setListeningKey] = useState<string | null>(null);

  const keyList = platform === 'GBA' ? GBA_KEYS : JAR_KEYS;

  useEffect(() => {
    if (isOpen) {
      const storageKey = `keybindings_${platform}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setKeyMap(JSON.parse(saved));
        } catch (e) {
          loadDefaults();
        }
      } else {
        loadDefaults();
      }
    }
  }, [isOpen, platform]);

  const loadDefaults = () => {
    if (platform === 'GBA') {
      setKeyMap({
        UP: 'ArrowUp', DOWN: 'ArrowDown', LEFT: 'ArrowLeft', RIGHT: 'ArrowRight',
        A: 'KeyZ', B: 'KeyX', L: 'KeyA', R: 'KeyS', SELECT: 'Backspace', START: 'Enter',
      });
    } else {
      setKeyMap({
        UP: 'ArrowUp', DOWN: 'ArrowDown', LEFT: 'ArrowLeft', RIGHT: 'ArrowRight',
        FIRE: 'Enter', SOFT_LEFT: 'KeyQ', SOFT_RIGHT: 'KeyW',
        KEY_1: 'Digit1', KEY_2: 'Digit2', KEY_3: 'Digit3', KEY_4: 'Digit4',
        KEY_5: 'Digit5', KEY_6: 'Digit6', KEY_7: 'Digit7', KEY_8: 'Digit8',
        KEY_9: 'Digit9', KEY_0: 'Digit0', KEY_STAR: '8', KEY_POUND: '3',
      });
    }
  };

  useEffect(() => {
    if (!listeningKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setKeyMap((prev) => ({ ...prev, [listeningKey]: e.code }));
      setListeningKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listeningKey]);

  const handleSave = () => {
    localStorage.setItem(`keybindings_${platform}`, JSON.stringify(keyMap));
    if (onSaved) onSaved();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="cartoon-container bg-[#fcfaf2] border-[3px] border-[#231f20] rounded-2xl shadow-[8px_8px_0px_#231f20] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#ff4757] border-b-[3px] border-[#231f20] p-5 flex justify-between items-center text-white">
          <h3 className="font-black text-lg uppercase tracking-wide flex items-center gap-2">
            Cấu Hình Nút Bấm ({platform})
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white text-[#231f20] border-2 border-[#231f20] rounded-lg font-black flex items-center justify-center hover:bg-gray-100 shadow-[2px_2px_0px_#231f20]"
          >
            ✕
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-[#fff8e1] border-b-2 border-[#231f20] p-3 px-6 text-xs font-bold text-[#524d4a] flex justify-between items-center">
          <span>Bấm vào nút cần đổi, sau đó nhấn phím tương ứng trên bàn phím của bạn.</span>
          <button
            onClick={loadDefaults}
            className="text-[#ff4757] underline hover:text-[#ff2e43] uppercase font-black"
          >
            Khôi phục mặc định
          </button>
        </div>

        {/* Key List Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {keyList.map((item) => {
            const currentCode = keyMap[item.key] || 'Chưa gán';
            const isListening = listeningKey === item.key;

            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 bg-white border-2 border-[#231f20] rounded-xl shadow-[2px_2px_0px_#231f20]"
              >
                <span className="font-black text-sm text-[#231f20]">{item.label}</span>
                <button
                  onClick={() => setListeningKey(item.key)}
                  className={`px-4 py-1.5 rounded-lg font-black text-xs border-2 border-[#231f20] transition-all ${
                    isListening
                      ? 'bg-[#ffa502] text-white animate-pulse shadow-[0_0_8px_#ffa502]'
                      : 'bg-[#f8f6ed] text-[#231f20] hover:bg-[#ffebee]'
                  }`}
                >
                  {isListening ? '👉 Hãy nhấn phím...' : currentCode.replace('Key', '').replace('Digit', '').replace('Arrow', '')}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-white border-t-[3px] border-[#231f20] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-[#231f20] rounded-xl font-black text-sm uppercase border-2 border-[#231f20] shadow-[3px_3px_0px_#231f20]"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#2ed573] hover:bg-[#26af5f] text-white rounded-xl font-black text-sm uppercase border-2 border-[#231f20] shadow-[3px_3px_0px_#231f20]"
          >
            Lưu Cấu Hình
          </button>
        </div>

      </div>
    </div>
  );
}
