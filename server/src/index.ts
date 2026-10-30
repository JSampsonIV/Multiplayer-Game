import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from './types.js';
import { GameRoom } from './game/GameRoom.js';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    message: '🎮 War & Modifiers Game Server is active!',
    activeRooms: rooms.size,
  });
});

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const rooms: Map<string, GameRoom> = new Map();
const socketToPlayerMap: Map<string, { roomId: string; playerId: string }> = new Map();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  socket.on('createRoom', ({ playerName }, callback) => {
    try {
      const roomId = generateRoomCode();
      const playerId = `player-${uuidv4().substring(0, 8)}`;

      const room = new GameRoom(
        roomId,
        (event, data) => io.to(roomId).emit(event as any, data),
        (socketId, event, data) => io.to(socketId).emit(event as any, data)
      );

      rooms.set(roomId, room);
      socket.join(roomId);
      socketToPlayerMap.set(socket.id, { roomId, playerId });

      room.addPlayer(playerId, playerName || 'Commander 1', socket.id);
      callback({ success: true, roomId });
    } catch (err: any) {
      console.error('Error creating room:', err);
      callback({ success: false, error: err.message });
    }
  });

  socket.on('joinRoom', ({ roomId, playerName }, callback) => {
    try {
      const room = rooms.get(roomId.toUpperCase());
      if (!room) {
        return callback({ success: false, error: 'Room not found. Check code and try again.' });
      }

      const playerId = `player-${uuidv4().substring(0, 8)}`;
      socket.join(roomId.toUpperCase());
      socketToPlayerMap.set(socket.id, { roomId: roomId.toUpperCase(), playerId });

      const added = room.addPlayer(playerId, playerName || 'Commander 2', socket.id);
      if (!added) {
        return callback({ success: false, error: 'Room is already full.' });
      }

      callback({ success: true });
    } catch (err: any) {
      console.error('Error joining room:', err);
      callback({ success: false, error: err.message });
    }
  });

  socket.on('createBotGame', ({ playerName }, callback) => {
    try {
      const roomId = `BOT-${generateRoomCode().substring(0, 3)}`;
      const playerId = `player-${uuidv4().substring(0, 8)}`;
      const botId = `bot-${uuidv4().substring(0, 8)}`;

      const room = new GameRoom(
        roomId,
        (event, data) => io.to(roomId).emit(event as any, data),
        (socketId, event, data) => io.to(socketId).emit(event as any, data)
      );

      rooms.set(roomId, room);
      socket.join(roomId);
      socketToPlayerMap.set(socket.id, { roomId, playerId });

      room.addPlayer(playerId, playerName || 'Player', socket.id);
      room.addPlayer(botId, 'Strategist AI 🤖', null, true);

      callback({ success: true, roomId });
    } catch (err: any) {
      console.error('Error creating bot game:', err);
      callback({ success: false, error: err.message });
    }
  });

  socket.on('cancelRoom', () => {
    const session = socketToPlayerMap.get(socket.id);
    if (session) {
      rooms.delete(session.roomId);
      socketToPlayerMap.delete(socket.id);
      socket.leave(session.roomId);
    }
  });

  socket.on('selectCard', (cardId: string) => {
    const session = socketToPlayerMap.get(socket.id);
    if (!session) return;
    const room = rooms.get(session.roomId);
    if (room) {
      room.selectCard(session.playerId, cardId);
    }
  });

  socket.on('selectModifier', (modifierId: string | null) => {
    const session = socketToPlayerMap.get(socket.id);
    if (!session) return;
    const room = rooms.get(session.roomId);
    if (room) {
      room.selectModifier(session.playerId, modifierId);
    }
  });

  socket.on('confirmTurn', () => {
    const session = socketToPlayerMap.get(socket.id);
    if (!session) return;
    const room = rooms.get(session.roomId);
    if (room) {
      room.confirmTurn(session.playerId);
    }
  });

  socket.on('rematch', () => {
    const session = socketToPlayerMap.get(socket.id);
    if (!session) return;
    const room = rooms.get(session.roomId);
    if (room) {
      room.startGame();
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    const session = socketToPlayerMap.get(socket.id);
    if (session) {
      const room = rooms.get(session.roomId);
      if (room) {
        room.removePlayer(session.playerId);
      }
      socketToPlayerMap.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎮 Game Server running on port ${PORT}`);
});
