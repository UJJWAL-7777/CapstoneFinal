import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { DashboardRedirect, GuestRoute, ProtectedRoute, RoleRoute } from './guards.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { ROLES } from '../utils/constants.js';

// Public
const Landing = lazy(() => import('../pages/public/Landing.jsx'));
const About = lazy(() => import('../pages/public/About.jsx'));
const HowItWorks = lazy(() => import('../pages/public/HowItWorks.jsx'));
const LegalResources = lazy(() => import('../pages/public/LegalResources.jsx'));
const NotFound = lazy(() => import('../pages/public/NotFound.jsx'));
const Login = lazy(() => import('../pages/auth/Login.jsx'));
const Register = lazy(() => import('../pages/auth/Register.jsx'));

// Client
const ClientDashboard = lazy(() => import('../pages/client/Dashboard.jsx'));
const FindAdvocates = lazy(() => import('../pages/client/FindAdvocates.jsx'));
const AdvocateProfile = lazy(() => import('../pages/client/AdvocateProfile.jsx'));
const BookConsultation = lazy(() => import('../pages/client/BookConsultation.jsx'));
const ClientConsultations = lazy(() => import('../pages/client/Consultations.jsx'));
const VideoCall = lazy(() => import('../pages/client/VideoCall.jsx'));
const ClientCases = lazy(() => import('../pages/client/Cases.jsx'));
const CaseWorkspace = lazy(() => import('../pages/client/CaseWorkspace.jsx'));
const ClientDocuments = lazy(() => import('../pages/client/Documents.jsx'));
const ClientMessages = lazy(() => import('../pages/client/Messages.jsx'));
const ClientNotifications = lazy(() => import('../pages/client/Notifications.jsx'));
const ClientProfile = lazy(() => import('../pages/client/Profile.jsx'));
const ClientSettings = lazy(() => import('../pages/client/Settings.jsx'));

// Advocate
const AdvocateDashboard = lazy(() => import('../pages/advocate/Dashboard.jsx'));
const AdvocateProfilePage = lazy(() => import('../pages/advocate/Profile.jsx'));
const AdvocateConsultations = lazy(() => import('../pages/advocate/Consultations.jsx'));
const AdvocateCalendar = lazy(() => import('../pages/advocate/Calendar.jsx'));
const AdvocateClients = lazy(() => import('../pages/advocate/Clients.jsx'));
const AdvocateCases = lazy(() => import('../pages/advocate/Cases.jsx'));
const AdvocateCaseWorkspace = lazy(() => import('../pages/advocate/CaseWorkspace.jsx'));
const AdvocateMessages = lazy(() => import('../pages/advocate/Messages.jsx'));
const AdvocateEarnings = lazy(() => import('../pages/advocate/Earnings.jsx'));
const AdvocateReviews = lazy(() => import('../pages/advocate/Reviews.jsx'));
const AdvocateBadges = lazy(() => import('../pages/advocate/Badges.jsx'));
const AdvocateSettings = lazy(() => import('../pages/advocate/Settings.jsx'));
const AdvocateVideoCall = lazy(() => import('../pages/client/VideoCall.jsx')); // reuse same component

// Admin
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard.jsx'));
const AdminUsers = lazy(() => import('../pages/admin/Users.jsx'));
const AdminAdvocates = lazy(() => import('../pages/admin/Advocates.jsx'));
const AdminVerification = lazy(() => import('../pages/admin/Verification.jsx'));
const AdminConsultations = lazy(() => import('../pages/admin/Consultations.jsx'));
const AdminCases = lazy(() => import('../pages/admin/Cases.jsx'));
const AdminReports = lazy(() => import('../pages/admin/Reports.jsx'));
const AdminPayments = lazy(() => import('../pages/admin/Payments.jsx'));
const AdminBadges = lazy(() => import('../pages/admin/Badges.jsx'));
const AdminAuditLogs = lazy(() => import('../pages/admin/AuditLogs.jsx'));
const AdminAnalytics = lazy(() => import('../pages/admin/Analytics.jsx'));
const AdminSettings = lazy(() => import('../pages/admin/Settings.jsx'));

const PageLoader = () => (
  <div className="flex min-h-[200px] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-chamber-200 border-t-chamber-600" />
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="about" element={<About />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="legal-resources" element={<LegalResources />} />
          <Route element={<GuestRoute />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardRedirect />} />
          <Route element={<DashboardLayout />}>
            {/* Client */}
            <Route element={<RoleRoute roles={[ROLES.CLIENT]} />}>
              <Route path="client/dashboard" element={<ClientDashboard />} />
              <Route path="client/advocates" element={<FindAdvocates />} />
              <Route path="client/advocates/:id" element={<AdvocateProfile />} />
              <Route path="client/book/:advocateId" element={<BookConsultation />} />
              <Route path="client/consultations" element={<ClientConsultations />} />
              <Route path="client/consultations/:id/video" element={<VideoCall />} />
              <Route path="client/cases" element={<ClientCases />} />
              <Route path="client/cases/:id" element={<CaseWorkspace />} />
              <Route path="client/documents" element={<ClientDocuments />} />
              <Route path="client/messages" element={<ClientMessages />} />
              <Route path="client/notifications" element={<ClientNotifications />} />
              <Route path="client/profile" element={<ClientProfile />} />
              <Route path="client/settings" element={<ClientSettings />} />
            </Route>

            {/* Advocate */}
            <Route element={<RoleRoute roles={[ROLES.ADVOCATE]} />}>
              <Route path="advocate/dashboard" element={<AdvocateDashboard />} />
              <Route path="advocate/profile" element={<AdvocateProfilePage />} />
              <Route path="advocate/consultations" element={<AdvocateConsultations />} />
              <Route path="advocate/calendar" element={<AdvocateCalendar />} />
              <Route path="advocate/clients" element={<AdvocateClients />} />
              <Route path="advocate/cases" element={<AdvocateCases />} />
              <Route path="advocate/cases/:id" element={<AdvocateCaseWorkspace />} />
              <Route path="advocate/messages" element={<AdvocateMessages />} />
              <Route path="advocate/earnings" element={<AdvocateEarnings />} />
              <Route path="advocate/reviews" element={<AdvocateReviews />} />
              <Route path="advocate/consultations/:id/video" element={<AdvocateVideoCall />} />
              <Route path="advocate/badges" element={<AdvocateBadges />} />
              <Route path="advocate/settings" element={<AdvocateSettings />} />
            </Route>

            {/* Admin */}
            <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/advocates" element={<AdminAdvocates />} />
              <Route path="admin/verification" element={<AdminVerification />} />
              <Route path="admin/consultations" element={<AdminConsultations />} />
              <Route path="admin/cases" element={<AdminCases />} />
              <Route path="admin/reports" element={<AdminReports />} />
              <Route path="admin/payments" element={<AdminPayments />} />
              <Route path="admin/badges" element={<AdminBadges />} />
              <Route path="admin/audit-logs" element={<AdminAuditLogs />} />
              <Route path="admin/analytics" element={<AdminAnalytics />} />
              <Route path="admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
