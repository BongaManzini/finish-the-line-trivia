import React from 'react';
import { X, Sliders, Check, Sparkles } from 'lucide-react';
import { GameSettings, Genre, Difficulty, GENRE_METADATA } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onSave: (newSettings: GameSettings) => void;
  onClose: () => void;
  isHost?: boolean;
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
const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onSave,
  onClose,
  isHost = true,
}) => {
  const [localSettings, setLocalSettings] = React.useState<GameSettings>(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const toggleGenre = (genre: Genre) => {
    const current = [...localSettings.selectedGenres];
    const index = current.indexOf(genre);
    if (index >= 0) {
      if (current.length > 1) {
        current.splice(index, 1);
      }
    } else {
      current.push(genre);
    }
    setLocalSettings({ ...localSettings, selectedGenres: current });
  };

  const toggleDifficulty = (diff: Difficulty) => {
    const current = [...localSettings.selectedDifficulties];
    const index = current.indexOf(diff);
    if (index >= 0) {
      if (current.length > 1) {
        current.splice(index, 1);
      }
    } else {
      current.push(diff);
    }
    setLocalSettings({ ...localSettings, selectedDifficulties: current });
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel-glow rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Game Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Total Rounds */}
          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-2">
              Number of Rounds
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[3, 5, 8, 10, 15].map((rounds) => (
                <button
                  key={rounds}
                  type="button"
                  disabled={!isHost}
                  onClick={() => setLocalSettings({ ...localSettings, totalRounds: rounds })}
                  className={`py-2 rounded-xl text-sm font-bold border transition ${
                    localSettings.totalRounds === rounds
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white'
                  }`}
                >
                  {rounds}
                </button>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-2">
              Quote Categories
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_GENRES.map((genre) => {
                const meta = GENRE_METADATA[genre];
                const isSelected = localSettings.selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    disabled={!isHost}
                    onClick={() => toggleGenre(genre)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition text-left ${
                      isSelected
                        ? `${meta.badgeClass} shadow-sm`
                        : 'bg-slate-800/40 text-slate-500 border-slate-800'
                    }`}
                  >
                    <span>{meta.label}</span>
                    {isSelected && <Check className="w-4 h-4 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulties */}
          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-2">
              Difficulty Levels
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ALL_DIFFICULTIES.map((diff) => {
                const isSelected = localSettings.selectedDifficulties.includes(diff);
                return (
                  <button
                    key={diff}
                    type="button"
                    disabled={!isHost}
                    onClick={() => toggleDifficulty(diff)}
                    className={`py-2 px-3 rounded-xl text-xs uppercase font-bold border transition text-center ${
                      isSelected
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/60'
                        : 'bg-slate-800/40 text-slate-500 border-slate-800'
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Word Reveal Speed & Mode */}
          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-2">
              Word Reveal Mode
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                disabled={!isHost}
                onClick={() => setLocalSettings({ ...localSettings, revealMode: 'manual' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  localSettings.revealMode === 'manual'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                    : 'bg-slate-800/40 text-slate-400 border-slate-800'
                }`}
              >
                Host Manual Trigger
              </button>
              <button
                type="button"
                disabled={!isHost}
                onClick={() => setLocalSettings({ ...localSettings, revealMode: 'auto' })}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  localSettings.revealMode === 'auto'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                    : 'bg-slate-800/40 text-slate-400 border-slate-800'
                }`}
              >
                Auto-Reveal Timer
              </button>
            </div>

            {localSettings.revealMode === 'auto' && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Auto-reveal interval:</span>
                <select
                  value={localSettings.autoRevealIntervalSeconds}
                  disabled={!isHost}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      autoRevealIntervalSeconds: parseInt(e.target.value, 10),
                    })
                  }
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                >
                  <option value={3}>Every 3 seconds (Fast)</option>
                  <option value={5}>Every 5 seconds (Standard)</option>
                  <option value={8}>Every 8 seconds (Chill)</option>
                </select>
              </div>
            )}
          </div>

          {/* Impression Bonus Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs font-bold text-white">+100 Voice Impression Bonus</p>
                <p className="text-[10px] text-slate-400">Award extra points for character impressions</p>
              </div>
            </div>
            <input
              type="checkbox"
              disabled={!isHost}
              checked={localSettings.allowImpressionsBonus}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, allowImpressionsBonus: e.target.checked })
              }
              className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-6 mt-6 border-t border-slate-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
          >
            Cancel
          </button>
          {isHost && (
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-pink-500/20 transition transform active:scale-95"
            >
              Save Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
