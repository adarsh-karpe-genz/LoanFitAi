import React from 'react';
import ComparisonTable from '@/components/compare/ComparisonTable';

export default function ComparePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-canvas)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Compare loan products
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Side-by-side comparison across the same attributes. All figures are tabular for accurate scanning. Demo data — verify with each lender.
          </p>
        </div>

        <ComparisonTable />
      </div>
    </div>
  );
}
