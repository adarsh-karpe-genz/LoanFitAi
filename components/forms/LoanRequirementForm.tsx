'use client';

import React, { useState } from 'react';
import { LoanRequirementInput, loanRequirementSchema, validTenureYears } from '@/lib/validation/schemas';
import { LoanRequirement, LoanType } from '@/types/database';
import { formatINR } from '@/lib/utils';
import LoanTypeSelector from '@/components/forms/LoanTypeSelector';
import { AlertCircle, Check, Clock, IndianRupee } from 'lucide-react';

interface LoanRequirementFormProps {
  initialData?: LoanRequirement | null;
  onSave: (data: LoanRequirementInput) => Promise<void>;
  onNext?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export default function LoanRequirementForm({
  initialData,
  onSave,
  onNext,
  onBack,
  isLoading = false,
}: LoanRequirementFormProps) {
  const initialTenureYears = initialData?.tenure_months
    ? Math.round(initialData.tenure_months / 12)
    : 20;

  const [formData, setFormData] = useState<LoanRequirementInput>({
    loan_type: (initialData?.loan_type as LoanType) || 'Home Loan',
    loan_amount: initialData?.loan_amount || ('' as unknown as number),
    tenure_years: initialTenureYears,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LoanRequirementInput | 'general', string>>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTypeSelect = (type: LoanType) => {
    setFormData((prev) => ({ ...prev, loan_type: type }));
    if (errors.loan_type) {
      setErrors((prev) => ({ ...prev, loan_type: undefined }));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? ('' as unknown as number) : Number(e.target.value);
    setFormData((prev) => ({ ...prev, loan_amount: value }));
    if (errors.loan_amount) {
      setErrors((prev) => ({ ...prev, loan_amount: undefined }));
    }
  };

  const handleTenureSelect = (years: number) => {
    setFormData((prev) => ({ ...prev, tenure_years: years }));
    if (errors.tenure_years) {
      setErrors((prev) => ({ ...prev, tenure_years: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    const validation = loanRequirementSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof LoanRequirementInput, string>> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LoanRequirementInput;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await onSave(validation.data);
      setSaveSuccess(true);
      if (onNext) {
        setTimeout(() => {
          onNext();
        }, 400);
      }
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to save loan requirements.' });
    }
  };

  const numAmount = typeof formData.loan_amount === 'number' ? formData.loan_amount : 0;
  const tenureMonths = formData.tenure_years * 12;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Loan requirement saved successfully.</span>
        </div>
      )}

      {errors.general && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* 1. Loan Category Selector */}
      <LoanTypeSelector
        selectedType={formData.loan_type}
        onSelect={handleTypeSelect}
        error={errors.loan_type}
      />

      {/* 2. Required Loan Amount */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="loan_amount" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Required Loan Amount <span className="text-rose-500">*</span>
          </label>
          {numAmount > 0 && (
            <span className="text-sm font-mono font-bold text-blue-700">
              {formatINR(numAmount)}
            </span>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <span className="font-semibold text-sm">₹</span>
          </div>
          <input
            id="loan_amount"
            name="loan_amount"
            type="number"
            min={10000}
            step={10000}
            required
            value={formData.loan_amount === ('' as unknown as number) ? '' : formData.loan_amount}
            onChange={handleAmountChange}
            placeholder="e.g. 3000000 (for ₹30 Lakhs)"
            className={`w-full pl-9 pr-4 py-3.5 bg-slate-50 border rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.loan_amount
                ? 'border-rose-300 focus:ring-rose-200 ring-1 ring-rose-300'
                : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
            }`}
          />
        </div>
        {errors.loan_amount ? (
          <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.loan_amount}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            <span className="text-slate-500">Quick Select:</span>
            {[500000, 1500000, 3000000, 5000000, 7500000, 10000000].map((quickVal) => (
              <button
                key={quickVal}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, loan_amount: quickVal }))}
                className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                {formatINR(quickVal)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Preferred Tenure Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Preferred Loan Tenure <span className="text-rose-500">*</span>
          </label>
          <span className="text-xs font-semibold text-slate-700">
            Selected: <span className="text-blue-700 font-bold">{formData.tenure_years} Years ({tenureMonths} Months)</span>
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {validTenureYears.map((years) => {
            const isSelected = formData.tenure_years === years;
            return (
              <button
                key={years}
                type="button"
                onClick={() => handleTenureSelect(years)}
                className={`py-3 px-2 rounded-xl text-center border font-medium text-xs transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm">{years} {years === 1 ? 'Year' : 'Years'}</div>
                <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  {years * 12} mos
                </div>
              </button>
            );
          })}
        </div>
        {errors.tenure_years && (
          <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.tenure_years}
          </p>
        )}
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
              Saving...
            </span>
          ) : (
            'Save Loan Requirements →'
          )}
        </button>
      </div>
    </form>
  );
}
