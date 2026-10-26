import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Socket } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { QuoteBoard } from '../components/QuoteBoard';
import { Leaderboard } from '../components/Leaderboard';
import { HostControls } from '../components/HostControls';
import { CountdownTimer } from '../components/CountdownTimer';
import { RoundResultModal } from '../components/RoundResultModal';
import { CustomQuoteModal } from '../components/CustomQuoteModal';
import { CategoryDeckPicker } from '../components/CategoryDeckPicker';
import { RoomState, Quote, GameSettings, Genre } from '../types';
import { sfx } from '../sound/sfx';
import { Play, Copy, Check, Users, Sparkles, RefreshCw, QrCode as QrIcon, Bell, BellOff, Layers } from 'lucide-react';

interface OnlineHostViewProps {
  socket: Socket | null;
  roomCode: string;
  roomState: RoomState | null;
  onOpenSettings: () => void;
  onGoHome: () => void;
}

export const OnlineHostView: React.FC<OnlineHostViewProps> = ({
  socket,
  roomCode,
  roomState,
  onOpenSettings,
  onGoHome,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isCustomQuoteModalOpen, setIsCustomQuoteModalOpen] = useState<boolean>(false);
  const [networkUrl, setNetworkUrl] = useState<string>(window.location.origin);

  // Fetch local network IP for QR code and mobile sharing
  useEffect(() => {
    fetch('/api/network-info')
      .then((res) => res.json())
      .then((data) => {
        if (data.joinUrl) {
          setNetworkUrl(data.joinUrl);
        }
      })
      .catch(() => {
        setNetworkUrl(window.location.origin);
      });
  }, []);

  // Generate QR Code for instant phone scanning
  useEffect(() => {
    if (roomCode) {
      const joinUrl = `${networkUrl}?room=${roomCode}`;
      QRCode.toDataURL(joinUrl, {
        width: 220,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#f8fafc',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code:', err));
    }
  }, [roomCode, networkUrl]);

  // Audio effects when game events happen over WebSockets
  useEffect(() => {
    if (!socket) return;

    const onWordRevealed = () => sfx.playWordReveal();
    const onPlayerBuzzed = () => sfx.playBuzzer();
    const onBuzzTick = () => sfx.playTick();
    const onRoundWon = () => sfx.playCorrect();
    const onGuessFailed = () => sfx.playWrong();
    const onBonusToggled = () => sfx.playBonus();
    const onGameOver = () => sfx.playVictory();

    socket.on('word_revealed', onWordRevealed);
    socket.on('player_buzzed', onPlayerBuzzed);
    socket.on('buzz_timer_tick', onBuzzTick);
    socket.on('round_won', onRoundWon);
    socket.on('guess_failed', onGuessFailed);
    socket.on('bonus_toggled', onBonusToggled);
    socket.on('game_over', onGameOver);

    return () => {
      socket.off('word_revealed', onWordRevealed);
      socket.off('player_buzzed', onPlayerBuzzed);
      socket.off('buzz_timer_tick', onBuzzTick);
      socket.off('round_won', onRoundWon);
      socket.off('guess_failed', onGuessFailed);
      socket.off('bonus_toggled', onBonusToggled);
      socket.off('game_over', onGameOver);
    };
  }, [socket]);

  const copyJoinLink = () => {
    const joinUrl = `${networkUrl}?room=${roomCode}`;
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    sfx.playTick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    if (socket) {
      sfx.playBuzzer();
      socket.emit('start_game', { roomCode });
    }
  };

  const handleRevealNextWord = () => {
    if (socket) {
      socket.emit('reveal_next_word', { roomCode });
    }
  };

  const handleMarkCorrect = (hasBonus = false) => {
    if (socket) {
      socket.emit('host_adjudicate_correct', { roomCode, hasBonus });
    }
  };

  const handleMarkIncorrect = () => {
    if (socket) {
      socket.emit('host_adjudicate_incorrect', { roomCode });
    }
  };

  const handleToggleBonus = () => {
    if (socket) {
      socket.emit('toggle_bonus', { roomCode });
    }
  };

  const handleSkipRound = () => {
    if (socket) {
      socket.emit('skip_round', { roomCode });
    }
  };

  const handleNextRound = () => {
    if (socket) {
      socket.emit('start_next_round', { roomCode });
    }
  };

  const handleRestartGame = () => {
    if (socket) {
      socket.emit('restart_game', { roomCode });
    }
  };

  const handleCategoriesChange = (newCategories: Genre[]) => {
    if (socket && roomCode) {
      socket.emit('set_active_categories', { roomCode, categories: newCategories });
    }
  };

  const handleTogglePlayerBuzzer = (playerId: string, currentBuzzerState?: boolean) => {
    if (socket && roomCode) {
      const nextState = currentBuzzerState === false ? true : false;
      socket.emit('host_set_player_buzzer', { roomCode, playerId, hasBuzzer: nextState });
      sfx.playTick();
    }
  };

  const handleAddCustomQuote = (quote: Omit<Quote, 'id'>) => {
    if (socket) {
      socket.emit('add_custom_quote', { roomCode, quote });
    }
  };

  if (!roomState) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mb-4" />
        <p className="text-slate-400 font-semibold">Connecting to party room...</p>
      </div>
    );
  }

  // --- 1. LOBBY SCREEN ---
  if (roomState.status === 'LOBBY') {
    const joinUrl = `${networkUrl}?room=${roomCode}`;

    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col items-center">
        {/* Lobby Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Room Lobby Active</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Join The Quote Battle!
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Scan the QR code with your phone or visit the link to buzz in!
          </p>
        </div>

        {/* Central Room Code & QR Card */}
        <div className="w-full max-w-4xl glass-panel-glow rounded-3xl p-6 sm:p-8 border border-slate-700/80 mb-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: 4-Letter Room Code & Link */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                Party Room Code:
              </span>
              <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-pink-500/20 border-2 border-amber-400 text-amber-300 font-mono text-5xl sm:text-6xl font-black tracking-widest shadow-xl">
                {roomCode}
              </div>

              <div className="w-full pt-2">
                <button
                  onClick={copyJoinLink}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-xs text-slate-300 transition group"
                >
                  <span className="truncate mr-2 font-mono">{joinUrl}</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0" />
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => setIsCustomQuoteModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition"
                >
                  + Add Custom Quote
                </button>
                <button
                  onClick={onOpenSettings}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition"
                >
                  Match Settings ({roomState.settings.totalRounds} Rounds)
                </button>
              </div>
            </div>

            {/* Right: QR Code */}
            <div className="flex flex-col items-center justify-center">
              {qrCodeDataUrl ? (
                <div className="p-3 bg-white rounded-3xl shadow-2xl border-4 border-slate-700">
                  <img
                    src={qrCodeDataUrl}
                    alt={`Join room ${roomCode}`}
                    className="w-48 h-48 rounded-xl object-contain"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-slate-800 rounded-2xl flex items-center justify-center">
                  <QrIcon className="w-12 h-12 text-slate-600 animate-pulse" />
                </div>
              )}
              <span className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                Point Phone Camera to Connect
              </span>
            </div>
          </div>
        </div>

        {/* Category Decks (Heads Up style Deck Picker) */}
        <div className="w-full max-w-4xl glass-panel rounded-3xl p-6 border border-slate-800 mb-8 shadow-xl">
          <CategoryDeckPicker
            selectedGenres={roomState.settings.selectedGenres}
            onChange={handleCategoriesChange}
          />
        </div>

        {/* Players Joined Roster & Buzzer Screen Indicators */}
        <div className="w-full max-w-4xl glass-panel rounded-3xl p-6 border border-slate-800 mb-8">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base text-white">
                Connected Devices ({roomState.players.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Each player can buzz or spectate from their phone
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {roomState.players.map((player) => {
              const hasBuzzer = player.hasBuzzer !== false;

              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 animate-in zoom-in-95"
                >
                  <div className="flex items-center space-x-2.5 truncate mr-2">
                    <span className="text-2xl">{player.avatar}</span>
                    <span className="font-bold text-slate-200 text-sm truncate">
                      {player.name}
                    </span>
                  </div>

                  {/* Buzzer capability indicator & Host toggle */}
                  <button
                    onClick={() => handleTogglePlayerBuzzer(player.id, player.hasBuzzer)}
                    title="Click to toggle buzzer on this player's screen"
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                      hasBuzzer
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30'
                    }`}
                  >
                    {hasBuzzer ? (
                      <>
                        <Bell className="w-3 h-3 text-rose-400" />
                        <span>Buzzer ON</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="w-3 h-3 text-indigo-400" />
                        <span>Viewer Only</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}

            {roomState.players.length === 0 && (
              <div className="col-span-full py-8 text-center text-sm text-slate-500">
                No players have joined yet. Scan the QR code or enter code <span className="font-mono text-amber-400 font-bold">{roomCode}</span>!
              </div>
            )}
          </div>
        </div>

        {/* Start Game Button */}
        <div className="w-full max-w-4xl">
          <button
            onClick={handleStartGame}
            disabled={roomState.players.length === 0}
            className="w-full py-5 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-600 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-lg flex items-center justify-center space-x-3 shadow-2xl shadow-pink-500/30 transition transform active:scale-98"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>START GAME ({roomState.players.length} PLAYERS)</span>
          </button>
        </div>

        <CustomQuoteModal
          isOpen={isCustomQuoteModalOpen}
          onAddQuote={handleAddCustomQuote}
          onClose={() => setIsCustomQuoteModalOpen(false)}
        />
      </div>
    );
  }

  // --- 2. ACTIVE / BUZZED / ROUND RESULT GAMEPLAY ---
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 flex flex-col space-y-6">
      {/* Buzzer countdown alert */}
      {roomState.status === 'BUZZED' && roomState.activeBuzz && (
        <div className="animate-in fade-in duration-150">
          <CountdownTimer
            timeRemaining={roomState.activeBuzz.timeRemaining}
            totalTime={roomState.settings.guessTimerSeconds || 10}
            label={`${roomState.activeBuzz.playerName} is Answering!`}
          />
        </div>
      )}

      {/* Main Board & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <QuoteBoard
            quote={roomState.currentQuote}
            revealedWordsCount={roomState.revealedWordsCount}
            isHost={true}
          />

          {/* Host Controls */}
          <HostControls
            status={roomState.status}
            activeBuzz={roomState.activeBuzz}
            onRevealNextWord={handleRevealNextWord}
            onMarkCorrect={handleMarkCorrect}
            onMarkIncorrect={handleMarkIncorrect}
            onSkipRound={handleSkipRound}
            onStartNextRound={handleNextRound}
            totalWordsInQuote={roomState.totalWordsInQuote}
            revealedWordsCount={roomState.revealedWordsCount}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Leaderboard
            players={roomState.players}
            activeBuzzerId={roomState.activeBuzz?.playerId}
            lockedOutIds={roomState.lockedOutPlayerIds}
          />
        </div>
      </div>

      {/* Round Result Modal */}
      <RoundResultModal
        isOpen={roomState.status === 'ROUND_RESULT'}
        result={roomState.lastRoundResult}
        isHost={true}
        onNextRound={handleNextRound}
        onToggleBonus={handleToggleBonus}
        isGameOver={roomState.currentRound >= roomState.totalRounds}
      />

      {/* Game Over Screen */}
      {roomState.status === 'GAME_OVER' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl glass-panel-glow rounded-3xl p-8 border border-amber-500/50 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 mx-auto flex items-center justify-center text-4xl shadow-xl shadow-pink-500/30 mb-4 animate-bounce">
              👑
            </div>

            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              GAME OVER
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-1 mb-6">
              Final Champion!
            </h2>

            {/* Podium */}
            <div className="space-y-3 mb-8">
              {[...roomState.players]
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map((player, idx) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                      idx === 0
                        ? 'bg-amber-500/20 border-amber-500/60 shadow-lg text-amber-300'
                        : idx === 1
                        ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-extrabold text-lg">#{idx + 1}</span>
                      <span className="text-2xl">{player.avatar}</span>
                      <span className="font-bold text-base text-white">{player.name}</span>
                    </div>
                    <div className="font-mono font-black text-xl">
                      {player.score.toLocaleString()} pts
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onGoHome}
                className="flex-1 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
              >
                Main Menu
              </button>
              <button
                onClick={handleRestartGame}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-500 hover:brightness-110 text-white font-extrabold shadow-lg flex items-center justify-center space-x-2 transition transform active:scale-98"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Play Again</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
