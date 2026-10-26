import React, { useState, useEffect, useRef } from 'react';
import { Send, Zap, Timer } from 'lucide-react';

interface GuessInputModalProps {
  isOpen: boolean;
  timeRemaining: number;
  playerName: string;
  onSubmit: (guess: string) => void;
  onCancel?: () => void;
}

export const GuessInputModal: React.FC<GuessInputModalProps> = ({
  isOpen,
  timeRemaining,
  playerName,
  onSubmit,
  onCancel,
}) => {
  const [guess, setGuess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setGuess('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim()) {
      onSubmit(guess.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel-glow rounded-3xl p-6 md:p-8 shadow-2xl border border-amber-500/40 transform animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Zap className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                You Buzzed In!
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white">
                Finish The Line!
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <Timer className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-amber-300 text-base">{timeRemaining}s</span>
          </div>
        </div>

        <p className="text-xs md:text-sm text-slate-400 mb-5">
          Type the remaining words of the quote (or the full quote). Fuzzy matching is active!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="e.g. make him an offer he can't refuse"
              className="w-full px-5 py-4 rounded-2xl bg-slate-900/90 border-2 border-amber-400/80 text-white placeholder-slate-500 font-medium text-base md:text-lg focus:outline-none focus:ring-4 focus:ring-amber-500/30 transition shadow-inner"
              autoFocus
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              disabled={!guess.trim()}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-600 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base flex items-center justify-center space-x-2 shadow-xl shadow-pink-500/20 transition transform active:scale-98"
            >
              <span>SUBMIT GUESS</span>
              <Send className="w-5 h-5" />
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="py-4 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-semibold text-sm transition"
              >
                Pass
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
