import React, { useState, useEffect } from 'react';
import { Button } from '@common';
import { Briefcase, ShieldCheck, Users, ArrowUp, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@common/ui/tabs';
import PageHeader from '@common/components/PageHeader.jsx';
import RoleTab from '@features/home/components/RoleTab.jsx';
import JobsTab from '@features/home/components/JobsTab.jsx';
import CoursesTab from '@features/home/components/CoursesTab.jsx';
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
    jobs,
    credentialHistory
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
    let validTabs = [];

    if (userRole === 'learner') {
      validTabs = ['courses', 'job'];
    } else if (userRole === 'regulator') {
      validTabs = ['learner'];
    } else if (userRole === 'employer') {
      validTabs = ['learner', 'job'];
      if (canViewAdmins) validTabs.push('regulator');
      if (canViewEmployers) validTabs.push('employer');
    } else {
      // Default fallback
      validTabs = ['learner', 'job'];
      if (canViewAdmins) validTabs.push('regulator');
      if (canViewEmployers) validTabs.push('employer');
    }

    if (!validTabs.includes(tab)) {
      setTab(validTabs[0]); // Default to first valid tab
    }
  }, [tab, canViewAdmins, canViewEmployers, userRole]);

  // Simple count display - components will handle their own counts
  const getTabCount = (tabType) => {
    try {
      switch (tabType) {
        case 'learner':
          return `(${Array.isArray(users.data) ? users.data.length : 0})`;
        case 'regulator':
          return `(${Array.isArray(admins.data) ? admins.data.length : 0})`;
        case 'employer':
          return `(${Array.isArray(employers.data) ? employers.data.length : 0})`;
        case 'job':
          return `(${Array.isArray(jobs.data) ? jobs.data.length : 0})`;
        case 'courses':
          if (!Array.isArray(credentialHistory.data)) {
            return '(0)';
          }
          const verifiedCourses = credentialHistory.data.filter(
            c => c && c.verificationStatus === 'VERIFIED' &&
                 (c.type === 'certificate' || c.type === 'micro_credential')
          );
          return `(${verifiedCourses.length})`;
        default:
          return '';
      }
    } catch (error) {
      console.error('Error in getTabCount:', error);
      return '(0)';
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
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto">
            {/* Courses Tab - Learners Only */}
            {userRole === 'learner' && (
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Courses</span>
                <span className="text-xs opacity-70">{getTabCount('courses')}</span>
              </TabsTrigger>
            )}

            {/* Learners Tab - Not for Learners */}
            {userRole !== 'learner' && (
              <TabsTrigger value="learner" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Learners</span>
                <span className="text-xs opacity-70">{getTabCount('learner')}</span>
              </TabsTrigger>
            )}

            {/* Regulators Tab - Employers Only (if permitted) */}
            {userRole === 'employer' && canViewAdmins && (
              <TabsTrigger value="regulator" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Regulators</span>
                <span className="text-xs opacity-70">{getTabCount('regulator')}</span>
              </TabsTrigger>
            )}

            {/* Employers Tab - Employers Only */}
            {userRole === 'employer' && canViewEmployers && (
              <TabsTrigger value="employer" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Employers</span>
                <span className="text-xs opacity-70">{getTabCount('employer')}</span>
              </TabsTrigger>
            )}

            {/* Jobs Tab - Learners and Employers */}
            {(userRole === 'learner' || userRole === 'employer') && (
              <TabsTrigger value="job" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Jobs</span>
                <span className="text-xs opacity-70">{getTabCount('job')}</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Courses Tab Content - Learners Only */}
          {userRole === 'learner' && (
            <TabsContent value="courses" className="space-y-4">
              <CoursesTab />
            </TabsContent>
          )}

          {/* Learners Tab Content - Not for Learners */}
          {userRole !== 'learner' && (
            <TabsContent value="learner" className="space-y-4">
              <RoleTab role="learner" />
            </TabsContent>
          )}

          {/* Regulators Tab Content - Employers Only */}
          {userRole === 'employer' && canViewAdmins && (
            <TabsContent value="regulator" className="space-y-4">
              <RoleTab role="regulator" />
            </TabsContent>
          )}

          {/* Employers Tab Content - Employers Only */}
          {userRole === 'employer' && canViewEmployers && (
            <TabsContent value="employer" className="space-y-4">
              <RoleTab role="employer" />
            </TabsContent>
          )}

          {/* Jobs Tab Content - Learners and Employers */}
          {(userRole === 'learner' || userRole === 'employer') && (
            <TabsContent value="job" className="space-y-4">
              <JobsTab />
            </TabsContent>
          )}
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
