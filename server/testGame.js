import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluateGuess, calculateScore, GameManager } from './gameManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Starting "Finish The Line" Test Suite...\n');

// 1. Test Scoring Logic
console.log('--- Test 1: Scoring Logic ---');
const s1 = calculateScore(1, false);
assert.strictEqual(s1.basePoints, 500, 'Word 1 should yield 500 base points');
assert.strictEqual(s1.totalPoints, 500, 'Word 1 without bonus = 500');

const s2 = calculateScore(2, true);
assert.strictEqual(s2.basePoints, 500, 'Word 2 should yield 500 base points');
assert.strictEqual(s2.bonusPoints, 100, 'Impression bonus should be 100 points');
assert.strictEqual(s2.totalPoints, 600, 'Word 2 + bonus = 600 points');

const s3 = calculateScore(3, false);
assert.strictEqual(s3.basePoints, 300, 'Word 3 should yield 300 base points');

const s4 = calculateScore(4, false);
assert.strictEqual(s4.basePoints, 300, 'Word 4 should yield 300 base points');

const s5 = calculateScore(5, false);
assert.strictEqual(s5.basePoints, 150, 'Word 5 should yield 150 base points');

const s6 = calculateScore(6, false);
assert.strictEqual(s6.basePoints, 150, 'Word 6 should yield 150 base points');

const s7 = calculateScore(7, false);
assert.strictEqual(s7.basePoints, 50, 'Word 7 should yield 50 base points');

const s12 = calculateScore(12, true);
assert.strictEqual(s12.basePoints, 50, 'Word 12 should yield 50 base points');
assert.strictEqual(s12.totalPoints, 150, 'Word 12 + bonus = 150');
console.log('✅ Scoring Logic Passed!\n');

// 2. Test Fuzzy Match Logic (Levenshtein >= 80% threshold)
console.log('--- Test 2: Fuzzy Matching ---');
const godfatherQuote = "I'm going to make him an offer he can't refuse.";

// Test exact remaining words guess
const match1 = evaluateGuess("make him an offer he cant refuse", godfatherQuote, 3, 0.8);
assert.strictEqual(match1.isMatch, true, 'Exact remaining words should match');

// Test full quote guess with minor typos / punctuation difference
const match2 = evaluateGuess("Im going to make him an offer he cannot refuse", godfatherQuote, 1, 0.8);
assert.strictEqual(match2.isMatch, true, 'Minor typo/punctuation variation should match with >= 80% similarity');

// Test completely wrong guess
const match3 = evaluateGuess("Luke I am your father", godfatherQuote, 2, 0.8);
assert.strictEqual(match3.isMatch, false, 'Irrelevant guess should NOT match');

// Test another iconic quote: "May the Force be with you"
const starWarsQuote = "May the Force be with you.";
const match4 = evaluateGuess("Force be with you", starWarsQuote, 2, 0.8);
assert.strictEqual(match4.isMatch, true, 'Remaining words of Star Wars quote should match');
console.log('✅ Fuzzy Matching Passed!\n');

// 3. Test Quotes Database Integrity
console.log('--- Test 3: Quotes Database Schema Validation ---');
const quotesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'quotes.json'), 'utf8'));
assert.ok(Array.isArray(quotesData) && quotesData.length >= 20, 'Quotes database should contain quotes');

const allowedGenres = [
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
];
const allowedDiffs = ['easy', 'medium', 'hard'];

quotesData.forEach((q, idx) => {
  assert.ok(q.id, `Quote #${idx} must have an id`);
  assert.ok(allowedGenres.includes(q.genre), `Quote ${q.id} has valid genre: ${q.genre}`);
  assert.ok(allowedDiffs.includes(q.difficulty), `Quote ${q.id} has valid difficulty: ${q.difficulty}`);
  assert.ok(typeof q.quote === 'string' && q.quote.trim().length > 0, `Quote ${q.id} has non-empty quote text`);
  assert.ok(typeof q.character === 'string' && q.character.trim().length > 0, `Quote ${q.id} has character`);
  assert.ok(typeof q.source === 'string' && q.source.trim().length > 0, `Quote ${q.id} has source`);
});
console.log(`✅ All ${quotesData.length} quotes across ${allowedGenres.length} categories validated successfully!\n`);

