import React from 'react';
import { Navigate } from 'react-router';
import { useGetMe } from '@/features/auth';
import AppLayout from '../AppLayout.jsx';
import { LoaderCircle } from 'lucide-react';

const ProtectedRoute = ({ requiredRole }) => {
  const { data: user, isPending } = useGetMe();

  if (isPending) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin size-8" />
      </div>
    );
  }

  if (!user) return <Navigate to={'/'} replace />;
  if (requiredRole && user.role != requiredRole)
    return <Navigate to={'/discover'} replace />;

  return <AppLayout />;
};

export default ProtectedRoute;
