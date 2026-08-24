'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Lock,
  Search,
  Scale,
  Sparkles,
  HelpCircle,
  TrendingDown,
  Percent,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200/60">
        {/* Subtle background ambient mesh elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[15%] w-[35rem] h-[35rem] rounded-full bg-blue-100/40 blur-3xl" />
          <div className="absolute top-[30%] right-[10%] w-[30rem] h-[30rem] rounded-full bg-indigo-100/30 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Multi-Dimensional Loan Fit & Affordability</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Find the loan that <span className="text-blue-600">fits you.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              LoanFit AI compares loan options based on your financial profile, affordability, total cost and personal preferences.
            </p>

            {/* Tagline Callout */}
            <p className="text-xs sm:text-sm font-semibold text-slate-800 italic">
              &ldquo;Find the loan that fits you — not just the lowest interest rate.&rdquo;
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-slate-900/10"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-slate-700 border border-slate-200 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                How it Works
              </a>
            </div>

            {/* Mandatory Informational Disclaimer */}
            <div className="pt-6 text-center max-w-xl mx-auto">
              <p className="text-[11px] text-slate-600 leading-normal">
                <span className="font-semibold text-slate-600">Disclaimer:</span> Loan information and recommendations are for informational purposes and should be verified with the lender before applying.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION (Simple 3-Step Explanation) */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Transparent 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
              How LoanFit AI Works
            </h2>
            <p className="text-sm text-slate-500">
              A structured, transparent methodology designed to match your real financial capacity with the right loan terms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-200 hover:bg-blue-50/20 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold font-display shadow-md shadow-blue-500/20 mb-6">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Tell us about yourself
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provide your income, living expenses, existing obligations, and credit standing in a secure, confidential environment.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-medium text-slate-500">
                ✓ Full privacy & RLS isolation
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-200 hover:bg-blue-50/20 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold font-display shadow-md shadow-indigo-500/20 mb-6">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Tell us what loan you need
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Select your loan category, desired amount, tenure, and set your personal decision priorities (total cost, EMI, or flexibility).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-medium text-slate-500">
                ✓ Customizable decision criteria
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-200 hover:bg-blue-50/20 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg font-bold font-display shadow-md shadow-slate-900/20 mb-6">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Get personalized recommendations
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our system prepares your verified profile to assess suitability, Net Cost of Borrowing, and EMI affordability.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-medium text-slate-500">
                ✓ Transparent multi-criteria logic
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MULTI-CRITERIA VALUE PROPOSITION */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Beyond Just Headline Rates
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight leading-tight">
                Why lowest interest rate alone isn’t the best loan for you
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Traditional loan aggregators only sort by advertised interest rates. In reality, hidden processing fees, prepayment lock-ins, reset terms, and strict eligibility thresholds can make a seemingly cheap loan significantly more expensive.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Total Cost of Borrowing</h4>
                    <p className="text-xs text-slate-500">Calculates interest payout, processing fees, and mandatory charges across the full tenure.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Debt-to-Income / FOIR Affordability</h4>
                    <p className="text-xs text-slate-500">Evaluates actual monthly cash flow impact against your verified income and living expenses.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Borrower Preference Weights</h4>
                    <p className="text-xs text-slate-500">Matches terms based on what you value most—whether low initial EMI, low fee, or prepayment flexibility.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Box */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-bold text-slate-900">Comprehensive Evaluation Factors</span>
                </div>
                <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
                  5 Core Pillars
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-slate-800">1. Total Cost of Borrowing</span>
                  <span className="text-blue-700 font-medium">Interest + Lifetime Fees</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-slate-800">2. Monthly EMI Sustainability</span>
                  <span className="text-blue-700 font-medium">Cash Flow Protection</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-slate-800">3. Eligibility & Policy Fit</span>
                  <span className="text-blue-700 font-medium">Income & Credit Match</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-slate-800">4. Processing & Admin Fees</span>
                  <span className="text-blue-700 font-medium">Upfront Outflow</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-semibold text-slate-800">5. Terms & Prepayment Rules</span>
                  <span className="text-blue-700 font-medium">Closure Flexibility</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION SECTION */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            Ready to build your verified borrower profile?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Get started in under 3 minutes. Secure your data with Row Level Security and establish your personal loan criteria.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/25"
            >
              <span>Create Borrower Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
