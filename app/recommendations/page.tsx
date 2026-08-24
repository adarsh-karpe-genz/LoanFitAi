'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getFullBorrowerProfile } from '@/services/loan/loanService';
import {
  BorrowerFullProfile,
  RecommendationResponse,
  SimulationPayload,
} from '@/types/database';
import { DEFAULT_WEIGHTS } from '@/lib/services/recommendationEngine';
import WhatIfSimulator from '@/components/recommendation/WhatIfSimulator';
import PersonalizedRankingDashboard from '@/components/recommendation/PersonalizedRankingDashboard';
import AiAdvisorSidebar from '@/components/ai/AiAdvisorSidebar';
import AccountAggregatorConsent from '@/components/ai/AccountAggregatorConsent';
import {
  Sparkles,
  Zap,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Building2,
  Edit3,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Bot,
  FileCheck,
} from 'lucide-react';

function RecommendationsContent() {
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<BorrowerFullProfile | null>(null);
  const [recommendationData, setRecommendationData] = useState<RecommendationResponse | null>(null);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [isAccountAggregatorOpen, setIsAccountAggregatorOpen] = useState<boolean>(false);

  // Initial Simulation payload based on saved borrower profile
  const [initialPayload, setInitialPayload] = useState<SimulationPayload>({
    loanType: 'Home Loan',
    amount: 3000000,
    tenureMonths: 240,
    monthlyIncome: 60000,
    existingEMI: 0,
    creditScore: 750,
    weights: DEFAULT_WEIGHTS,
    maxFOIR: 0.60,
  });

  // Load Saved Profile Recommendations on Mount
  const loadSavedProfile = useCallback(async () => {
    setLoading(true);
    try {
      let currentUserId = '';
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          currentUserId = data.user.id;
        }
      } else {
        const demoUser = typeof window !== 'undefined' ? localStorage.getItem('loanfit_demo_user') : null;
        if (demoUser) {
          currentUserId = JSON.parse(demoUser).id || 'demo-user-123';
        }
      }

      let fullProfile: BorrowerFullProfile | null = null;
      if (currentUserId) {
        fullProfile = await getFullBorrowerProfile(currentUserId);
        setProfileData(fullProfile);
      }

      const req = fullProfile?.loanRequirement;
      const fin = fullProfile?.financialProfile;
      const pref = fullProfile?.preferences;

      const payload: SimulationPayload = {
        loanType: req?.loan_type || 'Home Loan',
        amount: req?.loan_amount || 3000000,
        tenureMonths: req?.tenure_months || 240,
        monthlyIncome: fin?.monthly_income || 60000,
        existingEMI: fin?.existing_emi || 0,
        creditScore: fin?.credit_score ?? 750,
        weights: pref
          ? {
              costWeight: (pref.cost_weight || 60) / 100,
              feeWeight: (pref.fee_weight || 20) / 100,
              eligibilityWeight: (pref.eligibility_weight || 20) / 100,
            }
          : DEFAULT_WEIGHTS,
        maxFOIR: 0.60,
      };

      setInitialPayload(payload);

      // Call Recommendation API
      const res = await fetch('/api/v1/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId || undefined,
          loanType: payload.loanType,
          loanAmount: payload.amount,
          tenureMonths: payload.tenureMonths,
          monthlyIncome: payload.monthlyIncome,
          existingEMI: payload.existingEMI,
          creditScore: payload.creditScore,
          weights: payload.weights,
        }),
      });

      if (res.ok) {
        const data: RecommendationResponse = await res.json();
        setRecommendationData(data);
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedProfile();
  }, [loadSavedProfile]);

  // Real-time What-If Simulation Handler (Stateless)
  const handleSimulation = useCallback(async (payload: SimulationPayload) => {
    setSimulating(true);
    try {
      const res = await fetch('/api/v1/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data: RecommendationResponse = await res.json();
        setRecommendationData(data);
      }
    } catch (err) {
      console.error('Error running simulation:', err);
    } finally {
      setSimulating(false);
    }
  }, []);

  const handleConsentComplete = (data: { verifiedIncome: number; verifiedEMI: number }) => {
    handleSimulation({
      ...initialPayload,
      monthlyIncome: data.verifiedIncome,
      existingEMI: data.verifiedEMI,
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-32 bg-slate-200/70 animate-pulse rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 h-96 bg-slate-200/70 animate-pulse rounded-3xl" />
          <div className="lg:col-span-7 h-96 bg-slate-200/70 animate-pulse rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-400/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 4: AI & XAI Engine</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Gemini 2.5 Flash • Explainable AI • RAG
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Personalized Loan Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Our deterministic mathematical model evaluates all institutional loan products across Net Cost of Borrowing, upfront fees, and your credit buffer to rank the most suitable options.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          {/* Account Aggregator Button */}
          <button
            type="button"
            onClick={() => setIsAccountAggregatorOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all"
            title="Connect bank statement via Account Aggregator"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auto-Verify (AA)</span>
          </button>

          {/* Chatbot Toggle Button */}
          <button
            type="button"
            onClick={() => setIsAdvisorOpen(!isAdvisorOpen)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-lg hover:shadow-blue-500/25"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{isAdvisorOpen ? 'Close AI Advisor' : 'Ask AI Advisor'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Simulator + Ranked Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive What-If Simulator (5 Columns) */}
        <div className="lg:col-span-5 sticky top-24">
          <WhatIfSimulator
            initialPayload={initialPayload}
            onSimulate={handleSimulation}
            isLoading={simulating}
            onResetToSavedProfile={loadSavedProfile}
          />
        </div>

        {/* Right Column: Ranked Recommendations (7 Columns) */}
        <div className="lg:col-span-7">
          {recommendationData && (
            <PersonalizedRankingDashboard data={recommendationData} />
          )}
        </div>
      </div>

      {/* 3. Persistent AI Advisor Sidebar */}
      {recommendationData && (
        <AiAdvisorSidebar
          recommendations={recommendationData.recommendations}
          borrowerContext={recommendationData.borrowerContext}
          isOpen={isAdvisorOpen}
          onToggle={() => setIsAdvisorOpen(!isAdvisorOpen)}
        />
      )}

      {/* 4. Account Aggregator Consent Flow Modal */}
      <AccountAggregatorConsent
        isOpen={isAccountAggregatorOpen}
        onClose={() => setIsAccountAggregatorOpen(false)}
        onConsentComplete={handleConsentComplete}
      />
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="h-96 bg-slate-100 animate-pulse rounded-3xl" />
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}
