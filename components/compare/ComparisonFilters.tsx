'use client';

import React from 'react';
import { ComparisonFilterState } from '@/types/database';
import { Search, Filter, RotateCcw, CheckSquare, Square, Building2, Percent, IndianRupee } from 'lucide-react';

interface ComparisonFiltersProps {
  filters: ComparisonFilterState;
  onFilterChange: (filters: ComparisonFilterState) => void;
  onReset: () => void;
  availableLenders: { id: string; name: string; shortName?: string | null }[];
  maxRateBound: number;
  maxEMIBound: number;
}

export default function ComparisonFilters({
  filters,
  onFilterChange,
  onReset,
  availableLenders,
  maxRateBound,
  maxEMIBound,
}: ComparisonFiltersProps) {
  const handleLenderToggle = (lenderId: string) => {
    const current = filters.lenderIds;
    const exists = current.includes(lenderId);
    const updated = exists
      ? current.filter((id) => id !== lenderId)
      : [...current, lenderId];
    onFilterChange({ ...filters, lenderIds: updated });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchTerm: e.target.value });
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? undefined : Number(e.target.value);
    onFilterChange({ ...filters, maxRate: val });
  };

  const handleEMIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? undefined : Number(e.target.value);
    onFilterChange({ ...filters, maxEMI: val });
  };

  const handleEligibleToggle = () => {
    onFilterChange({ ...filters, onlyEligible: !filters.onlyEligible });
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Filter Loan Products
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Grid of Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* 1. Search Bar */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-slate-700">Search Lender / Product</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={handleSearchChange}
              placeholder="e.g. SBI, HDFC, Fixed..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 2. Max Interest Rate Filter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-700">Max Interest Rate</label>
            <span className="font-mono text-slate-500 font-bold">
              {filters.maxRate ? `${filters.maxRate}% p.a.` : 'Any Rate'}
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Percent className="w-3.5 h-3.5" />
            </div>
            <input
              type="number"
              min={6}
              max={25}
              step={0.25}
              value={filters.maxRate ?? ''}
              onChange={handleRateChange}
              placeholder={`Max rate (e.g. ${maxRateBound || 12}%)`}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 3. Max Monthly EMI Filter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-700">Max Monthly EMI</label>
            <span className="font-mono text-slate-500 font-bold">
              {filters.maxEMI ? `₹${filters.maxEMI.toLocaleString('en-IN')}` : 'Any EMI'}
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <span className="font-bold text-xs">₹</span>
            </div>
            <input
              type="number"
              min={1000}
              step={1000}
              value={filters.maxEMI ?? ''}
              onChange={handleEMIChange}
              placeholder="e.g. 35000"
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 4. Eligibility Filter Toggle */}
        <div className="space-y-1.5 flex flex-col justify-end">
          <button
            type="button"
            onClick={handleEligibleToggle}
            className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-semibold ${
              filters.onlyEligible
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {filters.onlyEligible ? (
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Only Stated Eligible</span>
          </button>
        </div>
      </div>

      {/* Lender Multi-Select Chips */}
      {availableLenders.length > 0 && (
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Filter by Lending Institutions:
          </label>
          <div className="flex flex-wrap gap-2">
            {availableLenders.map((lender) => {
              const isSelected = filters.lenderIds.length === 0 || filters.lenderIds.includes(lender.id);
              const isExplicit = filters.lenderIds.includes(lender.id);

              return (
                <button
                  key={lender.id}
                  type="button"
                  onClick={() => handleLenderToggle(lender.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    isExplicit
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : isSelected && filters.lenderIds.length === 0
                      ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  <span>{lender.shortName || lender.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
