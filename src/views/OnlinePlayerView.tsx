import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { BuzzerButton } from '../components/BuzzerButton';
import { CountdownTimer } from '../components/CountdownTimer';
import { GuessInputModal } from '../components/GuessInputModal';
import { RoundResultModal } from '../components/RoundResultModal';
import { RoomState, Player, Genre, GENRE_METADATA } from '../types';
import { sfx } from '../sound/sfx';
import { Zap, Trophy, Award, Lock, Sparkles, Bell, BellOff, Eye, Users } from 'lucide-react';

interface OnlinePlayerViewProps {
  socket: Socket | null;
  roomCode: string;
  roomState: RoomState | null;
  player: Player | null;
  onGoHome: () => void;
}

export const OnlinePlayerView: React.FC<OnlinePlayerViewProps> = ({
  socket,
  roomCode,
  roomState,
  player,
  onGoHome,
}) => {
  const [guessModalOpen, setGuessModalOpen] = useState(false);
  const [hasBuzzerOnScreen, setHasBuzzerOnScreen] = useState<boolean>(true);

  // Sync initial player buzzer setting
  useEffect(() => {
    if (player && player.hasBuzzer !== undefined) {
      setHasBuzzerOnScreen(player.hasBuzzer);
    }
  }, [player]);

  // Sound and vibration feedback on socket events
  useEffect(() => {
    if (!socket) return;

    const onWordRevealed = () => sfx.playWordReveal();
    const onPlayerBuzzed = (buzz: { playerId: string }) => {
      sfx.playBuzzer();
      if (buzz.playerId === player?.id) {
        setGuessModalOpen(true);
      }
    };
    const onBuzzTick = () => sfx.playTick();
    const onRoundWon = (result: { winnerId: string }) => {
      sfx.playCorrect();
      if (result.winnerId === player?.id) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
      setGuessModalOpen(false);
    };
    const onGuessFailed = (fail: { playerId: string }) => {
      sfx.playWrong();
      if (fail.playerId === player?.id) {
        setGuessModalOpen(false);
      }
    };
    const onBonusToggled = () => sfx.playBonus();

    socket.on('word_revealed', onWordRevealed);
    socket.on('player_buzzed', onPlayerBuzzed);
    socket.on('buzz_timer_tick', onBuzzTick);
    socket.on('round_won', onRoundWon);
    socket.on('guess_failed', onGuessFailed);
    socket.on('bonus_toggled', onBonusToggled);

    return () => {
      socket.off('word_revealed', onWordRevealed);
      socket.off('player_buzzed', onPlayerBuzzed);
      socket.off('buzz_timer_tick', onBuzzTick);
      socket.off('round_won', onRoundWon);
      socket.off('guess_failed', onGuessFailed);
      socket.off('bonus_toggled', onBonusToggled);
    };
  }, [socket, player]);

  const handleToggleBuzzer = (enabled: boolean) => {
    setHasBuzzerOnScreen(enabled);
    sfx.playTick();
    if (socket && roomCode) {
      socket.emit('toggle_player_buzzer', { roomCode, hasBuzzer: enabled });
    }
  };

  const handleBuzz = () => {
    if (!hasBuzzerOnScreen) return;
    if (socket && roomCode) {
      socket.emit('player_buzz', { roomCode });
    }
  };

  const handleSubmitGuess = (guessText: string) => {
    if (socket && roomCode) {
      socket.emit('submit_guess', { roomCode, guessText });
      setGuessModalOpen(false);
    }
  };

  if (!roomState || !player) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-pink-500 border-t-transparent animate-spin mb-4" />
        <p className="text-slate-300 font-bold">Connecting controller to room {roomCode}...</p>
      </div>
    );
  }

  // Find updated self player state from roomState
  const currentPlayer = roomState.players.find((p) => p.id === player.id) || player;

  const isBuzzedByMe = roomState.activeBuzz?.playerId === player.id;
  const isBuzzedByOther = Boolean(roomState.activeBuzz && !isBuzzedByMe);
  const isLockedOut = roomState.lockedOutPlayerIds?.includes(player.id);

  // Category & Clue
  const genre = roomState.quoteMeta?.genre as Genre;
  const genreMeta = genre ? GENRE_METADATA[genre] : null;

  // Potential points
  const pointsValue =
    roomState.revealedWordsCount <= 2 ? 500 :
    roomState.revealedWordsCount <= 4 ? 300 :
    roomState.revealedWordsCount <= 6 ? 150 : 50;

  // --- LOBBY SCREEN ON PHONE ---
  if (roomState.status === 'LOBBY') {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-6 flex flex-col items-center justify-between min-h-[80vh]">
        <div className="text-center w-full">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center text-4xl shadow-xl shadow-pink-500/30 mx-auto mb-4 animate-bounce">
            {currentPlayer.avatar}
          </div>

          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
            ● Connected to Room {roomCode}
          </span>
          <h2 className="text-2xl font-black text-white mt-1 mb-1">
            Ready, {currentPlayer.name}!
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
            Watch the host screen. Customize your phone controller below before the game begins!
          </p>

          {/* Option: Choose whether this phone has a buzzer on screen or not */}
          <div className="glass-panel-glow rounded-2xl p-4 border border-amber-500/30 text-left mb-6 space-y-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400 block">
              Phone Screen Mode
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggleBuzzer(true)}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition ${
                  hasBuzzerOnScreen
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/80 shadow-md ring-1 ring-amber-400'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700'
                }`}
              >
                <Bell className="w-5 h-5 mb-1 text-amber-400" />
                <span className="text-xs font-bold">Buzzer Controller</span>
                <span className="text-[10px] text-slate-400 mt-0.5">I want a buzzer on my screen</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleBuzzer(false)}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition ${
                  !hasBuzzerOnScreen
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/80 shadow-md ring-1 ring-indigo-400'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700'
                }`}
              >
                <Eye className="w-5 h-5 mb-1 text-indigo-400" />
                <span className="text-xs font-bold">Viewer Only</span>
                <span className="text-[10px] text-slate-400 mt-0.5">No buzzer on my screen</span>
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Players:</span>
              <span className="font-bold text-amber-400">{roomState.players.length}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Match Length:</span>
              <span className="font-bold text-slate-200">{roomState.settings.totalRounds} Rounds</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-pink-400 animate-pulse">Waiting for Host to start</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center mt-4">
          You can toggle buzzer mode on or off at any time during gameplay!
        </p>
      </div>
    );
  }

  // --- IN GAMEPLAY SCREEN ON PHONE ---
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-3 flex flex-col justify-between min-h-[85vh]">
      {/* Top Player Info Bar & Buzzer Mode Toggle */}
      <div className="glass-panel rounded-2xl p-3 border border-slate-800 flex items-center justify-between shadow-lg mb-3">
        <div className="flex items-center space-x-2.5">
          <span className="text-2xl">{currentPlayer.avatar}</span>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Player</span>
            <p className="font-extrabold text-sm text-white truncate max-w-[110px]">
              {currentPlayer.name}
            </p>
          </div>
        </div>

        {/* Quick Buzzer ON/OFF Screen Toggle Switch */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleToggleBuzzer(!hasBuzzerOnScreen)}
            title={hasBuzzerOnScreen ? 'Switch to Viewer Mode (Hide Buzzer)' : 'Enable Buzzer on Screen'}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              hasBuzzerOnScreen
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-inner'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {hasBuzzerOnScreen ? (
              <>
                <Bell className="w-3.5 h-3.5 text-rose-400" />
                <span>Buzzer: ON</span>
              </>
            ) : (
              <>
                <BellOff className="w-3.5 h-3.5 text-slate-400" />
                <span>No Buzzer</span>
              </>
            )}
          </button>

          <div className="text-right pl-2 border-l border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
            <p className="font-mono font-black text-amber-400 text-base leading-none">
              {currentPlayer.score.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Quote Clues Card */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800/80 text-center space-y-2 mb-3">
        <div className="flex items-center justify-between">
          {genreMeta && (
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${genreMeta.badgeClass}`}>
              {genreMeta.label}
            </span>
          )}
          <span className="text-xs font-bold text-amber-400 font-mono">
            Value: +{pointsValue} pts
          </span>
        </div>

        {/* Revealed Words Snippet */}
        <div className="py-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Revealed Words:
          </span>
          <p className="text-base sm:text-lg font-bold text-amber-200 tracking-wide">
            "{roomState.revealedWords || '...'}"
          </p>
          <span className="text-[11px] text-slate-400 font-mono block mt-1">
            Word {roomState.revealedWordsCount} of {roomState.totalWordsInQuote}
          </span>
        </div>
      </div>

      {/* Countdown timer if someone is buzzing */}
      {roomState.status === 'BUZZED' && roomState.activeBuzz && (
        <div className="mb-2">
          <CountdownTimer
            timeRemaining={roomState.activeBuzz.timeRemaining}
            totalTime={roomState.settings.guessTimerSeconds || 10}
            label={isBuzzedByMe ? 'Answer Now!' : `${roomState.activeBuzz.playerName} is answering...`}
          />
        </div>
      )}

      {/* Center Display: EITHER Big Buzzer Button OR Companion Clue Viewer */}
      <div className="my-auto flex flex-col items-center justify-center py-2">
        {hasBuzzerOnScreen ? (
          /* OPTION A: PHONE HAS BUZZER ON SCREEN */
          <>
            <BuzzerButton
              onBuzz={handleBuzz}
              isActiveBuzzer={isBuzzedByMe}
              anotherPlayerBuzzed={isBuzzedByOther}
              activePlayerName={roomState.activeBuzz?.playerName}
              isLockedOut={isLockedOut}
              disabled={roomState.status !== 'ACTIVE'}
              size="large"
            />

            {isBuzzedByMe && !guessModalOpen && (
              <button
                onClick={() => setGuessModalOpen(true)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider animate-bounce shadow-lg"
              >
                Type Your Guess!
              </button>
            )}
          </>
        ) : (
          /* OPTION B: PHONE DOES NOT HAVE BUZZER (VIEWER / SPECTATOR MODE) */
          <div className="w-full glass-panel-glow rounded-3xl p-6 border border-slate-700/80 text-center space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
              <Eye className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">
                Viewer / Spectator Display
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Buzzer Disabled on this Device
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                You are viewing the quote clues in real time without a buzzer on your screen.
              </p>
            </div>

            {/* Quick action to turn buzzer back on */}
            <div className="pt-2">
              <button
                onClick={() => handleToggleBuzzer(true)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition transform active:scale-95 flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Enable Buzzer on My Screen</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Feedback */}
      <div className="text-center text-xs text-slate-400 py-2">
        {hasBuzzerOnScreen && roomState.status === 'ACTIVE' && !isLockedOut && (
          <span className="text-emerald-400 font-bold animate-pulse">
            ● Buzzer is Live! Tap when you know the line!
          </span>
        )}
        {!hasBuzzerOnScreen && roomState.status === 'ACTIVE' && (
          <span className="text-indigo-400 font-medium">
            Watching clues live. Listen for other players buzzing in!
          </span>
        )}
        {isLockedOut && (
          <span className="text-rose-400 font-bold">
            Locked out for this word reveal. Unlocks on next word!
          </span>
        )}
        {isBuzzedByOther && (
          <span className="text-amber-400 font-semibold">
            {roomState.activeBuzz?.playerName} buzzed first!
          </span>
        )}
      </div>

      {/* Guess input modal */}
      <GuessInputModal
        isOpen={guessModalOpen && isBuzzedByMe}
        timeRemaining={roomState.activeBuzz?.timeRemaining || 10}
        playerName={currentPlayer.name}
        onSubmit={handleSubmitGuess}
        onCancel={() => setGuessModalOpen(false)}
      />

      {/* Round Result Modal */}
      <RoundResultModal
        isOpen={roomState.status === 'ROUND_RESULT'}
        result={roomState.lastRoundResult}
        isHost={false}
        onNextRound={() => {}}
        isGameOver={roomState.currentRound >= roomState.totalRounds}
      />
    </div>
  );
};
