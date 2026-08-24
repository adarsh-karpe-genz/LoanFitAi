'use client';

import React, { useState } from 'react';
import { RecommendationResponse, RecommendationResultItem } from '@/types/database';
import { formatINR } from '@/lib/utils';
import { ScoreBreakdownTrigger } from './ScoreBreakdownTooltip';
import { XaiExplanationTrigger } from './XaiExplanationCard';
import {
  Trophy,
  Building2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface PersonalizedRankingDashboardProps {
  data: RecommendationResponse;
}

export default function PersonalizedRankingDashboard({
  data,
}: PersonalizedRankingDashboardProps) {
  const [showDisqualified, setShowDisqualified] = useState<boolean>(false);
  const { recommendations, disqualifiedProducts = [], borrowerContext, weightsApplied } = data;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-emerald-500 to-teal-600 text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'from-blue-500 to-indigo-600 text-blue-700 bg-blue-50 border-blue-200';
    return 'from-amber-500 to-orange-500 text-amber-700 bg-amber-50 border-amber-200';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-600';
    return 'bg-amber-500';
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-base text-slate-900">
            Ranked Recommendations ({recommendations.length})
          </span>
          {data.isSimulated && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Zap className="w-3 h-3 text-indigo-600" />
              Real-time Simulation
            </span>
          )}
        </div>
        <div className="text-slate-500 text-[11px]">
          Evaluated against {borrowerContext.loanType} catalog • Weights:{' '}
          <strong className="text-slate-800">
            {Math.round(weightsApplied.costWeight * 100)}% Cost / {Math.round(weightsApplied.feeWeight * 100)}% Fee / {Math.round(weightsApplied.eligibilityWeight * 100)}% Approval Buffer
          </strong>
        </div>
      </div>

      {/* 2. Top Ranked Cards / Detailed List */}
      <div className="space-y-4">
        {recommendations.map((item) => {
          const isTopMatch = item.rank === 1;

          return (
            <div
              key={item.product_id}
              className={`bg-white rounded-3xl p-6 border transition-all shadow-sm hover:shadow-md ${
                isTopMatch
                  ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-blue-500/5'
                  : 'border-slate-200/90'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left Info Column */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Rank Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isTopMatch
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isTopMatch ? (
                        <>
                          <Trophy className="w-3.5 h-3.5 text-amber-300" />
                          <span>Rank #1 • Highest Suitability Match</span>
                        </>
                      ) : (
                        <span>Rank #{item.rank}</span>
                      )}
                    </span>

                    {/* FOIR Badge */}
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.foir_percentage}% FOIR (Safe &lt; {borrowerContext.foirThreshold}%)
                    </span>
                  </div>

                  {/* Lender and Product Title */}
                  <div>
                    <h3 className="text-lg font-display font-bold text-slate-900">
                      {item.product_name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.lender_name}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-normal">
                        Advertised Rate: {item.interest_rate.toFixed(2)}% p.a.
                      </span>
                    </p>
                  </div>

                  {/* Mathematical Transparency Trigger & Explainable AI */}
                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    <ScoreBreakdownTrigger item={item} />
                    <XaiExplanationTrigger
                      item={item}
                      borrowerContext={{
                        loanAmount: borrowerContext.loanAmount,
                        tenureMonths: borrowerContext.tenureMonths,
                        monthlyIncome: borrowerContext.monthlyIncome,
                        existingEMI: borrowerContext.existingEMI,
                        creditScore: borrowerContext.creditScore,
                      }}
                    />
                  </div>
                </div>

                {/* Center Financial Numbers Column */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs shrink-0 lg:min-w-[380px]">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Monthly EMI:</span>
                    <span className="font-mono font-bold text-blue-700 text-sm">
                      {formatINR(item.calculated_emi)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/ month</span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px] block">Upfront Fee:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {formatINR(item.processing_fee)}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-500 text-[11px] block">Net Borrowing Cost:</span>
                    <span className="font-mono font-bold text-slate-950 text-sm">
                      {formatINR(item.total_cost)}
                    </span>
                  </div>
                </div>

                {/* Right Suitability Score Column */}
                <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200/70 text-center min-w-[140px] shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Suitability Score
                  </span>
                  <div className="text-3xl font-display font-black text-slate-900">
                    {item.utility_score}
                    <span className="text-xs font-normal text-slate-400">/100</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getProgressBarColor(item.utility_score)} transition-all duration-500`}
                      style={{ width: `${item.utility_score}%` }}
                    />
                  </div>

                  <span className="text-[10px] font-semibold text-slate-500 mt-1.5">
                    {item.utility_score >= 85
                      ? 'Optimal Match'
                      : item.utility_score >= 70
                      ? 'High Match'
                      : 'Moderate Match'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Disqualified Loans Accordion (Affordability & Criteria Exclusions) */}
      {disqualifiedProducts.length > 0 && (
        <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDisqualified(!showDisqualified)}
            className="w-full p-5 flex items-center justify-between text-left text-xs font-semibold text-slate-700 hover:bg-slate-100/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-500" />
              <span>
                Disqualified Loan Products ({disqualifiedProducts.length}) — View Filter & FOIR Exclusions
              </span>
            </div>
            {showDisqualified ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showDisqualified && (
            <div className="p-5 pt-0 space-y-3 text-xs border-t border-slate-200/80">
              <p className="text-slate-500 text-[11px] pt-3">
                These products were hard-filtered out to protect borrower affordability (FOIR &gt; {borrowerContext.foirThreshold}%) or because stated minimum criteria were not met:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {disqualifiedProducts.map((d) => (
                  <div
                    key={d.productId}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <strong className="text-slate-900 block">{d.productName}</strong>
                      <span className="text-slate-500">{d.lenderName}</span>
                    </div>

                    <div className="text-rose-600 text-[11px] font-semibold flex items-center gap-1.5">
                      <span>Exclusion: {d.reasons.join('; ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Mandatory Regulatory & Explainability Note */}
      <div className="p-4 rounded-2xl bg-slate-100/90 border border-slate-200 text-[11px] text-slate-500 leading-relaxed space-y-1">
        <strong className="text-slate-700 block">About LoanFit AI Recommendation Scores:</strong>
        Suitability scores are mathematically computed based on your stated income, debt obligations, and multi-attribute decision weights. High suitability does not represent a loan sanction guarantee. Final approval and underwriting terms remain at the sole discretion of the lending bank.
      </div>
    </div>
  );
}
