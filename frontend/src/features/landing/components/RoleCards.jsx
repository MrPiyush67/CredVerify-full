import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Briefcase, ShieldCheck, ChevronRight } from 'lucide-react';

const ROLES = [
  {
    key: 'credentialist',
    title: 'Credentialist',
    desc: 'Manage & showcase verified credentials',
    theme: 'credentialist-theme'
  },
  {
    key: 'curator',
    title: 'Curator',
    desc: 'Post opportunities & discover talent',
    theme: 'curator-theme'
  },
  {
    key: 'validant',
    title: 'Validant',
    desc: 'Verify credentials with precision',
    theme: 'validant-theme'
  }
];

const ROLE_ICONS = {
  credentialist: User,
  curator: Briefcase,
  validant: ShieldCheck
};

const ROLE_COLORS = {
  credentialist: { primary: 'var(--credentialist-primary)', light: 'var(--credentialist-light)' },
  curator: { primary: 'var(--curator-primary)', light: 'var(--curator-light)' },
  validant: { primary: 'var(--validant-primary)', light: 'var(--validant-light)' }
};

const RoleCard = ({ role, index }) => {
  const { key, title, desc, theme } = role;
  const Icon = ROLE_ICONS[key];
  const colors = ROLE_COLORS[key];

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100, damping: 20 }}
      className={`group w-full ${theme}`}
      style={{
        '--primary': colors.primary,
        '--primary-light': colors.light
      }}
    >
      <Link to={`/login?role=${key}`} className="block relative">
        {/* Card Container */}
        <div className="relative overflow-hidden rounded-2xl bg-foreground/5 backdrop-blur-md border border-foreground/10 p-1 transition-all duration-500 hover:border-primary/50 hover:bg-foreground/10 hover:shadow-[0_0_40px_-10px_var(--primary)] hover:-translate-y-1">

          {/* Inner Content */}
          <div className="relative flex items-center gap-5 rounded-xl p-5 transition-colors">

            {/* Icon Section */}
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-foreground/5 ring-1 ring-foreground/10 transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-0 group-hover:scale-110 group-hover:rotate-3">
              <Icon size={26} strokeWidth={1.5} className="text-muted-foreground transition-colors duration-300 group-hover:text-primary-foreground" />
            </div>

            {/* Text Section */}
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-foreground tracking-wide group-hover:text-[var(--primary-light)] transition-colors duration-300">
                {title}
              </h3>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                {desc}
              </p>
            </div>

            {/* Action Indicator */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-foreground/5 text-muted-foreground transition-all duration-500 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
              <ChevronRight size={20} />
            </div>
          </div>

          {/* Shine Effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  );
};

const RoleCards = () => (
  <div className="flex flex-col gap-5 w-full mx-auto">
    {ROLES.map((role, index) => (
      <RoleCard key={role.key} role={role} index={index} />
    ))}
  </div>
);

export default RoleCards;
