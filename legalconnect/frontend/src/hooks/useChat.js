import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { TOKEN_KEY } from '../services/api.js';

export function useChat(caseId) {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!caseId) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:5000`;
    const socket = io(socketUrl, {
      auth: { token },
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('chat:join', { caseId });
    });
    socket.on('disconnect', () => setConnected(false));

    socket.on('chat:history', (history) => setMessages(history));
    socket.on('chat:message', (msg) => setMessages((prev) => [...prev, msg]));
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
  }, [caseId]);

  const sendMessage = useCallback((content, type = 'text', attachment = null) => {
    socketRef.current?.emit('chat:message', { caseId, content, type, attachment });
  }, [caseId]);

  const sendTyping = useCallback((isTyping) => {
    socketRef.current?.emit('chat:typing', { caseId, isTyping });
  }, [caseId]);

  return { messages, connected, typingUsers, sendMessage, sendTyping };
}
