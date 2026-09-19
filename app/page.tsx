'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  Lock,
} from 'lucide-react';
import SuitabilityScoreMeter from '@/components/ui/SuitabilityScoreMeter';
import NumberInterpolation from '@/components/ui/NumberInterpolation';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full bg-canvas text-txt-primary">
      {/* 1. HERO SECTION: THE COMPARISON MOMENT */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 hero-radial-wash text-white border-b border-navy-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-white">
              Find the loan that fits your finances — not just the lowest advertised rate.
            </h1>
            <p className="text-base sm:text-lg text-navy-150 leading-relaxed max-w-2xl mx-auto">
              Most loan aggregators rank lenders by teaser rates. LoanFit AI calculates your true lifecycle cost, checks your debt capacity, and ranks what remains by a personalized Suitability Score.
            </p>
          </div>

          {/* THE LIVE COMPARISON MOMENT (Side by Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto items-stretch">
            {/* Card A: The Nominal Rate Trap (Visually Deprioritized) */}
            <div className="p-6 md:p-8 rounded-2xl bg-navy-950/80 border border-navy-800 text-slate-300 flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                  <div>
                    <span className="text-xs text-navy-300 font-medium">Lender A (Teaser APR)</span>
                    <h3 className="text-base font-semibold text-white">Standard Personal Loan</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-xs text-[11px] font-medium bg-red-950/60 text-red-300 border border-red-800/60">
                    High Hidden Cost
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-xs text-navy-450 block">Advertised Rate</span>
                    <span className="tabular-nums text-xl font-bold text-slate-200">8.40% p.a.</span>
                    <span className="text-[10px] text-navy-450 block">Teaser starting rate</span>
                  </div>
                  <div>
                    <span className="text-xs text-navy-450 block">Monthly Installment</span>
                    <span className="tabular-nums text-xl font-bold text-slate-200">₹24,850</span>
                    <span className="text-[10px] text-navy-450 block">Per month on ₹10L / 5Y</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-md bg-navy-950 border border-navy-800 space-y-2 text-xs">
                  <div className="flex justify-between text-navy-300">
                    <span>Upfront Processing Fee</span>
                    <span className="tabular-nums font-semibold text-slate-200">₹35,400 (3.54%)</span>
                  </div>
                  <div className="flex justify-between text-navy-300">
                    <span>Net Lifetime Cost</span>
                    <span className="tabular-nums font-semibold text-slate-200">₹5,26,400</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-navy-900 text-red-400">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Debt Ratio (FOIR)</span>
                    </span>
                    <span className="tabular-nums font-bold">64.2% (Unsafe)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-navy-800/80 text-[11px] text-navy-450">
                <span>Result: Risk of rejection or financial stress due to excessive debt obligation.</span>
              </div>
            </div>

            {/* Card B: The Real-World Fit (Elevated with Suitability Score) */}
            <div className="p-6 md:p-8 rounded-2xl bg-navy-800 border-2 border-navy-300 text-white flex flex-col justify-between shadow-raised relative">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-navy-300 text-navy-950 text-[11px] font-bold">
                Recommended Fit
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-navy-600">
                  <div>
                    <span className="text-xs text-navy-300 font-medium">Lender B (Institutional)</span>
                    <h3 className="text-base font-semibold text-white">Transparent Fit Loan</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-xs text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-700/60">
                    Sustainable
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center pt-1">
                  <div className="flex items-center gap-3">
                    <SuitabilityScoreMeter score={94} size="sm" animate={true} />
                    <div>
                      <span className="text-xs text-navy-300 block">Suitability Score</span>
                      <span className="tabular-nums text-xl font-bold text-white">94 / 100</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-navy-300 block">True Net Lifetime Cost</span>
                    <span className="tabular-nums text-xl font-bold text-navy-300">₹4,62,100</span>
                    <span className="text-[10px] text-emerald-400 block">Saves ₹64,300 total</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-md bg-navy-950/80 border border-navy-600 space-y-2 text-xs">
                  <div className="flex justify-between text-navy-150">
                    <span>Upfront Processing Fee</span>
                    <span className="tabular-nums font-semibold text-white">₹5,000 (Flat)</span>
                  </div>
                  <div className="flex justify-between text-navy-150">
                    <span>Prepayment Penalty</span>
                    <span className="tabular-nums font-semibold text-emerald-400">Zero (Nil Charges)</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-navy-800 text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Debt Ratio (FOIR)</span>
                    </span>
                    <span className="tabular-nums font-bold">42.8% (Well within 60% cap)</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-navy-600 flex items-center justify-between gap-4">
                <Link
                  href="/profile"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-white text-navy-950 text-xs font-semibold hover:bg-navy-050 transition-colors shadow-sm"
                >
                  <span>See my personalized matches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ASYMMETRICAL BENTO GRID */}
      <section className="py-20 md:py-28 bg-canvas border-b border-bdr-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-txt-primary">
              Built on deterministic calculations, not commercial ranking.
            </h2>
            <p className="text-sm text-txt-secondary leading-relaxed">
              Every loan match is filtered by regulatory safety limits and scored mathematically against your personal priorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Tile 1 (Wide): Net Cost of Borrowing */}
            <div className="md:col-span-2 p-6 md:p-8 rounded-2xl bg-surface border border-bdr-subtle flex flex-col justify-between shadow-subtle">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-txt-primary">Net Cost of Borrowing Calculation</h3>
                    <p className="text-xs text-txt-secondary mt-0.5">
                      Total lifetime cash outflow including reducing-balance interest, administrative charges, and taxes.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-xs text-[11px] font-medium bg-navy-050 text-navy-800">
                    Reducing Balance
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-md bg-canvas border border-bdr-subtle">
                    <span className="text-xs text-txt-muted block">Principal Loan</span>
                    <span className="tabular-nums text-lg font-bold text-txt-primary">₹30,00,000</span>
                    <span className="text-[10px] text-txt-muted block">Home Loan (20 Years)</span>
                  </div>
                  <div className="p-4 rounded-md bg-canvas border border-bdr-subtle">
                    <span className="text-xs text-txt-muted block">Total Interest Obligation</span>
                    <span className="tabular-nums text-lg font-bold text-txt-primary">₹32,48,220</span>
                    <span className="text-[10px] text-txt-muted block">8.50% Reducing Balance</span>
                  </div>
                  <div className="p-4 rounded-md bg-navy-050/60 border border-navy-150">
                    <span className="text-xs text-navy-800 font-semibold block">True Net Cost</span>
                    <span className="tabular-nums text-lg font-bold text-navy-950">₹32,58,220</span>
                    <span className="text-[10px] text-navy-600 block">Includes ₹10,000 upfront fee</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-bdr-subtle text-xs text-txt-muted flex items-center justify-between">
                <span>Formula: True Net Cost = Total Interest + Clamped Upfront Fees + Known Taxes</span>
              </div>
            </div>

            {/* Bento Tile 2 (Tall): FOIR Debt Capacity Check */}
            <div className="p-6 md:p-8 rounded-2xl bg-surface border border-bdr-subtle flex flex-col justify-between shadow-subtle">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-txt-primary">Debt Capacity (FOIR)</h3>
                  <span className="px-2 py-0.5 rounded-xs text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Safety Gate
                  </span>
                </div>

                <p className="text-xs text-txt-secondary leading-relaxed">
                  The Fixed Obligation to Income Ratio (FOIR) ensures your monthly EMI does not exceed 60% of verified net income.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-txt-secondary">Monthly Net Income</span>
                      <span className="tabular-nums font-semibold text-txt-primary">₹60,000</span>
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-txt-secondary">Existing EMIs</span>
                      <span className="tabular-nums font-semibold text-txt-primary">₹5,000</span>
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-txt-secondary">New Loan EMI</span>
                      <span className="tabular-nums font-semibold text-txt-primary">₹26,035</span>
                    </div>
                  </div>

                  {/* Meter Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-3 rounded-full bg-navy-050 overflow-hidden relative">
                      <div
                        className="h-full bg-navy-600 rounded-full"
                        style={{ width: '51.7%' }}
                      />
                      {/* 60% Cap marker */}
                      <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-red-500" />
                    </div>
                    <div className="flex justify-between text-[10px] text-txt-muted">
                      <span>Calculated FOIR: 51.7%</span>
                      <span className="text-red-700 font-medium">60% Safe Debt Cap</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-bdr-subtle text-xs text-txt-muted">
                <span>Loans exceeding 60% FOIR are excluded to protect your credit profile.</span>
              </div>
            </div>

            {/* Bento Tile 3: MAUT Multi-Attribute Scoring */}
            <div className="p-6 md:p-8 rounded-2xl bg-surface border border-bdr-subtle flex flex-col justify-between shadow-subtle">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-navy-600" />
                  <h3 className="text-base font-semibold text-txt-primary">MAUT Scoring Model</h3>
                </div>
                <p className="text-xs text-txt-secondary leading-relaxed">
                  Multi-Attribute Utility Theory normalizes three distinct dimensions into a single 0–100 score:
                </p>
                <ul className="space-y-2 text-xs text-txt-secondary pt-1">
                  <li className="flex justify-between">
                    <span>Lowest Net Lifetime Cost</span>
                    <span className="tabular-nums font-semibold text-txt-primary">60% Weight</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Lowest Processing Fee</span>
                    <span className="tabular-nums font-semibold text-txt-primary">20% Weight</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Credit Score Buffer Cushion</span>
                    <span className="tabular-nums font-semibold text-txt-primary">20% Weight</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-bdr-subtle text-[11px] text-txt-muted">
                <span>Personalize weights to match your financial priorities.</span>
              </div>
            </div>

            {/* Bento Tile 4: Multilingual Indic AI Advisor */}
            <div className="p-6 md:p-8 rounded-2xl bg-surface border border-bdr-subtle flex flex-col justify-between shadow-subtle">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-navy-600" />
                  <h3 className="text-base font-semibold text-txt-primary">8 Indian Languages</h3>
                </div>
                <p className="text-xs text-txt-secondary leading-relaxed">
                  Financial jargon explained in your preferred language via Gemini 2.5 Flash and Bhashini NMT:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['English', 'हिन्दी', 'मराठी', 'தமிழ்', 'తెలుగు', 'বাংলা', 'ಕನ್ನಡ', 'ગુજરાતી'].map((lang) => (
                    <span
                      key={lang}
                      className="px-2 py-1 rounded-xs text-[11px] font-medium bg-canvas border border-bdr-subtle text-txt-secondary"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-bdr-subtle text-[11px] text-txt-muted">
                <span>Zero hallucination: explanations are grounded in verified bank data.</span>
              </div>
            </div>

            {/* Bento Tile 5 (Full-Width): In-Situ "Why this loan?" Decision Proof Panel */}
            <div className="md:col-span-3 p-6 md:p-8 rounded-2xl bg-surface border border-bdr-subtle shadow-subtle">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-bdr-subtle">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-navy-600 text-white">
                      Decision Intelligence
                    </span>
                    <h3 className="text-lg font-semibold text-txt-primary">Why this loan? In-Situ Explainability</h3>
                  </div>
                  <p className="text-xs text-txt-secondary mt-1">
                    Every recommendation provides a mathematical contribution breakdown and plain-language explanation.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <SuitabilityScoreMeter score={94} size="sm" animate={false} />
                  <div className="text-right">
                    <span className="text-xs text-txt-muted block">Suitability Match</span>
                    <span className="tabular-nums text-base font-bold text-txt-primary">SBI Regular Home Loan</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {/* Score Decomposition */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-txt-primary">Score Contribution Breakdown</h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-txt-secondary mb-1">
                        <span>Net Cost Utility (60%)</span>
                        <span className="tabular-nums font-semibold text-navy-800">+56.4 pts</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-navy-050 overflow-hidden">
                        <div className="h-full bg-navy-600 rounded-full" style={{ width: '94%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-txt-secondary mb-1">
                        <span>Processing Fee Utility (20%)</span>
                        <span className="tabular-nums font-semibold text-navy-800">+18.8 pts</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-navy-050 overflow-hidden">
                        <div className="h-full bg-navy-600 rounded-full" style={{ width: '94%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-txt-secondary mb-1">
                        <span>Approval Buffer Utility (20%)</span>
                        <span className="tabular-nums font-semibold text-navy-800">+19.2 pts</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-navy-050 overflow-hidden">
                        <div className="h-full bg-navy-600 rounded-full" style={{ width: '96%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plain-Language Rationale */}
                <div className="md:col-span-2 space-y-3 p-4 rounded-md bg-canvas border border-bdr-subtle text-xs">
                  <h4 className="font-semibold text-txt-primary flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-navy-600" />
                    <span>Explainable AI Interpretation</span>
                  </h4>
                  <p className="text-txt-secondary leading-relaxed">
                    &ldquo;SBI Regular Home Loan ranks #1 with a Suitability Score of 94/100. Over your 20-year tenure, it yields the lowest Net Cost of Borrowing (₹32.58 Lakh), saving ₹72,400 compared to competitor offers. Your 760 CIBIL score provides a comfortable 60-point buffer above their 700 minimum threshold, and the ₹26,035 EMI maintains your FOIR at a safe 51.7%.&rdquo;
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-txt-muted">
                    <span className="px-2 py-0.5 rounded-xs bg-surface border border-bdr-subtle">
                      ✓ Zero Prepayment Penalty
                    </span>
                    <span className="px-2 py-0.5 rounded-xs bg-surface border border-bdr-subtle">
                      ✓ Rate Verified: Current Month
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FINAL GET STARTED CTA */}
      <section className="py-16 md:py-20 bg-surface border-b border-bdr-subtle text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-txt-primary">
            Ready to find the loan that actually fits your finances?
          </h2>
          <p className="text-sm text-txt-secondary max-w-xl mx-auto">
            Takes 3 minutes. Zero spam, no phone calls, and no impact on your credit score.
          </p>
          <div className="pt-2">
            <Link
              href="/profile"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-md bg-navy-950 hover:bg-navy-800 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <span>Start my loan assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
