import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { TOKEN_KEY } from '../services/api.js';

let sharedSocket = null;
let refCount = 0;

function getSharedSocket() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  if (!sharedSocket || sharedSocket.disconnected) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || `http://${window.location.hostname}:5000`;
    sharedSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
  }
  return sharedSocket;
}

export function useSocket() {
  const [connected, setConnected] = useState(() => Boolean(sharedSocket?.connected));

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const socket = getSharedSocket();
    if (!socket) return;
    refCount++;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    if (socket.connected) {
      setConnected(true);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      refCount--;
      if (refCount <= 0) {
        refCount = 0;
        socket.disconnect();
        sharedSocket = null;
        setConnected(false);
      }
    };
  }, []);

  const emit = useCallback((event, data) => {
    sharedSocket?.emit(event, data);
  }, []);

  const on = useCallback((event, handler) => {
    const socket = getSharedSocket();
    socket?.on(event, handler);
    return () => socket?.off(event, handler);
  }, []);

  return { socket: sharedSocket, connected, emit, on };
}
