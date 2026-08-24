'use client';

import React from 'react';
import { ComparisonProductResult } from '@/types/database';
import { formatINR, formatTenure } from '@/lib/utils';
import { formatVerifiedDate } from '@/services/loan/loanCatalogService';
import {
  X,
  Building2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  IndianRupee,
  Layers,
  FileCheck,
} from 'lucide-react';

interface ProductDetailDrawerProps {
  product: ComparisonProductResult | null;
  onClose: () => void;
}

export default function ProductDetailDrawer({
  product,
  onClose,
}: ProductDetailDrawerProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur z-10 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  {product.lenderType}
                </span>
                <span className="text-xs text-slate-500 font-medium">{product.loanType}</span>
              </div>
              <h2 className="text-xl font-display font-bold text-slate-900">
                {product.productName}
              </h2>
              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{product.lenderName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 text-xs">
            {/* Stale Warning Banner if applicable */}
            {product.isStale && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Rate information may need verification</strong>
                  <span>This product data was last checked over 90 days ago. Please confirm current rates directly with the lender.</span>
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-600 leading-relaxed">
                {product.description}
              </div>
            )}

            {/* 1. Core Financial Calculation Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-blue-600" />
                <span>Calculated Financial Breakdown</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Advertised Rate:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{product.advertisedRateDisplay}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">({product.interestRateType})</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Monthly EMI:</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">
                    {formatINR(product.monthlyEMI)}
                  </span>
                  {product.maxMonthlyEMI && product.maxMonthlyEMI !== product.minMonthlyEMI && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Up to {formatINR(product.maxMonthlyEMI)}
                    </span>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Total Interest:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{formatINR(product.totalInterest)}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Over full tenure</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Processing Fee:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{formatINR(product.processingFee)}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{product.processingFeeDisplay}</span>
                </div>

                <div className="p-3.5 bg-slate-900 text-white rounded-xl col-span-2 sm:col-span-2">
                  <span className="text-slate-300 block mb-0.5 font-medium">Known Borrowing Cost:</span>
                  <span className="font-mono font-bold text-emerald-400 text-base">
                    {formatINR(product.knownBorrowingCost)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Total Interest ({formatINR(product.totalInterest)}) + Processing Fee ({formatINR(product.processingFee)})
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Basic Eligibility Parameters */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Eligibility & Underwriting Criteria</span>
              </h3>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  {product.isEligible ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                  <span className="font-semibold text-slate-800">
                    {product.isEligible ? 'Meets Basic Stated Eligibility Criteria' : 'Requires Additional Verification / May Fall Below Criteria'}
                  </span>
                </div>

                <ul className="space-y-1.5 pl-6 list-disc text-slate-600">
                  {product.eligibilityNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 block">Min Monthly Income:</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {product.minimumIncome ? formatINR(product.minimumIncome) : 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Min Credit Score:</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {product.minimumCreditScore ? `${product.minimumCreditScore}+` : 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Employment:</span>
                    <span className="font-semibold text-slate-900">
                      {product.employmentEligibility || 'All'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Product Rules & Prepayment Terms */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Terms & Prepayment Flexibility</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Prepayment / Foreclosure:</span>
                  <span className="font-semibold text-slate-800">
                    {product.prepaymentPenalty || (product.prepaymentAllowed ? 'Allowed (Nil penalty on floating)' : 'Restricted')}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Lock-in Period:</span>
                  <span className="font-semibold text-slate-800">
                    {product.lockInMonths ? `${product.lockInMonths} Months` : 'Nil / None'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Collateral / Security:</span>
                  <span className="font-semibold text-slate-800">
                    {product.collateralRequired ? 'Property / Asset Mortgage Required' : 'Unsecured / Nil'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Co-applicant Allowed:</span>
                  <span className="font-semibold text-slate-800">
                    {product.coApplicantAllowed ? 'Yes (Can add spouse/family)' : 'Single Applicant Only'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Verified Source & Freshness Attribution */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Source Verification & Attribution</span>
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Verified: {formatVerifiedDate(product.lastVerifiedAt)}</span>
                </span>
              </div>
              <p className="text-slate-600">
                Source: <strong>{product.sourceName}</strong>
              </p>
              {product.sourceUrl && (
                <a
                  href={product.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <span>Visit Official Lender Disclosure Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Mandatory Cost Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-700 block mb-1">Disclaimer:</strong>
              Known Borrowing Cost includes disclosed charges available in our dataset. Actual borrowing cost may differ based on lender-specific charges, taxes, insurance, borrower profile and final sanction terms. LoanFit AI does not provide loan approval guarantees.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white transition-colors"
          >
            Close Details
          </button>
          {product.sourceUrl && (
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm"
            >
              <span>View Lender Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
