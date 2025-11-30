import React, { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap, Award, Shield } from 'lucide-react';
import RoleCards from '../components/RoleCards';
import LiquidSideBackground from '../components/LiquidSideBackground';

// Animation variants
const titleVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { delay: 0.4 }
};

const subtitleVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { delay: 0.6 }
};

// Feature Pills constants
const FEATURES = [
  { text: 'Blockchain Secured', color: 'var(--credentialist-primary)' },
  { text: 'Instant Verification', color: 'var(--curator-primary)' },
  { text: 'Trusted Credentials', color: 'var(--validant-primary)' },
  { text: 'Privacy Protected', color: 'var(--credentialist-primary)' }
];

const featurePillVariant = (idx) => ({
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { delay: 0.8 + idx * 0.1 }
});

const FEATURE_ICONS = { 0: Lock, 1: Zap, 2: Award, 3: Shield };

// Inline FeaturePills component
const FeaturePills = React.memo(() => (
  <div className="flex flex-wrap gap-2 justify-center mt-4">
    {FEATURES.map((feature, idx) => {
      const Icon = FEATURE_ICONS[idx];
      return (
        <motion.div
          key={idx}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-muted/30 border border-border/50 rounded-3xl text-foreground text-sm font-medium backdrop-blur-md cursor-pointer transition-all"
          {...featurePillVariant(idx)}
          whileHover={{
            scale: 1.05,
            y: -2,
            backgroundColor: 'var(--accent)',
            borderColor: 'var(--border)'
          }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: `var(--validant-primary)` }} />
          <span>{feature.text}</span>
        </motion.div>
      );
    })}
  </div>
));

FeaturePills.displayName = 'FeaturePills';

// Lazy load the heavy HologramScene component
const HologramScene = lazy(() => import('../components/HologramScene'));

export default function LandingPage() {

  return (
    <div className="bg-landing-bg text-landing-fg h-screen flex relative overflow-hidden">
      <LiquidSideBackground />

      {/* Left Side - Cards */}
      <div className="flex-1 flex items-center justify-center px-8 py-8 z-10 overflow-y-auto">
        <motion.div
          className="max-w-lg w-full"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >

            <motion.h1
              className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 leading-tight tracking-tight flex items-center justify-center flex-wrap gap-2"
              {...titleVariant}
            >
              Welcome to{' '}
              <motion.span
                className="brand-highlight relative inline-block"
              >
                CredVerify
              </motion.span>
              <motion.span
                className="inline-block"
              >
                <motion.img
                  src="/logo.png"
                  alt="CredVerify Logo"
                  className="h-8 w-auto inline-block ml-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                />
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-base text-muted-foreground font-normal leading-relaxed max-w-md mx-auto mb-4"
              {...subtitleVariant}
            >
              The future of credential verification - secure, instant, and blockchain-powered
            </motion.p>

            <FeaturePills />
          </motion.div>

          {/* Who Are You Section */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center tracking-tight"
            >
              <span className="title-accent">Choose</span> Your Role
            </motion.h2>

            <RoleCards />
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Hologram */}
      <div className="flex-1 relative flex items-center justify-center p-8">
        <Suspense fallback={
          <div className="flex items-center justify-center w-full h-full text-white/50 text-base animate-pulse">
            Loading...
          </div>
        }>
          <HologramScene />
        </Suspense>
      </div>
    </div>
  );
}
