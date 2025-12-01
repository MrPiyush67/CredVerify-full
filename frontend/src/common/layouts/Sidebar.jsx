import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@common';
import { selectUser, selectRole, logout } from '@features/auth/redux/authSlice.js';
import * as authApi from '@features/auth/api/authApi.js';
import { Home, BarChart3, Bell, User, Settings, MessageSquare, Briefcase, FileText, Menu, X, Award, Plus } from 'lucide-react';


export const navigationItems = {
  validant: [
    { label: 'Home', href: '/home' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Issue Credential', href: '/issue-credentials' },
    { label: 'Requests', href: '/requests' },
    { label: 'Profile', href: '/profile' },
    { label: 'Notifications', href: '/notifications' },
    { label: 'Settings', href: '/settings' },
    { label: 'Chat', href: '/chat' },
  ],
  curator: [
    { label: 'Home', href: '/home' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Post Job', href: '/post-job' },
    { label: 'Profile', href: '/profile' },
    { label: 'Notifications', href: '/notifications' },
    { label: 'Settings', href: '/settings' },
    { label: 'Chat', href: '/chat' },
  ],
  credentialist: [
    { label: 'Home', href: '/home' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Credentials', href: '/credentials' },
    { label: 'Add Credentials', href: '/credentials/add' },
    { label: 'Profile', href: '/profile' },
    { label: 'Notifications', href: '/notifications' },
    { label: 'Settings', href: '/settings' },
    { label: 'Chat', href: '/chat' },
  ],
};

const iconMap = {
  'Home': Home,
  'Dashboard': BarChart3,
  'Notifications': Bell,
  'Profile': User,
  'Settings': Settings,
  'Chat': MessageSquare,
  'Jobs': Briefcase,
  'Post Job': FileText,
  'Credentials': Award,
  'Add Credentials': Plus,
  'Requests': FileText,
  'Issue Credential': Plus,
};

const sidebarVariants = {
  hidden: { x: -320, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const navItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

// Mobile menu animations - always active
const mobileMenuVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { x: "-100%", transition: { duration: 0.3, ease: "easeIn" } }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export default function Sidebar({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const role = useSelector(selectRole) || 'credentialist';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isFirstRender = useRef(true);

  // Track if this is a page refresh vs navigation
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, []);

  const shouldAnimate = isFirstRender.current;

  const handleLogout = async (e) => {
    if (e) e.preventDefault();
    try {
      // Call server-side logout first to clear cookie
      try {
        await authApi.logout();
      } catch (err) {
        console.warn('Server logout failed, clearing local state anyway', err);
      }
      // Dispatch logout action to clear Redux state first
      dispatch(logout());
      localStorage.clear();
      sessionStorage.clear();

      // Navigate to landing page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear storage and navigate to landing even if logout fails
      localStorage.clear();
      sessionStorage.clear();
      navigate('/', { replace: true });
    }
  };

  // Don't show sidebar if user is not authenticated
  if (!user) {
    return <>{children}</>;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const SidebarContent = () => (
    <motion.div
      variants={shouldAnimate ? sidebarVariants : undefined}
      initial={shouldAnimate ? "hidden" : false}
      animate={shouldAnimate ? "visible" : false}
      className="h-full flex flex-col"
    >
      <div className="h-14 flex items-center justify-between px-4 border-b logo">
        <Link to="/" className="font-semibold">
          MicroCredentials
        </Link>
      </div>

      <nav className="flex-1 px-2 py-3">
        <ul className="space-y-1">
          {navigationItems[role].map((item, index) => {
            const active = location.pathname === item.href;
            const Icon = iconMap[item.label];

            return (
              <motion.li
                key={item.href}
                variants={shouldAnimate ? navItemVariants : undefined}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 text-inherit hover:bg-white/10 hover:translate-x-1 ${active ? 'bg-white/15 shadow-[0_4px_12px_rgba(0,0,0,0.1)]' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {Icon && (
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="h-4 w-4 mr-2 inline" />
                    </motion.div>
                  )}
                  {item.label}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <div className="sticky bottom-1 left-1 p-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            className="w-full bg-transparent text-[var(--sidebar-fg)] border-[var(--sidebar-fg)]/40 hover:bg-[var(--sidebar-fg)]/10"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );

  // Get theme class based on role
  const themeClass = role === 'credentialist' ? 'credentialist-theme' : role === 'curator' ? 'curator-theme' : 'validant-theme';

  return (
    <div className={`min-h-screen ${themeClass}`}>
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex w-64 flex-col bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] border-r text-center fixed top-0 left-0 h-screen overflow-y-auto z-30"
        initial={shouldAnimate ? { x: -320, opacity: 0 } : false}
        animate={shouldAnimate ? { x: 0, opacity: 1 } : false}
        transition={shouldAnimate ? { duration: 0.4, ease: "easeOut" } : undefined}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 md:hidden"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Overlay Background */}
              <motion.div
                className="fixed inset-0 bg-black/50"
                onClick={() => setIsMobileMenuOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* Mobile Sidebar */}
              <motion.aside
                className="fixed left-0 top-0 h-full w-64 flex-col bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] border-r text-center flex z-10"
                variants={mobileMenuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <SidebarContent />
              </motion.aside>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col md:ml-64">
        {/* Mobile Header with Menu Toggle */}
        <motion.div
          className="md:hidden flex items-center justify-between p-4 border-b bg-background"
          initial={shouldAnimate ? { y: -20, opacity: 0 } : false}
          animate={shouldAnimate ? { y: 0, opacity: 1 } : false}
          transition={shouldAnimate ? { duration: 0.3, delay: 0.1 } : undefined}
        >
          <Link to="/" className="font-semibold text-lg">
            MicroCredentials
          </Link>
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>

        <motion.main
          className="flex-1 p-4 pt-8 bg-background overflow-y-auto min-h-screen"
          initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
          animate={shouldAnimate ? { opacity: 1, y: 0 } : false}
          transition={shouldAnimate ? { duration: 0.4, delay: 0.2 } : undefined}
        >
          <div className="max-w-7xl mx-auto">{children}</div>
        </motion.main>
      </div>
    </div>
  );
}