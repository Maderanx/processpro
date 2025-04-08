import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Store connected users and their socket IDs
const connectedUsers = new Map();
const userRooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('user:join', (userData) => {
    connectedUsers.set(socket.id, userData);
    io.emit('users:update', Array.from(connectedUsers.values()));
  });

  // WebRTC Signaling
  socket.on('join:room', (roomId) => {
    socket.join(roomId);
    userRooms.set(socket.id, roomId);
    
    // Notify the joining peer about the number of participants
    const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    socket.emit('room:joined', { roomId, isFirst: roomSize === 1 });
    
    // Notify other peers in the room about the new peer
    if (roomSize > 1) {
      socket.to(roomId).emit('peer:joined', socket.id);
    }
  });

  socket.on('peer:offer', ({ offer, to }) => {
    socket.to(to).emit('peer:offer', { offer, from: socket.id });
  });

  socket.on('peer:answer', ({ answer, to }) => {
    socket.to(to).emit('peer:answer', { answer, from: socket.id });
  });

  socket.on('peer:ice', ({ candidate, to }) => {
    socket.to(to).emit('peer:ice', { candidate, from: socket.id });
  });

  // Handle private messages
  socket.on('message:private', ({ content, receiverId }) => {
    const sender = connectedUsers.get(socket.id);
    const message = {
      id: Date.now().toString(),
      content,
      senderId: sender.id,
      receiverId,
      createdAt: new Date().toISOString(),
      read: false
    };

    // Find receiver's socket ID
    const receiverSocketId = Array.from(connectedUsers.entries())
      .find(([_, user]) => user.id === receiverId)?.[0];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('message:receive', message);
    }
    socket.emit('message:sent', message);
  });

  // Handle group messages
  socket.on('message:group', ({ content, groupId }) => {
    const sender = connectedUsers.get(socket.id);
    const message = {
      id: Date.now().toString(),
      content,
      senderId: sender.id,
      groupId,
      createdAt: new Date().toISOString(),
      read: false
    };

    io.emit('message:group', message);
  });

  // Handle typing status
  socket.on('typing:start', ({ groupId }) => {
    const user = connectedUsers.get(socket.id);
    socket.broadcast.emit('user:typing', { userId: user.id, groupId });
  });

  socket.on('typing:stop', ({ groupId }) => {
    const user = connectedUsers.get(socket.id);
    socket.broadcast.emit('user:stop-typing', { userId: user.id, groupId });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const roomId = userRooms.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit('peer:left', socket.id);
      userRooms.delete(socket.id);
    }
    
    connectedUsers.delete(socket.id);
    io.emit('users:update', Array.from(connectedUsers.values()));
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});