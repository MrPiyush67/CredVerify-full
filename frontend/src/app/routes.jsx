import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@common/components/ProtectedRoute.jsx';
import PublicRoute from '@common/components/PublicRoute.jsx';
const LoginPage = lazy(() => import('@features/auth/pages/LoginPage.jsx'));
const SignupPage = lazy(() => import('@features/auth/pages/SignupPage.jsx'));
const LandingPage = lazy(() => import('@features/landing/pages/LandingPage.jsx'));
const HomePage = lazy(() => import('@features/home/pages/HomePage.jsx'));
const ChatPage = lazy(() => import('@features/chat/pages/ChatPage.jsx'));
const ProfilePage = lazy(() => import('@features/profile/pages/ProfilePage.jsx'));
const SettingsPage = lazy(() => import('@features/settings/pages/SettingsPage.jsx'));
const NotificationsPage = lazy(() => import('@features/notifications/pages/NotificationsPage.jsx'));
const DashboardPage = lazy(() => import('@features/dashboard/pages/DashboardPage.jsx'));
const CredentialsPage = lazy(() => import('@features/credentials/pages/CredentialsPage.jsx'));
const AddCredentialsPage = lazy(() => import('@features/credentials/pages/AddCredentialsPage.jsx'));
const UploadMethodsGuidePage = lazy(() => import('@features/credentials/pages/UploadMethodsGuidePage.jsx'));
const RequestsPage = lazy(() => import('@features/verification/pages/RequestsPage.jsx'));
const IssueCredentialsPage = lazy(() => import('@features/verification/pages/IssueCredentialsPage.jsx'));
const JobsPage = lazy(() => import('@features/jobs/pages/JobsPage.jsx'));
const PostJobPage = lazy(() => import('@features/jobs/pages/PostJobPage.jsx'));

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Protected routes (any authenticated user) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Learner-only routes */}
      <Route element={<ProtectedRoute requiredRole="learner" />}>
        <Route path="/credentials" element={<CredentialsPage />} />
        <Route path="/credentials/add" element={<AddCredentialsPage />} />
        <Route path="/credentials/upload-guide" element={<UploadMethodsGuidePage />} />
      </Route>

      {/* Regulator-only routes */}
      <Route element={<ProtectedRoute requiredRole="regulator" />}>
        <Route path="/requests" element={<RequestsPage />} />
      </Route>

      {/* Issue Credentials - temporarily accessible to all authenticated users for testing */}
      <Route element={<ProtectedRoute />}>
        <Route path="/issue-credentials" element={<IssueCredentialsPage />} />
      </Route>

      {/* Employer-only routes */}
      <Route element={<ProtectedRoute requiredRole="employer" />}>
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/post-job" element={<PostJobPage />} />
        <Route path="/post-job/:id" element={<PostJobPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<div>404 page not fount or not autharized</div>} />
    </Routes>
  );
}