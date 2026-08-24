'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, LucideIcon, Edit3 } from 'lucide-react';

interface SummaryItem {
  label: string;
  value: string | number;
}

interface SectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconTextColor: string;
  isCompleted: boolean;
  stepNumber: number;
  summaryItems?: SummaryItem[];
  editHref: string;
}

export default function SectionCard({
  title,
  description,
  icon: Icon,
  iconBgColor,
  iconTextColor,
  isCompleted,
  stepNumber,
  summaryItems = [],
  editHref,
}: SectionCardProps) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl ${iconBgColor} ${iconTextColor} flex items-center justify-center shadow-sm`}>
            <Icon className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">
              Step {stepNumber}
            </span>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Completed ✓
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Incomplete →
              </span>
            )}
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
          {title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          {description}
        </p>

        {/* Summary Details if completed */}
        {isCompleted && summaryItems.length > 0 && (
          <div className="mb-6 p-3.5 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
            {summaryItems.map((item, idx) => (
              <div key={idx}>
                <span className="text-slate-600 block text-[11px] font-medium">{item.label}</span>
                <span className="font-semibold text-slate-900 font-mono truncate block">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="pt-2 border-t border-slate-100">
        <Link
          href={editHref}
          className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
            isCompleted
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
          }`}
        >
          {isCompleted ? (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </>
          ) : (
            <>
              <span>Complete Step {stepNumber}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </Link>
      </div>
    </div>
  );
}
