'use client';

import React from 'react';
import { Home, GraduationCap, Car, User, Briefcase, CheckCircle2 } from 'lucide-react';
import { LoanType } from '@/types/database';

interface LoanTypeOption {
  type: LoanType;
  title: string;
  description: string;
  icon: React.ElementType;
  accent: string;
}

export const loanTypeOptions: LoanTypeOption[] = [
  {
    type: 'Home Loan',
    title: 'Home Loan',
    description: 'For purchasing, constructing, or renovating residential property.',
    icon: Home,
    accent: 'blue',
  },
  {
    type: 'Education Loan',
    title: 'Education Loan',
    description: 'For higher education, tuition fees, and study expenses in India or abroad.',
    icon: GraduationCap,
    accent: 'indigo',
  },
  {
    type: 'Car Loan',
    title: 'Car Loan',
    description: 'For purchasing a new or pre-owned four-wheeler or commercial vehicle.',
    icon: Car,
    accent: 'cyan',
  },
  {
    type: 'Personal Loan',
    title: 'Personal Loan',
    description: 'For immediate personal financial requirements, medical, or emergencies.',
    icon: User,
    accent: 'slate',
  },
  {
    type: 'Business Loan',
    title: 'Business Loan',
    description: 'For business expansion, equipment purchase, or working capital needs.',
    icon: Briefcase,
    accent: 'emerald',
  },
];

interface LoanTypeSelectorProps {
  selectedType: LoanType | null;
  onSelect: (type: LoanType) => void;
  error?: string;
}

export default function LoanTypeSelector({
  selectedType,
  onSelect,
  error,
}: LoanTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <label className="block text-sm font-semibold text-slate-800">
          Select Loan Category <span className="text-rose-500">*</span>
        </label>
        <span className="text-xs text-slate-500">Choose the type of financing you are seeking</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {loanTypeOptions.map((option) => {
          const isSelected = selectedType === option.type;
          const Icon = option.icon;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onSelect(option.type)}
              className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between group ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                )}
              </div>

              <div>
                <h3
                  className={`text-sm font-bold tracking-tight mb-1 ${
                    isSelected ? 'text-blue-900' : 'text-slate-900'
                  }`}
                >
                  {option.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
