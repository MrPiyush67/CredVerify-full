/**
 * Framer Motion animation variants for auth pages
 * Shared between LoginPage and SignupPage for consistent animations
 */

export const authPageContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

export const authPageItem = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};
