import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  GameLogEntry,
  GameState,
  PlayerPrivateState,
  ServerToClientEvents,
} from './types';
import { Lobby } from './components/Lobby';
import { GameHeader } from './components/GameHeader';
import { OpponentHand } from './components/OpponentHand';
import { BattleZone } from './components/BattleZone';
import { PlayerHand } from './components/PlayerHand';
import { CombatLog } from './components/CombatLog';
import { GameOverModal } from './components/GameOverModal';
import { soundManager } from './utils/sound';

export const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myPlayer, setMyPlayer] = useState<PlayerPrivateState | null>(null);
  const [logs, setLogs] = useState<GameLogEntry[]>([]);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('war_player_name') || 'Commander');
  const [waitingRoomId, setWaitingRoomId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const prevPhaseRef = useRef<string | null>(null);

  // Initialize Socket.io
  useEffect(() => {
    // In dev, Vite proxies /socket.io to localhost:3001, or fallback direct port.
    // In production, use VITE_SERVER_URL if provided, else current origin.
    const socketUrl =
      import.meta.env.VITE_SERVER_URL ||
      (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/');
    const s: Socket<ServerToClientEvents, ClientToServerEvents> = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      console.log('Connected to server via WebSocket');
    });

    s.on('gameUpdated', (state: GameState) => {
      setGameState(state);
      if (state.phase !== 'LOBBY') {
        setWaitingRoomId(null);
      }
    });

    s.on('privateStateUpdated', (privateState: PlayerPrivateState) => {
      setMyPlayer(privateState);
    });

    s.on('newLog', (entry: GameLogEntry) => {
      setLogs((prev) => [entry, ...prev.slice(0, 49)]);
    });

    s.on('errorMessage', (msg: string) => {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Save Player Name
  useEffect(() => {
    localStorage.setItem('war_player_name', playerName);
  }, [playerName]);

  // Audio cues on phase transition
  useEffect(() => {
    if (!gameState) return;
    const currentPhase = gameState.phase;
    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = currentPhase;

    if (currentPhase !== prevPhase) {
      if (currentPhase === 'REVEAL_NORMAL') {
        soundManager.playCardFlip();
      } else if (currentPhase === 'REVEAL_MODIFIER_1' || currentPhase === 'REVEAL_MODIFIER_2') {
        soundManager.playModifierActivate();
      } else if (currentPhase === 'RESOLVING_ROUND') {
        if (gameState.activeResolution?.isTie) {
          soundManager.playWarTie();
        } else if (gameState.activeResolution?.winnerId === myPlayer?.id) {
          soundManager.playRoundWin();
        }
      }
    }
  }, [gameState, myPlayer?.id]);

  // Lobby actions
  const handleCreateRoom = () => {
    if (!socket) return;
    socket.emit('createRoom', { playerName }, (res) => {
      if (res.success && res.roomId) {
        setWaitingRoomId(res.roomId);
        setLogs([]);
      } else {
        setErrorMessage(res.error || 'Failed to create room.');
      }
    });
  };

  const handleJoinRoom = (code: string) => {
    if (!socket) return;
    socket.emit('joinRoom', { roomId: code.trim().toUpperCase(), playerName }, (res) => {
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to join room.');
      } else {
        setWaitingRoomId(null);
        setLogs([]);
      }
    });
  };

  const handleCreateBotGame = () => {
    if (!socket) return;
    socket.emit('createBotGame', { playerName }, (res) => {
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to start AI Bot game.');
      } else {
        setWaitingRoomId(null);
        setLogs([]);
      }
    });
  };

  const handleCancelWaitingRoom = () => {
    if (socket) {
      socket.emit('cancelRoom');
    }
    setWaitingRoomId(null);
  };

  // Gameplay actions
  const handleSelectCard = (cardId: string) => {
    if (!socket) return;
    socket.emit('selectCard', cardId);
  };

  const handleSelectModifier = (modifierId: string | null) => {
    if (!socket) return;
    socket.emit('selectModifier', modifierId);
  };

  const handleConfirmTurn = () => {
    if (!socket) return;
    socket.emit('confirmTurn');
  };

  const handleRematch = () => {
    if (!socket) return;
    socket.emit('rematch');
  };

  const handleLeaveRoom = () => {
    window.location.reload();
  };

  // Check if we are in Lobby or Game
  const inGame = gameState && gameState.phase !== 'LOBBY' && myPlayer;

  if (!inGame) {
    return (
      <Lobby
        playerName={playerName}
        setPlayerName={setPlayerName}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onCreateBotGame={handleCreateBotGame}
        waitingRoomId={waitingRoomId}
        onCancelWaitingRoom={handleCancelWaitingRoom}
        errorMessage={errorMessage}
      />
    );
  }

  // Find opponent state
  const opponentId = gameState.playerOrder.find((id) => id !== myPlayer.id);
  const opponent = opponentId ? gameState.players[opponentId] : null;

  return (
    <div className="min-h-screen felt-table flex flex-col justify-between select-none">
      {/* Top Header */}
      <GameHeader
        roomId={gameState.roomId}
        deckCount={gameState.deckCount}
        discardCount={gameState.discardCount}
        onLeaveRoom={handleLeaveRoom}
      />

      {/* Opponent Area */}
      <OpponentHand opponent={opponent} />

      {/* Center Clash Area */}
      <BattleZone
        gameState={gameState}
        myPlayer={myPlayer}
        opponent={opponent}
      />

      {/* Player Hand & Controls */}
      <PlayerHand
        player={myPlayer}
        phase={gameState.phase}
        onSelectCard={handleSelectCard}
        onSelectModifier={handleSelectModifier}
        onConfirm={handleConfirmTurn}
      />

      {/* Slide-out Combat Log */}
      <CombatLog logs={logs} />

      {/* Game Over Modal */}
      {gameState.phase === 'GAME_OVER' && (
        <GameOverModal
          isWinner={gameState.winnerId === myPlayer.id}
          winnerName={
            gameState.winnerId
              ? gameState.players[gameState.winnerId]?.name || 'Victor'
              : 'Stalemate'
          }
          roundCount={gameState.roundNumber}
          onRematch={handleRematch}
          onReturnLobby={handleLeaveRoom}
        />
      )}
    </div>
  );
};

export default App;
