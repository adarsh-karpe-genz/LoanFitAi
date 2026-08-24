'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getFullBorrowerProfile } from '@/services/loan/loanService';
import {
  upsertProfile,
  upsertFinancialProfile,
} from '@/services/profile/profileService';
import {
  upsertLoanRequirement,
  upsertUserPreferences,
} from '@/services/loan/loanService';
import { BorrowerFullProfile } from '@/types/database';
import {
  PersonalProfileInput,
  FinancialProfileInput,
  LoanRequirementInput,
  UserPreferencesInput,
} from '@/lib/validation/schemas';
import PersonalProfileForm from '@/components/forms/PersonalProfileForm';
import FinancialProfileForm from '@/components/forms/FinancialProfileForm';
import LoanRequirementForm from '@/components/forms/LoanRequirementForm';
import UserPreferencesForm from '@/components/forms/UserPreferencesForm';
import ReviewSummary from '@/components/forms/ReviewSummary';
import {
  Home,
  User,
  IndianRupee,
  Sliders,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

const steps = [
  { id: 0, title: 'Loan Category & Terms', shortTitle: 'Loan Terms', icon: Home },
  { id: 1, title: 'Personal Information', shortTitle: 'Personal', icon: User },
  { id: 2, title: 'Financial Profile & CIBIL', shortTitle: 'Financials', icon: IndianRupee },
  { id: 3, title: 'Decision Preferences', shortTitle: 'Preferences', icon: Sliders },
  { id: 4, title: 'Review & Confirm', shortTitle: 'Review', icon: CheckCircle2 },
];

function ProfileWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');

  const [currentStep, setCurrentStep] = useState<number>(
    stepParam !== null ? parseInt(stepParam, 10) || 0 : 0
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<BorrowerFullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        let currentUserId = '';
        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const { data, error } = await supabase.auth.getUser();
          if (error || !data.user) {
            router.push('/login?redirect=/profile');
            return;
          }
          currentUserId = data.user.id;
        } else {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('loanfit_demo_user') : null;
          if (!stored) {
            router.push('/login?redirect=/profile');
            return;
          }
          currentUserId = JSON.parse(stored).id || 'demo-user-123';
        }

        setUserId(currentUserId);
        const data = await getFullBorrowerProfile(currentUserId);
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  useEffect(() => {
    if (stepParam !== null) {
      const parsed = parseInt(stepParam, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 4) {
        setCurrentStep(parsed);
      }
    }
  }, [stepParam]);

  const refreshData = async () => {
    if (!userId) return;
    const data = await getFullBorrowerProfile(userId);
    setProfileData(data);
  };

  const handleSaveLoanRequirements = async (input: LoanRequirementInput) => {
    if (!userId) return;
    setSaving(true);
    try {
      await upsertLoanRequirement(userId, input);
      await refreshData();
    } finally {
      setSaving(false);
    }
  };

  const handleSavePersonalProfile = async (input: PersonalProfileInput) => {
    if (!userId) return;
    setSaving(true);
    try {
      await upsertProfile(userId, input);
      await refreshData();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFinancialProfile = async (input: FinancialProfileInput) => {
    if (!userId) return;
    setSaving(true);
    try {
      await upsertFinancialProfile(userId, input);
      await refreshData();
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (input: UserPreferencesInput) => {
    if (!userId) return;
    setSaving(true);
    try {
      await upsertUserPreferences(userId, input);
      await refreshData();
    } finally {
      setSaving(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await refreshData();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-slate-200/70 rounded-3xl" />
          <div className="h-96 bg-slate-200/70 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!userId || !profileData) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Breadcrumb & Step Tracker */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-xs font-semibold text-slate-500">
            Step {currentStep + 1} of {steps.length}: <strong className="text-slate-800">{steps[currentStep].title}</strong>
          </span>
        </div>

        {/* Step Navigation Pills */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {steps.map((step) => {
            const isCurrent = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={`py-3 px-2 rounded-2xl border text-center transition-all flex flex-col sm:flex-row items-center justify-center gap-2 ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-1 ring-blue-500/20'
                    : isCompleted
                    ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    : 'border-slate-100 bg-slate-50/70 text-slate-400 hover:bg-slate-100/50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-[11px] font-semibold hidden md:inline truncate">
                  {step.shortTitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-card">
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-xl font-display font-bold text-slate-900">
                Loan Purpose & Desired Terms
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your loan category, required financing amount, and preferred tenure.
              </p>
            </div>
            <LoanRequirementForm
              initialData={profileData.loanRequirement}
              onSave={handleSaveLoanRequirements}
              onNext={() => setCurrentStep(1)}
              isLoading={saving}
            />
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-xl font-display font-bold text-slate-900">
                Personal Information
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Essential identity and employment details to evaluate initial lender eligibility criteria.
              </p>
            </div>
            <PersonalProfileForm
              initialData={profileData.profile}
              onSave={handleSavePersonalProfile}
              onNext={() => setCurrentStep(2)}
              isLoading={saving}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-xl font-display font-bold text-slate-900">
                Financial Profile & CIBIL Standing
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Your monthly earnings, living obligations, and existing EMIs will calculate your sustainable borrowing headroom.
              </p>
            </div>
            <FinancialProfileForm
              initialData={profileData.financialProfile}
              onSave={handleSaveFinancialProfile}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
              isLoading={saving}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-xl font-display font-bold text-slate-900">
                Decision Preferences (MCDA Criteria)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Indicate what matters most to your financial goals: lowest total cost, lower monthly EMI, higher eligibility, or prepayment flexibility.
              </p>
            </div>
            <UserPreferencesForm
              initialData={profileData.preferences}
              onSave={handleSavePreferences}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
              isLoading={saving}
            />
          </div>
        )}

        {currentStep === 4 && (
          <ReviewSummary
            data={profileData}
            onEditSection={(stepIdx) => setCurrentStep(stepIdx)}
            onSubmitProfile={handleFinalSubmit}
            isLoading={saving}
          />
        )}
      </div>
    </div>
  );
}

export default function ProfileWizardPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-12"><div className="h-96 bg-slate-100 animate-pulse rounded-3xl" /></div>}>
      <ProfileWizardContent />
    </Suspense>
  );
}
