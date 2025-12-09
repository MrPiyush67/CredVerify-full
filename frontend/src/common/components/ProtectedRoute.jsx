import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, selectIsAuthenticated, selectUser, selectRole, selectAuthLoading } from '@features/auth/redux/authSlice.js';
import Loader from './Loader.jsx';
import Sidebar from '../layouts/Sidebar.jsx';

const ProtectedRoute = ({ requiredRole }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const hasAttemptedFetch = useRef(false);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectUser);
  const userRole = useSelector(selectRole);
  const authLoading = useSelector(selectAuthLoading);

  useEffect(() => {
    // Only fetch once per mount, and only if not authenticated and not loading
    // This prevents infinite loops when logout clears auth state
    if (!isAuthenticated && !authLoading && !hasAttemptedFetch.current) {
      hasAttemptedFetch.current = true;
      dispatch(fetchMe());
    }
  }, [dispatch, isAuthenticated, authLoading]);

  // Show loader while checking auth (only on first load)
  if (authLoading && !hasAttemptedFetch.current) {
    return <Loader type="auth" />;
  }

  // Not authenticated - redirect to landing page
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/" replace />;
  }

  // Authenticated but wrong role - redirect based on user role
  if (requiredRole && userRole !== requiredRole) {
    const redirectPath = userRole === 'employer' ? '/jobs' : '/home';
    console.log(`🔒 Access denied: Required role "${requiredRole}", but user has role "${userRole}". Redirecting to ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  console.log(`✅ Access granted: User role "${userRole}" matches required role "${requiredRole || 'any'}"`);

  // Authenticated and authorized - render protected content
  return (
    <Sidebar>
      <Outlet />
    </Sidebar>
  );
};

export default ProtectedRoute;
