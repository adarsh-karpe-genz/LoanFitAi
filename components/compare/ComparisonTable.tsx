'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import SuitabilityScoreMeter from '@/components/ui/SuitabilityScoreMeter';

function formatINR(v: number) {
  const s = Math.round(v).toString();
  if (s.length <= 3) return `₹${s}`;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${rest},${last3}`;
}

interface Product {
  id: string;
  lender: string;
  loanType: string;
  suitabilityScore: number;
  interestRate: string;
  emi: number;
  netCost: number;
  processingFee: number;
  tenure: string;
  minCibil: number;
  maxLtv: string;
  prepayment: string;
  lockIn: string;
  foir: string;
  eligibility: 'eligible' | 'borderline' | 'ineligible';
}

const PRODUCTS: Product[] = [
  { id: 'sbi', lender: 'SBI', loanType: 'Regular Home Loan', suitabilityScore: 94, interestRate: '8.50%', emi: 26035, netCost: 3248900, processingFee: 10500, tenure: '20 years', minCibil: 700, maxLtv: '80%', prepayment: 'Nil (floating)', lockIn: 'None', foir: '51.7%', eligibility: 'eligible' },
  { id: 'hdfc', lender: 'HDFC Bank', loanType: 'Home Advantage', suitabilityScore: 87, interestRate: '8.75%', emi: 26450, netCost: 3348000, processingFee: 15000, tenure: '20 years', minCibil: 700, maxLtv: '75%', prepayment: 'Nil (floating)', lockIn: 'None', foir: '52.4%', eligibility: 'eligible' },
  { id: 'icici', lender: 'ICICI Bank', loanType: 'Home Loan', suitabilityScore: 79, interestRate: '9.00%', emi: 26980, netCost: 3461200, processingFee: 15000, tenure: '20 years', minCibil: 725, maxLtv: '75%', prepayment: 'Nil (floating)', lockIn: '6 months', foir: '53.3%', eligibility: 'eligible' },
  { id: 'axis', lender: 'Axis Bank', loanType: 'Shubh Aarambh', suitabilityScore: 68, interestRate: '9.40%', emi: 27600, netCost: 3614000, processingFee: 30000, tenure: '20 years', minCibil: 700, maxLtv: '80%', prepayment: '2% (fixed rate)', lockIn: 'None', foir: '54.3%', eligibility: 'borderline' },
];

const ATTRIBUTES: { key: keyof Product; label: string; format?: (v: unknown) => string }[] = [
  { key: 'interestRate', label: 'Interest rate' },
  { key: 'emi', label: 'Monthly EMI', format: (v) => formatINR(v as number) },
  { key: 'netCost', label: 'Net borrowing cost', format: (v) => formatINR(v as number) },
  { key: 'processingFee', label: 'Processing fee', format: (v) => formatINR(v as number) },
  { key: 'tenure', label: 'Tenure' },
  { key: 'minCibil', label: 'Min CIBIL score' },
  { key: 'maxLtv', label: 'Max LTV' },
  { key: 'prepayment', label: 'Prepayment penalty' },
  { key: 'lockIn', label: 'Lock-in period' },
  { key: 'foir', label: 'FOIR (your profile)' },
  { key: 'eligibility', label: 'Eligibility status' },
];

function EligibilityTag({ status }: { status: Product['eligibility'] }) {
  const cfg = {
    eligible: { label: 'Eligible', Icon: CheckCircle2, color: 'var(--status-eligible)', bg: 'var(--status-eligible-bg)' },
    borderline: { label: 'Borderline', Icon: AlertTriangle, color: 'var(--status-borderline)', bg: 'var(--status-borderline-bg)' },
    ineligible: { label: 'Not eligible', Icon: XCircle, color: 'var(--status-ineligible)', bg: 'var(--status-ineligible-bg)' },
  }[status];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-semibold border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.color }}>
      <cfg.Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// Desktop table
function DesktopTable() {
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid var(--border-subtle)' }}>
      <table className="w-full border-collapse text-xs" style={{ background: 'var(--bg-surface)' }}>
        <thead>
          <tr>
            {/* Sticky attribute column header */}
            <th className="sticky left-0 z-10 p-4 text-left font-semibold w-48"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-strong)', borderRight: '1px solid var(--border-subtle)' }}>
              Attribute
            </th>
            {PRODUCTS.map((p) => (
              <th key={p.id} className="p-4 text-center align-top font-medium min-w-[160px]"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-strong)' }}>
                <div className="flex flex-col items-center gap-2">
                  <SuitabilityScoreMeter score={p.suitabilityScore} size="sm" showLabel={false} animate={true} />
                  <div>
                    <p className="font-semibold">{p.lender}</p>
                    <p className="text-[10px] font-normal mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.loanType}</p>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ATTRIBUTES.map((attr, rowIdx) => (
            <tr key={attr.key}
              style={{ background: rowIdx % 2 === 0 ? 'var(--bg-surface)' : 'var(--navy-050)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--navy-050)')}
              onMouseLeave={e => (e.currentTarget.style.background = rowIdx % 2 === 0 ? 'var(--bg-surface)' : 'var(--navy-050)')}>
              <td className="sticky left-0 p-4 font-medium"
                style={{
                  color: 'var(--text-secondary)',
                  background: rowIdx % 2 === 0 ? 'var(--bg-surface)' : 'var(--navy-050)',
                  borderRight: '1px solid var(--border-subtle)',
                }}>
                {attr.label}
              </td>
              {PRODUCTS.map((p) => {
                const raw = p[attr.key];
                const isEligibility = attr.key === 'eligibility';
                const isNumeric = typeof raw === 'number' || (typeof raw === 'string' && raw.includes('%') && !isEligibility);
                return (
                  <td key={p.id} className="p-4 text-center"
                    style={{ color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)' }}>
                    {isEligibility ? (
                      <EligibilityTag status={raw as Product['eligibility']} />
                    ) : (
                      <span className={isNumeric ? 'tabular-nums font-mono' : ''}>
                        {attr.format ? attr.format(raw) : String(raw)}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Mobile: stacked cards per product
function MobileCards() {
  return (
    <div className="space-y-4">
      {PRODUCTS.map((p) => (
        <div key={p.id} className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
          {/* Header */}
          <div className="flex items-center gap-3 p-4"
            style={{ background: 'var(--navy-950)', borderBottom: '1px solid var(--navy-800)' }}>
            <SuitabilityScoreMeter score={p.suitabilityScore} size="sm" showLabel={false} animate={true} />
            <div>
              <p className="text-sm font-semibold text-white">{p.lender}</p>
              <p className="text-[11px]" style={{ color: 'var(--navy-300)' }}>{p.loanType}</p>
            </div>
          </div>
          {/* Rows */}
          <dl style={{ background: 'var(--bg-surface)' }}>
            {ATTRIBUTES.map((attr) => {
              const raw = p[attr.key];
              const isEligibility = attr.key === 'eligibility';
              return (
                <div key={attr.key} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <dt className="text-xs" style={{ color: 'var(--text-secondary)' }}>{attr.label}</dt>
                  <dd className="text-xs font-semibold">
                    {isEligibility
                      ? <EligibilityTag status={raw as Product['eligibility']} />
                      : <span className="tabular-nums font-mono" style={{ color: 'var(--text-primary)' }}>
                        {attr.format ? attr.format(raw) : String(raw)}
                      </span>
                    }
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ))}
    </div>
  );
}

export default function ComparisonTable() {
  return (
    <div>
      <div className="hidden md:block"><DesktopTable /></div>
      <div className="md:hidden"><MobileCards /></div>
    </div>
  );
}
