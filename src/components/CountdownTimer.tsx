import React from 'react';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  timeRemaining: number;
  totalTime?: number;
  label?: string;
  pulsing?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  timeRemaining,
  totalTime = 10,
  label = 'Time to Finish The Line',
  pulsing = true,
}) => {
  const percentage = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100));

  const isCritical = timeRemaining <= 3;
  const isWarning = timeRemaining <= 6 && timeRemaining > 3;

  const colorClass = isCritical
    ? 'text-rose-500 border-rose-500/60 bg-rose-500/10'
    : isWarning
    ? 'text-amber-400 border-amber-500/60 bg-amber-500/10'
    : 'text-emerald-400 border-emerald-500/60 bg-emerald-500/10';

  const barColor = isCritical
    ? 'bg-rose-500 shadow-rose-500/50'
    : isWarning
    ? 'bg-amber-400 shadow-amber-400/50'
    : 'bg-emerald-400 shadow-emerald-400/50';

  return (
    <div className={`w-full max-w-md mx-auto p-4 rounded-2xl border transition-all duration-200 ${colorClass} ${isCritical && pulsing ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Timer className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="text-xs uppercase font-extrabold tracking-wider">{label}</span>
        </div>
        <div className="text-xl md:text-2xl font-black font-mono">
          {timeRemaining}s
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-300 shadow-md ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
