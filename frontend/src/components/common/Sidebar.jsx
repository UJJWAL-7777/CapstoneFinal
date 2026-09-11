import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const advocateLinks = [
  { to: "/advocate/dashboard", icon: "📰", label: "Dashboard" },
  { to: "/advocate/profile", icon: "👤", label: "My Profile" },
  { to: "/advocate/cases", icon: "📁", label: "My Cases" },
  { to: "/advocate/requests", icon: "📥", label: "Requests" },
  { to: "/advocate/history", icon: "📜", label: "Case History" },
  { to: "/advocate/earnings", icon: "💰", label: "Earnings" },
  { to: "/advocate/notifications", icon: "🔔", label: "Notifications" },
  { to: "/advocate/settings", icon: "⚙️", label: "Settings" },
];

const clientLinks = [
  { to: "/client/dashboard", icon: "📰", label: "Dashboard" },
  { to: "/client/profile", icon: "👤", label: "My Profile" },
  { to: "/client/search", icon: "🔍", label: "Find Advocate" },
  { to: "/client/cases", icon: "📁", label: "My Cases" },
  { to: "/client/history", icon: "📜", label: "Case History" },
  { to: "/client/notifications", icon: "🔔", label: "Notifications" },
  { to: "/client/settings", icon: "⚙️", label: "Settings" },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === "advocate" ? advocateLinks : clientLinks;

  return (
    <aside className="w-64 shrink-0 bg-navy text-cream border-r border-sepia/20 flex flex-col max-md:w-[70px] max-[480px]:hidden">
      {/* User section */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-cream/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sepia-light to-sepia flex items-center justify-center font-serif font-bold text-navy text-lg shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="flex flex-col overflow-hidden max-md:hidden">
          <span className="font-serif font-semibold text-sm truncate">{user?.name}</span>
          <span className="text-xs text-cream/40 capitalize font-sans">{user?.role}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col py-3 flex-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm font-sans font-medium border-l-3 transition-all max-md:justify-center max-md:px-0 max-md:py-3.5 ${
                isActive
                  ? "text-cream bg-cream/10 border-l-accent"
                  : "text-cream/55 border-l-transparent hover:text-cream hover:bg-cream/5"
              }`
            }
          >
            <span className="text-base max-md:text-lg">{link.icon}</span>
            <span className="max-md:hidden">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Newspaper footer decoration */}
      <div className="px-5 py-3 border-t border-cream/10 max-md:hidden">
        <p className="text-[10px] text-cream/30 font-sans text-center italic">Est. 2026 · LegalConnect</p>
      </div>
    </aside>
  );
}
