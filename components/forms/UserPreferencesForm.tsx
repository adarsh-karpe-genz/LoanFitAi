'use client';

import React, { useState } from 'react';
import { UserPreferencesInput, userPreferencesSchema } from '@/lib/validation/schemas';
import { UserPreferences } from '@/types/database';
import { Sliders, Check, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

interface PreferenceItem {
  key: keyof UserPreferencesInput;
  title: string;
  subtitle: string;
  description: string;
  tooltip: string;
  lowLabel: string;
  highLabel: string;
}

const preferenceItems: PreferenceItem[] = [
  {
    key: 'cost_weight',
    title: 'Lowest Total Cost of Borrowing',
    subtitle: 'Minimizes cumulative interest and total loan outflow across the full tenure',
    description: 'Prioritizes lenders offering competitive baseline rates over the entire loan life.',
    tooltip: 'Weight given to minimizing total interest payout over the entire loan term.',
    lowLabel: 'Standard priority',
    highLabel: 'Highest priority (Cost first)',
  },
  {
    key: 'emi_weight',
    title: 'Lowest Monthly EMI',
    subtitle: 'Keeps monthly installments as low and manageable as possible',
    description: 'Optimizes monthly cash flow, allowing higher flexibility in daily expenses.',
    tooltip: 'Weight given to minimizing each month’s installment check.',
    lowLabel: 'Standard priority',
    highLabel: 'Highest priority (Cash flow)',
  },
  {
    key: 'eligibility_weight',
    title: 'Higher Eligibility & Approval Odds',
    subtitle: 'Focuses on lenders with criteria best matched to your credit and income profile',
    description: 'Targets institutions where your FOIR and employment stability score strongest.',
    tooltip: 'Weight given to likelihood of meeting the lender’s baseline eligibility criteria.',
    lowLabel: 'Standard priority',
    highLabel: 'Highest priority (High fit)',
  },
  {
    key: 'fee_weight',
    title: 'Lower Upfront & Processing Fees',
    subtitle: 'Minimizes administrative charges, processing fees, and documentation costs',
    description: 'Reduces out-of-pocket expenses when the loan is disbursed.',
    tooltip: 'Weight given to zero or discounted upfront processing and documentation fees.',
    lowLabel: 'Standard priority',
    highLabel: 'Highest priority (Lowest fees)',
  },
  {
    key: 'flexibility_weight',
    title: 'Flexible Loan Terms & Prepayment',
    subtitle: 'Valuing zero foreclosure penalties, part-payment flexibility, and top-up options',
    description: 'Enables you to close or part-pay your loan early without extra penalty charges.',
    tooltip: 'Weight given to flexible repayment, nil part-payment fees, and easier tenure adjustments.',
    lowLabel: 'Standard priority',
    highLabel: 'Highest priority (Max freedom)',
  },
];

interface UserPreferencesFormProps {
  initialData?: UserPreferences | null;
  onSave: (data: UserPreferencesInput) => Promise<void>;
  onNext?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export default function UserPreferencesForm({
  initialData,
  onSave,
  onNext,
  onBack,
  isLoading = false,
}: UserPreferencesFormProps) {
  const [formData, setFormData] = useState<UserPreferencesInput>({
    cost_weight: initialData?.cost_weight ?? 80,
    emi_weight: initialData?.emi_weight ?? 60,
    eligibility_weight: initialData?.eligibility_weight ?? 75,
    fee_weight: initialData?.fee_weight ?? 50,
    flexibility_weight: initialData?.flexibility_weight ?? 65,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserPreferencesInput | 'general', string>>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSliderChange = (key: keyof UserPreferencesInput, value: number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    const validation = userPreferencesSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof UserPreferencesInput, string>> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof UserPreferencesInput;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      // Pass raw 0-100 preferences without client-side normalization
      await onSave(validation.data);
      setSaveSuccess(true);
      if (onNext) {
        setTimeout(() => {
          onNext();
        }, 400);
      }
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to save preferences.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Your preferences have been saved successfully.</span>
        </div>
      )}

      {errors.general && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Info notice about MCDA raw collection */}
      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <p className="font-semibold text-blue-900 mb-0.5">
            Personalized Decision Criteria (MCDA Setup)
          </p>
          <p>
            Adjust the sliders below (0–100) to reflect what matters most for your loan choice. These raw preference weights will be utilized by the multi-criteria decision analysis (MCDA) engine to rank suitable loan products for your profile.
          </p>
        </div>
      </div>

      {/* 5 Preference Sliders */}
      <div className="space-y-6">
        {preferenceItems.map((item) => {
          const value = formData[item.key] ?? 50;

          // Compute visual block progress bar representation (e.g. ██████░░░░)
          const totalBlocks = 10;
          const filledBlocks = Math.round(value / 10);
          const visualBar = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

          return (
            <div
              key={item.key}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <Tooltip content={item.tooltip} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-400 hidden sm:inline">{visualBar}</span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-800 font-mono font-bold text-xs rounded-full border border-blue-200/60">
                    {value} / 100
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {item.subtitle}
              </p>

              {/* Slider Component */}
              <div className="pt-2 space-y-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={value}
                  onChange={(e) => handleSliderChange(item.key, Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  aria-label={item.title}
                />
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span>0 ({item.lowLabel})</span>
                  <span>100 ({item.highLabel})</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            ← Back
          </button>
        ) : <div />}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:opacity-50 transition-all shadow-sm hover:shadow"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving Preferences...
            </span>
          ) : (
            'Save Preferences →'
          )}
        </button>
      </div>
    </form>
  );
}
