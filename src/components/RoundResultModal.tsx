import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, ArrowRight, Quote as QuoteIcon, ThumbsUp } from 'lucide-react';
import { RoundResult } from '../types';
import { sfx } from '../sound/sfx';

interface RoundResultModalProps {
  result: RoundResult | null;
  isOpen: boolean;
  onNextRound: () => void;
  isHost?: boolean;
  onToggleBonus?: () => void;
  isGameOver?: boolean;
}

export const RoundResultModal: React.FC<RoundResultModalProps> = ({
  result,
  isOpen,
  onNextRound,
  isHost = false,
  onToggleBonus,
  isGameOver = false,
}) => {
  useEffect(() => {
    if (isOpen && result?.winnerId) {
      sfx.playCorrect();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#6366f1', '#10b981'],
      });
    } else if (isOpen && !result?.winnerId) {
      sfx.playTimeUp();
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const hasWinner = Boolean(result.winnerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl glass-panel-glow rounded-3xl p-6 md:p-8 shadow-2xl border border-amber-500/40 transform animate-in zoom-in-95 duration-200 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
        {/* Header / Winner Spotlight */}
        <div className="text-center pb-4 border-b border-slate-800">
          {hasWinner ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-pink-500 flex items-center justify-center text-3xl shadow-xl shadow-pink-500/30 mb-3 animate-bounce">
                {result.winnerAvatar || '🏆'}
              </div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
                LINE COMPLETED!
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white mt-0.5">
                {result.winnerName}
              </h2>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                <QuoteIcon className="w-7 h-7" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-300">
                Round Finished
              </h2>
              <p className="text-xs text-slate-500">Nobody finished the line in time!</p>
            </div>
          )}
        </div>

        {/* The Full Quote Reveal */}
        <div className="my-6 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center relative overflow-hidden">
          <QuoteIcon className="w-10 h-10 text-slate-800 absolute -top-1 -left-1 opacity-50" />
          <p className="text-lg md:text-2xl font-serif font-bold text-amber-200 leading-snug tracking-wide italic mb-3">
            "{result.quote.quote}"
          </p>
          <div className="inline-block px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
            <span className="text-amber-400 font-bold">{result.quote.character}</span> —{' '}
            <span className="text-slate-400">{result.quote.source}</span>
          </div>
        </div>

        {/* Points breakdown if there was a winner */}
        {hasWinner && (
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2 mb-6">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Solved on Word {result.wordsRevealed}:</span>
              <span className="font-mono font-bold text-amber-300">+{result.basePoints} pts</span>
            </div>

            {/* Voice Impression bonus badge / toggle */}
            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800/80">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300">Impression / Acting Bonus:</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`font-mono font-bold ${result.impressionBonus ? 'text-amber-300' : 'text-slate-500'}`}>
                  {result.impressionBonus ? '+100 pts' : '0 pts'}
                </span>
                {isHost && onToggleBonus && (
                  <button
                    onClick={() => {
                      sfx.playBonus();
                      onToggleBonus();
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                      result.impressionBonus
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {result.impressionBonus ? 'Remove Bonus' : '+ Award +100'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-700 text-white">
              <span>Total Points Awarded:</span>
              <span className="font-mono font-black text-amber-400 text-base">
                +{result.totalPointsAwarded} pts
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onNextRound}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-600 hover:brightness-110 text-white font-extrabold text-base flex items-center justify-center space-x-2 shadow-xl shadow-pink-500/20 transition transform active:scale-98"
        >
          <span>{isGameOver ? 'VIEW FINAL RESULTS' : 'NEXT ROUND'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
