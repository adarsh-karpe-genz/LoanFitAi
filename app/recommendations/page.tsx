import React from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import PersonalizedRankingDashboard from '@/components/recommendation/PersonalizedRankingDashboard';
import WhatIfSimulator from '@/components/recommendation/WhatIfSimulator';

const profileSummary = [
  { label: 'Loan amount', value: '₹30,00,000' },
  { label: 'Tenure', value: '20 years' },
  { label: 'Loan type', value: 'Home Loan' },
  { label: 'Monthly income', value: '₹60,000' },
  { label: 'Existing EMIs', value: '₹5,000' },
  { label: 'CIBIL score', value: '760' },
];

export default function RecommendationsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-canvas)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Your loan matches
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Ranked by Suitability Score — a composite of net cost, fees, and your credit headroom. Loans exceeding 60% FOIR are excluded.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left rail: profile + what-if */}
          <aside className="lg:col-span-3 space-y-4">
            {/* Profile summary */}
            <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Your profile</h3>
                <Link href="/profile"
                  className="flex items-center gap-1 text-[11px] font-medium"
                  style={{ color: 'var(--navy-600)' }}>
                  <Pencil className="w-3 h-3" />
                  Edit
                </Link>
              </div>
              <dl className="space-y-2.5">
                {profileSummary.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <dt className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{label}</dt>
                    <dd className="tabular-nums font-mono text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Adjust parameters */}
            <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <h3 className="text-xs font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Adjust parameters</h3>
              <WhatIfSimulator />
            </div>
          </aside>

          {/* Center: ranked results */}
          <main className="lg:col-span-9 space-y-3">
            <PersonalizedRankingDashboard />

            {/* Disclaimer */}
            <p className="text-[11px] pt-2" style={{ color: 'var(--text-muted)' }}>
              Rates and fees are indicative demo data, labeled as such. Verify with each lender before applying.
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
