import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { TOKEN_KEY } from '../services/api.js';

/**
 * Gets media with progressive fallback:
 *   1. video + audio  (ideal)
 *   2. audio only     (camera busy / no camera)
 *   3. silent stream  (no mic either — still lets signalling work)
 */
async function getMediaStream() {
  try {
    return { stream: await navigator.mediaDevices.getUserMedia({ video: true, audio: true }), mode: 'video+audio' };
  } catch { /* fall through */ }
  try {
    return { stream: await navigator.mediaDevices.getUserMedia({ video: false, audio: true }), mode: 'audio-only' };
  } catch { /* fall through */ }
  const ctx = new AudioContext();
  const dest = ctx.createMediaStreamDestination();
  return { stream: dest.stream, mode: 'silent', ctx };
}

export function useVideoCall(consultationId) {
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const isInitiatorRef = useRef(false); // remember role across events

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [status, setStatus] = useState('idle');
  const [mediaMode, setMediaMode] = useState('video+audio');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef(null);

  /** Create an RTCPeerConnection wired up to the given socket. Does NOT send an offer. */
  const createPeer = useCallback((socket) => {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
    const pc = new RTCPeerConnection(config);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) =>
        pc.addTrack(track, localStreamRef.current)
      );
    }

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('video:ice_candidate', { consultationId, candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      remoteStreamRef.current = stream;
      setRemoteStream(stream);
      setStatus('connected');
      if (!timerRef.current) {
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      }
    };

    pc.onconnectionstatechange = () => {
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        setStatus('ended');
        clearInterval(timerRef.current);
      }
    };

    return pc;
  }, [consultationId]);

  /** Initiator creates and sends an offer once the peer is ready */
  const sendOffer = useCallback(async (pc, socket) => {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('video:offer', { consultationId, sdp: offer });
  }, [consultationId]);

  useEffect(() => {
    if (!consultationId) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    let socket;

    async function init() {
      const { stream, mode, ctx } = await getMediaStream();
      localStreamRef.current = stream;
      audioCtxRef.current = ctx || null;
      setLocalStream(stream);
      setMediaMode(mode);
      if (mode !== 'video+audio') setIsCameraOff(true);

      // Connect to backend — use current hostname so phone works via 172.21.3.15
      const socketUrl = import.meta.env.VITE_SOCKET_URL
        || `http://${window.location.hostname}:5000`;
      socket = io(socketUrl, { auth: { token } });
      socketRef.current = socket;

      socket.on('connect', () => {
        setStatus('connecting');
        socket.emit('video:join', { consultationId });
      });

      // Re-join if socket reconnects (covers HMR / network blips)
      socket.on('reconnect', () => {
        socket.emit('video:join', { consultationId });
      });

      // ── First person in room ──────────────────────────────────────
      // Just save the initiator role; DO NOT send offer yet.
      // We wait for video:peer_joined before sending the offer.
      socket.on('video:joined', ({ isInitiator }) => {
        isInitiatorRef.current = isInitiator;
        if (!peerRef.current) {
          peerRef.current = createPeer(socket);
        }
      });

      // ── Second person joined — now the initiator sends the offer ──
      socket.on('video:peer_joined', async () => {
        if (!peerRef.current) {
          peerRef.current = createPeer(socket);
        }
        // Only the initiator creates and sends the offer
        if (isInitiatorRef.current) {
          await sendOffer(peerRef.current, socket);
        }
      });

      // ── Non-initiator receives offer → sends answer ───────────────
      socket.on('video:offer', async ({ sdp }) => {
        if (!peerRef.current) {
          peerRef.current = createPeer(socket);
        }
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socket.emit('video:answer', { consultationId, sdp: answer });
      });

      // ── Initiator receives answer ─────────────────────────────────
      socket.on('video:answer', async ({ sdp }) => {
        await peerRef.current?.setRemoteDescription(new RTCSessionDescription(sdp));
      });

      socket.on('video:ice_candidate', ({ candidate }) => {
        peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      });

      socket.on('video:ended', () => {
        setStatus('ended');
        clearInterval(timerRef.current);
      });

      socket.on('video:error', ({ message }) => {
        console.error('Video signaling error:', message);
      });

      socket.on('disconnect', () => {
        setStatus('ended');
        clearInterval(timerRef.current);
      });
    }

    init();

    return () => {
      clearInterval(timerRef.current);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
      peerRef.current?.close();
      socket?.emit('video:end', { consultationId });
      socket?.disconnect();
    };
  }, [consultationId, createPeer, sendOffer]);

  const endCall = useCallback(() => {
    clearInterval(timerRef.current);
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    peerRef.current?.close();
    socketRef.current?.emit('video:end', { consultationId });
    setStatus('ended');
  }, [consultationId]);

  const toggleMute = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsMuted(!track.enabled); }
  }, []);

  const toggleCamera = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsCameraOff(!track.enabled); }
  }, []);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return {
    localStream, remoteStream, status, mediaMode,
    isMuted, isCameraOff, duration: formatDuration(duration),
    endCall, toggleMute, toggleCamera,
  };
}
