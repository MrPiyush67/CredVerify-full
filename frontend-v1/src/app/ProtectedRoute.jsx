import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { Loader } from '@/shared/ui';
import Sidebar from '@/layouts/Sidebar';
import { useGetMe } from '@/features/auth';

const ProtectedRoute = ({ requiredRole }) => {
  const { data: user, isPending } = useGetMe();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="size-8" />
      </div>
    );
  }

  if (!user) return <Navigate to={'/'} replace />;
  if (requiredRole && user.role != requiredRole)
    return <Navigate to={'/home'} replace />;

  return (
    <Sidebar>
      <Outlet />
    </Sidebar>
  );
};

export default ProtectedRoute;
