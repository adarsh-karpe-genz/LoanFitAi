'use client';

import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  icon?: 'help' | 'info';
  children?: React.ReactNode;
}

export default function Tooltip({ content, icon = 'info', children }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-700 transition-colors p-0.5 rounded"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="More information"
      >
        {children || (
          icon === 'info' ? (
            <Info className="w-4 h-4 text-blue-500" />
          ) : (
            <HelpCircle className="w-4 h-4 text-slate-400" />
          )
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none leading-relaxed transition-opacity">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}
