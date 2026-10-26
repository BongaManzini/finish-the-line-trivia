// Fuzzy matching and scoring logic for "Finish The Line"

/**
 * Normalizes text by lowering case, removing punctuation, and collapsing whitespace.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes standard Levenshtein distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Computes similarity ratio between 0 and 1.
 */
export function computeSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);

  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const maxLen = Math.max(s1.length, s2.length);
  const dist = levenshteinDistance(s1, s2);
  return (maxLen - dist) / maxLen;
}

/**
 * Evaluates whether player's guess matches the quote.
 * Players can guess either:
 * 1. The remaining words of the quote (e.g. if "May the" is revealed, guessing "force be with you")
 * 2. The entire quote ("May the force be with you")
 * 3. Or acceptable aliases/answers if provided
 */
export function evaluateGuess(
  guess: string,
  fullQuote: string,
  revealedWordsCount: number,
  threshold: number = 0.8
): { isMatch: boolean; similarity: number; matchedTarget: string } {
  const normGuess = normalizeText(guess);
  if (!normGuess) {
    return { isMatch: false, similarity: 0, matchedTarget: '' };
  }

  const words = fullQuote.split(/\s+/);
  const remainingQuote = words.slice(revealedWordsCount).join(' ');

  const fullSim = computeSimilarity(guess, fullQuote);
  const remainingSim = computeSimilarity(guess, remainingQuote);

  // Check substring containment: if remaining quote contains guess or vice versa with sufficient length
  const normRemaining = normalizeText(remainingQuote);
  const normFull = normalizeText(fullQuote);

  let bestSim = Math.max(fullSim, remainingSim);
  let bestTarget = fullSim >= remainingSim ? fullQuote : remainingQuote;

  // Exact substring match bonus if guess is at least 4 characters
  if (normGuess.length >= 4 && (normRemaining.includes(normGuess) || normGuess.includes(normRemaining))) {
    const minLen = Math.min(normGuess.length, normRemaining.length);
    const maxLen = Math.max(normGuess.length, normRemaining.length);
    const containmentSim = minLen / maxLen;
    if (containmentSim > bestSim) {
      bestSim = Math.max(bestSim, containmentSim);
    }
  }

  return {
    isMatch: bestSim >= threshold,
    similarity: Math.round(bestSim * 100) / 100,
    matchedTarget: bestTarget,
  };
}

/**
 * Calculates score based on specification:
 * - Solved on 1–2 words: 500 pts
 * - Solved on 3–4 words: 300 pts
 * - Solved on 5–6 words: 150 pts
 * - Solved on 7+ words: 50 pts
 * - Optional Host Bonus: +100 pts for impression / voice acting
 */
export function calculateScore(revealedWordsCount: number, hasImpressionBonus: boolean = false): {
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
} {
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
    totalPoints: basePoints + bonusPoints,
  };
}
