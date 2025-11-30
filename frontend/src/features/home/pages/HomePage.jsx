import React, { useState, useId, useCallback, useEffect } from 'react';
import { Input, Button } from '@common';
import { Briefcase, ShieldCheck, Users, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@common/components/PageHeader.jsx';
import RoleTab from '@features/home/components/RoleTab.jsx';
import JobsTab from '@features/home/components/JobsTab.jsx';
import { useHome } from '../hooks/useHome.js';

export default function HomePage() {
  const [tab, setTab] = useState('credentialist');
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
    const validTabs = ['credentialist', 'job'];
    if (canViewAdmins) validTabs.push('validant');
    if (canViewEmployers) validTabs.push('curator');

    if (!validTabs.includes(tab)) {
      setTab('credentialist'); // Default to credentialist tab
    }
  }, [tab, canViewAdmins, canViewEmployers]);

  // Accessibility: tabs ids and keyboard navigation
  const tabIds = {
    credentialist: useId(),
    validant: useId(),
    curator: useId(),
    job: useId(),
  };

  const onTabsKeyDown = useCallback((e) => {
    const order = ['credentialist', 'validant', 'curator', 'job'];
    const idx = order.indexOf(tab);
    if (e.key === 'ArrowRight') {
      setTab(order[(idx + 1) % order.length]);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      setTab(order[(idx - 1 + order.length) % order.length]);
      e.preventDefault();
    }
  }, [tab]);

  // Simple count display - components will handle their own counts
  const getTabCount = (tabType) => {
    switch (tabType) {
      case 'credentialist':
        return `(${users.data?.length || 0})`;
      case 'validant':
        return `(${admins.data?.length || 0})`;
      case 'curator':
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

      {/* Tabs */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center gap-2" role="tablist" aria-label="Home tabs" onKeyDown={onTabsKeyDown}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              role="tab"
              aria-selected={tab === 'credentialist'}
              aria-controls={tabIds.credentialist}
              variant={tab === 'credentialist' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTab('credentialist')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Credentialists {getTabCount('credentialist')}
            </Button>
          </motion.div>

          {canViewAdmins && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                role="tab"
                aria-selected={tab === 'validant'}
                aria-controls={tabIds.validant}
                variant={tab === 'validant' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTab('validant')}
                className="flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                Validants {getTabCount('validant')}
              </Button>
            </motion.div>
          )}

          {canViewEmployers && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                role="tab"
                aria-selected={tab === 'curator'}
                aria-controls={tabIds.curator}
                variant={tab === 'curator' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTab('curator')}
                className="flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Curators {getTabCount('curator')}
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
        {tab === 'credentialist' && (
          <RoleTab
            role="credentialist"
            id={tabIds.credentialist}
            tabpanelProps={{
              role: "tabpanel",
              "aria-label": "Credentialists tab"
            }}
          />
        )}

        {tab === 'validant' && canViewAdmins && (
          <RoleTab
            role="validant"
            id={tabIds.validant}
            tabpanelProps={{
              role: "tabpanel",
              "aria-label": "Validants tab"
            }}
          />
        )}

        {tab === 'curator' && canViewEmployers && (
          <RoleTab
            role="curator"
            id={tabIds.curator}
            tabpanelProps={{
              role: "tabpanel",
              "aria-label": "Curators tab"
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

