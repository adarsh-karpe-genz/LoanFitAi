'use client';

import React, { useState } from 'react';
import { BorrowerFullProfile } from '@/types/database';
import { formatINR, formatTenure } from '@/lib/utils';
import {
  User,
  IndianRupee,
  Sliders,
  FileText,
  CheckCircle2,
  Edit2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Home,
  Check,
} from 'lucide-react';
import Link from 'next/link';

interface ReviewSummaryProps {
  data: BorrowerFullProfile;
  onEditSection: (stepIndex: number) => void;
  onSubmitProfile: () => Promise<void>;
  isLoading?: boolean;
}

export default function ReviewSummary({
  data,
  onEditSection,
  onSubmitProfile,
  isLoading = false,
}: ReviewSummaryProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setError(null);
      await onSubmitProfile();
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit profile.');
    }
  };

  const { profile, financialProfile, loanRequirement, preferences } = data;

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6 max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-slate-900">
            Your profile is ready.
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            LoanFit AI will use your profile to compare suitable loan options in the next stage.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Profile Summary Confirmed</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div>
              <span className="text-slate-600 font-medium block">Borrower:</span>
              <span className="font-semibold text-slate-900">{profile?.full_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-600 font-medium block">Selected Loan:</span>
              <span className="font-semibold text-slate-900">{loanRequirement?.loan_type || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-600 font-medium block">Requested Amount:</span>
              <span className="font-semibold text-slate-900">{formatINR(loanRequirement?.loan_amount)}</span>
            </div>
            <div>
              <span className="text-slate-600 font-medium block">Tenure:</span>
              <span className="font-semibold text-slate-900">{formatTenure(loanRequirement?.tenure_months)}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Header Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">
            Review Your Financial Snapshot
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify all details before finalizing. You can edit any section at any time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
            Ready for Verification
          </span>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Personal Profile Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditSection(1)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-600 font-medium block mb-0.5">Full Name</span>
              <span className="font-semibold text-slate-900">{profile?.full_name || '—'}</span>
            </div>
            <div>
              <span className="text-slate-600 font-medium block mb-0.5">Age</span>
              <span className="font-semibold text-slate-900">{profile?.age ? `${profile.age} Years` : '—'}</span>
            </div>
            <div>
              <span className="text-slate-600 font-medium block mb-0.5">Employment</span>
              <span className="font-semibold text-slate-900">{profile?.employment_type || '—'}</span>
            </div>
            <div>
              <span className="text-slate-600 font-medium block mb-0.5">Location</span>
              <span className="font-semibold text-slate-900">{profile?.location || '—'}</span>
            </div>
          </div>
        </div>

        {/* 2. Financial Profile Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Financial Profile</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditSection(2)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-600 font-medium block mb-0.5">Monthly Income</span>
              <span className="font-semibold font-mono text-slate-900">
                {financialProfile?.monthly_income ? formatINR(financialProfile.monthly_income) : '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-600 font-medium block mb-0.5">Monthly Expenses</span>
              <span className="font-semibold font-mono text-slate-900">
                {financialProfile?.monthly_expenses !== undefined ? formatINR(financialProfile.monthly_expenses) : '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-600 font-medium block mb-0.5">Existing EMIs</span>
              <span className="font-semibold font-mono text-slate-900">
                {financialProfile?.existing_emi !== undefined ? formatINR(financialProfile.existing_emi) : '₹0'}
              </span>
            </div>
            <div>
              <span className="text-slate-600 font-medium block mb-0.5">CIBIL / Credit Score</span>
              <span className="font-semibold font-mono text-blue-700">
                {financialProfile?.credit_score ? `${financialProfile.credit_score}` : 'Unspecified / Default Tier'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Loan Requirement Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Loan Requirements</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditSection(0)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-600 font-medium block mb-0.5">Loan Category</span>
              <span className="font-semibold text-slate-900">{loanRequirement?.loan_type || '—'}</span>
            </div>
            <div>
              <span className="text-slate-600 font-medium block mb-0.5">Requested Amount</span>
              <span className="font-semibold font-mono text-blue-700">
                {loanRequirement?.loan_amount ? formatINR(loanRequirement.loan_amount) : '—'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-600 font-medium block mb-0.5">Preferred Tenure</span>
              <span className="font-semibold text-slate-900">
                {loanRequirement?.tenure_months ? formatTenure(loanRequirement.tenure_months) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* 4. User Preferences Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Decision Preferences (MCDA)</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditSection(3)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Lowest Total Cost:</span>
              <span className="font-mono font-bold text-slate-900">{preferences?.cost_weight ?? 50}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Lowest Monthly EMI:</span>
              <span className="font-mono font-bold text-slate-900">{preferences?.emi_weight ?? 50}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Higher Eligibility:</span>
              <span className="font-mono font-bold text-slate-900">{preferences?.eligibility_weight ?? 50}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Lower Fees:</span>
              <span className="font-mono font-bold text-slate-900">{preferences?.fee_weight ?? 50}/100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Flexibility & Prepayment:</span>
              <span className="font-mono font-bold text-slate-900">{preferences?.flexibility_weight ?? 50}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Final Submit Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-white">
            Ready to finalize Phase 1 Borrower Profile?
          </h4>
          <p className="text-xs text-slate-400 max-w-lg">
            Your encrypted financial parameters and preference weights will be securely saved under your private user partition.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 shrink-0"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting Profile...
            </span>
          ) : (
            'Submit Profile & Complete'
          )}
        </button>
      </div>
    </div>
  );
}
