import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';

import { plans } from './plans';

import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 32,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function PremiumPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="h-full flex flex-col justify-center items-center">
      {/* Header */}

      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="space-y-3 text-center mb-4"
      >
        <h1 className="text-3xl font-medium tracking-tight lg:text-4xl">
          Choose the <span className="font-bold">Perfect Plan</span>
        </h1>

        <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
          Unlock AI-powered tools, premium profile visibility and exclusive
          features to accelerate your learning journey.
        </p>
      </motion.div>

      {/* Billing */}

      <div className="flex justify-center mb-14">
        <div className="flex items-center gap-3 rounded-full border bg-background px-4 py-2 shadow-sm">
          <span
            onClick={() => setAnnual(false)}
            className={`cursor-pointer text-sm transition ${
              !annual
                ? 'font-semibold text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            Monthly
          </span>

          <button
            onClick={() => setAnnual((v) => !v)}
            className={`relative h-5 w-10 rounded-full transition ${
              annual ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <motion.span
              layout
              transition={{
                type: 'spring',
                stiffness: 700,
                damping: 38,
              }}
              className="absolute top-0.5 h-4 w-4 rounded-full bg-white"
              style={{
                left: annual ? 'calc(100% - 18px)' : '2px',
              }}
            />
          </button>

          <span
            onClick={() => setAnnual(true)}
            className={`cursor-pointer text-sm transition ${
              annual ? 'font-semibold text-foreground' : 'text-muted-foreground'
            }`}
          >
            Annually
          </span>

          <AnimatePresence>
            {annual && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="rounded-md border border-emerald-300 bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
              >
                Save 20%
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cards */}
      {/*
        `items-end` (instead of the default stretch) lets each card size to
        its own content rather than being forced to match its neighbors'
        height. Combined with the negative margin on the highlighted card
        below, that's what produces the "raised middle card" look — no
        card is artificially stretched to fake it.
      */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 items-end gap-6 lg:grid-cols-3"
      >
        {plans.map((plan) => {
          const Icon = plan.icon;

          return (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              whileHover={{
                y: plan.highlight ? -14 : -8,
                boxShadow: plan.dark
                  ? '0 24px 55px -12px rgba(0,0,0,0.45)'
                  : '0 16px 40px -12px rgba(0,0,0,0.12)',
                transition: { type: 'spring', stiffness: 300, damping: 20 },
              }}
              className={`relative flex flex-col rounded-2xl border bg-card p-6 ${
                plan.highlight ? '-mt-4 lg:-mt-6' : ''
              } ${
                plan.highlight
                  ? 'border-primary shadow-lg ring-1 ring-primary/20'
                  : 'shadow-sm'
              } ${
                plan.dark
                  ? 'border-primary bg-primary text-primary-foreground'
                  : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-md border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                  {plan.badge}
                </div>
              )}

              {/* Header */}

              <div className="mb-4 flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    plan.dark ? 'bg-white/10' : 'bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <p className="text-sm font-semibold">{plan.name}</p>
              </div>

              {/* Price */}

              <div className="mb-2 flex items-end gap-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={annual ? 'annual' : 'monthly'}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-3xl font-bold leading-none tracking-tight lg:text-4xl"
                  >
                    ₹{annual ? plan.annualPrice : plan.monthlyPrice}
                  </motion.span>
                </AnimatePresence>

                <span
                  className={`mb-1 text-[11px] ${
                    plan.dark
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  }`}
                >
                  /month
                </span>
              </div>

              <p
                className={`mb-4 text-xs leading-relaxed ${
                  plan.dark
                    ? 'text-primary-foreground/75'
                    : 'text-muted-foreground'
                }`}
              >
                {plan.description}
              </p>

              <div
                className={`mb-4 h-px ${
                  plan.dark ? 'bg-white/10' : 'bg-border'
                }`}
              />

              {/* Features */}

              <ul className="mb-6 flex flex-col gap-2">
                {plan.features.map((feature, index) => {
                  const FeatureIcon = feature.icon;

                  return (
                    <motion.li
                      key={feature.title}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.04 }}
                      className="flex items-start gap-2"
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md ${
                          plan.dark ? 'bg-white/10' : 'bg-muted'
                        }`}
                      >
                        <Check className="h-2.5 w-2.5" />
                      </span>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <FeatureIcon className="h-3.5 w-3.5 opacity-70" />

                          <span className="text-xs font-medium">
                            {feature.title}
                          </span>
                        </div>

                        {feature.description && (
                          <p
                            className={`text-[11px] leading-relaxed ${
                              plan.dark
                                ? 'text-primary-foreground/65'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {feature.description}
                          </p>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </ul>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="mt-auto"
              >
                <Button
                  variant={
                    plan.dark
                      ? 'secondary'
                      : plan.id === 'free'
                        ? 'default'
                        : 'outline'
                  }
                  className={`h-9 w-full rounded-lg text-sm font-semibold ${
                    plan.dark
                      ? 'bg-background text-foreground hover:bg-background/90'
                      : ''
                  }`}
                  onClick={() => toast('Coming soon!')}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
