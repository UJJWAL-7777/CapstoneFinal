import { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Clock } from 'lucide-react';
import { useVideoCall } from '../../hooks/useVideoCall.js';
import { usePlatformStatus } from '../../context/PlatformContext.jsx';
import MaintenanceNotice from '../../components/ui/MaintenanceNotice.jsx';

export default function VideoCall() {
  const { id: consultationId } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { maintenanceMode, isAdmin } = usePlatformStatus();
  const { localStream, remoteStream, status, mediaMode, isMuted, isCameraOff, duration, endCall, toggleMute, toggleCamera } = useVideoCall(consultationId);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Determine back-destination by role (from URL prefix)
  const backTo = pathname.startsWith('/advocate') ? '/advocate/consultations' : '/client/consultations';

  if (maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <MaintenanceNotice
          serviceName="Video Consultation Room"
          description="LegalConnect video servers are currently undergoing scheduled platform upgrades. Scheduled consultations will resume promptly once the maintenance window is concluded."
          backTo={backTo}
          backLabel="Back to Consultations"
        />
      </div>
    );
  }

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (status === 'ended') {
      setTimeout(() => navigate(backTo), 2000);
    }
  }, [status, navigate, backTo]);

  const statusMessages = {
    idle: 'Initializing...',
    connecting: 'Waiting for the other participant...',
    connected: 'Call in progress',
    ended: 'Call ended. Redirecting...',
    error: 'Failed to connect. Please try again.',
  };

  const isAudioOnly = mediaMode === 'audio-only' || mediaMode === 'silent';

  return (
    <div className="fixed inset-0 bg-ink flex flex-col">
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-ink/80">
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${status === 'connected' ? 'bg-emerald-400 animate-pulse' : status === 'ended' ? 'bg-red-400' : 'bg-amber-400'}`} />
          <span className="text-sm text-white">{statusMessages[status] || statusMessages.connecting}</span>
          {isAudioOnly && status !== 'ended' && (
            <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
              🎤 Audio only — camera in use by another tab
            </span>
          )}
        </div>
        {status === 'connected' && (
          <div className="flex items-center gap-2 text-white">
            <Clock className="h-4 w-4 text-chamber-300" />
            <span className="font-mono text-sm">{duration}</span>
          </div>
        )}
      </div>

      {/* Video area */}
      <div className="flex-1 relative bg-gray-900 overflow-hidden">
        {/* Remote video (main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />

        {/* Placeholder when not connected */}
        {status !== 'connected' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-chamber-800 flex items-center justify-center">
                {isAudioOnly ? <Mic className="h-10 w-10 text-amber-400" /> : <Video className="h-10 w-10 text-chamber-400" />}
              </div>
              <p className="text-lg">{statusMessages[status] || statusMessages.connecting}</p>
              {isAudioOnly && (
                <p className="mt-2 text-sm text-amber-300">Camera unavailable — joined in audio-only mode</p>
              )}
              {(status === 'connecting' || status === 'idle') && (
                <div className="mt-3 flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-2 w-2 rounded-full bg-chamber-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Local video (PiP) */}
        <div className="absolute bottom-4 right-4 h-36 w-48 overflow-hidden rounded-xl border-2 border-chamber-600 bg-gray-800 shadow-2xl">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover scale-x-[-1]"
          />
          {isCameraOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <VideoOff className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 bg-ink/90 py-6">
        <ControlBtn
          onClick={toggleMute}
          active={!isMuted}
          icon={isMuted ? MicOff : Mic}
          label={isMuted ? 'Unmute' : 'Mute'}
        />
        <ControlBtn
          onClick={toggleCamera}
          active={!isCameraOff}
          icon={isCameraOff ? VideoOff : Video}
          label={isCameraOff ? 'Camera on' : 'Camera off'}
        />
        <button
          onClick={() => { endCall(); navigate(backTo); }}
          className="flex flex-col items-center gap-1 rounded-full bg-danger-500 p-4 text-white hover:bg-danger-700 transition-colors"
          aria-label="End call"
        >
          <PhoneOff className="h-6 w-6" />
        </button>
        <ControlBtn icon={Monitor} label="Screen share" active={false} onClick={() => {}} />
      </div>
    </div>
  );
}

function ControlBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-full p-4 transition-colors ${active ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
