import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { Case } from '../models/Case.js';
import { Consultation } from '../models/Consultation.js';
import { Message } from '../models/Message.js';
import { env } from '../config/env.js';

// Track online users: userId -> Set of socketIds
const onlineUsers = new Map();

function addOnlineUser(userId, socketId) {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
}

function removeOnlineUser(userId, socketId) {
  const sockets = onlineUsers.get(userId);
  if (sockets) {
    sockets.delete(socketId);
    if (sockets.size === 0) onlineUsers.delete(userId);
  }
}

export function isUserOnline(userId) {
  return onlineUsers.has(String(userId));
}

export function initSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin(origin, cb) {
        if (!origin) return cb(null, true);
        if (!env.isProd && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return cb(null, true);
        if (env.CLIENT_URLS.includes(origin)) return cb(null, true);
        cb(new Error('Origin not allowed by CORS'));
      },
      credentials: true,
    },
    path: '/socket.io',
  });

  // Auth middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));

      const payload = verifyToken(token);
      const user = await User.findById(payload.sub).lean();
      if (!user) return next(new Error('User not found'));

      socket.userId = String(user._id);
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    addOnlineUser(userId, socket.id);

    // Join user's personal room for notifications
    socket.join(`user:${userId}`);

    // ─── Chat (Case or Consultation) ──────────────────────────────
    socket.on('chat:join', async ({ caseId, consultationId }) => {
      try {
        let roomId = null;
        let query = {};

        if (caseId) {
          const caseDoc = await Case.findById(caseId).lean();
          if (!caseDoc) return;
          const participants = [String(caseDoc.client), String(caseDoc.advocate)];
          if (!participants.includes(userId)) return;
          roomId = `case:${caseId}`;
          query = { case: caseId };
        } else if (consultationId) {
          const consDoc = await Consultation.findById(consultationId).lean();
          if (!consDoc) return;
          const participants = [String(consDoc.client), String(consDoc.advocate)];
          if (!participants.includes(userId)) return;
          roomId = `consultation:${consultationId}`;
          query = { consultation: consultationId };
        } else {
          return;
        }

        socket.join(roomId);

        // Send message history (last 50)
        const messages = await Message.find({ ...query, isDeleted: false })
          .sort({ createdAt: -1 })
          .limit(50)
          .populate('sender', 'name avatar role')
          .lean();
        socket.emit('chat:history', messages.reverse());

        // Mark messages as read
        await Message.updateMany(
          { ...query, sender: { $ne: userId }, readBy: { $not: { $elemMatch: { $eq: userId } } } },
          { $addToSet: { readBy: userId } }
        );
      } catch (err) {
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    socket.on('chat:message', async ({ caseId, consultationId, content, type = 'text', attachment }) => {
      try {
        let roomId = null;
        const msgData = {
          sender: userId,
          content,
          type,
          attachment,
          readBy: [userId],
        };

        if (caseId) {
          const caseDoc = await Case.findById(caseId).lean();
          if (!caseDoc) return;
          const participants = [String(caseDoc.client), String(caseDoc.advocate)];
          if (!participants.includes(userId)) return;
          roomId = `case:${caseId}`;
          msgData.case = caseId;
        } else if (consultationId) {
          const consDoc = await Consultation.findById(consultationId).lean();
          if (!consDoc) return;
          const participants = [String(consDoc.client), String(consDoc.advocate)];
          if (!participants.includes(userId)) return;
          roomId = `consultation:${consultationId}`;
          msgData.consultation = consultationId;
        } else {
          return;
        }

        const message = await Message.create(msgData);
        const populated = await message.populate('sender', 'name avatar role');
        io.to(roomId).emit('chat:message', populated);
      } catch {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('chat:typing', ({ caseId, consultationId, isTyping }) => {
      const roomId = caseId ? `case:${caseId}` : (consultationId ? `consultation:${consultationId}` : null);
      if (roomId) {
        socket.to(roomId).emit('chat:typing', { userId, isTyping });
      }
    });

    // ─── Video Signaling (WebRTC) ─────────────────────────────────
    socket.on('video:join', async ({ consultationId }) => {
      try {
        const consultation = await Consultation.findById(consultationId).lean();
        if (!consultation) return socket.emit('video:error', { message: 'Consultation not found' });

        const participants = [String(consultation.client), String(consultation.advocate)];
        if (!participants.includes(userId)) return socket.emit('video:error', { message: 'Access denied' });

        const room = `video:${consultationId}`;
        const roomSockets = await io.in(room).fetchSockets();

        if (roomSockets.length >= 2) {
          return socket.emit('video:error', { message: 'Room is full' });
        }

        socket.join(room);
        const isInitiator = roomSockets.length === 0;
        socket.emit('video:joined', { isInitiator, roomId: consultationId });
        socket.to(room).emit('video:peer_joined', { userId, isInitiator: !isInitiator });
      } catch {
        socket.emit('video:error', { message: 'Failed to join video room' });
      }
    });

    socket.on('video:offer', ({ consultationId, sdp }) => {
      socket.to(`video:${consultationId}`).emit('video:offer', { sdp, from: userId });
    });

    socket.on('video:answer', ({ consultationId, sdp }) => {
      socket.to(`video:${consultationId}`).emit('video:answer', { sdp, from: userId });
    });

    socket.on('video:ice_candidate', ({ consultationId, candidate }) => {
      socket.to(`video:${consultationId}`).emit('video:ice_candidate', { candidate, from: userId });
    });

    socket.on('video:end', ({ consultationId }) => {
      io.to(`video:${consultationId}`).emit('video:ended', { by: userId });
      socket.leave(`video:${consultationId}`);
    });

    // ─── Disconnect ───────────────────────────────────────────────
    socket.on('disconnect', () => {
      removeOnlineUser(userId, socket.id);
      socket.broadcast.emit('user:offline', { userId });
    });
  });

  return io;
}
