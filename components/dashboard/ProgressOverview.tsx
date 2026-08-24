'use client';

import React from 'react';
import Link from 'next/link';
import ProgressBar from '@/components/ui/ProgressBar';
import { ArrowRight, CheckCircle, Sparkles, UserCheck } from 'lucide-react';

interface ProgressOverviewProps {
  userName: string;
  completionPercentage: number;
  completedCardsCount: number;
  totalCardsCount: number;
}

export default function ProgressOverview({
  userName,
  completionPercentage,
  completedCardsCount,
  totalCardsCount,
}: ProgressOverviewProps) {
  const isComplete = completionPercentage === 100;

  // Visual ASCII-style progress preview: ████████░░
  const totalBlocks = 10;
  const filledBlocks = Math.round((completionPercentage / 100) * totalBlocks);
  const visualBar = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Greeting & Status */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider">
              Phase 1: Foundation & Profile
            </span>
            {isComplete && (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1 border border-emerald-200">
                <CheckCircle className="w-3 h-3" />
                Profile Complete
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            Welcome, {userName || 'Borrower'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {isComplete
              ? 'Your financial profile and preference weights are fully configured and ready for Phase 2 loan catalog matching.'
              : 'Complete the four profile dimensions below to establish your verified borrowing and preference model.'}
          </p>
        </div>

        {/* Right Side: CTA Button */}
        <div className="shrink-0 flex items-center gap-3">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm hover:shadow hover:scale-[1.02]"
          >
            <span>{isComplete ? 'Review & Edit Profile' : 'Continue Profile'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">
              Phase 1 Profile Completion
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-400 tracking-widest hidden sm:inline">
                {visualBar}
              </span>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                {completionPercentage}%
              </span>
            </div>
          </div>
          <ProgressBar progress={completionPercentage} showPercentage={false} size="md" />
        </div>

        <div className="md:col-span-4 flex items-center md:justify-end text-xs text-slate-500 font-medium">
          <span>
            <strong className="text-slate-800">{completedCardsCount}</strong> of{' '}
            <strong className="text-slate-800">{totalCardsCount}</strong> sections completed
          </span>
        </div>
      </div>
    </div>
  );
}
