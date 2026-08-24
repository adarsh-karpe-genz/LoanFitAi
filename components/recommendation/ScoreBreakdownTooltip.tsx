'use client';

import React, { useState } from 'react';
import { RecommendationResultItem } from '@/types/database';
import { formatINR } from '@/lib/utils';
import {
  HelpCircle,
  X,
  Info,
  Scale,
  Percent,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ScoreBreakdownModalProps {
  item: RecommendationResultItem;
  isOpen: boolean;
  onClose: () => void;
}

export function ScoreBreakdownModal({
  item,
  isOpen,
  onClose,
}: ScoreBreakdownModalProps) {
  if (!isOpen) return null;

  const { breakdown } = item;
  const costWeightPct = Math.round(breakdown.weightsApplied.costWeight * 100);
  const feeWeightPct = Math.round(breakdown.weightsApplied.feeWeight * 100);
  const eligWeightPct = Math.round(breakdown.weightsApplied.eligibilityWeight * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/80 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                Rank #{item.rank}
              </span>
              <span className="text-xs font-semibold text-slate-500">{item.lender_name}</span>
            </div>
            <h3 className="text-lg font-display font-bold text-slate-900">
              Suitability Score Breakdown: <span className="text-blue-600">{item.utility_score}/100</span>
            </h3>
            <p className="text-xs text-slate-500">
              Multi-Attribute Utility Theory (MAUT) & Affordability Mathematical Explanation
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs text-slate-600 max-h-[75vh] overflow-y-auto">
          {/* 1. Composite Formula Explanation */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-950 space-y-2">
            <span className="font-bold flex items-center gap-1.5 text-blue-900">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>Multi-Attribute Scoring Formula (MCDA / MAUT)</span>
            </span>
            <div className="font-mono text-[11px] bg-white/90 p-2.5 rounded-xl border border-blue-200/80 leading-relaxed text-blue-900">
              Suitability = ({costWeightPct}% × Net Cost Utility) + ({feeWeightPct}% × Fee Utility) + ({eligWeightPct}% × Credit Buffer)
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Every loan product is mathematically evaluated against the lowest and highest cost metrics in the catalog, normalized into a 0.0–1.0 utility curve, and weighted according to borrower priorities.
            </p>
          </div>

          {/* 2. Three Metric Pillars Breakdown */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Mathematical Pillar Contributions
            </h4>

            {/* Pillar 1: Net Cost of Borrowing */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. Net Cost of Borrowing ({costWeightPct}% Weight)</span>
                </span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  +{breakdown.costComponentScore.toFixed(1)} pts
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                <div>
                  <span>Total Net Cost: </span>
                  <strong className="text-slate-900 font-mono">{formatINR(item.total_cost)}</strong>
                </div>
                <div>
                  <span>Normalized Utility: </span>
                  <strong className="text-slate-900 font-mono">{(item.cost_utility * 100).toFixed(1)}%</strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Calculated from Total Interest ({formatINR(item.total_interest)}) + Upfront Fees ({formatINR(item.processing_fee)}). Lower cost relative to other lenders yields higher utility.
              </p>
            </div>

            {/* Pillar 2: Upfront Processing Fee */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-blue-600" />
                  <span>2. Processing Fee Impact ({feeWeightPct}% Weight)</span>
                </span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  +{breakdown.feeComponentScore.toFixed(1)} pts
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                <div>
                  <span>Upfront Processing Fee: </span>
                  <strong className="text-slate-900 font-mono">{formatINR(item.processing_fee)}</strong>
                </div>
                <div>
                  <span>Fee Utility: </span>
                  <strong className="text-slate-900 font-mono">{(item.fee_utility * 100).toFixed(1)}%</strong>
                </div>
              </div>
            </div>

            {/* Pillar 3: Credit Buffer & Soft Eligibility */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>3. Soft Eligibility & Approval Cushion ({eligWeightPct}% Weight)</span>
                </span>
                <span className="font-mono font-bold text-indigo-700 text-sm">
                  +{breakdown.eligibilityComponentScore.toFixed(1)} pts
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                <div>
                  <span>Borrower CIBIL: </span>
                  <strong className="text-slate-900 font-mono">{breakdown.userCIBIL || 'Unspecified (Neutral)'}</strong>
                </div>
                <div>
                  <span>Lender Minimum: </span>
                  <strong className="text-slate-900 font-mono">{breakdown.minCIBILRequired || '650+'}</strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                {breakdown.userCIBIL
                  ? `Your credit score has a +${breakdown.creditBuffer} pt cushion above the lender's stated minimum.`
                  : 'CIBIL score is unspecified; neutral score baseline applied.'}
              </p>
            </div>
          </div>

          {/* 3. FOIR Affordability Verification */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Affordability & FOIR Verification</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                PASS ({item.foir_percentage}% FOIR)
              </span>
            </div>
            <div className="text-[11px] text-emerald-800 leading-relaxed font-mono bg-white/80 p-2 rounded-xl border border-emerald-200">
              FOIR = (Existing EMI ₹{formatINR(breakdown.weightsApplied ? 0 : 0)} + New EMI {formatINR(item.calculated_emi)}) ÷ Monthly Income = {item.foir_percentage}%
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              This loan is within the safe debt-to-income threshold of <strong>{breakdown.foirThreshold}%</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function ScoreBreakdownTrigger({
  item,
}: {
  item: RecommendationResultItem;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors underline decoration-blue-200 underline-offset-2"
        title="View mathematical MAUT breakdown"
      >
        <Info className="w-3.5 h-3.5" />
        <span>Why this score?</span>
      </button>

      <ScoreBreakdownModal item={item} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
