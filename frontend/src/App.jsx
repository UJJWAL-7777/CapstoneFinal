import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { useTheme } from "./context/ThemeContext.jsx";
import NotificationBell from "./components/common/NotificationBell.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

import Home from "./pages/public/Home.jsx";
import About from "./pages/public/About.jsx";
import Contact from "./pages/public/Contact.jsx";
import Discovery from "./pages/Discovery.jsx";
import ProviderDetail from "./pages/ProviderDetail.jsx";

import Login from "./pages/auth/Login.jsx";
import RegisterAdvocate from "./pages/auth/RegisterAdvocate.jsx";
import RegisterClient from "./pages/auth/RegisterClient.jsx";
import VerifyOTP from "./pages/auth/VerifyOTP.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";

import AdvocateDashboard from "./pages/advocate/Dashboard.jsx";
import AdvocateProfile from "./pages/advocate/Profile.jsx";
import AdvocateCases from "./pages/advocate/Cases.jsx";
import AdvocateCaseDetail from "./pages/advocate/CaseDetail.jsx";
import AdvocateRequests from "./pages/advocate/Requests.jsx";
import AdvocateHistory from "./pages/advocate/History.jsx";
import AdvocateEarnings from "./pages/advocate/Earnings.jsx";
import AdvocateNotifications from "./pages/advocate/Notifications.jsx";
import AdvocateSettings from "./pages/advocate/Settings.jsx";

import ClientDashboard from "./pages/client/Dashboard.jsx";
import ClientProfile from "./pages/client/Profile.jsx";
import ClientSearch from "./pages/client/Search.jsx";
import ClientAdvocateDetail from "./pages/client/AdvocateDetail.jsx";
import ClientCases from "./pages/client/Cases.jsx";
import ClientCaseDetail from "./pages/client/CaseDetail.jsx";
import ClientHistory from "./pages/client/History.jsx";
import ClientNotifications from "./pages/client/Notifications.jsx";
import ClientSettings from "./pages/client/Settings.jsx";

export default function App() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* ── Newspaper Masthead / Navbar ──────────────── */}
      <nav className="bg-navy sticky top-0 z-50 border-b-4 border-double border-sepia-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16">
          <Link to="/" className="font-serif text-xl font-bold text-cream tracking-tight mr-8 hover:text-sepia-light transition-colors">
            ⚖️ THE LEGALCONNECT
          </Link>

          <div className="hidden md:flex gap-6 mr-auto">
            {[
              ["/discover", "Discover"],
              ["/about", "About"],
              ["/contact", "Contact"],
            ].map(([to, label]) => (
              <Link key={to} to={to} className="text-cream/70 text-sm font-sans font-medium hover:text-cream transition-colors">
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Dark / Light toggle */}
            <button
              onClick={toggle}
              className="text-cream/70 hover:text-cream transition-colors text-lg p-1"
              title={dark ? "Switch to Light" : "Switch to Dark"}
            >
              {dark ? "☀️" : "🌙"}
            </button>

            {user ? (
              <>
                <NotificationBell />
                <Link
                  to={`/${user.role}/dashboard`}
                  className="text-sm font-sans font-medium text-cream/80 hover:text-cream px-3 py-1.5 rounded border border-cream/20 hover:border-cream/40 transition-all"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-sans font-medium text-cream/60 hover:text-accent transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-sans font-medium text-cream/80 hover:text-cream transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/register/client"
                  className="text-sm font-sans font-semibold bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Routes ──────────────────────────────────── */}
      <main className="min-h-[calc(100vh-4rem)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discovery />} />
          <Route path="/providers/:id" element={<ProviderDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Login />} />
          <Route path="/register/advocate" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <RegisterAdvocate />} />
          <Route path="/register/client" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <RegisterClient />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/advocate/dashboard" element={<ProtectedRoute allowedRoles={["advocate"]}><AdvocateDashboard /></ProtectedRoute>} />
          <Route path="/advocate/profile" element={<ProtectedRoute allowedRoles={["advocate"]}><AdvocateProfile /></ProtectedRoute>} />
          <Route path="/advocate/cases" element={<ProtectedRoute allowedRoles={["advocate"]}><AdvocateCases /></ProtectedRoute>} />
          <Route path="/advocate/cases/:caseId" element={<ProtectedRoute allowedRoles={["advocate"]}><AdvocateCaseDetail /></ProtectedRoute>} />
          <Route path="/advocate/requests" element={<ProtectedRoute allowedRoles={["advocate"]}><AdvocateRequests /></ProtectedRoute>} />
          <Route path="/advocate/history" element={<ProtectedRoute allowedRoles={["advocate"]}><AdvocateHistory /></ProtectedRoute>} />
          <Route path="/advocate/earnings" element={<ProtectedRoute allowedRoles={["advocate"]}><AdvocateEarnings /></ProtectedRoute>} />
          <Route path="/advocate/notifications" element={<ProtectedRoute allowedRoles={["advocate"]}><AdvocateNotifications /></ProtectedRoute>} />
          <Route path="/advocate/settings" element={<ProtectedRoute allowedRoles={["advocate"]}><AdvocateSettings /></ProtectedRoute>} />

          <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={["client"]}><ClientDashboard /></ProtectedRoute>} />
          <Route path="/client/profile" element={<ProtectedRoute allowedRoles={["client"]}><ClientProfile /></ProtectedRoute>} />
          <Route path="/client/search" element={<ProtectedRoute allowedRoles={["client"]}><ClientSearch /></ProtectedRoute>} />
          <Route path="/client/advocates/:id" element={<ProtectedRoute allowedRoles={["client"]}><ClientAdvocateDetail /></ProtectedRoute>} />
          <Route path="/client/cases" element={<ProtectedRoute allowedRoles={["client"]}><ClientCases /></ProtectedRoute>} />
          <Route path="/client/cases/:caseId" element={<ProtectedRoute allowedRoles={["client"]}><ClientCaseDetail /></ProtectedRoute>} />
          <Route path="/client/history" element={<ProtectedRoute allowedRoles={["client"]}><ClientHistory /></ProtectedRoute>} />
          <Route path="/client/notifications" element={<ProtectedRoute allowedRoles={["client"]}><ClientNotifications /></ProtectedRoute>} />
          <Route path="/client/settings" element={<ProtectedRoute allowedRoles={["client"]}><ClientSettings /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
