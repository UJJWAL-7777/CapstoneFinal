import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationsAPI } from "../../api.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const poll = () =>
      notificationsAPI.getAll({ limit: 1 }).then((d) => setUnreadCount(d.unreadCount)).catch(() => {});
    poll();
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  return (
    <button
      className="relative text-cream/70 hover:text-cream transition-colors text-lg p-1"
      onClick={() => navigate(`/${user.role}/notifications`)}
      title="Notifications"
    >
      🔔
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1.5 bg-accent text-white text-[10px] font-bold font-sans px-1.5 py-0.5 rounded-full min-w-[16px] text-center leading-none">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
