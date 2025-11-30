import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';

export default function PageHeader({ title, description, className, children }) {
  return (
    <motion.div
      className={cn("space-y-1.5 border-b border-border/40 mb-6", className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </motion.div>
  );
}
