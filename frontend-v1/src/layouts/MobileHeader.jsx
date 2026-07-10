// MobileHeader.jsx

import { Link } from 'react-router';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileHeader({ isOpen, onToggle }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
      <Link to="/home" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <ShieldCheck className="h-5 w-5" />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            CredVerify
          </span>

          <span className="text-[11px] text-muted-foreground">
            Digital Credentials
          </span>
        </div>
      </Link>

      <motion.button
        type="button"
        onClick={onToggle}
        whileTap={{ scale: 0.9 }}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </motion.button>
    </header>
  );
}