// 4. Test GameManager State Transitions
console.log('--- Test 4: GameManager State Machine & Buzzer Modes ---');
const mockIo = {
  to: () => ({ emit: () => {} }),
};

const gm = new GameManager(mockIo);
const room = gm.createRoom('host-socket-123');
assert.strictEqual(room.status, 'LOBBY', 'Initial room status should be LOBBY');
assert.strictEqual(room.roomCode.length, 4, 'Room code should be 4 characters');

const p1 = gm.addPlayer(room.roomCode, 'player-socket-1', 'Alice', '⚡', true);
assert.strictEqual(p1.name, 'Alice');
assert.strictEqual(p1.hasBuzzer, true);
assert.strictEqual(room.players.length, 1);

const p2 = gm.addPlayer(room.roomCode, 'player-socket-2', 'Bob', '🔥', true);
assert.strictEqual(p2.name, 'Bob');
assert.strictEqual(room.players.length, 2);

// p3 joins in Spectator/Viewer mode (hasBuzzer = false)
const p3 = gm.addPlayer(room.roomCode, 'player-socket-3', 'Charlie', '🍿', false);
assert.strictEqual(p3.name, 'Charlie');
assert.strictEqual(p3.hasBuzzer, false, 'Charlie should have buzzer disabled');

// Start Game
gm.startGame(room.roomCode);
assert.strictEqual(room.status, 'ACTIVE', 'Status after startGame should be ACTIVE');
assert.strictEqual(room.currentRound, 1, 'Current round should be 1');
assert.strictEqual(room.revealedWordsCount, 1, 'Initially 1 word revealed');

// Word Reveal
gm.revealNextWord(room.roomCode);
assert.strictEqual(room.revealedWordsCount, 2, 'Next word increments revealed words count');

// Test that Charlie (Spectator / hasBuzzer = false) CANNOT buzz
const charlieBuzzed = gm.handleBuzz(room.roomCode, 'player-socket-3');
assert.strictEqual(charlieBuzzed, false, 'Charlie (hasBuzzer = false) should NOT be able to buzz');

// Test that Alice (hasBuzzer = true) CAN buzz
const buzzed = gm.handleBuzz(room.roomCode, 'player-socket-1');
assert.strictEqual(buzzed, true, 'Alice should successfully buzz');
assert.strictEqual(room.status, 'BUZZED', 'Room status should be BUZZED');
assert.strictEqual(room.activeBuzz.playerId, 'player-socket-1');

// While Alice is buzzed, Bob should NOT be able to buzz
const bobBuzzed = gm.handleBuzz(room.roomCode, 'player-socket-2');
assert.strictEqual(bobBuzzed, false, 'Bob cannot buzz while Alice is active');

// Host adjudicates correct with impression bonus
gm.handleCorrectGuess(room.roomCode, 'player-socket-1', 'Host Approved', true);
assert.strictEqual(room.status, 'ROUND_RESULT', 'Room status after correct guess should be ROUND_RESULT');
assert.strictEqual(room.players[0].score, 600, 'Alice score should be 500 (word 2) + 100 (bonus) = 600');
assert.strictEqual(room.players[0].roundWins, 1, 'Alice round wins should be 1');

// Test toggling Charlie to hasBuzzer = true
gm.setPlayerBuzzer(room.roomCode, 'player-socket-3', true);
assert.strictEqual(room.players[2].hasBuzzer, true, 'Charlie buzzer should now be enabled');

console.log('✅ GameManager State Transitions & Buzzer Modes Passed!\n');
console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 🚀');
