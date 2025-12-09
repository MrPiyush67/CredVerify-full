import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';
import { selectIsAuthenticated, selectRole } from '@features/auth/redux/authSlice.js';

export default function PublicRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectRole);

  // If user is authenticated, redirect based on role
  if (isAuthenticated) {
    const redirectPath = userRole === 'employer' ? '/jobs' : '/home';
    return <Navigate to={redirectPath} replace />;
  }

  // Otherwise show public pages (landing, login, signup)
  return <Outlet />;
}
