import { Sparkles, Film, Gamepad2, BookOpen, Tv, HelpCircle, Award, Star, Music, Shield, Rocket, Mic, Smile, Flame } from 'lucide-react';
import { Quote, Genre, GENRE_METADATA } from '../types';

interface QuoteBoardProps {
  quote: Quote | null;
  revealedWordsCount: number;
  revealedWordsString?: string;
  isHost?: boolean;
}

export const QuoteBoard: React.FC<QuoteBoardProps> = ({
  quote,
  revealedWordsCount,
  revealedWordsString,
  isHost = false,
}) => {
  if (!quote) {
    return (
      <div className="w-full glass-panel-glow rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[320px]">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mb-4 text-slate-500 animate-pulse">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-300 mb-1">Waiting for the Next Quote</h3>
        <p className="text-sm text-slate-500">The game host is selecting the category...</p>
      </div>
    );
  }

  const genreMeta = GENRE_METADATA[quote.genre] || {
    label: quote.genre,
    icon: 'Sparkles',
    color: '#6366f1',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  };

  const renderGenreIcon = (genre: Genre) => {
    switch (genre) {
      case 'anime':
        return <Sparkles className="w-4 h-4 mr-1.5" />;
      case 'cinema':
        return <Film className="w-4 h-4 mr-1.5" />;
      case 'gaming':
        return <Gamepad2 className="w-4 h-4 mr-1.5" />;
      case 'tv_shows':
        return <Tv className="w-4 h-4 mr-1.5" />;
      case 'music_lyrics':
        return <Music className="w-4 h-4 mr-1.5" />;
      case 'superheroes':
        return <Shield className="w-4 h-4 mr-1.5" />;
      case 'sci_fi_fantasy':
        return <Rocket className="w-4 h-4 mr-1.5" />;
      case 'history_speeches':
        return <Mic className="w-4 h-4 mr-1.5" />;
      case 'literature':
        return <BookOpen className="w-4 h-4 mr-1.5" />;
      case 'memes':
        return <Smile className="w-4 h-4 mr-1.5" />;
      case 'pop_culture':
        return <Flame className="w-4 h-4 mr-1.5" />;
      default:
        return <Sparkles className="w-4 h-4 mr-1.5" />;
    }
  };

  const getDifficultyBadge = () => {
    switch (quote.difficulty) {
      case 'easy':
        return (
          <span className="flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <Star className="w-3 h-3 fill-emerald-400 mr-1" /> Easy
          </span>
        );
      case 'medium':
        return (
          <span className="flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Star className="w-3 h-3 fill-amber-400 mr-1" />
            <Star className="w-3 h-3 fill-amber-400 mr-1 -ml-1.5" /> Medium
          </span>
        );
      case 'hard':
        return (
          <span className="flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <Star className="w-3 h-3 fill-rose-400 mr-1" />
            <Star className="w-3 h-3 fill-rose-400 mr-1 -ml-1.5" />
            <Star className="w-3 h-3 fill-rose-400 mr-1 -ml-1.5" /> Hard
          </span>
        );
    }
  };

  // Determine current point value according to specification
  const currentPoints =
    revealedWordsCount <= 2 ? 500 :
    revealedWordsCount <= 4 ? 300 :
    revealedWordsCount <= 6 ? 150 : 50;

  // Split quote into words
  const words = quote.quote.split(/\s+/);
  const totalWords = words.length;

  return (
    <div className="w-full glass-panel-glow rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-slate-700/60 transition-all">
      {/* Top Bar: Genre, Difficulty, Points value */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <span className={`flex items-center px-3.5 py-1.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider border shadow-sm ${genreMeta.badgeClass}`}>
            {renderGenreIcon(quote.genre)}
            {genreMeta.label}
          </span>
          {getDifficultyBadge()}
        </div>

        {/* Current Points Badge */}
        <div className="flex items-center space-x-2 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-500/40 shadow-inner">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-xs uppercase text-slate-300 font-semibold tracking-wider">Solve Value:</span>
          <span className="font-extrabold text-amber-400 text-base md:text-lg tracking-wide font-mono">
            +{currentPoints} PTS
          </span>
        </div>
      </div>

      {/* Progressive Word Cards Display */}
      <div className="py-8 md:py-12 flex flex-wrap items-center justify-center gap-2.5 md:gap-3.5 min-h-[180px] max-w-4xl mx-auto">
        {words.map((word, index) => {
          const isRevealed = index < revealedWordsCount;

          return (
            <div
              key={`${quote.id}-${index}`}
              className={`transition-all duration-300 select-none ${
                isRevealed
                  ? 'animate-word-pop'
                  : 'opacity-70 scale-95'
              }`}
            >
              {isRevealed ? (
                <div className="px-3.5 md:px-5 py-2 md:py-2.5 rounded-2xl bg-gradient-to-b from-slate-700/90 to-slate-800/95 border-2 border-amber-400/80 text-white font-extrabold text-lg md:text-2xl tracking-wide shadow-lg shadow-amber-500/10 text-shadow-sm flex items-center justify-center transform hover:scale-105 transition">
                  <span className="text-amber-200">{word}</span>
                </div>
              ) : (
                <div
                  className="px-3 md:px-4 py-2 md:py-2.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-slate-500 font-mono text-base md:text-lg flex items-center justify-center tracking-widest min-w-[3.5rem]"
                  title="Word hidden"
                >
                  <span className="opacity-50">
                    {'•'.repeat(Math.max(3, Math.min(word.length, 7)))}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Bar: Word Counter & Host Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800/80 text-xs md:text-sm text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-300">Progress:</span>
          <div className="flex items-center space-x-1.5 bg-slate-800/70 px-3 py-1 rounded-full font-mono text-xs">
            <span className="text-amber-400 font-bold">{Math.min(revealedWordsCount, totalWords)}</span>
            <span>/</span>
            <span>{totalWords} Words</span>
          </div>
          {revealedWordsCount < totalWords && (
            <span className="text-slate-500 text-xs hidden sm:inline">
              ({totalWords - revealedWordsCount} hidden)
            </span>
          )}
        </div>

        {/* Host Secret Display (Only Host sees the answer / character in advance!) */}
        {isHost && (
          <div className="flex items-center space-x-2 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-indigo-300 text-xs">
            <span className="font-bold uppercase tracking-wider text-indigo-400 text-[10px]">Host Clue:</span>
            <span className="font-semibold text-indigo-200">
              {quote.character} ({quote.source})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
