'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getFullBorrowerProfile } from '@/services/loan/loanService';
import { BorrowerFullProfile } from '@/types/database';
import ProgressOverview from '@/components/dashboard/ProgressOverview';
import SectionCard from '@/components/dashboard/SectionCard';
import { formatINR, formatTenure } from '@/lib/utils';
import {
  User,
  IndianRupee,
  Home,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profileData, setProfileData] = useState<BorrowerFullProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        let currentUserId = '';
        let currentUserEmail = '';

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const { data, error } = await supabase.auth.getUser();
          if (error || !data.user) {
            router.push('/login?redirect=/dashboard');
            return;
          }
          currentUserId = data.user.id;
          currentUserEmail = data.user.email || '';
          setUser({ id: currentUserId, email: currentUserEmail });
        } else {
          // Demo fallback
          const stored = typeof window !== 'undefined' ? localStorage.getItem('loanfit_demo_user') : null;
          if (!stored) {
            router.push('/login?redirect=/dashboard');
            return;
          }
          const parsed = JSON.parse(stored);
          currentUserId = parsed.id || 'demo-user-123';
          currentUserEmail = parsed.email || 'borrower@demo.com';
          setUser({ id: currentUserId, email: currentUserEmail });
        }

        const fullProfile = await getFullBorrowerProfile(currentUserId);
        setProfileData(fullProfile);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-44 bg-slate-200/70 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-56 bg-slate-200/70 rounded-3xl" />
            <div className="h-56 bg-slate-200/70 rounded-3xl" />
            <div className="h-56 bg-slate-200/70 rounded-3xl" />
            <div className="h-56 bg-slate-200/70 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profileData) {
    return null;
  }

  const { profile, financialProfile, loanRequirement, preferences, completionPercentage } = profileData;

  const isPersonalComplete = Boolean(profile && profile.full_name && profile.age && profile.location);
  const isFinancialComplete = Boolean(
    financialProfile && financialProfile.monthly_income >= 10000 && financialProfile.monthly_expenses !== undefined
  );
  const isLoanComplete = Boolean(
    loanRequirement && loanRequirement.loan_type && loanRequirement.loan_amount > 0 && loanRequirement.tenure_months > 0
  );
  const isPreferencesComplete = Boolean(
    preferences &&
      preferences.cost_weight !== undefined &&
      preferences.emi_weight !== undefined
  );

  const completedCardsCount = [
    isPersonalComplete,
    isFinancialComplete,
    isLoanComplete,
    isPreferencesComplete,
  ].filter(Boolean).length;

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Borrower';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. Header Progress Bar Overview */}
      <ProgressOverview
        userName={displayName}
        completionPercentage={completionPercentage}
        completedCardsCount={completedCardsCount}
        totalCardsCount={4}
      />

      {/* 2. Four Interactive Assessment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Personal Profile */}
        <SectionCard
          title="Personal Information"
          description="Age, verified employment type, and current location for lender eligibility filters."
          icon={User}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
          isCompleted={isPersonalComplete}
          stepNumber={1}
          editHref="/profile?step=1"
          summaryItems={
            isPersonalComplete
              ? [
                  { label: 'Name', value: profile?.full_name || '' },
                  { label: 'Age', value: `${profile?.age || ''} yrs` },
                  { label: 'Employment', value: profile?.employment_type || '' },
                  { label: 'Location', value: profile?.location || '' },
                ]
              : []
          }
        />

        {/* Card 2: Financial Profile */}
        <SectionCard
          title="Financial Profile & CIBIL"
          description="Verifiable income, living expenses, existing loan EMIs, and credit score range."
          icon={IndianRupee}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
          isCompleted={isFinancialComplete}
          stepNumber={2}
          editHref="/profile?step=2"
          summaryItems={
            isFinancialComplete
              ? [
                  { label: 'Monthly Income', value: formatINR(financialProfile?.monthly_income) },
                  { label: 'Living Expenses', value: formatINR(financialProfile?.monthly_expenses) },
                  { label: 'Existing EMI', value: formatINR(financialProfile?.existing_emi || 0) },
                  {
                    label: 'CIBIL Score',
                    value: financialProfile?.credit_score ? `${financialProfile.credit_score}` : 'Unspecified',
                  },
                ]
              : []
          }
        />

        {/* Card 3: Loan Requirement */}
        <SectionCard
          title="Loan Requirements"
          description="Category (Home, Personal, Car, Education, Business), required capital and tenure."
          icon={Home}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
          isCompleted={isLoanComplete}
          stepNumber={3}
          editHref="/profile?step=0"
          summaryItems={
            isLoanComplete
              ? [
                  { label: 'Loan Type', value: loanRequirement?.loan_type || '' },
                  { label: 'Amount', value: formatINR(loanRequirement?.loan_amount) },
                  { label: 'Tenure', value: formatTenure(loanRequirement?.tenure_months) },
                ]
              : []
          }
        />

        {/* Card 4: Preferences */}
        <SectionCard
          title="Decision Preferences (MCDA)"
          description="Custom 0–100 sliders balancing total borrowing cost, monthly EMI, and terms flexibility."
          icon={Sliders}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
          isCompleted={isPreferencesComplete}
          stepNumber={4}
          editHref="/profile?step=3"
          summaryItems={
            isPreferencesComplete
              ? [
                  { label: 'Cost Priority', value: `${preferences?.cost_weight ?? 50}/100` },
                  { label: 'EMI Priority', value: `${preferences?.emi_weight ?? 50}/100` },
                  { label: 'Eligibility', value: `${preferences?.eligibility_weight ?? 50}/100` },
                  { label: 'Flexibility', value: `${preferences?.flexibility_weight ?? 50}/100` },
                ]
              : []
          }
        />
      </div>

      {/* 3. Comparison Action Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-base text-white">
              {isLoanComplete
                ? `Compare ${loanRequirement?.loan_type} Options`
                : 'Compare Institutional Loan Products'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            {isLoanComplete
              ? `Evaluate institutional rates, monthly EMIs, processing fees, and Known Borrowing Costs for your ${formatINR(loanRequirement?.loan_amount)} requirement.`
              : 'Compare verified loan rates, fees, and deterministic EMI calculations across major banks.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Link
            href="/compare"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
          >
            Compare Catalog
          </Link>
          <Link
            href="/recommendations"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-lg hover:shadow-blue-500/25 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>AI Recommendations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {completionPercentage < 100 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Continue your profile assessment
              </h4>
              <p className="text-xs text-slate-500">
                Complete the remaining {4 - completedCardsCount} section(s) to finalize your borrowing model.
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold text-center transition-all shadow-sm"
          >
            Continue Profile →
          </Link>
        </div>
      )}

      {/* Technical Leadership Badge */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="/images/adarsh_karpe.jpg"
            alt="Adarsh Karpe"
            className="w-10 h-10 rounded-full object-cover object-top ring-2 ring-blue-600/30 shadow-sm"
          />
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Adarsh Karpe</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Technical Head
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              LoanFit AI Platform Architecture & Decision Intelligence
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Systems Operational</span>
        </div>
      </div>
    </div>
  );
}
