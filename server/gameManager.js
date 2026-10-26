import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read quotes database
const quotesPath = path.join(__dirname, 'quotes.json');
let quotesDatabase = [];
try {
  const data = fs.readFileSync(quotesPath, 'utf8');
  quotesDatabase = JSON.parse(data);
} catch (e) {
  console.error('Failed to load quotes.json:', e);
}

// Levenshtein & Fuzzy matching helpers
function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function computeSimilarity(str1, str2) {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  const maxLen = Math.max(s1.length, s2.length);
  const dist = levenshteinDistance(s1, s2);
  return (maxLen - dist) / maxLen;
}

export function evaluateGuess(guess, fullQuote, revealedWordsCount, threshold = 0.8) {
  const normGuess = normalizeText(guess);
  if (!normGuess) return { isMatch: false, similarity: 0 };

  const words = fullQuote.split(/\s+/);
  const remainingQuote = words.slice(revealedWordsCount).join(' ');

  const fullSim = computeSimilarity(guess, fullQuote);
  const remainingSim = computeSimilarity(guess, remainingQuote);

  const normRemaining = normalizeText(remainingQuote);
  let bestSim = Math.max(fullSim, remainingSim);

  if (normGuess.length >= 4 && (normRemaining.includes(normGuess) || normGuess.includes(normRemaining))) {
    const minLen = Math.min(normGuess.length, normRemaining.length);
    const maxLen = Math.max(normGuess.length, normRemaining.length);
    bestSim = Math.max(bestSim, minLen / maxLen);
  }

  return {
    isMatch: bestSim >= threshold,
    similarity: Math.round(bestSim * 100) / 100
  };
}

export function calculateScore(revealedWordsCount, hasImpressionBonus = false) {
  let basePoints = 50;
  if (revealedWordsCount <= 2) {
    basePoints = 500;
  } else if (revealedWordsCount <= 4) {
    basePoints = 300;
  } else if (revealedWordsCount <= 6) {
    basePoints = 150;
  } else {
    basePoints = 50;
  }
  const bonusPoints = hasImpressionBonus ? 100 : 0;
  return {
    basePoints,
    bonusPoints,
    totalPoints: basePoints + bonusPoints
  };
}

