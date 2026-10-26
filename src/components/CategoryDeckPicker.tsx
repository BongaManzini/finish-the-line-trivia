import React from 'react';
import {
  Sparkles,
  Film,
  Gamepad2,
  Tv,
  Music,
  Shield,
  Rocket,
  Mic,
  BookOpen,
  Smile,
  Flame,
  Check,
  CheckSquare,
  Square,
  Layers,
} from 'lucide-react';
import { Genre, GENRE_METADATA } from '../types';
import { INITIAL_QUOTES } from '../data/quotes';
import { sfx } from '../sound/sfx';

interface CategoryDeckPickerProps {
  selectedGenres: Genre[];
  onChange: (genres: Genre[]) => void;
  disabled?: boolean;
}

const ALL_GENRES: Genre[] = [
  'anime',
  'cinema',
  'gaming',
  'tv_shows',
  'music_lyrics',
  'superheroes',
  'sci_fi_fantasy',
  'history_speeches',
  'literature',
  'memes',
  'pop_culture',
];

export const CategoryDeckPicker: React.FC<CategoryDeckPickerProps> = ({
  selectedGenres,
  onChange,
  disabled = false,
}) => {
  const getGenreIcon = (genre: Genre) => {
    switch (genre) {
      case 'anime':
        return <Sparkles className="w-5 h-5" />;
      case 'cinema':
        return <Film className="w-5 h-5" />;
      case 'gaming':
        return <Gamepad2 className="w-5 h-5" />;
      case 'tv_shows':
        return <Tv className="w-5 h-5" />;
      case 'music_lyrics':
        return <Music className="w-5 h-5" />;
      case 'superheroes':
        return <Shield className="w-5 h-5" />;
      case 'sci_fi_fantasy':
        return <Rocket className="w-5 h-5" />;
      case 'history_speeches':
        return <Mic className="w-5 h-5" />;
      case 'literature':
        return <BookOpen className="w-5 h-5" />;
      case 'memes':
        return <Smile className="w-5 h-5" />;
      case 'pop_culture':
        return <Flame className="w-5 h-5" />;
    }
  };

  const getQuoteCount = (genre: Genre) => {
    return INITIAL_QUOTES.filter((q) => q.genre === genre).length;
  };

  const toggleGenre = (genre: Genre) => {
    if (disabled) return;
    sfx.playTick();
    const current = [...selectedGenres];
    const index = current.indexOf(genre);
    if (index >= 0) {
      if (current.length > 1) {
        current.splice(index, 1);
        onChange(current);
      }
    } else {
      current.push(genre);
      onChange(current);
    }
  };

  const selectSingleDeck = (genre: Genre) => {
    if (disabled) return;
    sfx.playBuzzer();
    onChange([genre]);
  };

  const selectAll = () => {
    if (disabled) return;
    sfx.playTick();
    onChange([...ALL_GENRES]);
  };

  const isAllSelected = selectedGenres.length === ALL_GENRES.length;

  return (
    <div className="w-full space-y-4">
      {/* Top Deck Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
            Choose Category Deck (Heads-Up Style)
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            disabled={disabled}
            onClick={selectAll}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 ${
              isAllSelected
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-inner'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {isAllSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            <span>Select All Mix ({ALL_GENRES.length} Decks)</span>
          </button>
        </div>
      </div>

      {/* Grid of Heads Up Deck Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {ALL_GENRES.map((genre) => {
          const meta = GENRE_METADATA[genre];
          const isSelected = selectedGenres.includes(genre);
          const count = getQuoteCount(genre);
          const isSoleSelection = selectedGenres.length === 1 && isSelected;

          return (
            <div
              key={genre}
              className={`group relative rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-md select-none ${
                isSelected
                  ? 'bg-slate-800/90 border-slate-600 ring-2 ring-amber-400/80 shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 opacity-60 hover:opacity-90'
              }`}
            >
              {/* Vibrant Top Color Accent Bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${meta.gradient}`}
              />

              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`p-2 rounded-xl text-white shadow-md bg-gradient-to-tr ${meta.gradient}`}
                    >
                      {getGenreIcon(genre)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition">
                        {meta.label}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {count} Quotes
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {meta.tag}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {meta.description}
                </p>
              </div>

              {/* Deck Action Buttons */}
              <div className="flex items-center space-x-2 pt-3 mt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => selectSingleDeck(genre)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-extrabold transition transform active:scale-95 ${
                    isSoleSelection
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-400/50'
                  }`}
                >
                  {isSoleSelection ? '★ PLAYING ONLY THIS' : 'Play Only This'}
                </button>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleGenre(genre)}
                  title={isSelected ? 'Remove from mix' : 'Add to mix'}
                  className={`p-1.5 rounded-xl border transition ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  <Check className={`w-4 h-4 ${isSelected ? 'opacity-100' : 'opacity-20'}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
