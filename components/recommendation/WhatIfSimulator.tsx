'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  LoanType,
  RecommendationWeights,
  SimulationPayload,
} from '@/types/database';
import { formatINR, formatTenure } from '@/lib/utils';
import { DEFAULT_WEIGHTS } from '@/lib/services/recommendationEngine';
import {
  Sliders,
  RotateCcw,
  Zap,
  IndianRupee,
  Calendar,
  Wallet,
  CreditCard,
  Scale,
  Percent,
  Sparkles,
} from 'lucide-react';

interface WhatIfSimulatorProps {
  initialPayload: SimulationPayload;
  onSimulate: (payload: SimulationPayload) => void;
  isLoading?: boolean;
  onResetToSavedProfile: () => void;
}

export default function WhatIfSimulator({
  initialPayload,
  onSimulate,
  isLoading = false,
  onResetToSavedProfile,
}: WhatIfSimulatorProps) {
  const [loanType, setLoanType] = useState<LoanType>(initialPayload.loanType || 'Home Loan');
  const [amount, setAmount] = useState<number>(initialPayload.amount);
  const [tenureMonths, setTenureMonths] = useState<number>(initialPayload.tenureMonths);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(initialPayload.monthlyIncome);
  const [existingEMI, setExistingEMI] = useState<number>(initialPayload.existingEMI || 0);
  const [creditScore, setCreditScore] = useState<number | null>(initialPayload.creditScore ?? 750);
  const [knowsCreditScore, setKnowsCreditScore] = useState<boolean>(initialPayload.creditScore !== null);
  const [costWeight, setCostWeight] = useState<number>(initialPayload.weights?.costWeight ? Math.round(initialPayload.weights.costWeight * 100) : 60);
  const [feeWeight, setFeeWeight] = useState<number>(initialPayload.weights?.feeWeight ? Math.round(initialPayload.weights.feeWeight * 100) : 20);
  const [eligibilityWeight, setEligibilityWeight] = useState<number>(initialPayload.weights?.eligibilityWeight ? Math.round(initialPayload.weights.eligibilityWeight * 100) : 20);
  const [maxFOIR, setMaxFOIR] = useState<number>(initialPayload.maxFOIR ? Math.round(initialPayload.maxFOIR * 100) : 60);
  const [showAdvancedWeights, setShowAdvancedWeights] = useState<boolean>(false);

  // Sync state if parent props change
  useEffect(() => {
    setLoanType(initialPayload.loanType || 'Home Loan');
    setAmount(initialPayload.amount);
    setTenureMonths(initialPayload.tenureMonths);
    setMonthlyIncome(initialPayload.monthlyIncome);
    setExistingEMI(initialPayload.existingEMI || 0);
    setCreditScore(initialPayload.creditScore ?? 750);
    setKnowsCreditScore(initialPayload.creditScore !== null);
  }, [initialPayload]);

  // Debounced callback trigger to onSimulate
  useEffect(() => {
    const timer = setTimeout(() => {
      onSimulate({
        loanType,
        amount,
        tenureMonths,
        monthlyIncome,
        existingEMI,
        creditScore: knowsCreditScore ? creditScore : null,
        weights: {
          costWeight: costWeight / 100,
          feeWeight: feeWeight / 100,
          eligibilityWeight: eligibilityWeight / 100,
        },
        maxFOIR: maxFOIR / 100,
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [
    loanType,
    amount,
    tenureMonths,
    monthlyIncome,
    existingEMI,
    creditScore,
    knowsCreditScore,
    costWeight,
    feeWeight,
    eligibilityWeight,
    maxFOIR,
    onSimulate,
  ]);

  const maxTenureBound = loanType === 'Home Loan' ? 360 : loanType === 'Car Loan' ? 84 : 180;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-slate-900 flex items-center gap-1.5">
              <span>Interactive What-If Simulator</span>
              {isLoading && (
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping inline-block" />
              )}
            </h3>
            <p className="text-[11px] text-slate-500">
              Adjust sliders to recalculate MAUT suitability scores in real-time
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetToSavedProfile}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200"
          title="Reset to your saved profile values"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Loan Category Pills */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Loan Category
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {(['Home Loan', 'Car Loan', 'Education Loan', 'Personal Loan', 'Business Loan'] as LoanType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setLoanType(type)}
              className={`py-2 px-2 text-[11px] font-semibold rounded-xl border transition-all text-center ${
                loanType === type
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* 1. Loan Amount Slider */}
        <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
              <span>Loan Amount</span>
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {formatINR(amount)}
            </span>
          </div>
          <input
            type="range"
            min={100000}
            max={10000000}
            step={50000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>₹1 Lakh</span>
            <span>₹50 Lakh</span>
            <span>₹1 Crore</span>
          </div>
        </div>

        {/* 2. Tenure Slider */}
        <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Loan Tenure</span>
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {formatTenure(tenureMonths)} ({tenureMonths} mos)
            </span>
          </div>
          <input
            type="range"
            min={12}
            max={maxTenureBound}
            step={12}
            value={tenureMonths}
            onChange={(e) => setTenureMonths(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>1 Year</span>
            <span>{Math.round(maxTenureBound / 24)} Years</span>
            <span>{Math.round(maxTenureBound / 12)} Years</span>
          </div>
        </div>

        {/* 3. Monthly Income Slider */}
        <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Monthly In-Hand Income</span>
            </span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              {formatINR(monthlyIncome)}
            </span>
          </div>
          <input
            type="range"
            min={15000}
            max={300000}
            step={5000}
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>₹15,000</span>
            <span>₹1.5 Lakh</span>
            <span>₹3.0 Lakh</span>
          </div>
        </div>

        {/* 4. Existing Monthly EMIs Slider */}
        <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              <span>Existing Active EMIs</span>
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {formatINR(existingEMI)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100000}
            step={2500}
            value={existingEMI}
            onChange={(e) => setExistingEMI(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>₹0 (Nil)</span>
            <span>₹50,000</span>
            <span>₹1 Lakh</span>
          </div>
        </div>
      </div>

      {/* Credit Score & Max FOIR Quick Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
        {/* Credit Score */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">CIBIL Credit Score</span>
            <button
              type="button"
              onClick={() => setKnowsCreditScore(!knowsCreditScore)}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
            >
              {knowsCreditScore ? 'I know score' : "I don't know score"}
            </button>
          </div>

          {knowsCreditScore ? (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-500">Score value:</span>
                <span className="font-mono font-bold text-slate-900">{creditScore}</span>
              </div>
              <input
                type="range"
                min={550}
                max={900}
                step={10}
                value={creditScore || 750}
                onChange={(e) => setCreditScore(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 italic">
              Neutral baseline (0.70 eligibility utility) applied.
            </p>
          )}
        </div>

        {/* Max FOIR Limit */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">Max Affordability (FOIR)</span>
            <span className="font-mono font-bold text-slate-900">{maxFOIR}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={75}
            step={5}
            value={maxFOIR}
            onChange={(e) => setMaxFOIR(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <span className="text-[10px] text-slate-400 block">
            Standard banking limit is 50%–60% of gross monthly income.
          </span>
        </div>
      </div>

      {/* Advanced MAUT Weight Toggle */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowAdvancedWeights(!showAdvancedWeights)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <Scale className="w-3.5 h-3.5 text-blue-600" />
          <span>{showAdvancedWeights ? 'Hide MCDA Utility Weights ▲' : 'Customize MCDA Utility Weights ▼'}</span>
        </button>

        {showAdvancedWeights && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs animate-in fade-in duration-200">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Lowest Net Cost</span>
                <span className="font-mono">{costWeight}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={costWeight}
                onChange={(e) => setCostWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Lowest Upfront Fees</span>
                <span className="font-mono">{feeWeight}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={feeWeight}
                onChange={(e) => setFeeWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Soft Approval Odds</span>
                <span className="font-mono">{eligibilityWeight}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={eligibilityWeight}
                onChange={(e) => setEligibilityWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