export class GameManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomCode -> roomState
    this.timerIntervals = new Map(); // roomCode -> setInterval
    this.autoRevealIntervals = new Map();
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(hostSocketId, customSettings = {}) {
    const roomCode = this.generateRoomCode();
    const defaultSettings = {
      totalRounds: 5,
      selectedGenres: [
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
        'pop_culture'
      ],
      selectedDifficulties: ['easy', 'medium'],
      revealMode: 'manual',
      autoRevealIntervalSeconds: 5,
      guessTimerSeconds: 10,
      fuzzyThreshold: 0.8,
      allowImpressionsBonus: true,
      ...customSettings
    };

    const room = {
      roomCode,
      status: 'LOBBY',
      hostId: hostSocketId,
      currentRound: 0,
      totalRounds: defaultSettings.totalRounds,
      currentQuote: null,
      revealedWordsCount: 1,
      totalWordsInQuote: 0,
      players: [],
      activeBuzz: null,
      lockedOutPlayerIds: [],
      settings: defaultSettings,
      lastRoundResult: null,
      usedQuoteIds: [],
      customQuotes: []
    };

    this.rooms.set(roomCode, room);
    return room;
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode?.toUpperCase());
  }

  addPlayer(roomCode, socketId, playerName, avatar, hasBuzzer = true) {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    // Check if player already exists by socketId or name
    let player = room.players.find(p => p.id === socketId || (p.name.toLowerCase() === playerName.toLowerCase() && !p.connected));
    if (player) {
      player.id = socketId;
      player.name = playerName;
      player.avatar = avatar || player.avatar;
      player.connected = true;
      if (hasBuzzer !== undefined) player.hasBuzzer = hasBuzzer;
    } else {
      player = {
        id: socketId,
        name: playerName.trim() || `Player ${room.players.length + 1}`,
        avatar: avatar || '⚡',
        score: 0,
        connected: true,
        roundWins: 0,
        hasBuzzer: hasBuzzer !== false
      };
      room.players.push(player);
    }

    this.broadcastState(roomCode);
    return player;
  }

  setPlayerBuzzer(roomCode, socketId, hasBuzzer) {
    const room = this.getRoom(roomCode);
    if (!room) return;
    const player = room.players.find(p => p.id === socketId);
    if (player) {
      player.hasBuzzer = Boolean(hasBuzzer);
      this.broadcastState(roomCode);
    }
  }

  removePlayer(socketId) {
    for (const [roomCode, room] of this.rooms.entries()) {
      if (room.hostId === socketId) {
        // Host disconnected
        // If players exist, assign new host or notify
      }
      const player = room.players.find(p => p.id === socketId);
      if (player) {
        player.connected = false;
        // If player was actively buzzing, clear buzz
        if (room.activeBuzz?.playerId === socketId) {
          this.cancelBuzz(roomCode, 'Player disconnected');
        }
        this.broadcastState(roomCode);
      }
    }
  }

  updateSettings(roomCode, newSettings) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'LOBBY') return;
    room.settings = { ...room.settings, ...newSettings };
    room.totalRounds = room.settings.totalRounds;
    this.broadcastState(roomCode);
  }

  addCustomQuote(roomCode, quote) {
    const room = this.getRoom(roomCode);
    if (!room) return;
    const newQuote = {
      ...quote,
      id: `custom-${Date.now()}`
    };
    room.customQuotes.push(newQuote);
    this.broadcastState(roomCode);
  }

  startGame(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    room.currentRound = 0;
    room.players.forEach(p => {
      p.score = 0;
      p.roundWins = 0;
    });
    room.usedQuoteIds = [];
    this.startNextRound(roomCode);
  }

  startNextRound(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    this.clearAllTimers(roomCode);

    if (room.currentRound >= room.totalRounds) {
      room.status = 'GAME_OVER';
      this.broadcastState(roomCode);
      this.io.to(roomCode).emit('game_over', { players: room.players });
      return;
    }

    room.currentRound += 1;
    room.status = 'ACTIVE';
    room.activeBuzz = null;
    room.lockedOutPlayerIds = [];

    // Select random quote
    const pool = [...quotesDatabase, ...room.customQuotes].filter(q => {
      const genreMatch = room.settings.selectedGenres.length === 0 || room.settings.selectedGenres.includes(q.genre);
      const diffMatch = room.settings.selectedDifficulties.length === 0 || room.settings.selectedDifficulties.includes(q.difficulty);
      const notUsed = !room.usedQuoteIds.includes(q.id);
      return genreMatch && diffMatch && notUsed;
    });

    let selectedQuote = null;
    if (pool.length > 0) {
      selectedQuote = pool[Math.floor(Math.random() * pool.length)];
    } else {
      // Fallback: reset used
      const fallback = [...quotesDatabase, ...room.customQuotes].filter(q => {
        return (room.settings.selectedGenres.length === 0 || room.settings.selectedGenres.includes(q.genre)) &&
               (room.settings.selectedDifficulties.length === 0 || room.settings.selectedDifficulties.includes(q.difficulty));
      });
      selectedQuote = fallback[Math.floor(Math.random() * fallback.length)] || quotesDatabase[0];
    }

    room.currentQuote = selectedQuote;
    room.usedQuoteIds.push(selectedQuote.id);

    const words = selectedQuote.quote.split(/\s+/);
    room.totalWordsInQuote = words.length;
    room.revealedWordsCount = 1; // Start with 1 word revealed

    this.broadcastState(roomCode);
    this.io.to(roomCode).emit('round_started', {
      round: room.currentRound,
      totalRounds: room.totalRounds,
      genre: selectedQuote.genre,
      difficulty: selectedQuote.difficulty
    });

    if (room.settings.revealMode === 'auto') {
      this.startAutoReveal(roomCode);
    }
  }

  revealNextWord(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'ACTIVE') return;

    if (room.revealedWordsCount < room.totalWordsInQuote) {
      room.revealedWordsCount += 1;
      // When next word is revealed, clear the lockout list for the new word phase!
      room.lockedOutPlayerIds = [];
      this.broadcastState(roomCode);
      this.io.to(roomCode).emit('word_revealed', {
        revealedWordsCount: room.revealedWordsCount
      });
    } else {
      // All words revealed and nobody got it right!
      this.finishRoundWithoutWinner(roomCode);
    }
  }

  startAutoReveal(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room || room.settings.revealMode !== 'auto') return;

    this.stopAutoReveal(roomCode);
    const intervalMs = (room.settings.autoRevealIntervalSeconds || 5) * 1000;

    const timer = setInterval(() => {
      const currentRoom = this.getRoom(roomCode);
      if (!currentRoom || currentRoom.status !== 'ACTIVE') return;
      this.revealNextWord(roomCode);
    }, intervalMs);

    this.autoRevealIntervals.set(roomCode, timer);
  }

  stopAutoReveal(roomCode) {
    if (this.autoRevealIntervals.has(roomCode)) {
      clearInterval(this.autoRevealIntervals.get(roomCode));
      this.autoRevealIntervals.delete(roomCode);
    }
  }

  handleBuzz(roomCode, socketId) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'ACTIVE') return false;

    // Check if player is locked out
    if (room.lockedOutPlayerIds.includes(socketId)) return false;

    const player = room.players.find(p => p.id === socketId);
    if (!player) return false;

    // Disallow buzzer if player is in spectator mode / hasBuzzer is false
    if (player.hasBuzzer === false) return false;

    this.stopAutoReveal(roomCode);

    room.status = 'BUZZED';
    room.activeBuzz = {
      playerId: socketId,
      playerName: player.name,
      playerAvatar: player.avatar,
      timeRemaining: room.settings.guessTimerSeconds || 10,
      guessText: ''
    };

    this.broadcastState(roomCode);
    this.io.to(roomCode).emit('player_buzzed', room.activeBuzz);

    // Start 10s countdown on server
    this.startBuzzTimer(roomCode);
    return true;
  }

  startBuzzTimer(roomCode) {
    this.clearBuzzTimer(roomCode);

    const timer = setInterval(() => {
      const room = this.getRoom(roomCode);
      if (!room || room.status !== 'BUZZED' || !room.activeBuzz) {
        this.clearBuzzTimer(roomCode);
        return;
      }

      room.activeBuzz.timeRemaining -= 1;
      this.io.to(roomCode).emit('buzz_timer_tick', { timeRemaining: room.activeBuzz.timeRemaining });

      if (room.activeBuzz.timeRemaining <= 0) {
        this.clearBuzzTimer(roomCode);
        this.handleIncorrectGuess(roomCode, room.activeBuzz.playerId, 'Time Expired');
      }
    }, 1000);

    this.timerIntervals.set(roomCode, timer);
  }

  clearBuzzTimer(roomCode) {
    if (this.timerIntervals.has(roomCode)) {
      clearInterval(this.timerIntervals.get(roomCode));
      this.timerIntervals.delete(roomCode);
    }
  }

  cancelBuzz(roomCode, reason = '') {
    this.clearBuzzTimer(roomCode);
    const room = this.getRoom(roomCode);
    if (!room) return;
    room.status = 'ACTIVE';
    room.activeBuzz = null;
    this.broadcastState(roomCode);
    if (room.settings.revealMode === 'auto') {
      this.startAutoReveal(roomCode);
    }
  }

  submitGuess(roomCode, socketId, guessText) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'BUZZED' || room.activeBuzz?.playerId !== socketId) {
      return;
    }

    this.clearBuzzTimer(roomCode);
    room.activeBuzz.guessText = guessText;

    const evaluation = evaluateGuess(
      guessText,
      room.currentQuote.quote,
      room.revealedWordsCount,
      room.settings.fuzzyThreshold
    );

    if (evaluation.isMatch) {
      this.handleCorrectGuess(roomCode, socketId, guessText);
    } else {
      this.handleIncorrectGuess(roomCode, socketId, guessText, evaluation.similarity);
    }
  }

  handleCorrectGuess(roomCode, socketId, guessText, forceImpressionBonus = false) {
    this.clearAllTimers(roomCode);
    const room = this.getRoom(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socketId);
    const scoreResult = calculateScore(room.revealedWordsCount, forceImpressionBonus);

    if (player) {
      player.score += scoreResult.totalPoints;
      player.roundWins = (player.roundWins || 0) + 1;
    }

    const roundResult = {
      quote: room.currentQuote,
      winnerId: socketId,
      winnerName: player ? player.name : 'Unknown',
      winnerAvatar: player ? player.avatar : '⚡',
      wordsRevealed: room.revealedWordsCount,
      basePoints: scoreResult.basePoints,
      impressionBonus: forceImpressionBonus,
      totalPointsAwarded: scoreResult.totalPoints,
      guessText,
      skipped: false
    };

    room.lastRoundResult = roundResult;
    room.status = 'ROUND_RESULT';
    room.activeBuzz = null;

    this.broadcastState(roomCode);
    this.io.to(roomCode).emit('round_won', roundResult);
  }

  handleIncorrectGuess(roomCode, socketId, guessText, similarity = 0) {
    this.clearBuzzTimer(roomCode);
    const room = this.getRoom(roomCode);
    if (!room) return;

    // Lock player out for this word reveal
    if (!room.lockedOutPlayerIds.includes(socketId)) {
      room.lockedOutPlayerIds.push(socketId);
    }

    const failedPlayer = room.players.find(p => p.id === socketId);
    room.status = 'ACTIVE';
    room.activeBuzz = null;

    this.broadcastState(roomCode);
    this.io.to(roomCode).emit('guess_failed', {
      playerId: socketId,
      playerName: failedPlayer ? failedPlayer.name : 'Player',
      guessText,
      similarity
    });

    // If all players are locked out, automatically reveal next word
    const activePlayers = room.players.filter(p => p.connected);
    if (room.lockedOutPlayerIds.length >= activePlayers.length && activePlayers.length > 0) {
      setTimeout(() => {
        this.revealNextWord(roomCode);
      }, 1000);
    } else if (room.settings.revealMode === 'auto') {
      this.startAutoReveal(roomCode);
    }
  }

  toggleImpressionBonus(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room || !room.lastRoundResult || !room.lastRoundResult.winnerId) return;

    const result = room.lastRoundResult;
    const winner = room.players.find(p => p.id === result.winnerId);
    if (!winner) return;

    result.impressionBonus = !result.impressionBonus;
    if (result.impressionBonus) {
      result.totalPointsAwarded += 100;
      winner.score += 100;
    } else {
      result.totalPointsAwarded -= 100;
      winner.score -= 100;
    }

    this.broadcastState(roomCode);
    this.io.to(roomCode).emit('bonus_toggled', {
      impressionBonus: result.impressionBonus,
      totalPointsAwarded: result.totalPointsAwarded,
      newScore: winner.score
    });
  }

  finishRoundWithoutWinner(roomCode, skipped = false) {
    this.clearAllTimers(roomCode);
    const room = this.getRoom(roomCode);
    if (!room) return;

    const roundResult = {
      quote: room.currentQuote,
      winnerId: null,
      winnerName: null,
      winnerAvatar: null,
      wordsRevealed: room.revealedWordsCount,
      basePoints: 0,
      impressionBonus: false,
      totalPointsAwarded: 0,
      skipped
    };

    room.lastRoundResult = roundResult;
    room.status = 'ROUND_RESULT';
    room.activeBuzz = null;

    this.broadcastState(roomCode);
    this.io.to(roomCode).emit('round_ended_no_winner', roundResult);
  }

  restartGame(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return;
    this.clearAllTimers(roomCode);
    room.status = 'LOBBY';
    room.currentRound = 0;
    room.currentQuote = null;
    room.revealedWordsCount = 1;
    room.activeBuzz = null;
    room.lockedOutPlayerIds = [];
    room.lastRoundResult = null;
    room.usedQuoteIds = [];
    room.players.forEach(p => {
      p.score = 0;
      p.roundWins = 0;
    });
    this.broadcastState(roomCode);
  }

  clearAllTimers(roomCode) {
    this.clearBuzzTimer(roomCode);
    this.stopAutoReveal(roomCode);
  }

  broadcastState(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    // Sanitize state for guessing players: do NOT leak currentQuote.quote to guessing players!
    // Host gets full quote; players only get revealed words
    const words = room.currentQuote ? room.currentQuote.quote.split(/\s+/) : [];
    const revealedWords = words.slice(0, room.revealedWordsCount).join(' ');

    const publicState = {
      roomCode: room.roomCode,
      status: room.status,
      currentRound: room.currentRound,
      totalRounds: room.totalRounds,
      revealedWordsCount: room.revealedWordsCount,
      totalWordsInQuote: room.totalWordsInQuote,
      revealedWords,
      quoteMeta: room.currentQuote ? {
        id: room.currentQuote.id,
        genre: room.currentQuote.genre,
        difficulty: room.currentQuote.difficulty
      } : null,
      players: room.players,
      activeBuzz: room.activeBuzz,
      lockedOutPlayerIds: room.lockedOutPlayerIds,
      settings: room.settings,
      lastRoundResult: room.lastRoundResult,
      hostId: room.hostId
    };

    const hostState = {
      ...publicState,
      currentQuote: room.currentQuote // Host can see the answer to adjudicate!
    };

    // Emit hostState to host
    this.io.to(room.hostId).emit('room_state', hostState);

    // Emit publicState to all other players in room
    room.players.forEach(p => {
      if (p.id !== room.hostId) {
        this.io.to(p.id).emit('room_state', publicState);
      }
    });
  }
}
