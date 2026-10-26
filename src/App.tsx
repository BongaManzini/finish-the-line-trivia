import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Navbar } from './components/Navbar';
import { SettingsModal } from './components/SettingsModal';
import { HomeView } from './views/HomeView';
import { LocalGameView } from './views/LocalGameView';
import { OnlineHostView } from './views/OnlineHostView';
import { OnlinePlayerView } from './views/OnlinePlayerView';
import { GameSettings, RoomState, Player, Genre } from './types';

const ALL_DEFAULT_GENRES: Genre[] = [
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

export const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'local' | 'online_host' | 'online_player'>('home');
  const [localPlayerCount, setLocalPlayerCount] = useState<number>(3);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomCode, setRoomCode] = useState<string>('');
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  const [settings, setSettings] = useState<GameSettings>({
    totalRounds: 5,
    selectedGenres: ALL_DEFAULT_GENRES,
    selectedDifficulties: ['easy', 'medium'],
    revealMode: 'manual',
    autoRevealIntervalSeconds: 5,
    guessTimerSeconds: 10,
    fuzzyThreshold: 0.8,
    allowImpressionsBonus: true,
  });

  // Initialize Socket.io connection
  useEffect(() => {
    const newSocket = io(window.location.origin, {
      reconnectionAttempts: 10,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to game server. Socket ID:', newSocket.id);
    });

    newSocket.on('room_state', (state: RoomState) => {
      setRoomState(state);
      if (state.settings) {
        setSettings(state.settings);
      }
    });

    setSocket(newSocket);

    // Check if URL has ?room=XXXX query parameter for quick join
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get('room');
    if (urlRoom) {
      setRoomCode(urlRoom.toUpperCase());
    }

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Handler: Start Local Couch Game
  const handleStartLocalGame = (playerCount: number, selectedGenres?: Genre[]) => {
    setLocalPlayerCount(playerCount);
    if (selectedGenres && selectedGenres.length > 0) {
      setSettings((prev) => ({ ...prev, selectedGenres }));
    }
    setView('local');
  };

  // Handler: Host Online Room
  const handleCreateOnlineRoom = (selectedGenres?: Genre[]) => {
    if (!socket) return;

    const roomSettings = {
      ...settings,
      selectedGenres: selectedGenres && selectedGenres.length > 0 ? selectedGenres : settings.selectedGenres,
    };

    setSettings(roomSettings);

    socket.emit('create_room', roomSettings, (response: { success: boolean; roomCode?: string }) => {
      if (response.success && response.roomCode) {
        setRoomCode(response.roomCode);
        setView('online_host');
      }
    });
  };

  // Handler: Join Online Room (as Player controller or viewer)
  const handleJoinOnlineRoom = (code: string, name: string, avatar: string, hasBuzzer: boolean = true) => {
    if (!socket) return;

    socket.emit(
      'join_room',
      { roomCode: code, playerName: name, avatar, isHost: false, hasBuzzer },
      (response: { success: boolean; player?: Player; error?: string }) => {
        if (response.success && response.player) {
          setRoomCode(code);
          setCurrentPlayer(response.player);
          setView('online_player');
        } else {
          alert(response.error || 'Failed to join room. Please check code.');
        }
      }
    );
  };

  // Handler: Save Settings
  const handleSaveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    if (socket && roomCode && view === 'online_host') {
      socket.emit('update_settings', { roomCode, settings: newSettings });
    }
  };

  // Handler: Update selected genres
  const handleUpdateGenres = (genres: Genre[]) => {
    setSettings((prev) => ({ ...prev, selectedGenres: genres }));
    if (socket && roomCode && view === 'online_host') {
      socket.emit('set_active_categories', { roomCode, categories: genres });
    }
  };

  // Handler: Return to Home
  const handleGoHome = () => {
    setView('home');
    setRoomCode('');
    setRoomState(null);
    setCurrentPlayer(null);
  };

  const getRoundInfo = () => {
    if (view === 'online_host' || view === 'online_player') {
      if (roomState && roomState.currentRound > 0) {
        return { current: roomState.currentRound, total: roomState.totalRounds };
      }
    }
    return undefined;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <Navbar
        roomCode={view !== 'home' && roomCode ? roomCode : undefined}
        roundInfo={getRoundInfo()}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onGoHome={view !== 'home' ? handleGoHome : undefined}
      />

      <main className="flex-1 flex flex-col">
        {view === 'home' && (
          <HomeView
            onStartLocalGame={handleStartLocalGame}
            onCreateOnlineRoom={handleCreateOnlineRoom}
            onJoinOnlineRoom={handleJoinOnlineRoom}
            currentGenres={settings.selectedGenres}
            onUpdateGenres={handleUpdateGenres}
          />
        )}

        {view === 'local' && (
          <LocalGameView
            playerCount={localPlayerCount}
            settings={settings}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onGoHome={handleGoHome}
          />
        )}

        {view === 'online_host' && (
          <OnlineHostView
            socket={socket}
            roomCode={roomCode}
            roomState={roomState}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onGoHome={handleGoHome}
          />
        )}

        {view === 'online_player' && (
          <OnlinePlayerView
            socket={socket}
            roomCode={roomCode}
            roomState={roomState}
            player={currentPlayer}
            onGoHome={handleGoHome}
          />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        settings={settings}
        onSave={handleSaveSettings}
        onClose={() => setIsSettingsModalOpen(false)}
        isHost={view !== 'online_player'}
      />
    </div>
  );
};

export default App;
