import React from 'react';
import { motion } from 'framer-motion';

export const BentoGrid = ({ children, className = "" }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {children}
    </div>
  );
};

export const BentoCard = ({ children, className = "", title, icon: Icon, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col ${className}`}
    >
      {(title || Icon) && (
        <div className="px-4 pt-4 pb-2 flex items-center gap-3 mb-1 border-b border-gray-50">
          {Icon && <div className="p-2 bg-gray-50 rounded-lg text-gray-700"><Icon size={18} /></div>}
          {title && <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>}
        </div>
      )}
      <div className="px-4 py-4 flex-1">
        {children}
      </div>
    </motion.div>
  );
};
