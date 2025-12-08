import React, { useState, useEffect } from 'react';
import { Button } from '@common';
import { Briefcase, ShieldCheck, Users, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@common/ui/tabs';
import PageHeader from '@common/components/PageHeader.jsx';
import RoleTab from '@features/home/components/RoleTab.jsx';
import JobsTab from '@features/home/components/JobsTab.jsx';
import { useHome } from '../hooks/useHome.js';

export default function HomePage() {
  const [tab, setTab] = useState('learner');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Use the home hook for data management
  const {
    initializeDashboard,
    userRole,
    canViewAdmins,
    canViewEmployers,
    users,
    admins,
    employers,
    jobs
  } = useHome();

  // Initialize dashboard data on mount
  useEffect(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 4 card heights (approximately 800px)
      setShowScrollTop(window.scrollY > 800);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset tab to valid tab based on user role
  useEffect(() => {
    const validTabs = ['learner', 'job'];
    if (canViewAdmins) validTabs.push('regulator');
    if (canViewEmployers) validTabs.push('employer');

    if (!validTabs.includes(tab)) {
      setTab('learner'); // Default to learner tab
    }
  }, [tab, canViewAdmins, canViewEmployers]);

  // Simple count display - components will handle their own counts
  const getTabCount = (tabType) => {
    switch (tabType) {
      case 'learner':
        return `(${users.data?.length || 0})`;
      case 'regulator':
        return `(${admins.data?.length || 0})`;
      case 'employer':
        return `(${employers.data?.length || 0})`;
      case 'job':
        return `(${jobs.data?.length || 0})`;
      default:
        return '';
    }
  };

  return (
    <motion.main
      className="px-6 space-y-8 max-w-7xl mx-auto"
      role="main"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Welcome Header */}
      <PageHeader
        title="Home"
        description="Manage users, employers, admins, and jobs from here."
      />

      {/* Tabs with shadcn */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:flex lg:w-auto lg:justify-start">
            <TabsTrigger value="learner" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Learners</span>
              <span className="text-xs opacity-70">{getTabCount('learner')}</span>
            </TabsTrigger>

            {canViewAdmins && (
              <TabsTrigger value="regulator" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Regulators</span>
                <span className="text-xs opacity-70">{getTabCount('regulator')}</span>
              </TabsTrigger>
            )}

            {canViewEmployers && (
              <TabsTrigger value="employer" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Employers</span>
                <span className="text-xs opacity-70">{getTabCount('employer')}</span>
              </TabsTrigger>
            )}

            <TabsTrigger value="job" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Jobs</span>
              <span className="text-xs opacity-70">{getTabCount('job')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learner" className="space-y-4">
            <RoleTab role="learner" />
          </TabsContent>

          {canViewAdmins && (
            <TabsContent value="regulator" className="space-y-4">
              <RoleTab role="regulator" />
            </TabsContent>
          )}

          {canViewEmployers && (
            <TabsContent value="employer" className="space-y-4">
              <RoleTab role="employer" />
            </TabsContent>
          )}

          <TabsContent value="job" className="space-y-4">
            <JobsTab />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed right-6 bottom-6 z-50"
          >
            <Button
              onClick={scrollToTop}
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
