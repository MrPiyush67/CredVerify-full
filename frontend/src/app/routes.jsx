import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import PageSkeleton from './components/PageSkeleton.jsx';

import UnderDevelopmentPage from '@/features/UnderDevelopment/UnderDevelopmentPage.jsx';

import { LandingPage } from '@/features/landing';
import { LoginPage, SignupPage, ForgetPasswordPage } from '@/features/auth';
import NotFound from './components/NotFound.jsx';

const DiscoverPage = lazy(() => import('@/features/discover/DiscoverPage.jsx'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage.jsx'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage.jsx'));
// const ChatPage = lazy(() => import('../features/chat'));
// const NotificationsPage = lazy(() => import('../features/notifications'));
// const DashboardPage = lazy(() => import('../features/dashboard'));
// const CredentialsPage = lazy(() => import('../features/credentials'));
// const AddCredentialsPage = lazy(() => import('../features/credentials'));
// const UploadMethodsGuidePage = lazy(() => import('../features/credentials'));
// const RequestsPage = lazy(() => import('../features/verification'));
// const IssueCredentialsPage = lazy(() => import('../features/verification'));
// const JobsPage = lazy(() => import('../features/jobs'));
// const PostJobPage = lazy(() => import('../features/jobs'));
// const PremiumPlans = lazy(() => import('../features/premium'));

// export default function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="*" element={<UnderDevelopmentPage />} />
//     </Routes>
//   );
// }

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forget-password" element={<ForgetPasswordPage />} />
        </Route>

        {/* Protected routes (any authenticated user) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} /> */}
        </Route>

        {/* Learner-only routes */}
        {/* <Route element={<ProtectedRoute requiredRole="learner" />}>
          <Route path="/credentials" element={<CredentialsPage />} />
          <Route path="/credentials/add" element={<AddCredentialsPage />} />
          <Route
            path="/credentials/upload-guide"
            element={<UploadMethodsGuidePage />}
          />
          <Route path="/premium" element={<PremiumPlans />} />
        </Route> */}

        {/* Regulator-only routes */}
        {/* <Route element={<ProtectedRoute requiredRole="regulator" />}>
          <Route path="/requests" element={<RequestsPage />} />
        </Route> */}

        {/* Issue Credentials - temporarily accessible to all authenticated users for testing */}
        {/* <Route element={<ProtectedRoute />}>
          <Route path="/issue-credentials" element={<IssueCredentialsPage />} />
        </Route> */}

        {/* Employer-only routes */}
        {/* <Route element={<ProtectedRoute requiredRole="employer" />}>
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/post-job" element={<PostJobPage />} />
          <Route path="/post-job/:id" element={<PostJobPage />} />
        </Route> */}

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
