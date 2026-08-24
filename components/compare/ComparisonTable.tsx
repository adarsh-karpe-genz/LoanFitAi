'use client';

import React from 'react';
import { ComparisonProductResult, SortField, SortOrder } from '@/types/database';
import { formatINR } from '@/lib/utils';
import { formatVerifiedDate } from '@/services/loan/loanCatalogService';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
  Eye,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

interface ComparisonTableProps {
  products: ComparisonProductResult[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
  onSelectProduct: (product: ComparisonProductResult) => void;
}

export default function ComparisonTable({
  products,
  sortField,
  sortOrder,
  onSortChange,
  onSelectProduct,
}: ComparisonTableProps) {
  const renderSortHeader = (
    field: SortField,
    label: string,
    tooltipText?: string
  ) => {
    const isActive = sortField === field;
    return (
      <th
        scope="col"
        className="py-3.5 px-4 text-left text-xs font-bold text-slate-700 select-none cursor-pointer hover:bg-slate-100/70 transition-colors"
        onClick={() => onSortChange(field)}
      >
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          {tooltipText && <Tooltip content={tooltipText} />}
          <span className="text-slate-400">
            {isActive ? (
              sortOrder === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
              )
            ) : (
              <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
            )}
          </span>
        </div>
      </th>
    );
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Info className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">
            No matching loan products found.
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your filters, changing your loan amount, tenure, or loan type.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Sort Label Note */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900">{products.length}</strong> loan products.
        </span>
        <span className="italic text-[11px]">
          Sorted by {sortField.replace(/_/g, ' ')} ({sortOrder === 'asc' ? 'Lowest first' : 'Highest first'}). Sorting is for comparison only and is not a recommendation.
        </span>
      </div>

      {/* Desktop Wide Table (1280px+ optimized with horizontal scrolling) */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th scope="col" className="py-3.5 px-4 text-left font-bold text-slate-700">
                  Lender
                </th>
                <th scope="col" className="py-3.5 px-4 text-left font-bold text-slate-700">
                  Loan Product
                </th>
                {renderSortHeader(
                  'interest_rate',
                  'Advertised Rate Range',
                  'Advertised rate range. Actual rate varies based on credit appraisal.'
                )}
                {renderSortHeader(
                  'emi',
                  'Monthly EMI',
                  'Calculated monthly installment based on advertised baseline rate.'
                )}
                {renderSortHeader(
                  'total_interest',
                  'Total Interest',
                  'Cumulative interest calculated across full requested tenure.'
                )}
                {renderSortHeader(
                  'processing_fee',
                  'Processing Fee',
                  'Upfront lender processing fee including stated minimum/maximum limits.'
                )}
                {renderSortHeader(
                  'known_borrowing_cost',
                  'Known Borrowing Cost',
                  'Total Interest + Processing Fee + Known Disclosed Charges.'
                )}
                <th scope="col" className="py-3.5 px-4 text-left font-bold text-slate-700">
                  Eligibility
                </th>
                <th scope="col" className="py-3.5 px-4 text-left font-bold text-slate-700">
                  Source & Verified
                </th>
                <th scope="col" className="py-3.5 px-4 text-right font-bold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {products.map((p) => (
                <tr
                  key={p.productId}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* 1. Lender */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold font-display text-xs shrink-0">
                        {p.lenderShortName || p.lenderName.slice(0, 3)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block truncate max-w-[140px]">
                          {p.lenderName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {p.lenderType}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 2. Product Name */}
                  <td className="py-4 px-4">
                    <span className="font-semibold text-slate-800 block">
                      {p.productName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {p.interestRateType} Rate
                    </span>
                  </td>

                  {/* 3. Advertised Rate */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {p.advertisedRateDisplay}
                    </span>
                  </td>

                  {/* 4. Monthly EMI */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-blue-700 text-sm">
                      {formatINR(p.monthlyEMI)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/ month</span>
                  </td>

                  {/* 5. Total Interest */}
                  <td className="py-4 px-4 whitespace-nowrap font-mono font-semibold text-slate-800">
                    {formatINR(p.totalInterest)}
                  </td>

                  {/* 6. Processing Fee */}
                  <td className="py-4 px-4 whitespace-nowrap font-mono font-semibold text-slate-800">
                    {formatINR(p.processingFee)}
                    <span className="text-[10px] text-slate-400 block font-sans">
                      {p.processingFeeDisplay}
                    </span>
                  </td>

                  {/* 7. Known Borrowing Cost */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-950 text-sm">
                      {formatINR(p.knownBorrowingCost)}
                    </span>
                  </td>

                  {/* 8. Eligibility Match */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {p.isEligible ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Stated Match
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200" title={p.eligibilityNotes[0]}>
                        <AlertCircle className="w-3 h-3 text-slate-400" />
                        Check Terms
                      </span>
                    )}
                  </td>

                  {/* 9. Source & Last Verified */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <a
                        href={p.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold max-w-[130px] truncate"
                        title={`Source: ${p.sourceName}`}
                      >
                        <span className="truncate">{p.sourceName}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{formatVerifiedDate(p.lastVerifiedAt)}</span>
                        {p.isStale && (
                          <span className="text-amber-500 font-bold" title="Needs re-verification">!</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 10. Actions */}
                  <td className="py-4 px-4 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => onSelectProduct(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all group-hover:bg-blue-600"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile / Tablet Cards View (< 1024px) */}
      <div className="lg:hidden space-y-4">
        {products.map((p) => (
          <div
            key={p.productId}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {p.lenderType} • {p.loanType}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  {p.productName}
                </h4>
                <p className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>{p.lenderName}</span>
                </p>
              </div>

              {p.isEligible ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Eligible
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                  Review
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-500 text-[11px] block">Advertised Rate:</span>
                <span className="font-mono font-bold text-slate-900">{p.advertisedRateDisplay}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Monthly EMI:</span>
                <span className="font-mono font-bold text-blue-700">{formatINR(p.monthlyEMI)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Total Interest:</span>
                <span className="font-mono font-semibold text-slate-800">{formatINR(p.totalInterest)}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Processing Fee:</span>
                <span className="font-mono font-semibold text-slate-800">{formatINR(p.processingFee)}</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200/60">
                <span className="text-slate-500 text-[11px] block">Known Borrowing Cost:</span>
                <span className="font-mono font-bold text-slate-950 text-sm">{formatINR(p.knownBorrowingCost)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Verified: {formatVerifiedDate(p.lastVerifiedAt)}</span>
              </div>

              <button
                type="button"
                onClick={() => onSelectProduct(p)}
                className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
