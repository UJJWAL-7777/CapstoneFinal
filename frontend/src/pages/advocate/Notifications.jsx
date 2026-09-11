import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout.jsx";
import { notificationsAPI } from "../../api.js";

const ICONS = { new_request:"📥", case_update:"📋", badge_unlock:"🏅", tier_change:"📈", request_accepted:"✅", request_rejected:"❌", system:"🔔" };

export default function AdvocateNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const load = () => { notificationsAPI.getAll().then(d=>{setNotifications(d.notifications);setUnreadCount(d.unreadCount);}).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(load, []);
  const markRead = async id => { await notificationsAPI.markAsRead(id); load(); };
  const markAll = async () => { await notificationsAPI.markAllAsRead(); load(); };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center border-b-4 border-double border-ink mb-6 pb-4">
        <h1 className="font-serif text-3xl font-black text-ink">Notifications</h1>
        {unreadCount>0 && <button onClick={markAll} className="border border-rule text-ink px-4 py-2 rounded-lg font-sans text-xs font-medium hover:border-sepia transition-colors">Mark all read ({unreadCount})</button>}
      </div>
      {loading ? <p className="text-ink-muted text-sm font-sans text-center py-6">Loading...</p>
      : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map(n=>(
            <div key={n._id} onClick={()=>{if(!n.isRead)markRead(n._id);if(n.link)navigate(n.link);}}
              className={`flex items-start gap-4 bg-parchment border rounded-lg p-4 cursor-pointer transition-all hover:border-sepia ${n.isRead?"border-rule":"border-accent bg-cream"}`}>
              <span className="text-2xl shrink-0 mt-0.5">{ICONS[n.type]||"🔔"}</span>
              <div className="flex-1 min-w-0">
                <strong className="font-sans text-sm font-semibold text-ink block">{n.title}</strong>
                <p className="text-xs font-sans text-ink-muted mt-0.5">{n.message}</p>
                <span className="text-[10px] font-sans text-ink-faint">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />}
            </div>
          ))}
        </div>
      ) : <div className="bg-parchment border border-rule rounded-lg p-8"><p className="text-ink-faint text-sm font-sans italic text-center">No notifications yet.</p></div>}
    </DashboardLayout>
  );
}
