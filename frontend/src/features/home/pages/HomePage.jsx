<<<<<<< HEAD
import React, { useState, useId, useCallback, useEffect } from 'react';
import { Input, Button } from '@common';
import { Briefcase, ShieldCheck, Users, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
=======
import React, { useState, useEffect } from 'react';
import { Button } from '@common';
import { Briefcase, ShieldCheck, Users, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@common/ui/tabs';
>>>>>>> my-local-backup
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

<<<<<<< HEAD
  // Accessibility: tabs ids and keyboard navigation
  const tabIds = {
    learner: useId(),
    regulator: useId(),
    employer: useId(),
    job: useId(),
  };

  const onTabsKeyDown = useCallback((e) => {
    const order = ['learner', 'regulator', 'employer', 'job'];
    const idx = order.indexOf(tab);
    if (e.key === 'ArrowRight') {
      setTab(order[(idx + 1) % order.length]);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      setTab(order[(idx - 1 + order.length) % order.length]);
      e.preventDefault();
    }
  }, [tab]);

=======
>>>>>>> my-local-backup
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

<<<<<<< HEAD
      {/* Tabs */}
      <motion.div
        className="space-y-3"
=======
      {/* Tabs with shadcn */}
      <motion.div
>>>>>>> my-local-backup
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
<<<<<<< HEAD
        <div className="flex items-center gap-2" role="tablist" aria-label="Home tabs" onKeyDown={onTabsKeyDown}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              role="tab"
              aria-selected={tab === 'learner'}
              aria-controls={tabIds.learner}
              variant={tab === 'learner' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTab('learner')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Learners {getTabCount('learner')}
            </Button>
          </motion.div>

          {canViewAdmins && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                role="tab"
                aria-selected={tab === 'regulator'}
                aria-controls={tabIds.regulator}
                variant={tab === 'regulator' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTab('regulator')}
                className="flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                Regulators {getTabCount('regulator')}
              </Button>
            </motion.div>
          )}

          {canViewEmployers && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                role="tab"
                aria-selected={tab === 'employer'}
                aria-controls={tabIds.employer}
                variant={tab === 'employer' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTab('employer')}
                className="flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Employers {getTabCount('employer')}
              </Button>
            </motion.div>
          )}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              role="tab"
              aria-selected={tab === 'job'}
              aria-controls={tabIds.job}
              variant={tab === 'job' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTab('job')}
              className="flex items-center gap-2"
            >
              <Briefcase className="h-4 w-4" />
              Jobs {getTabCount('job')}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Tab content */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {tab === 'learner' && (
          <RoleTab
            role="learner"
            id={tabIds.learner}
            tabpanelProps={{
              role: "tabpanel",
              "aria-label": "Learners tab"
            }}
          />
        )}

        {tab === 'regulator' && canViewAdmins && (
          <RoleTab
            role="regulator"
            id={tabIds.regulator}
            tabpanelProps={{
              role: "tabpanel",
              "aria-label": "Regulators tab"
            }}
          />
        )}

        {tab === 'employer' && canViewEmployers && (
          <RoleTab
            role="employer"
            id={tabIds.employer}
            tabpanelProps={{
              role: "tabpanel",
              "aria-label": "Employers tab"
            }}
          />
        )}

        {tab === 'job' && (
          <JobsTab
            id={tabIds.job}
            tabpanelProps={{
              role: "tabpanel",
              "aria-label": "Jobs tab"
            }}
          />
        )}
=======
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
>>>>>>> my-local-backup
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
<<<<<<< HEAD

=======
>>>>>>> my-local-backup
