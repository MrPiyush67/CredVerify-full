import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { selectRole } from '@features/auth/redux/authSlice.js';
import {
  fetchDashboardStats,
  selectDashboardStats,
  selectDashboardLoading,
  selectDashboardError,
  selectLastUpdated
} from '../redux/dashboardSlice.js';
import UserDashboardView from '../components/UserDashboardView.jsx';
import AdminDashboardView from '../components/AdminDashboardView.jsx';
import EmployerDashboardView from '../components/EmployerDashboardView.jsx';
import { Button } from '@common';
import Loader from '@common/components/Loader.jsx';
import PageHeader from '@common/components/PageHeader.jsx';
import AiChatWrapper from '@features/ai-chat/components/AiChatWrapper.jsx';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const role = useSelector(selectRole);
  const stats = useSelector(selectDashboardStats);
  const isLoading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const lastUpdated = useSelector(selectLastUpdated);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const handleRefresh = () => dispatch(fetchDashboardStats());

  if (isLoading && !stats) return <Loader type="page" fullScreen />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 space-y-6">
        {/* Header */}
        <PageHeader
          title="Dashboard"
          description={`Welcome back! Here's what's happening.${lastUpdated ? ` Last updated: ${new Date(lastUpdated).toLocaleTimeString()}` : ''}`}
        >
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </PageHeader>

        {/* Role-Based Dashboard Views */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {role === 'regulator' && <AdminDashboardView stats={stats} />}
          {role === 'employer' && <EmployerDashboardView stats={stats} />}
          {role === 'learner' && <UserDashboardView stats={stats} />}
          {!role && <div className="text-center text-muted-foreground">Loading user data...</div>}
        </motion.div>
      </div>

      <AiChatWrapper />
    </div>
  );
}
