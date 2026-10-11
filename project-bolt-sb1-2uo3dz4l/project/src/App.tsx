import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { type ReactNode, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { DataProvider } from '@/context/DataContext';
import { AppLayout } from '@/components/AppLayout';

import { AuthLayout } from '@/pages/auth/AuthLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { NotFoundPage } from '@/pages/ErrorPages';

import { DashboardPage } from '@/pages/student/DashboardPage';
import { ModulesPage } from '@/pages/student/ModulesPage';
import { ModuleDetailPage } from '@/pages/student/ModuleDetailPage';
import { VideosPage } from '@/pages/student/VideosPage';
import { NotesPage } from '@/pages/student/NotesPage';
import { QuizzesPage } from '@/pages/student/QuizzesPage';
import { QuizDetailPage } from '@/pages/student/QuizDetailPage';
import { MockTestsPage, MockTestDetailPage } from '@/pages/student/MockTestsPage';
import { ScenariosPage } from '@/pages/student/ScenariosPage';
import { PhishingDetectivePage } from '@/pages/student/PhishingDetectivePage';
import { SecurityTipsPage } from '@/pages/student/SecurityTipsPage';
import { CampaignsPage } from '@/pages/student/CampaignsPage';
import { AchievementsPage } from '@/pages/student/AchievementsPage';
import { CertificatesPage } from '@/pages/student/CertificatesPage';
import { ProgressPage } from '@/pages/student/ProgressPage';
import { ProfilePage } from '@/pages/student/ProfilePage';
import { SettingsPage } from '@/pages/student/SettingsPage';
import { HelpPage } from '@/pages/student/HelpPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <DataProvider>{children}</DataProvider>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected student routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/modules" element={<ProtectedRoute><AppLayout><ModulesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/modules/:id" element={<ProtectedRoute><AppLayout><ModuleDetailPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/videos" element={<ProtectedRoute><AppLayout><VideosPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/notes" element={<ProtectedRoute><AppLayout><NotesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/quizzes" element={<ProtectedRoute><AppLayout><QuizzesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/quizzes/:id" element={<ProtectedRoute><AppLayout><QuizDetailPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/mock-tests" element={<ProtectedRoute><AppLayout><MockTestsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/mock-tests/:id" element={<ProtectedRoute><AppLayout><MockTestDetailPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/scenarios" element={<ProtectedRoute><AppLayout><ScenariosPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/phishing-detective" element={<ProtectedRoute><AppLayout><PhishingDetectivePage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/security-tips" element={<ProtectedRoute><AppLayout><SecurityTipsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/campaigns" element={<ProtectedRoute><AppLayout><CampaignsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/achievements" element={<ProtectedRoute><AppLayout><AchievementsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/certificates" element={<ProtectedRoute><AppLayout><CertificatesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/progress" element={<ProtectedRoute><AppLayout><ProgressPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/student/help" element={<ProtectedRoute><AppLayout><HelpPage /></AppLayout></ProtectedRoute>} />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
