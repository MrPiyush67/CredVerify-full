// SidebarItem.jsx

import { Link } from 'react-router';
import { motion } from 'framer-motion';

export default function SidebarItem({
  to,
  icon: Icon,
  label,
  active,
  onClick,
}) {
  return (
    <motion.li whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
      <Link
        to={to}
        onClick={onClick}
        className={`
          group flex h-11 items-center gap-3 rounded-xl px-3
          text-sm font-medium transition-all duration-200
          ${
            active
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }
        `}
      >
        <Icon
          className={`h-5 w-5 shrink-0 ${
            active
              ? 'text-primary-foreground'
              : 'text-muted-foreground group-hover:text-foreground'
          }`}
        />

        <span
          className={`truncate ${
            active
              ? 'text-primary-foreground'
              : 'text-muted-foreground group-hover:text-foreground'
          }`}
        >
          {label}
        </span>
      </Link>
    </motion.li>
  );
}
