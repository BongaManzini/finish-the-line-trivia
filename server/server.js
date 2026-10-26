import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GameManager } from './gameManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const gameManager = new GameManager(io);

// Function to find local network IPv4 address for party co-op on Wi-Fi
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/network-info', (req, res) => {
  const localIp = getLocalIpAddress();
  const port = process.env.PORT || 3001;
  res.json({
    localIp,
    port,
    joinUrl: `http://${localIp}:${port === 3001 ? 5173 : port}`
  });
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Create Room (Host)
  socket.on('create_room', (customSettings, callback) => {
    const room = gameManager.createRoom(socket.id, customSettings);
    socket.join(room.roomCode);
    console.log(`[Room Created] Code: ${room.roomCode} by Host: ${socket.id}`);
    if (typeof callback === 'function') {
      callback({ success: true, roomCode: room.roomCode });
    }
    gameManager.broadcastState(room.roomCode);
  });

  // Join Room (Player or reconnecting Host)
  socket.on('join_room', ({ roomCode, playerName, avatar, isHost, hasBuzzer }, callback) => {
    const room = gameManager.getRoom(roomCode);
    if (!room) {
      if (typeof callback === 'function') {
        callback({ success: false, error: 'Room not found. Check the code and try again.' });
      }
      return;
    }

    socket.join(room.roomCode);

    if (isHost && room.hostId === socket.id) {
      // Re-joining host
      if (typeof callback === 'function') {
        callback({ success: true, isHost: true });
      }
      gameManager.broadcastState(room.roomCode);
      return;
    }

    const player = gameManager.addPlayer(room.roomCode, socket.id, playerName, avatar, hasBuzzer);
    console.log(`[Player Joined] ${player.name} (${avatar}) [Buzzer: ${player.hasBuzzer !== false}] -> Room ${room.roomCode}`);

    if (typeof callback === 'function') {
      callback({ success: true, player, isHost: false });
    }
  });

  // Player toggles their own buzzer on/off (spectator mode)
  socket.on('toggle_player_buzzer', ({ roomCode, hasBuzzer }) => {
    gameManager.setPlayerBuzzer(roomCode, socket.id, hasBuzzer);
  });

  // Host toggles a player's buzzer capability
  socket.on('host_set_player_buzzer', ({ roomCode, playerId, hasBuzzer }) => {
    const room = gameManager.getRoom(roomCode);
    if (room && room.hostId === socket.id) {
      gameManager.setPlayerBuzzer(roomCode, playerId, hasBuzzer);
    }
  });

  // Fast Category Deck Selection (Heads-Up style)
  socket.on('set_active_categories', ({ roomCode, categories }) => {
    const room = gameManager.getRoom(roomCode);
    if (room && room.hostId === socket.id && Array.isArray(categories)) {
      gameManager.updateSettings(roomCode, { selectedGenres: categories });
    }
  });

  // Update Settings
  socket.on('update_settings', ({ roomCode, settings }) => {
    const room = gameManager.getRoom(roomCode);
    if (room && room.hostId === socket.id) {
      gameManager.updateSettings(roomCode, settings);
    }
  });

  // Start Game
  socket.on('start_game', ({ roomCode }) => {
    const room = gameManager.getRoom(roomCode);
    if (room && room.hostId === socket.id) {
      gameManager.startGame(roomCode);
    }
  });

  // Host manually reveals next word
  socket.on('reveal_next_word', ({ roomCode }) => {
    const room = gameManager.getRoom(roomCode);
    if (room && room.hostId === socket.id) {
      gameManager.revealNextWord(roomCode);
    }
  });

  // Player hits Buzzer
  socket.on('player_buzz', ({ roomCode }) => {
    gameManager.handleBuzz(roomCode, socket.id);
  });

  // Player submits typed guess
  socket.on('submit_guess', ({ roomCode, guessText }) => {
    gameManager.submitGuess(roomCode, socket.id, guessText);
  });

  // Host manually marks answer correct (for verbal guesses or override)
  socket.on('host_adjudicate_correct', ({ roomCode, hasBonus }) => {
    const room = gameManager.getRoom(roomCode);
    if (room && room.hostId === socket.id && room.activeBuzz) {
      gameManager.handleCorrectGuess(roomCode, room.activeBuzz.playerId, 'Host Approved', hasBonus);
    }
  });

  // Host manually marks answer incorrect
  socket.on('host_adjudicate_incorrect', ({ roomCode }) => {
    const room = gameManager.getRoom(roomCode);
    if (room && room.hostId === socket.id && room.activeBuzz) {
      gameManager.handleIncorrectGuess(roomCode, room.activeBuzz.playerId, 'Host Denied', 0);
    }
  });

  // Host toggles +100 Impression Bonus
  socket.on('toggle_bonus', ({ roomCode }) => {
    const room = gameManager.getRoom(roomCode);
    if (room && room.hostId === socket.id) {
      gameManager.toggleImpressionBonus(roomCode);
    }
  });

  // Advance to next round
  socket.on('start_next_round', ({ roomCode }) => {
    const room = gameManager.getRoom(roomCode);
    if (room && room.hostId === socket.id) {
      gameManager.startNextRound(roomCode);
    }
  });

  // Skip round
  socket.on('skip_round', ({ roomCode }) => {
    const room = gameManager.getRoom(roomCode);
    if (room && room.hostId === socket.id) {
      gameManager.finishRoundWithoutWinner(roomCode, true);
    }
  });

  // Restart Game
  socket.on('restart_game', ({ roomCode }) => {
    const room = gameManager.getRoom(roomCode);
    if (room && room.hostId === socket.id) {
      gameManager.restartGame(roomCode);
    }
  });

  // Add custom quote
  socket.on('add_custom_quote', ({ roomCode, quote }) => {
    gameManager.addCustomQuote(roomCode, quote);
  });

  socket.on('disconnect', () => {
    gameManager.removePlayer(socket.id);
  });
});

// Serve frontend in production mode
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for client-side routing (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.url.startsWith('/api') && !req.url.startsWith('/socket.io')) {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  console.log(`\n======================================================`);
  console.log(`🎯 "Finish The Line" Server running!`);
  console.log(`🌐 Local:   http://localhost:${PORT}`);
  console.log(`📱 Network: http://${localIp}:${PORT}`);
  console.log(`======================================================\n`);
});
