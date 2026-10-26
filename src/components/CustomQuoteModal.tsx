import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { Quote, Genre, Difficulty } from '../types';

interface CustomQuoteModalProps {
  isOpen: boolean;
  onAddQuote: (quote: Omit<Quote, 'id'>) => void;
  onClose: () => void;
}

export const CustomQuoteModal: React.FC<CustomQuoteModalProps> = ({
  isOpen,
  onAddQuote,
  onClose,
}) => {
  const [quote, setQuote] = useState('');
  const [character, setCharacter] = useState('');
  const [source, setSource] = useState('');
  const [genre, setGenre] = useState<Genre>('pop_culture');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.trim() || !character.trim() || !source.trim()) return;

    onAddQuote({
      quote: quote.trim(),
      character: character.trim(),
      source: source.trim(),
      genre,
      difficulty,
    });

    setQuote('');
    setCharacter('');
    setSource('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel-glow rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Add Custom Quote</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase font-bold text-slate-400 block mb-1">
              The Iconic Quote *
            </label>
            <textarea
              required
              rows={3}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="e.g. I'm going to make him an offer he can't refuse."
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase font-bold text-slate-400 block mb-1">
                Character *
              </label>
              <input
                required
                type="text"
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                placeholder="e.g. Vito Corleone"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-400 block mb-1">
                Source *
              </label>
              <input
                required
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. The Godfather"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase font-bold text-slate-400 block mb-1">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as Genre)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
              >
                <option value="cinema">Cinema & Movies</option>
                <option value="anime">Anime & Manga</option>
                <option value="gaming">Video Games</option>
                <option value="literature">Literature</option>
                <option value="pop_culture">Pop Culture</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-slate-400 block mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-sm font-semibold hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-white font-bold text-sm shadow-md flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Game</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
