import React from 'react';
import { Outlet, Navigate } from 'react-router';
import { useGetMe } from '@/features/auth';
import { LoaderCircle } from 'lucide-react';

export default function PublicRoute() {
  const { data: user, isPending } = useGetMe();

  if (isPending) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin size-8" />
      </div>
    );
  }

  if (!user)
    return (
      <div className="w-full">
        <Outlet />
      </div>
    );

  return <Navigate to={'/discover'} replace />;
}
