import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import PageSkeleton from './components/PageSkeleton.jsx';

import UnderDevelopmentPage from '@/features/underDevelopment/UnderDevelopmentPage.jsx';

import LandingPage from '@/features/landing/LandingPage.jsx';
import { LoginPage, SignupPage, ForgetPasswordPage } from '@/features/auth';
import NotFound from './components/NotFound.jsx';

const DiscoverPage = lazy(() => import('@/features/discover/DiscoverPage.jsx'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage.jsx'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage.jsx'));

const ViewCredentialsPage = lazy(
  () =>
    import('@/features/credentials/viewCredentails/ViewCredentialsPage.jsx'),
);
const AddCredentialsPage = lazy(
  () => import('@/features/credentials/addCredentials/AddCredentialsPage.jsx'),
);
const ViewCredentialDetailsPage = lazy(
  () =>
    import('@/features/credentials/viewCredentialDetails/ViewCredentialDetailsPage.jsx'),
);
const PremiumPage = lazy(() => import('@/features/premium/PremiumPage.jsx'));
const NotificationsPage = lazy(
  () => import('@/features/notifications/NotificationsPage.jsx'),
);
const VerifyOrganizationPage = lazy(
  () => import('@/features/verifyOrg/verifyOrganizationPage.jsx'),
);

// const ChatPage = lazy(() => import('../features/chat'));
// const RequestsPage = lazy(() => import('../features/verification'));
// const IssueCredentialsPage = lazy(() => import('../features/verification'));

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
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          {/* <Route path="/chat" element={<ChatPage />} /> */}
          {/* <Route path="/community" element={<CommunityPage />} /> */}
        </Route>

        {/* Learner-only routes */}
        <Route element={<ProtectedRoute requiredRole="learner" />}>
          <Route path="/credentials" element={<ViewCredentialsPage />} />
          <Route path="/credentials/add" element={<AddCredentialsPage />} />
          <Route
            path="/credentials/:id"
            element={<ViewCredentialDetailsPage />}
          />
          <Route path="/premium" element={<PremiumPage />} />
        </Route>

        {/* Issue Credentials - temporarily accessible to all authenticated users for testing */}
        {/* <Route element={<ProtectedRoute />}>
          <Route path="/issue-credentials" element={<IssueCredentialsPage />} />
          <Route path="/requests" element={<RequestsPage />} />
        </Route> */}

        {/* Regulator-only routes */}
        <Route element={<ProtectedRoute requiredRole="regulator" />}>
          <Route
            path="/verify-organization"
            element={<VerifyOrganizationPage />}
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
