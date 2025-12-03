import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';
import { selectIsAuthenticated } from '@features/auth/redux/authSlice.js';

export default function PublicRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // If user is authenticated, redirect to home
  if (isAuthenticated) return <Navigate to="/home" replace />;

  // Otherwise show public pages (landing, login, signup)
  return <Outlet />;
}
