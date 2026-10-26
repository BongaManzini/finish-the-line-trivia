export type Genre =
  | 'anime'
  | 'cinema'
  | 'gaming'
  | 'tv_shows'
  | 'music_lyrics'
  | 'superheroes'
  | 'sci_fi_fantasy'
  | 'history_speeches'
  | 'literature'
  | 'memes'
  | 'pop_culture';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Quote {
  id: string;
  genre: Genre;
  quote: string;
  character: string;
  source: string;
  acceptableAliases?: string[];
  difficulty: Difficulty;
}

export type GameMode = 'local' | 'online';

export type GameStateStatus =
  | 'LOBBY'
  | 'ROUND_PREVIEW'
  | 'ACTIVE'
  | 'BUZZED'
  | 'ROUND_RESULT'
  | 'GAME_OVER';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isHost?: boolean;
  connected?: boolean;
  isLockedOutThisWord?: boolean;
  roundWins?: number;
  keyBinding?: string; // For Pass & Play couch co-op
  hasBuzzer?: boolean; // Whether this player has an active buzzer on their screen (true) or is in spectator/viewer mode (false)
}

export interface GameSettings {
  totalRounds: number;
  selectedGenres: Genre[];
  selectedDifficulties: Difficulty[];
  revealMode: 'manual' | 'auto';
  autoRevealIntervalSeconds: number; // e.g. 5 seconds
  guessTimerSeconds: number; // standard 10 seconds
  fuzzyThreshold: number; // 0.8 (80%)
  allowImpressionsBonus: boolean;
}

export interface ActiveBuzz {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  timeRemaining: number;
  guessText?: string;
  submittedAt?: number;
}

export interface RoundResult {
  quote: Quote;
  winnerId: string | null;
  winnerName: string | null;
  winnerAvatar: string | null;
  wordsRevealed: number;
  basePoints: number;
  impressionBonus: boolean;
  totalPointsAwarded: number;
  guessText?: string;
  skipped: boolean;
}

export interface RoomState {
  roomCode: string;
  status: GameStateStatus;
  currentRound: number;
  totalRounds: number;
  currentQuote: Quote | null;
  revealedWordsCount: number;
  totalWordsInQuote: number;
  revealedWords?: string;
  quoteMeta?: {
    id: string;
    genre: Genre;
    difficulty: Difficulty;
  } | null;
  players: Player[];
  activeBuzz: ActiveBuzz | null;
  lockedOutPlayerIds: string[];
  settings: GameSettings;
  lastRoundResult: RoundResult | null;
  hostId: string;
}

export interface GenreInfo {
  label: string;
  icon: string;
  color: string;
  gradient: string;
  badgeClass: string;
  description: string;
  tag: string;
}

export const GENRE_METADATA: Record<Genre, GenreInfo> = {
  anime: {
    label: 'Anime & Manga',
    icon: 'Sparkles',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    description: 'Iconic lines from Dragon Ball, Naruto, One Piece, AoT, JJK & Demon Slayer',
    tag: '⚡ Popular',
  },
  cinema: {
    label: 'Movies & Cinema',
    icon: 'Film',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Legendary movie quotes from Hollywood blockbusters, classics & thrillers',
    tag: '🎬 Classic',
  },
  gaming: {
    label: 'Video Games',
    icon: 'Gamepad2',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-cyan-600',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Memorable quotes from Skyrim, Portal, Zelda, Halo, Dark Souls & RPGs',
    tag: '🎮 Gamer',
  },
  tv_shows: {
    label: 'TV & Sitcoms',
    icon: 'Tv',
    color: '#a855f7',
    gradient: 'from-purple-500 to-indigo-600',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Bingeworthy lines from The Office, Friends, Breaking Bad, GoT & B99',
    tag: '📺 Binge',
  },
  music_lyrics: {
    label: 'Hip-Hop & Lyrics',
    icon: 'Music',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Unforgettable bars, iconic opening hooks, and legendary song lyrics',
    tag: '🎵 Party',
  },
  superheroes: {
    label: 'Superheroes & Comics',
    icon: 'Shield',
    color: '#ef4444',
    gradient: 'from-red-500 to-rose-700',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
    description: 'Epic battle cries and one-liners from Marvel & DC superheroes and villains',
    tag: '🦸 Heroic',
  },
  sci_fi_fantasy: {
    label: 'Sci-Fi & Fantasy',
    icon: 'Rocket',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-600',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    description: 'Mind-bending lines from Dune, Star Trek, Doctor Who, Witcher & Matrix',
    tag: '🚀 Cosmic',
  },
  history_speeches: {
    label: 'History & Speeches',
    icon: 'Mic',
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-700',
    badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    description: 'Historic addresses and famous sayings that changed the world',
    tag: '🏛️ Iconic',
  },
  literature: {
    label: 'Classic Literature',
    icon: 'BookOpen',
    color: '#14b8a6',
    gradient: 'from-teal-500 to-emerald-700',
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    description: 'Timeless opening sentences from Shakespeare, Orwell, Austen & classic novels',
    tag: '📖 Literary',
  },
  memes: {
    label: 'Memes & Viral',
    icon: 'Smile',
    color: '#f97316',
    gradient: 'from-orange-500 to-amber-600',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    description: 'Internet culture, viral sensations, TikTok trends, and legendary memes',
    tag: '😂 Viral',
  },
  pop_culture: {
    label: 'Pop Culture Mix',
    icon: 'Flame',
    color: '#d946ef',
    gradient: 'from-fuchsia-500 to-pink-600',
    badgeClass: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    description: 'A wild variety mix of the most recognized quotes from everywhere',
    tag: '🌟 Ultimate',
  },
};

export const AVATARS = [
  '⚡', '🔥', '🌟', '👑', '🎭', '🚀',
  '🐉', '🎮', '🍿', '🦊', '🐱', '🦄',
  '🎸', '👾', '🎯', '💎', '🍕', '🏆'
];
