import React from 'react';
import { Play, Check, X, SkipForward, Sparkles, Eye, PlusCircle } from 'lucide-react';
import { GameStateStatus, ActiveBuzz } from '../types';

interface HostControlsProps {
  status: GameStateStatus;
  activeBuzz: ActiveBuzz | null;
  onRevealNextWord: () => void;
  onMarkCorrect: (hasBonus?: boolean) => void;
  onMarkIncorrect: () => void;
  onSkipRound: () => void;
  onStartNextRound?: () => void;
  hasImpressionBonus?: boolean;
  onToggleBonus?: () => void;
  totalWordsInQuote?: number;
  revealedWordsCount?: number;
}

export const HostControls: React.FC<HostControlsProps> = ({
  status,
  activeBuzz,
  onRevealNextWord,
  onMarkCorrect,
  onMarkIncorrect,
  onSkipRound,
  onStartNextRound,
  hasImpressionBonus = false,
  onToggleBonus,
  totalWordsInQuote = 0,
  revealedWordsCount = 0,
}) => {
  const isAllRevealed = totalWordsInQuote > 0 && revealedWordsCount >= totalWordsInQuote;

  return (
    <div className="w-full glass-panel rounded-2xl p-4 border border-indigo-500/30 shadow-xl bg-slate-900/90">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-300">
            Host Control Deck
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          State: <span className="font-bold text-amber-400">{status}</span>
        </span>
      </div>

      {/* When someone is BUZZED */}
      {status === 'BUZZED' && activeBuzz ? (
        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{activeBuzz.playerAvatar}</span>
              <div>
                <p className="text-xs uppercase text-slate-400 font-semibold">Active Buzzer</p>
                <p className="font-bold text-amber-300 text-sm">{activeBuzz.playerName}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-mono">Time:</span>
              <span className="font-mono font-black text-amber-400 text-lg ml-1">
                {activeBuzz.timeRemaining}s
              </span>
            </div>
          </div>

          {activeBuzz.guessText && (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Typed Answer:
              </span>
              <p className="text-slate-100 font-semibold italic text-sm">
                "{activeBuzz.guessText}"
              </p>
            </div>
          )}

          {/* Adjudication Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => onMarkCorrect(hasImpressionBonus)}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition transform active:scale-95"
            >
              <Check className="w-5 h-5" />
              <span>Correct Answer</span>
            </button>

            <button
              onClick={onMarkIncorrect}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition transform active:scale-95"
            >
              <X className="w-5 h-5" />
              <span>Wrong / Lockout</span>
            </button>
          </div>

          {/* Optional Voice Impression Bonus toggle */}
          {onToggleBonus && (
            <button
              onClick={onToggleBonus}
              className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border text-xs font-bold transition ${
                hasImpressionBonus
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-inner'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {hasImpressionBonus ? '✓ +100 Impression Bonus ACTIVE' : '+ Add +100 Voice Impression Bonus'}
              </span>
            </button>
          )}
        </div>
      ) : (
        /* Standard word reveal controls */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={onRevealNextWord}
            disabled={status !== 'ACTIVE' || isAllRevealed}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition transform active:scale-95 col-span-2 sm:col-span-1 ${
              status === 'ACTIVE' && !isAllRevealed
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Reveal Next Word</span>
          </button>

          <button
            onClick={onSkipRound}
            disabled={status !== 'ACTIVE'}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Skip Quote</span>
          </button>

          {onStartNextRound && (
            <button
              onClick={onStartNextRound}
              className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition col-span-2 sm:col-span-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Next Round</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
