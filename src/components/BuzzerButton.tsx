import React from 'react';
import { Zap, Lock, AlertCircle } from 'lucide-react';
import { sfx } from '../sound/sfx';

interface BuzzerButtonProps {
  onBuzz: () => void;
  isLockedOut?: boolean;
  isActiveBuzzer?: boolean;
  anotherPlayerBuzzed?: boolean;
  activePlayerName?: string;
  playerName?: string;
  playerAvatar?: string;
  hotkeyLabel?: string;
  disabled?: boolean;
  size?: 'default' | 'large' | 'compact';
}

export const BuzzerButton: React.FC<BuzzerButtonProps> = ({
  onBuzz,
  isLockedOut = false,
  isActiveBuzzer = false,
  anotherPlayerBuzzed = false,
  activePlayerName = '',
  playerName,
  playerAvatar,
  hotkeyLabel,
  disabled = false,
  size = 'default',
}) => {
  const handleClick = () => {
    if (disabled || isLockedOut || anotherPlayerBuzzed || isActiveBuzzer) return;

    // Trigger haptic vibration on mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    sfx.playBuzzer();
    onBuzz();
  };

  const isInteractive = !disabled && !isLockedOut && !anotherPlayerBuzzed && !isActiveBuzzer;

  // Sizing configurations
  const sizeClasses =
    size === 'large'
      ? 'w-64 h-64 md:w-80 md:h-80 text-3xl'
      : size === 'compact'
      ? 'w-36 h-36 md:w-44 md:h-44 text-lg'
      : 'w-52 h-52 md:w-64 md:h-64 text-2xl';

  return (
    <div className="flex flex-col items-center justify-center p-3">
      {/* Player identity label above buzzer if provided */}
      {playerName && (
        <div className="flex items-center space-x-2 mb-3 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700 shadow-sm">
          {playerAvatar && <span className="text-xl">{playerAvatar}</span>}
          <span className="font-bold text-slate-200 text-sm md:text-base">{playerName}</span>
          {hotkeyLabel && (
            <kbd className="px-2 py-0.5 text-xs font-mono font-bold text-amber-300 bg-slate-900 border border-slate-700 rounded shadow-inner">
              [{hotkeyLabel}]
            </kbd>
          )}
        </div>
      )}

      {/* Buzzer Button */}
      <div className="relative group flex items-center justify-center">
        {/* Outer ambient glow ring */}
        {isInteractive && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-500 blur-2xl opacity-40 group-hover:opacity-75 animate-pulse transition duration-500" />
        )}

        {/* 3D Buzzer Base & Button */}
        <button
          onClick={handleClick}
          disabled={!isInteractive}
          className={`relative rounded-full font-display font-black tracking-wider uppercase transition-all duration-150 transform select-none flex flex-col items-center justify-center border-4 ${sizeClasses} ${
            isActiveBuzzer
              ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 border-amber-300 buzzer-glow-active scale-105'
              : anotherPlayerBuzzed
              ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed opacity-60'
              : isLockedOut
              ? 'bg-slate-900 text-slate-500 border-rose-950/60 cursor-not-allowed opacity-50'
              : disabled
              ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-40'
              : 'bg-gradient-to-b from-rose-500 via-red-600 to-red-700 text-white border-red-400 buzzer-glow hover:scale-105 active:scale-95 cursor-pointer'
          }`}
        >
          {/* Inner Highlight Reflection */}
          <div className="absolute top-2 w-3/4 h-1/3 bg-white/20 rounded-full blur-[2px] pointer-events-none" />

          {/* Button Content */}
          <div className="flex flex-col items-center justify-center p-4 text-center z-10 pointer-events-none">
            {isActiveBuzzer ? (
              <>
                <Zap className="w-10 h-10 md:w-14 md:h-14 mb-1 text-slate-950 fill-slate-950 animate-bounce" />
                <span>YOU BUZZED!</span>
                <span className="text-xs font-sans font-bold tracking-normal text-slate-900 mt-1">
                  Answer Now!
                </span>
              </>
            ) : anotherPlayerBuzzed ? (
              <>
                <AlertCircle className="w-8 h-8 md:w-12 md:h-12 mb-1 text-amber-400" />
                <span className="text-sm md:text-base font-bold text-slate-300">
                  {activePlayerName ? `${activePlayerName}` : 'Player'}
                </span>
                <span className="text-xs font-sans text-slate-400">is answering...</span>
              </>
            ) : isLockedOut ? (
              <>
                <Lock className="w-8 h-8 md:w-12 md:h-12 mb-1 text-rose-400" />
                <span className="text-xs md:text-sm font-bold text-rose-400">LOCKED OUT</span>
                <span className="text-[10px] font-sans text-slate-400 mt-0.5">Wait for next word</span>
              </>
            ) : (
              <>
                <Zap className="w-10 h-10 md:w-14 md:h-14 mb-1 text-white fill-white drop-shadow" />
                <span>BUZZ IN!</span>
                {hotkeyLabel && (
                  <span className="text-xs font-sans font-extrabold text-amber-300 mt-1 opacity-90">
                    PRESS {hotkeyLabel}
                  </span>
                )}
              </>
            )}
          </div>
        </button>
      </div>

      {/* Lockout status subtext */}
      {isLockedOut && (
        <p className="mt-3 text-xs text-rose-400 font-medium text-center max-w-xs">
          Incorrect guess on this clue. You will be unlocked when the next word is revealed!
        </p>
      )}
    </div>
  );
};
