import React from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import PersonalizedRankingDashboard from '@/components/recommendation/PersonalizedRankingDashboard';
import WhatIfSimulator from '@/components/recommendation/WhatIfSimulator';

// Profile summary rows — label left, value right
// FIX: Using a dl with explicit flex + gap so label and value can NEVER overlap
// even when the rail is narrow (col-span-3 ≈ 280px on 1024px viewport)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* Page heading */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Your loan matches
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Ranked by Suitability Score — a composite of net cost, fees, and your credit headroom.
            Loans exceeding 60% FOIR are excluded.
          </p>
        </div>

        {/* ── Main grid: profile rail (narrow) + results (wide) ── */}
        {/* The rail is col-span-3, results col-span-9.
            WhatIfSimulator is NOT in this narrow rail — it is in its own
            full-width section below so it always has adequate horizontal space. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left rail: profile summary ONLY — no simulator here */}
          <aside className="lg:col-span-3 space-y-4">
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

              {/* Profile rows — explicit flex layout, no collision possible */}
              <dl className="space-y-0">
                {profileSummary.map(({ label, value }) => (
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

            {/* Quick actions */}
            <div
              className="rounded-2xl p-4 space-y-2"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Actions
              </h3>
              <Link
                href="/compare"
                className="block text-center text-xs font-medium py-2.5 px-4 rounded-md"
                style={{
                  color: 'var(--navy-600)',
                  background: 'var(--navy-050)',
                  border: '1px solid var(--navy-150)',
                }}
              >
                Compare side by side
              </Link>
              <Link
                href="/profile"
                className="block text-center text-xs font-medium py-2.5 px-4 rounded-md"
                style={{
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Update my profile
              </Link>
            </div>
          </aside>

          {/* Center: ranked loan results */}
          <main className="lg:col-span-9 space-y-3">
            <PersonalizedRankingDashboard />
            <p className="text-[11px] pt-1" style={{ color: 'var(--text-muted)' }}>
              All figures are indicative demo data. Verify terms directly with each lender before applying.
            </p>
          </main>
        </div>

        {/* ── What-If Simulator: full-width below results ──
            This ensures the simulator ALWAYS has adequate horizontal space
            (100% of page width minus padding) regardless of viewport size.
            The simulator's own internal layout is single-column with proper
            flex rows, so it handles any width from 320px upward. ── */}
        <section
          className="rounded-2xl p-6 space-y-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="space-y-1">
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              What-if simulator
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Adjust loan parameters to see how EMI, total interest, and FOIR change in real time.
              Numbers interpolate smoothly as you drag — no page reload.
            </p>
          </div>

          {/* On md+ screens: 2-column layout (sliders | output) within the wide section.
              On mobile (< md): single column stack.
              This is safe because the parent container is full-width,
              so each column gets ≥ 400px at md, ≥ 560px at lg — plenty of space. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <WhatIfSimulator />
          </div>
        </section>

      </div>
    </div>
  );
}
