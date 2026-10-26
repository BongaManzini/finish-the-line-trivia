import React from 'react';
import { Trophy, Crown, Medal, Award, Zap, Lock } from 'lucide-react';
import { Player } from '../types';

interface LeaderboardProps {
  players: Player[];
  activeBuzzerId?: string | null;
  lockedOutIds?: string[];
  compact?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  activeBuzzerId,
  lockedOutIds = [],
  compact = false,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50 flex items-center justify-center font-bold text-xs">
            <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
        );
      case 2:
        return (
          <div className="w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/50 flex items-center justify-center font-bold text-xs">
            <Medal className="w-3.5 h-3.5 text-slate-300" />
          </div>
        );
      case 3:
        return (
          <div className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/50 flex items-center justify-center font-bold text-xs">
            <Award className="w-3.5 h-3.5 text-amber-600" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs">
            {rank}
          </div>
        );
    }
  };

  return (
    <div className={`w-full glass-panel rounded-2xl ${compact ? 'p-3' : 'p-5'} border border-slate-800 shadow-xl`}>
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200">
            Leaderboard
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {players.length} {players.length === 1 ? 'Player' : 'Players'}
        </span>
      </div>

      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
        {sortedPlayers.map((player, index) => {
          const isBuzzed = activeBuzzerId === player.id;
          const isLocked = lockedOutIds.includes(player.id);

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2.5 rounded-xl transition duration-150 border ${
                isBuzzed
                  ? 'bg-amber-500/20 border-amber-500/60 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                  : isLocked
                  ? 'bg-slate-900/40 border-slate-800 opacity-60'
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                {getRankBadge(index + 1)}
                <span className="text-xl select-none">{player.avatar}</span>
                <div className="truncate">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sm text-slate-200 truncate">
                      {player.name}
                    </span>
                    {player.keyBinding && (
                      <kbd className="px-1.5 py-0.2 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-700 rounded">
                        {player.keyBinding}
                      </kbd>
                    )}
                  </div>
                  {player.roundWins !== undefined && player.roundWins > 0 && (
                    <span className="text-[10px] text-amber-400 font-semibold">
                      🏆 {player.roundWins} {player.roundWins === 1 ? 'win' : 'wins'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {isBuzzed && (
                  <span className="flex items-center text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 animate-bounce">
                    <Zap className="w-2.5 h-2.5 mr-0.5 fill-slate-950" /> BUZZED
                  </span>
                )}
                {isLocked && !isBuzzed && (
                  <span className="flex items-center text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    <Lock className="w-2.5 h-2.5 mr-0.5" /> LOCKED
                  </span>
                )}
                <div className="font-mono font-black text-amber-300 text-sm md:text-base">
                  {player.score.toLocaleString()} <span className="text-xs text-amber-500/80 font-normal">pts</span>
                </div>
              </div>
            </div>
          );
        })}

        {players.length === 0 && (
          <div className="py-6 text-center text-xs text-slate-500">
            No players joined yet.
          </div>
        )}
      </div>
    </div>
  );
};
