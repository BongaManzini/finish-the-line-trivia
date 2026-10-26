import React, { useState } from 'react';
import { Volume2, VolumeX, Settings, Home, Copy, Check, Sparkles } from 'lucide-react';
import { sfx } from '../sound/sfx';

interface NavbarProps {
  roomCode?: string;
  roundInfo?: { current: number; total: number };
  onOpenSettings?: () => void;
  onGoHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomCode,
  roundInfo,
  onOpenSettings,
  onGoHome,
}) => {
  const [muted, setMuted] = useState(sfx.getMuted());
  const [volume, setVolume] = useState(sfx.getVolume());
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleMute = () => {
    const nextMuted = !muted;
    sfx.setMuted(nextMuted);
    setMuted(nextMuted);
    if (!nextMuted) {
      sfx.playTick();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    sfx.setVolume(val);
    if (muted && val > 0) {
      sfx.setMuted(false);
      setMuted(false);
    }
  };

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      sfx.playTick();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="w-full glass-panel border-b border-slate-800/80 sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-3">
        {onGoHome && (
          <button
            onClick={onGoHome}
            title="Return to Menu"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all transform active:scale-95"
          >
            <Home className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center space-x-2 cursor-pointer" onClick={onGoHome}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center shadow-md shadow-pink-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg md:text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-400">
              FINISH THE LINE
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1 hidden sm:block">
              Party Trivia Game
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Room Code Badge */}
        {roomCode && (
          <button
            onClick={copyRoomCode}
            title="Click to copy Room Code"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60 transition group font-mono text-sm shadow-sm"
          >
            <span className="text-xs uppercase text-indigo-400 font-bold">Room:</span>
            <span className="font-extrabold text-amber-300 tracking-wider text-base">{roomCode}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition" />
            )}
          </button>
        )}

        {/* Round Counter */}
        {roundInfo && roundInfo.total > 0 && (
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-200">
            Round <span className="text-amber-400">{roundInfo.current}</span> / {roundInfo.total}
          </div>
        )}

        {/* Audio Controls */}
        <div className="relative flex items-center">
          <button
            onClick={toggleMute}
            onMouseEnter={() => setShowVolumeSlider(true)}
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition transform active:scale-95"
          >
            {muted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-rose-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-amber-400" />
            )}
          </button>

          {showVolumeSlider && (
            <div
              onMouseLeave={() => setShowVolumeSlider(false)}
              className="absolute right-0 top-12 p-3 glass-panel-glow rounded-xl shadow-2xl flex flex-col items-center space-y-2 w-36 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="text-[11px] font-bold text-slate-300 flex justify-between w-full">
                <span>Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Settings Button */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            title="Game Settings"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition transform active:scale-95"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};
