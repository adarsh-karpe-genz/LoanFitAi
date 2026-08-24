'use client';

import React, { useState, useEffect } from 'react';
import { FinancialProfileInput, financialProfileSchema } from '@/lib/validation/schemas';
import { FinancialProfile } from '@/types/database';
import { formatINR, calculateFOIR } from '@/lib/utils';
import Tooltip from '@/components/ui/Tooltip';
import { IndianRupee, AlertCircle, Check, CreditCard, ShieldAlert, Sparkles } from 'lucide-react';

interface FinancialProfileFormProps {
  initialData?: FinancialProfile | null;
  onSave: (data: FinancialProfileInput) => Promise<void>;
  onNext?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export default function FinancialProfileForm({
  initialData,
  onSave,
  onNext,
  onBack,
  isLoading = false,
}: FinancialProfileFormProps) {
  const [formData, setFormData] = useState<FinancialProfileInput>({
    monthly_income: initialData?.monthly_income || ('' as unknown as number),
    monthly_expenses: initialData?.monthly_expenses || ('' as unknown as number),
    existing_emi: initialData?.existing_emi ?? 0,
    knows_credit_score: initialData ? initialData.credit_score !== null : true,
    credit_score: initialData?.credit_score ?? ('' as unknown as number),
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FinancialProfileInput | 'general', string>>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live validation for Expenses vs Income
  useEffect(() => {
    if (
      typeof formData.monthly_income === 'number' &&
      typeof formData.monthly_expenses === 'number' &&
      formData.monthly_expenses > 0 &&
      formData.monthly_income > 0
    ) {
      if (formData.monthly_expenses > formData.monthly_income) {
        setErrors((prev) => ({
          ...prev,
          monthly_expenses: 'Monthly expenses cannot be greater than monthly income.',
        }));
      } else if (errors.monthly_expenses === 'Monthly expenses cannot be greater than monthly income.') {
        setErrors((prev) => ({ ...prev, monthly_expenses: undefined }));
      }
    }
  }, [formData.monthly_income, formData.monthly_expenses, errors.monthly_expenses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      const numValue = value === '' ? ('' as unknown as number) : Number(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    }

    if (errors[name as keyof FinancialProfileInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleScoreTypeToggle = (knows: boolean) => {
    setFormData((prev) => ({
      ...prev,
      knows_credit_score: knows,
      credit_score: knows ? (prev.credit_score || 750) : null,
    }));
    if (errors.credit_score) {
      setErrors((prev) => ({ ...prev, credit_score: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    const validation = financialProfileSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof FinancialProfileInput, string>> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FinancialProfileInput;
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
      setErrors({ general: err.message || 'Failed to save financial profile.' });
    }
  };

  // Safe numeric values for calculations
  const numIncome = typeof formData.monthly_income === 'number' ? formData.monthly_income : 0;
  const numExpenses = typeof formData.monthly_expenses === 'number' ? formData.monthly_expenses : 0;
  const numEMI = typeof formData.existing_emi === 'number' ? formData.existing_emi : 0;
  const foir = calculateFOIR(numIncome, numEMI);
  const netSurplus = Math.max(0, numIncome - numExpenses - numEMI);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Your financial profile has been saved.</span>
        </div>
      )}

      {errors.general && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Income */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="monthly_income" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Monthly Net Income <span className="text-rose-500">*</span>
            </label>
            {numIncome > 0 && (
              <span className="text-xs font-mono font-bold text-blue-700">
                {formatINR(numIncome)}
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span className="font-semibold text-sm">₹</span>
            </div>
            <input
              id="monthly_income"
              name="monthly_income"
              type="number"
              min={10000}
              step={1000}
              required
              value={formData.monthly_income === ('' as unknown as number) ? '' : formData.monthly_income}
              onChange={handleChange}
              placeholder="e.g. 60000"
              className={`w-full pl-9 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.monthly_income
                  ? 'border-rose-300 focus:ring-rose-200 ring-1 ring-rose-300'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.monthly_income ? (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.monthly_income}
            </p>
          ) : (
            <span className="text-[11px] text-slate-400">Minimum verifiable monthly income: ₹10,000</span>
          )}
        </div>

        {/* Monthly Expenses */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="monthly_expenses" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Monthly Living Expenses <span className="text-rose-500">*</span>
            </label>
            {numExpenses > 0 && (
              <span className="text-xs font-mono font-bold text-slate-700">
                {formatINR(numExpenses)}
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span className="font-semibold text-sm">₹</span>
            </div>
            <input
              id="monthly_expenses"
              name="monthly_expenses"
              type="number"
              min={0}
              step={500}
              required
              value={formData.monthly_expenses === ('' as unknown as number) ? '' : formData.monthly_expenses}
              onChange={handleChange}
              placeholder="e.g. 25000"
              className={`w-full pl-9 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.monthly_expenses
                  ? 'border-rose-300 focus:ring-rose-200 ring-1 ring-rose-300'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.monthly_expenses ? (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.monthly_expenses}
            </p>
          ) : (
            <span className="text-[11px] text-slate-400">Includes rent, utilities, food, groceries, etc.</span>
          )}
        </div>

        {/* Existing Monthly EMI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label htmlFor="existing_emi" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Existing Monthly EMIs
              </label>
              <Tooltip content="Total monthly payments for ongoing personal, vehicle, credit card or student loans." />
            </div>
            {numEMI > 0 && (
              <span className="text-xs font-mono font-bold text-slate-700">
                {formatINR(numEMI)}
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span className="font-semibold text-sm">₹</span>
            </div>
            <input
              id="existing_emi"
              name="existing_emi"
              type="number"
              min={0}
              step={500}
              value={formData.existing_emi === 0 ? '0' : formData.existing_emi}
              onChange={handleChange}
              placeholder="0"
              className={`w-full pl-9 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.existing_emi
                  ? 'border-rose-300 focus:ring-rose-200 ring-1 ring-rose-300'
                  : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.existing_emi ? (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.existing_emi}
            </p>
          ) : (
            <span className="text-[11px] text-slate-400">Enter ₹0 if you have no active loan EMIs</span>
          )}
        </div>

        {/* CIBIL / Credit Score Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                CIBIL / Credit Score
              </label>
              <Tooltip content="CIBIL score is one factor that lenders may consider when evaluating loan applications. Actual eligibility depends on the lender and other factors." />
            </div>
          </div>

          {/* Toggle between known score and unknown */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              type="button"
              onClick={() => handleScoreTypeToggle(true)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                formData.knows_credit_score
                  ? 'bg-blue-50 border-blue-500 text-blue-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              I know my CIBIL score
            </button>
            <button
              type="button"
              onClick={() => handleScoreTypeToggle(false)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                !formData.knows_credit_score
                  ? 'bg-blue-50 border-blue-500 text-blue-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              I don&apos;t know my score
            </button>
          </div>

          {formData.knows_credit_score ? (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                id="credit_score"
                name="credit_score"
                type="number"
                min={300}
                max={900}
                value={
                  formData.credit_score === null || formData.credit_score === ('' as unknown as number)
                    ? ''
                    : formData.credit_score
                }
                onChange={handleChange}
                placeholder="300 – 900 (e.g. 760)"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.credit_score
                    ? 'border-rose-300 focus:ring-rose-200 ring-1 ring-rose-300'
                    : 'border-slate-200 focus:ring-blue-100 focus:border-blue-500'
                }`}
              />
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
              <span className="font-semibold text-slate-700 block mb-0.5">Score marked as unknown</span>
              Our comparison engine will use general baseline eligibility tiers until you provide or verify your score.
            </div>
          )}

          {errors.credit_score && (
            <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.credit_score}
            </p>
          )}
        </div>
      </div>

      {/* Financial Health Summary Banner (Informational Only) */}
      {numIncome > 0 && (
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5 font-medium">Current Debt Obligations (FOIR):</span>
            <span className={`font-mono font-bold text-sm ${foir > 50 ? 'text-amber-600' : 'text-emerald-700'}`}>
              {foir}% of monthly income
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5 font-medium">Estimated Monthly Surplus:</span>
            <span className="font-mono font-bold text-sm text-slate-800">
              {formatINR(netSurplus)}
            </span>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Used strictly to evaluate realistic borrowing capacity and EMI affordability.</span>
          </div>
        </div>
      )}

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
            'Save Financial Profile →'
          )}
        </button>
      </div>
    </form>
  );
}
