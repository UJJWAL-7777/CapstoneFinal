import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import api, { TOKEN_KEY } from '../services/api.js';

export function useChat(target) {
  // Support both useChat(caseId) and useChat({ caseId, consultationId })
  const caseId = typeof target === 'string' ? target : target?.caseId;
  const consultationId = typeof target === 'object' ? target?.consultationId : null;

  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);

  // 1. Initial REST fetch for instant, reliable loading
  useEffect(() => {
    if (!caseId && !consultationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = caseId ? { caseId } : { consultationId };
    api
      .get('/messages', { params })
      .then((res) => {
        const list = res.data?.data?.messages || [];
        setMessages(list);
      })
      .catch((err) => {
        console.warn('REST messages fetch notice:', err.message);
      })
      .finally(() => setLoading(false));
  }, [caseId, consultationId]);

  // 2. Real-time Socket.IO connection
  useEffect(() => {
    if (!caseId && !consultationId) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    // Connect to same origin dev proxy or fallback to port 5000
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (window.location.port ? `${window.location.protocol}//${window.location.hostname}:5000` : '/');

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('chat:join', { caseId, consultationId });
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    socket.on('chat:history', (history) => {
      if (Array.isArray(history) && history.length > 0) {
        setMessages((prev) => {
          const map = new Map();
          [...prev, ...history].forEach((m) => map.set(String(m._id || `${m.content}_${m.createdAt}`), m));
          return Array.from(map.values()).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });
      }
    });

    socket.on('chat:message', (msg) => {
      setMessages((prev) => {
        const id = String(msg._id || `${msg.content}_${msg.createdAt}`);
        if (prev.some((m) => String(m._id || `${m.content}_${m.createdAt}`) === id)) {
          return prev;
        }
        return [...prev, msg];
      });
    });

    socket.on('chat:typing', ({ userId, isTyping }) => {
      setTypingUsers((prev) =>
        isTyping ? [...new Set([...prev, userId])] : prev.filter((id) => id !== userId)
      );
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [caseId, consultationId]);

  const sendMessage = useCallback(
    async (content, type = 'text', attachment = null) => {
      if (!caseId && !consultationId) return;

      const payload = {
        caseId,
        consultationId,
        content,
        type,
        attachment,
      };

      if (socketRef.current?.connected) {
        socketRef.current.emit('chat:message', payload);
      } else {
        // Fallback to REST API if socket is temporarily connecting
        try {
          const res = await api.post('/messages', payload);
          const saved = res.data?.data;
          if (saved) {
            setMessages((prev) => [...prev, saved]);
          }
        } catch (err) {
          console.error('Failed to send message via REST fallback:', err);
        }
      }
    },
    [caseId, consultationId]
  );

  const sendTyping = useCallback(
    (isTyping) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('chat:typing', { caseId, consultationId, isTyping });
      }
    },
    [caseId, consultationId]
  );

  return { messages, connected, loading, typingUsers, sendMessage, sendTyping };
}
