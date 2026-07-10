import React from 'react';
import { Outlet, Navigate } from 'react-router';
import { useGetMe } from '@/features/auth';
import { Loader } from '@/shared/ui';

export default function PublicRoute() {
  const { data: user, isPending } = useGetMe();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="size-8" />
      </div>
    );
  }

  if (!user) return <Outlet />;

  return <Navigate to={'/home'} replace />;
}
