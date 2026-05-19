import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// Public pages
import LandingPage from '@/pages/public/LandingPage';
import LoginPage from '@/pages/public/LoginPage';
import RegisterPage from '@/pages/public/RegisterPage';
import ForgotPasswordPage from '@/pages/public/ForgotPasswordPage';

// Admin pages
import AdminDashboard from '@/pages/admin/DashboardPage';
import CertificationsPage from '@/pages/admin/CertificationsPage';
import DataMasterPage from '@/pages/admin/DataMasterPage';
import RegistrationsPage from '@/pages/admin/RegistrationsPage';
import SchedulesPage from '@/pages/admin/SchedulesPage';
import ReportsPage from '@/pages/admin/ReportsPage';
import SettingsPage from '@/pages/admin/SettingsPage';

// Asesi pages
import AsesiDashboard from '@/pages/asesi/DashboardPage';
import RegisterCertPage from '@/pages/asesi/RegisterCertPage';
import StatusPage from '@/pages/asesi/StatusPage';
import AsesiSchedulePage from '@/pages/asesi/SchedulePage';
import AsesiProfilePage from '@/pages/asesi/ProfilePage';

// Asesor pages
import AsesorDashboard from '@/pages/asesor/DashboardPage';
import AsesorSchedulePage from '@/pages/asesor/SchedulePage';
import AsesorParticipantsPage from '@/pages/asesor/ParticipantsPage';
import AsesorProfilePage from '@/pages/asesor/ProfilePage';

// Placeholder pages
import ComingSoonPage from '@/pages/ComingSoonPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';

export const router = createBrowserRouter([
  // === Public routes ===
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },

  // === Admin routes ===
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/admin/dashboard', element: <AdminDashboard /> },
          { path: '/admin/data-master', element: <DataMasterPage /> },
          { path: '/admin/certifications', element: <Navigate to="/admin/data-master" replace /> },
          { path: '/admin/registrations', element: <RegistrationsPage /> },
          { path: '/admin/schedules', element: <SchedulesPage /> },
          { path: '/admin/reports', element: <ReportsPage /> },
          { path: '/admin/settings', element: <SettingsPage /> },
          // Backwards compatibility redirects
          { path: '/admin/announcements', element: <Navigate to="/admin/settings" replace /> },
          { path: '/admin/profile', element: <Navigate to="/admin/settings" replace /> },
        ],
      },
    ],
  },

  // === Asesi routes ===
  {
    element: <ProtectedRoute allowedRoles={['asesi']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/asesi/dashboard', element: <AsesiDashboard /> },
          { path: '/asesi/sertifikasi', element: <StatusPage /> },
          { path: '/asesi/register-cert', element: <RegisterCertPage /> },
          { path: '/asesi/schedule', element: <AsesiSchedulePage /> },
          { path: '/asesi/profile', element: <AsesiProfilePage /> },
          // Placeholder routes (mockup sidebar items)
          { path: '/asesi/riwayat', element: <ComingSoonPage /> },
          { path: '/asesi/notifikasi', element: <ComingSoonPage /> },
          // Backwards compatibility
          { path: '/asesi/status', element: <Navigate to="/asesi/sertifikasi" replace /> },
          { path: '/asesi/announcements', element: <Navigate to="/asesi/notifikasi" replace /> },
        ],
      },
    ],
  },

  // === Asesor routes ===
  {
    element: <ProtectedRoute allowedRoles={['asesor']} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/asesor/dashboard', element: <AsesorDashboard /> },
          { path: '/asesor/schedule', element: <AsesorSchedulePage /> },
          { path: '/asesor/penilaian', element: <AsesorParticipantsPage /> },
          { path: '/asesor/profile', element: <AsesorProfilePage /> },
          // Placeholder routes (mockup sidebar items)
          { path: '/asesor/riwayat', element: <ComingSoonPage /> },
          { path: '/asesor/notifikasi', element: <ComingSoonPage /> },
          // Backwards compatibility
          { path: '/asesor/participants', element: <Navigate to="/asesor/penilaian" replace /> },
          { path: '/asesor/announcements', element: <Navigate to="/asesor/notifikasi" replace /> },
        ],
      },
    ],
  },
]);
