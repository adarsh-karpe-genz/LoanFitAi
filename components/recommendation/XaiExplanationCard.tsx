'use client';

import React, { useState, useEffect } from 'react';
import {
  RecommendationResultItem,
  XaiExplanation,
  SupportedLanguage,
} from '@/types/database';
import { SUPPORTED_LANGUAGES } from '@/lib/services/xaiEngine';
import { formatINR } from '@/lib/utils';
import {
  Sparkles,
  Bot,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Scale,
  RefreshCw,
  X,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface XaiExplanationModalProps {
  item: RecommendationResultItem;
  borrowerContext: {
    loanAmount: number;
    tenureMonths: number;
    monthlyIncome: number;
    existingEMI: number;
    creditScore: number | null;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function XaiExplanationModal({
  item,
  borrowerContext,
  isOpen,
  onClose,
}: XaiExplanationModalProps) {
  const [explanation, setExplanation] = useState<XaiExplanation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  useEffect(() => {
    if (!isOpen) return;

    async function fetchXai() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/xai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            item,
            ...borrowerContext,
            language,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setExplanation(data);
        }
      } catch (err) {
        console.error('Failed to load XAI explanation:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchXai();
  }, [isOpen, item, borrowerContext, language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 text-xs">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-300" />
                <span>Explainable AI (XAI)</span>
              </span>
              <span className="text-slate-400 font-semibold">
                Rank #{item.rank} • {item.lender_name}
              </span>
            </div>
            <h3 className="text-lg font-display font-bold text-white">
              Why this loan? — Natural Language & Feature Importance
            </h3>
            <p className="text-[11px] text-slate-400">
              Interpreted by Gemini 2.5 Flash from deterministic Phase 3 mathematical models
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selector Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Translate Explanation (Bhashini-Ready):</span>
          </span>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName} ({lang.name})
              </option>
            ))}
          </select>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
              <p className="text-slate-500 font-semibold">
                Generating grounded natural language explanation...
              </p>
            </div>
          ) : explanation ? (
            <>
              {/* 1. Headline & Narrative Summary */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 space-y-2">
                <h4 className="text-sm font-bold text-blue-950 font-display">
                  {explanation.headline}
                </h4>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {explanation.summary}
                </p>
              </div>

              {/* 2. Positive Drivers & Trade-Offs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Positive Factors */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Top Positive Drivers</span>
                  </span>
                  <ul className="space-y-1.5 text-slate-700 pl-4 list-disc text-[11px]">
                    {explanation.positiveDrivers.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>

                {/* Trade-offs & Watchouts */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Trade-Offs & Watchouts</span>
                  </span>
                  <ul className="space-y-1.5 text-slate-700 pl-4 list-disc text-[11px]">
                    {explanation.tradeOffs.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 3. Simulated SHAP Feature Importance */}
              <div className="space-y-2.5">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  <span>SHAP-Style Feature Importance Contributions</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {explanation.shapFeatureImpacts.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{feat.featureName}</span>
                        {feat.impactScore > 0 && (
                          <span className="font-mono font-bold text-emerald-700 text-[11px]">
                            +{feat.impactScore} pts
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Observed value: <strong className="text-slate-900 font-mono">{feat.featureValue}</strong>
                      </div>
                      <p className="text-[10px] text-slate-500 pt-0.5">
                        {feat.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. FOIR Affordability Safety Verdict */}
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-[11px] text-slate-700 space-y-1">
                <strong className="text-slate-900 block font-semibold">Affordability Verdict:</strong>
                <p>{explanation.foirVerdict}</p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 italic">
            Grounded in deterministic math. Verify sanction terms with lender.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
}

export function XaiExplanationTrigger({
  item,
  borrowerContext,
}: {
  item: RecommendationResultItem;
  borrowerContext: {
    loanAmount: number;
    tenureMonths: number;
    monthlyIncome: number;
    existingEMI: number;
    creditScore: number | null;
  };
}) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-all shadow-xs"
      >
        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        <span>Explain with AI</span>
      </button>

      <XaiExplanationModal
        item={item}
        borrowerContext={borrowerContext}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
