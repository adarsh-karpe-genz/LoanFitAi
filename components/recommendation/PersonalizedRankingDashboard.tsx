'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import SuitabilityScoreMeter from '@/components/ui/SuitabilityScoreMeter';
import XaiExplanationCard, { XaiProps } from '@/components/recommendation/XaiExplanationCard';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoanProduct {
  id: string;
  rank: number;
  lenderName: string;
  loanType: string;
  interestRate: number;
  processingFee: number;
  processingFeeAmt: number;
  tenureMonths: number;
  emi: number;
  netCost: number;
  totalInterest: number;
  suitabilityScore: number;
  foir: number;
  eligibility: 'eligible' | 'borderline' | 'ineligible';
  minCibil: number;
  costUtility: number;
  feeUtility: number;
  eligibilityUtility: number;
  creditScoreBuffer: number;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatINR(value: number): string {
  const rounded = Math.round(value);
  const s = rounded.toString();
  if (s.length <= 3) return `₹${s}`;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${rest},${last3}`;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_PRODUCTS: LoanProduct[] = [
  {
    id: 'sbi-home',
    rank: 1,
    lenderName: 'SBI',
    loanType: 'Regular Home Loan',
    interestRate: 8.50,
    processingFee: 0.35,
    processingFeeAmt: 10500,
    tenureMonths: 240,
    emi: 26035,
    netCost: 3248900,
    totalInterest: 3238400,
    suitabilityScore: 94,
    foir: 0.517,
    eligibility: 'eligible',
    minCibil: 700,
    costUtility: 0.94,
    feeUtility: 0.94,
    eligibilityUtility: 0.96,
    creditScoreBuffer: 60,
  },
  {
    id: 'hdfc-home',
    rank: 2,
    lenderName: 'HDFC Bank',
    loanType: 'Home Advantage Loan',
    interestRate: 8.75,
    processingFee: 0.50,
    processingFeeAmt: 15000,
    tenureMonths: 240,
    emi: 26450,
    netCost: 3348000,
    totalInterest: 3333000,
    suitabilityScore: 87,
    foir: 0.524,
    eligibility: 'eligible',
    minCibil: 700,
    costUtility: 0.81,
    feeUtility: 0.78,
    eligibilityUtility: 0.94,
    creditScoreBuffer: 60,
  },
  {
    id: 'icici-home',
    rank: 3,
    lenderName: 'ICICI Bank',
    loanType: 'Home Loan',
    interestRate: 9.00,
    processingFee: 0.50,
    processingFeeAmt: 15000,
    tenureMonths: 240,
    emi: 26980,
    netCost: 3461200,
    totalInterest: 3446200,
    suitabilityScore: 79,
    foir: 0.533,
    eligibility: 'eligible',
    minCibil: 725,
    costUtility: 0.68,
    feeUtility: 0.78,
    eligibilityUtility: 0.88,
    creditScoreBuffer: 35,
  },
  {
    id: 'axis-home',
    rank: 4,
    lenderName: 'Axis Bank',
    loanType: 'Shubh Aarambh Home Loan',
    interestRate: 9.40,
    processingFee: 1.00,
    processingFeeAmt: 30000,
    tenureMonths: 240,
    emi: 27600,
    netCost: 3614000,
    totalInterest: 3584000,
    suitabilityScore: 68,
    foir: 0.543,
    eligibility: 'borderline',
    minCibil: 700,
    costUtility: 0.48,
    feeUtility: 0.38,
    eligibilityUtility: 0.90,
    creditScoreBuffer: 60,
  },
  {
    id: 'bob-home',
    rank: 5,
    lenderName: 'Bank of Baroda',
    loanType: 'Baroda Home Loan',
    interestRate: 9.65,
    processingFee: 0.50,
    processingFeeAmt: 15000,
    tenureMonths: 240,
    emi: 28100,
    netCost: 3734000,
    totalInterest: 3719000,
    suitabilityScore: 61,
    foir: 0.552,
    eligibility: 'borderline',
    minCibil: 675,
    costUtility: 0.36,
    feeUtility: 0.78,
    eligibilityUtility: 0.94,
    creditScoreBuffer: 85,
  },
];

function genExplanation(p: LoanProduct): string {
  return `${p.lenderName} ${p.loanType} ranks #${p.rank} with a Suitability Score of ${p.suitabilityScore}/100. Over 20 years, it results in a Net Borrowing Cost of ${formatINR(p.netCost)} — the ${p.rank === 1 ? 'lowest' : `#${p.rank} lowest`} among matched offers. Your CIBIL score provides a ${p.creditScoreBuffer}-point buffer above the minimum requirement, and the monthly EMI of ${formatINR(p.emi)} keeps your debt obligation at ${(p.foir * 100).toFixed(1)}%, well within the 60% regulatory ceiling.`;
}

// ─── Eligibility Tag ──────────────────────────────────────────────────────────

function EligibilityTag({ status }: { status: LoanProduct['eligibility'] }) {
  const config = {
    eligible: { label: 'Eligible', icon: CheckCircle2, color: 'var(--status-eligible)', bg: 'var(--status-eligible-bg)' },
    borderline: { label: 'Borderline', icon: AlertTriangle, color: 'var(--status-borderline)', bg: 'var(--status-borderline-bg)' },
    ineligible: { label: 'Not eligible', icon: XCircle, color: 'var(--status-ineligible)', bg: 'var(--status-ineligible-bg)' },
  }[status];
  const Icon = config.icon;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-semibold border"
      style={{ color: config.color, background: config.bg, borderColor: config.color }}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ─── Loan Card ────────────────────────────────────────────────────────────────

function LoanCard({ product, index, onShowWhy }: { product: LoanProduct; index: number; onShowWhy: (p: LoanProduct) => void }) {
  const isTop = product.rank === 1;

  return (
    <motion.div
      layout
      layoutId={product.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.32, delay: index * 0.06 }}
      className="relative rounded-2xl transition-colors"
      style={{
        background: 'var(--bg-surface)',
        border: isTop ? '2px solid var(--navy-300)' : '1px solid var(--border-subtle)',
      }}
      onMouseEnter={(e) => { if (!isTop) e.currentTarget.style.borderColor = 'var(--navy-300)'; }}
      onMouseLeave={(e) => { if (!isTop) e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
    >
      {isTop && (
        <div className="absolute -top-3 left-5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
          style={{ background: 'var(--navy-600)' }}>
          Best fit
        </div>
      )}

      <div className="p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Score meter */}
        <div className="flex-shrink-0">
          <SuitabilityScoreMeter score={product.suitabilityScore} size="md" animate={true} />
        </div>

        {/* Middle: lender + details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{product.lenderName}</span>
            <EligibilityTag status={product.eligibility} />
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{product.loanType}</p>
          <div className="flex flex-wrap gap-3 pt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="tabular-nums font-mono">{product.interestRate}% p.a.</span>
            <span className="tabular-nums font-mono">Fee: {formatINR(product.processingFeeAmt)}</span>
            <span className="tabular-nums font-mono">Net cost: {formatINR(product.netCost)}</span>
          </div>
        </div>

        {/* Right: EMI (hero number) + actions */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          <div className="text-right">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Monthly EMI</span>
            <p className="tabular-nums font-mono text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatINR(product.emi)}
            </p>
          </div>
          <button
            onClick={() => onShowWhy(product)}
            className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            style={{ color: 'var(--navy-600)', background: 'var(--navy-050)', border: '1px solid var(--navy-150)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--navy-150)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--navy-050)'; }}
          >
            Why this loan?
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PersonalizedRankingDashboard() {
  const [xaiProduct, setXaiProduct] = useState<LoanProduct | null>(null);

  return (
    <>
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {DEMO_PRODUCTS.map((product, i) => (
            <LoanCard
              key={product.id}
              product={product}
              index={i}
              onShowWhy={setXaiProduct}
            />
          ))}
        </AnimatePresence>
      </div>

      {xaiProduct && (
        <XaiExplanationCard
          open={!!xaiProduct}
          onClose={() => setXaiProduct(null)}
          lenderName={xaiProduct.lenderName}
          loanType={xaiProduct.loanType}
          rank={xaiProduct.rank}
          score={xaiProduct.suitabilityScore}
          costUtility={xaiProduct.costUtility}
          feeUtility={xaiProduct.feeUtility}
          eligibilityUtility={xaiProduct.eligibilityUtility}
          emi={xaiProduct.emi}
          netCost={xaiProduct.netCost}
          foir={xaiProduct.foir}
          interestRate={xaiProduct.interestRate}
          creditScoreBuffer={xaiProduct.creditScoreBuffer}
          explanation={genExplanation(xaiProduct)}
        />
      )}
    </>
  );
}
