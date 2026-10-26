import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { QuoteBoard } from '../components/QuoteBoard';
import { BuzzerButton } from '../components/BuzzerButton';
import { Leaderboard } from '../components/Leaderboard';
import { HostControls } from '../components/HostControls';
import { GuessInputModal } from '../components/GuessInputModal';
import { RoundResultModal } from '../components/RoundResultModal';
import { CountdownTimer } from '../components/CountdownTimer';
import { Player, Quote, GameSettings, ActiveBuzz, RoundResult, GameStateStatus, AVATARS } from '../types';
import { INITIAL_QUOTES, getRandomQuote } from '../data/quotes';
import { evaluateGuess, calculateScore } from '../utils/fuzzyMatch';
import { sfx } from '../sound/sfx';
import { Trophy, RefreshCw, Crown, Award, Medal } from 'lucide-react';

interface LocalGameViewProps {
  playerCount: number;
  settings: GameSettings;
  onOpenSettings: () => void;
  onGoHome: () => void;
}

const DEFAULT_KEY_BINDINGS = ['Space', 'Enter', 'q', 'p', 'z', 'm'];

export const LocalGameView: React.FC<LocalGameViewProps> = ({
  playerCount,
  settings,
  onOpenSettings,
  onGoHome,
}) => {
  // Game state
  const [players, setPlayers] = useState<Player[]>(() => {
    return Array.from({ length: playerCount }, (_, i) => ({
      id: `p-${i + 1}`,
      name: `Player ${i + 1}`,
      avatar: AVATARS[i % AVATARS.length],
      score: 0,
      roundWins: 0,
      keyBinding: DEFAULT_KEY_BINDINGS[i] || `${i + 1}`,
    }));
  });

  const [status, setStatus] = useState<GameStateStatus>('ACTIVE');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [revealedWordsCount, setRevealedWordsCount] = useState<number>(1);
  const [usedQuoteIds, setUsedQuoteIds] = useState<string[]>([]);
  const [activeBuzz, setActiveBuzz] = useState<ActiveBuzz | null>(null);
  const [lockedOutIds, setLockedOutIds] = useState<string[]>([]);
  const [lastRoundResult, setLastRoundResult] = useState<RoundResult | null>(null);
  const [hasImpressionBonus, setHasImpressionBonus] = useState<boolean>(false);
  const [customQuotes, setCustomQuotes] = useState<Quote[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoRevealRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize first round
  useEffect(() => {
    startNewRound(1);
    return () => {
      clearAllTimers();
    };
  }, []);

  const clearAllTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoRevealRef.current) clearInterval(autoRevealRef.current);
  };

  const startNewRound = (roundNumber: number) => {
    clearAllTimers();
    setHasImpressionBonus(false);

    if (roundNumber > settings.totalRounds) {
      setStatus('GAME_OVER');
      sfx.playVictory();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });
      return;
    }

    const nextQuote = getRandomQuote(
      settings.selectedGenres,
      settings.selectedDifficulties,
      usedQuoteIds,
      customQuotes
    );

    if (!nextQuote) {
      setStatus('GAME_OVER');
      return;
    }

    setCurrentQuote(nextQuote);
    setUsedQuoteIds((prev) => [...prev, nextQuote.id]);
    setCurrentRound(roundNumber);
    setRevealedWordsCount(1);
    setLockedOutIds([]);
    setActiveBuzz(null);
    setLastRoundResult(null);
    setStatus('ACTIVE');

    sfx.playWordReveal();

    if (settings.revealMode === 'auto') {
      startAutoReveal();
    }
  };

  const startAutoReveal = () => {
    if (autoRevealRef.current) clearInterval(autoRevealRef.current);
    const intervalMs = (settings.autoRevealIntervalSeconds || 5) * 1000;

    autoRevealRef.current = setInterval(() => {
      handleRevealNextWord();
    }, intervalMs);
  };

  const stopAutoReveal = () => {
    if (autoRevealRef.current) clearInterval(autoRevealRef.current);
  };

  // Reveal next word
  const handleRevealNextWord = () => {
    if (!currentQuote || status !== 'ACTIVE') return;

    const words = currentQuote.quote.split(/\s+/);
    if (revealedWordsCount < words.length) {
      setRevealedWordsCount((prev) => prev + 1);
      setLockedOutIds([]); // Unlock players for the next word!
      sfx.playWordReveal();
    } else {
      // All words revealed and nobody got it
      handleRoundNoWinner();
    }
  };

  // Player Buzz Action
  const handlePlayerBuzz = (player: Player) => {
    if (status !== 'ACTIVE' || lockedOutIds.includes(player.id)) return;

    stopAutoReveal();
    setStatus('BUZZED');

    const buzz: ActiveBuzz = {
      playerId: player.id,
      playerName: player.name,
      playerAvatar: player.avatar,
      timeRemaining: settings.guessTimerSeconds || 10,
    };
    setActiveBuzz(buzz);
    sfx.playBuzzer();

    // Start 10-second buzz timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveBuzz((prev) => {
        if (!prev) return null;
        if (prev.timeRemaining <= 1) {
          clearInterval(timerRef.current!);
          handleIncorrectGuess(prev.playerId, 'Time Expired');
          return null;
        }
        sfx.playTick();
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  };

  // Submit typed guess
  const handleSubmitGuess = (guessText: string) => {
    if (!activeBuzz || !currentQuote) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const evaluation = evaluateGuess(
      guessText,
      currentQuote.quote,
      revealedWordsCount,
      settings.fuzzyThreshold
    );

    if (evaluation.isMatch) {
      handleCorrectGuess(activeBuzz.playerId, guessText, hasImpressionBonus);
    } else {
      handleIncorrectGuess(activeBuzz.playerId, guessText);
    }
  };

  // Correct Guess
  const handleCorrectGuess = (playerId: string, guessText: string = '', withBonus = false) => {
    clearAllTimers();
    if (!currentQuote) return;

    const scoreData = calculateScore(revealedWordsCount, withBonus);

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          return {
            ...p,
            score: p.score + scoreData.totalPoints,
            roundWins: (p.roundWins || 0) + 1,
          };
        }
        return p;
      })
    );

    const winner = players.find((p) => p.id === playerId);
    const result: RoundResult = {
      quote: currentQuote,
      winnerId: playerId,
      winnerName: winner ? winner.name : 'Player',
      winnerAvatar: winner ? winner.avatar : '⚡',
      wordsRevealed: revealedWordsCount,
      basePoints: scoreData.basePoints,
      impressionBonus: withBonus,
      totalPointsAwarded: scoreData.totalPoints,
      guessText,
      skipped: false,
    };

    setLastRoundResult(result);
    setStatus('ROUND_RESULT');
    setActiveBuzz(null);
  };

  // Incorrect Guess
  const handleIncorrectGuess = (playerId: string, guessText: string = '') => {
    if (timerRef.current) clearInterval(timerRef.current);
    sfx.playWrong();

    setLockedOutIds((prev) => {
      const updated = [...prev, playerId];
      // If all players are locked out, reveal next word!
      if (updated.length >= players.length) {
        setTimeout(() => {
          handleRevealNextWord();
        }, 1200);
      } else if (settings.revealMode === 'auto') {
        startAutoReveal();
      }
      return updated;
    });

    setStatus('ACTIVE');
    setActiveBuzz(null);
  };

  // Toggle impression bonus
  const handleToggleBonus = () => {
    if (!lastRoundResult?.winnerId) {
      setHasImpressionBonus((prev) => !prev);
      return;
    }

    const winnerId = lastRoundResult.winnerId;
    const nextBonus = !lastRoundResult.impressionBonus;

    setLastRoundResult((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        impressionBonus: nextBonus,
        totalPointsAwarded: prev.totalPointsAwarded + (nextBonus ? 100 : -100),
      };
    });

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === winnerId) {
          return {
            ...p,
            score: p.score + (nextBonus ? 100 : -100),
          };
        }
        return p;
      })
    );
  };

  // Round ended with no winner / skipped
  const handleRoundNoWinner = (skipped = false) => {
    clearAllTimers();
    if (!currentQuote) return;

    const result: RoundResult = {
      quote: currentQuote,
      winnerId: null,
      winnerName: null,
      winnerAvatar: null,
      wordsRevealed: revealedWordsCount,
      basePoints: 0,
      impressionBonus: false,
      totalPointsAwarded: 0,
      skipped,
    };

    setLastRoundResult(result);
    setStatus('ROUND_RESULT');
    setActiveBuzz(null);
  };

  // Restart couch game
  const handleRestart = () => {
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        score: 0,
        roundWins: 0,
      }))
    );
    setUsedQuoteIds([]);
    startNewRound(1);
  };

  // Keyboard Hotkey Listener for Couch Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const code = e.code.toLowerCase();

      // Host Hotkeys:
      // Space or N: Reveal next word (if not assigned to player 1 buzz)
      // Check player buzz hotkeys first
      players.forEach((p) => {
        const bind = (p.keyBinding || '').toLowerCase();
        if (
          bind === key ||
          (bind === 'space' && code === 'space') ||
          (bind === 'enter' && code === 'enter')
        ) {
          e.preventDefault();
          handlePlayerBuzz(p);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [players, status, lockedOutIds]);

  const words = currentQuote ? currentQuote.quote.split(/\s+/) : [];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 flex flex-col space-y-6">
      {/* Active Buzz Countdown Bar */}
      {status === 'BUZZED' && activeBuzz && (
        <div className="animate-in fade-in duration-150">
          <CountdownTimer
            timeRemaining={activeBuzz.timeRemaining}
            totalTime={settings.guessTimerSeconds || 10}
            label={`${activeBuzz.playerName} is Answering!`}
          />
        </div>
      )}

      {/* Main Presentation Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <QuoteBoard
            quote={currentQuote}
            revealedWordsCount={revealedWordsCount}
            isHost={true}
          />

          {/* Host Control Deck */}
          <HostControls
            status={status}
            activeBuzz={activeBuzz}
            onRevealNextWord={handleRevealNextWord}
            onMarkCorrect={(bonus) => {
              if (activeBuzz) handleCorrectGuess(activeBuzz.playerId, 'Host Approved', bonus);
            }}
            onMarkIncorrect={() => {
              if (activeBuzz) handleIncorrectGuess(activeBuzz.playerId, 'Host Denied');
            }}
            onSkipRound={() => handleRoundNoWinner(true)}
            hasImpressionBonus={hasImpressionBonus}
            onToggleBonus={handleToggleBonus}
            totalWordsInQuote={words.length}
            revealedWordsCount={revealedWordsCount}
          />

          {/* Physical Couch Buzzers Grid */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-4 text-center">
              Tap Screen or Press Hotkey to Buzz In
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 justify-items-center">
              {players.map((player) => {
                const isBuzzed = activeBuzz?.playerId === player.id;
                const isLocked = lockedOutIds.includes(player.id);
                const anotherBuzzed = status === 'BUZZED' && !isBuzzed;

                return (
                  <BuzzerButton
                    key={player.id}
                    onBuzz={() => handlePlayerBuzz(player)}
                    playerName={player.name}
                    playerAvatar={player.avatar}
                    hotkeyLabel={player.keyBinding?.toUpperCase()}
                    isActiveBuzzer={isBuzzed}
                    isLockedOut={isLocked}
                    anotherPlayerBuzzed={anotherBuzzed}
                    activePlayerName={activeBuzz?.playerName}
                    size="compact"
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar: Leaderboard & Quick Game Info */}
        <div className="space-y-6">
          <Leaderboard
            players={players}
            activeBuzzerId={activeBuzz?.playerId}
            lockedOutIds={lockedOutIds}
          />

          <div className="glass-panel rounded-2xl p-4 border border-slate-800 text-xs text-slate-400 space-y-2">
            <span className="font-bold uppercase text-slate-300 block">Game Tips</span>
            <p>• Buzz early for 500 pts! Points decrease to 300, 150, and 50 as words reveal.</p>
            <p>• If you guess wrong, you are locked out for that specific word only!</p>
            <p>• Host can award +100 bonus pts for character impressions!</p>
          </div>
        </div>
      </div>

      {/* Typed Guess Modal */}
      <GuessInputModal
        isOpen={status === 'BUZZED' && Boolean(activeBuzz)}
        timeRemaining={activeBuzz?.timeRemaining || 10}
        playerName={activeBuzz?.playerName || 'Player'}
        onSubmit={handleSubmitGuess}
        onCancel={() => {
          if (activeBuzz) handleIncorrectGuess(activeBuzz.playerId, 'Passed');
        }}
      />

      {/* Round Result Modal */}
      <RoundResultModal
        isOpen={status === 'ROUND_RESULT'}
        result={lastRoundResult}
        isHost={true}
        onNextRound={() => startNewRound(currentRound + 1)}
        onToggleBonus={handleToggleBonus}
        isGameOver={currentRound >= settings.totalRounds}
      />

      {/* Final Game Over Podium */}
      {status === 'GAME_OVER' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl glass-panel-glow rounded-3xl p-8 border border-amber-500/50 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-pink-500 mx-auto flex items-center justify-center text-4xl shadow-xl shadow-pink-500/30 mb-4 animate-bounce">
              👑
            </div>

            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              GAME OVER
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-1 mb-6">
              Victory Celebration!
            </h2>

            {/* Podium */}
            <div className="space-y-3 mb-8">
              {[...players]
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
                onClick={handleRestart}
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
