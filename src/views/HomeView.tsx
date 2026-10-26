import React, { useState } from 'react';
import { Tv, Users, Smartphone, Sparkles, Trophy, ArrowRight, Zap, Play, Bell, Eye } from 'lucide-react';
import { AVATARS, Genre } from '../types';
import { CategoryDeckPicker } from '../components/CategoryDeckPicker';
import { sfx } from '../sound/sfx';

interface HomeViewProps {
  onStartLocalGame: (playerCount: number, selectedGenres?: Genre[]) => void;
  onCreateOnlineRoom: (selectedGenres?: Genre[]) => void;
  onJoinOnlineRoom: (roomCode: string, name: string, avatar: string, hasBuzzer?: boolean) => void;
  currentGenres: Genre[];
  onUpdateGenres: (genres: Genre[]) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartLocalGame,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  currentGenres,
  onUpdateGenres,
}) => {
  const [activeTab, setActiveTab] = useState<'couch' | 'host' | 'join'>('couch');
  const [localPlayerCount, setLocalPlayerCount] = useState<number>(3);
  const [joinRoomCode, setJoinRoomCode] = useState<string>('');
  const [joinName, setJoinName] = useState<string>('');
  const [joinAvatar, setJoinAvatar] = useState<string>('⚡');
  const [joinHasBuzzer, setJoinHasBuzzer] = useState<boolean>(true);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinRoomCode.trim() && joinName.trim()) {
      sfx.playBuzzer();
      onJoinOnlineRoom(joinRoomCode.trim().toUpperCase(), joinName.trim(), joinAvatar, joinHasBuzzer);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 md:py-14 flex flex-col items-center">
      {/* Hero Title Section */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4 animate-bounce-subtle">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Real-Time Party Trivia Experience</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-400 text-shadow-glow">
          FINISH THE LINE
        </h1>
        <p className="mt-3 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium">
          The high-energy quote trivia game where clues reveal word by word. Buzz in before your rivals to complete the line and score maximum points!
        </p>

        {/* Quick Points Breakdown Pill */}
        <div className="mt-6 flex flex-wrap justify-center items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-amber-300">
            1–2 Words: <span className="text-white font-mono">500 pts</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-amber-300">
            3–4 Words: <span className="text-white font-mono">300 pts</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-amber-300">
            5–6 Words: <span className="text-white font-mono">150 pts</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-amber-300">
            7+ Words: <span className="text-white font-mono">50 pts</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300">
            Impression Bonus: <span className="text-white font-mono">+100 pts</span>
          </span>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="w-full max-w-2xl glass-panel rounded-2xl p-1.5 flex mb-8 border border-slate-800">
        <button
          onClick={() => {
            sfx.playTick();
            setActiveTab('couch');
          }}
          className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
            activeTab === 'couch'
              ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pass & Play (Couch)</span>
        </button>

        <button
          onClick={() => {
            sfx.playTick();
            setActiveTab('host');
          }}
          className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
            activeTab === 'host'
              ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>Host TV Screen</span>
        </button>

        <button
          onClick={() => {
            sfx.playTick();
            setActiveTab('join');
          }}
          className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
            activeTab === 'join'
              ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Join from Phone</span>
        </button>
      </div>

      {/* Active Tab Panel */}
      <div className="w-full max-w-4xl">
        {/* 1. Pass & Play / Couch Co-Op Mode */}
        {activeTab === 'couch' && (
          <div className="glass-panel-glow rounded-3xl p-6 md:p-8 border border-slate-700/80 animate-in fade-in duration-200 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Pass & Play / Couch Co-Op</h3>
                <p className="text-xs text-slate-400">Play together on one laptop, PC, or TV screen!</p>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-2">
                Select Number of Local Players:
              </label>
              <div className="grid grid-cols-5 gap-2.5 max-w-md">
                {[2, 3, 4, 5, 6].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      sfx.playTick();
                      setLocalPlayerCount(count);
                    }}
                    className={`py-3 rounded-2xl font-black text-lg border transition ${
                      localPlayerCount === count
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/80 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {count}P
                  </button>
                ))}
              </div>
            </div>

            {/* Category Deck Selection */}
            <div className="pt-2">
              <CategoryDeckPicker
                selectedGenres={currentGenres}
                onChange={onUpdateGenres}
              />
            </div>

            <button
              onClick={() => {
                sfx.playBuzzer();
                onStartLocalGame(localPlayerCount, currentGenres);
              }}
              className="w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-600 hover:brightness-110 text-white font-extrabold text-base flex items-center justify-center space-x-2 shadow-xl shadow-pink-500/25 transition transform active:scale-98"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START COUCH GAME ({localPlayerCount} PLAYERS)</span>
            </button>
          </div>
        )}

        {/* 2. Host Online Room Mode */}
        {activeTab === 'host' && (
          <div className="glass-panel-glow rounded-3xl p-6 md:p-8 border border-slate-700/80 animate-in fade-in duration-200 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Tv className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Host an Online Party Room</h3>
                <p className="text-xs text-slate-400">Put this screen on a TV / projector for the party!</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Creates a dedicated 4-letter room code and scannable QR code. Players join from their personal phones or browsers to buzz in or view clues live.
            </p>

            {/* Category Deck Selection */}
            <CategoryDeckPicker
              selectedGenres={currentGenres}
              onChange={onUpdateGenres}
            />

            <button
              onClick={() => {
                sfx.playBuzzer();
                onCreateOnlineRoom(currentGenres);
              }}
              className="w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-pink-500 to-amber-500 hover:brightness-110 text-white font-extrabold text-base flex items-center justify-center space-x-2 shadow-xl shadow-indigo-600/25 transition transform active:scale-98"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>CREATE ONLINE ROOM & LAUNCH LOBBY</span>
            </button>
          </div>
        )}

        {/* 3. Join Online Room Mode (Phone Controller) */}
        {activeTab === 'join' && (
          <div className="max-w-2xl mx-auto glass-panel-glow rounded-3xl p-6 md:p-8 border border-slate-700/80 animate-in fade-in duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Join Room from Device</h3>
                <p className="text-xs text-slate-400">Turn this phone into your buzzer controller or companion screen</p>
              </div>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  4-Letter Room Code:
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={joinRoomCode}
                  onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WORD"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-700 focus:border-amber-400 text-white font-mono text-xl tracking-widest text-center uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Your Nickname:
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="e.g. TriviaMaster"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-white text-base focus:outline-none"
                />
              </div>

              {/* Buzzer on screen option */}
              <div>
                <label className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                  Device Screen Option:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJoinHasBuzzer(true)}
                    className={`p-3 rounded-xl border flex items-center space-x-2.5 transition ${
                      joinHasBuzzer
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/80 shadow-md ring-1 ring-amber-400'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Bell className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="text-left">
                      <p className="text-xs font-bold leading-tight">Buzzer Controller</p>
                      <p className="text-[10px] text-slate-400 leading-tight">Buzzer button on my screen</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setJoinHasBuzzer(false)}
                    className={`p-3 rounded-xl border flex items-center space-x-2.5 transition ${
                      !joinHasBuzzer
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/80 shadow-md ring-1 ring-indigo-400'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Eye className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div className="text-left">
                      <p className="text-xs font-bold leading-tight">Viewer / Spectator</p>
                      <p className="text-[10px] text-slate-400 leading-tight">Clues & scores, no buzzer</p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-2">
                  Choose Your Avatar:
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        sfx.playTick();
                        setJoinAvatar(av);
                      }}
                      className={`p-2.5 rounded-xl text-2xl border transition transform active:scale-90 ${
                        joinAvatar === av
                          ? 'bg-amber-500/20 border-amber-400 shadow-md scale-105'
                          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!joinRoomCode.trim() || !joinName.trim()}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-amber-500 to-indigo-600 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-base flex items-center justify-center space-x-2 shadow-xl shadow-pink-500/25 transition transform active:scale-98"
                >
                  <span>CONNECT TO GAME</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
