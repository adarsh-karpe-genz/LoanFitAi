'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function ProfileSummaryRail() {
  const [params, setParams] = useState({
    loanAmount: 3000000,
    tenureYears: 20,
    loanType: 'Home Loan',
    income: 60000,
    existingEMI: 5000,
    creditScore: 760,
  });

  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setParams({
            loanAmount: data.loanRequirement?.loan_amount || 3000000,
            tenureYears: data.loanRequirement?.tenure_years || 20,
            loanType: data.loanRequirement?.loan_type || 'Home Loan',
            income: data.financialInfo?.monthly_income || 60000,
            existingEMI: data.financialInfo?.existing_emi || 5000,
            creditScore: data.financialInfo?.credit_score || 760,
          });
        } else {
          const stored = localStorage.getItem('loanfit_simulator_params');
          if (stored) {
            const p = JSON.parse(stored);
            setParams((prev) => ({
              ...prev,
              loanAmount: p.amount || prev.loanAmount,
              tenureYears: p.tenureYears || prev.tenureYears,
              income: p.income || prev.income,
              existingEMI: p.existingEMI !== undefined ? p.existingEMI : prev.existingEMI,
              creditScore: p.creditScore || prev.creditScore,
            }));
          }
        }
      } catch {
        // fallback to defaults
      }
    }

    fetchLatest();
  }, []);

  const items = [
    { label: 'Loan amount', value: formatINR(params.loanAmount) },
    { label: 'Tenure', value: `${params.tenureYears} years` },
    { label: 'Loan type', value: params.loanType },
    { label: 'Monthly income', value: formatINR(params.income) },
    { label: 'Existing EMIs', value: formatINR(params.existingEMI) },
    { label: 'CIBIL score', value: String(params.creditScore) },
  ];

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
          Your profile
        </h3>
        <Link
          href="/profile"
          className="flex items-center gap-1 text-[11px] font-medium"
          style={{ color: 'var(--navy-600)' }}
        >
          <Pencil className="w-3 h-3" />
          Edit
        </Link>
      </div>

      <dl className="space-y-0">
        {items.map(({ label, value }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '6px 0',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <dt
              style={{
                minWidth: 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                fontSize: '11px',
                color: 'var(--text-muted)',
                flexShrink: 1,
              }}
            >
              {label}
            </dt>
            <dd
              style={{
                flexShrink: 0,
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-geist-mono, monospace)',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
