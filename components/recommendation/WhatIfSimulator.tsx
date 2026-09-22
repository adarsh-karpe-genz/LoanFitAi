'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useSpring } from 'framer-motion';
import { isSupabaseConfigured } from '@/lib/supabase/client';

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatINR(value: number): string {
  const rounded = Math.round(value);
  if (rounded >= 10000000) return `₹${(rounded / 10000000).toFixed(2)} Cr`;
  if (rounded >= 100000) {
    const lakhs = Math.floor(rounded / 100000);
    const remainder = rounded % 100000;
    if (remainder === 0) return `₹${lakhs} Lakh`;
    const s = remainder.toString().padStart(5, '0');
    return `₹${lakhs},${s.slice(0, 2)},${s.slice(2)}`;
  }
  const s = rounded.toString();
  if (s.length <= 3) return `₹${s}`;
  return `₹${s.slice(0, s.length - 3)},${s.slice(-3)}`;
}

function calcEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (annualRate === 0 || tenureMonths === 0) return principal / Math.max(tenureMonths, 1);
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ─── Animated Number ──────────────────────────────────────────────────────────

function AnimatedNumber({ value, format }: { value: number; format: (v: number) => string }) {
  const spring = useSpring(value, { stiffness: 100, damping: 20 });
  const [display, setDisplay] = useState(value);

  useEffect(() => { spring.set(value); }, [value, spring]);
  useEffect(() => {
    const unsub = spring.on('change', (v) => setDisplay(v));
    return unsub;
  }, [spring]);

  return <span className="tabular-nums font-mono">{format(display)}</span>;
}

// ─── Slider Component ─────────────────────────────────────────────────────────

interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

function Slider({ id, label, value, min, max, step, format, onChange }: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="space-y-1.5">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
        <label
          htmlFor={id}
          style={{
            minWidth: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            flexShrink: 1,
          }}
        >
          {label}
        </label>
        <span
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
          {format(value)}
        </span>
      </div>

      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '9999px',
            background: 'var(--navy-150)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: '9999px',
              background: 'var(--navy-300)',
              width: `${pct}%`,
              transition: 'width 0.12s ease-out',
            }}
          />
        </div>

        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
            zIndex: 2,
          }}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={format(value)}
        />

        <div
          style={{
            position: 'absolute',
            left: `calc(${pct}% - 9px)`,
            width: isDragging ? '20px' : '18px',
            height: isDragging ? '20px' : '18px',
            borderRadius: '50%',
            background: 'var(--navy-600)',
            border: '2px solid white',
            boxShadow: isDragging
              ? '0 0 0 4px rgba(78,164,204,0.30), 0 1px 4px rgba(0,0,42,0.20)'
              : '0 1px 4px rgba(0,0,42,0.18)',
            pointerEvents: 'none',
            zIndex: 1,
            transition: 'width 150ms ease-out, height 150ms ease-out, box-shadow 150ms ease-out',
          }}
        />
      </div>
    </div>
  );
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────

function StatRow({
  label,
  value,
  valueColor,
  bold,
}: {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: '12px',
        paddingTop: '8px',
        paddingBottom: '8px',
      }}
    >
      <span
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
      </span>
      <span
        style={{
          flexShrink: 0,
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-geist-mono, monospace)',
          fontVariantNumeric: 'tabular-nums',
          fontSize: bold ? '13px' : '12px',
          fontWeight: bold ? 700 : 600,
          color: valueColor ?? 'var(--text-primary)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── FOIR Status ──────────────────────────────────────────────────────────────

function foirStatus(foir: number) {
  if (foir < 0.40) return { label: 'Very comfortable', color: 'var(--status-eligible)', bg: 'var(--status-eligible-bg)', icon: '✓' };
  if (foir < 0.55) return { label: 'Within safe limits', color: 'var(--status-eligible)', bg: 'var(--status-eligible-bg)', icon: '✓' };
  if (foir < 0.60) return { label: 'Approaching limit', color: 'var(--status-borderline)', bg: 'var(--status-borderline-bg)', icon: '!' };
  return { label: 'Exceeds 60% cap', color: 'var(--status-ineligible)', bg: 'var(--status-ineligible-bg)', icon: '✗' };
}

function cibilRating(score: number) {
  if (score >= 750) return { label: 'Excellent', color: 'var(--status-eligible)', bg: 'var(--status-eligible-bg)' };
  if (score >= 700) return { label: 'Good', color: 'var(--status-eligible)', bg: 'var(--status-eligible-bg)' };
  if (score >= 650) return { label: 'Fair', color: 'var(--status-borderline)', bg: 'var(--status-borderline-bg)' };
  return { label: 'Needs attention', color: 'var(--status-ineligible)', bg: 'var(--status-ineligible-bg)' };
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DEMO_RATE = 8.75;

export default function WhatIfSimulator() {
  const [amount, setAmount] = useState(3000000);
  const [tenureYears, setTenureYears] = useState(20);
  const [income, setIncome] = useState(60000);
  const [existingEMI, setExistingEMI] = useState(5000);
  const [creditScore, setCreditScore] = useState(760);
  const [isSaved, setIsSaved] = useState(false);

  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── Load saved values from database or localStorage on mount ────────────────
  useEffect(() => {
    async function loadSavedParams() {
      try {
        // Try fetching verified profile from API
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.financialInfo?.monthly_income) {
            setIncome(Number(data.financialInfo.monthly_income));
          }
          if (data.financialInfo?.existing_emi !== undefined) {
            setExistingEMI(Number(data.financialInfo.existing_emi));
          }
          if (data.financialInfo?.credit_score) {
            setCreditScore(Number(data.financialInfo.credit_score));
          }
          if (data.loanRequirement?.loan_amount) {
            setAmount(Number(data.loanRequirement.loan_amount));
          }
          if (data.loanRequirement?.tenure_years) {
            setTenureYears(Number(data.loanRequirement.tenure_years));
          }
        } else {
          // Fallback to localStorage demo key
          const stored = localStorage.getItem('loanfit_simulator_params');
          if (stored) {
            const p = JSON.parse(stored);
            if (p.amount) setAmount(p.amount);
            if (p.tenureYears) setTenureYears(p.tenureYears);
            if (p.income) setIncome(p.income);
            if (p.existingEMI !== undefined) setExistingEMI(p.existingEMI);
            if (p.creditScore) setCreditScore(p.creditScore);
          }
        }
      } catch {
        // use default values
      }
    }

    loadSavedParams();
  }, []);

  // ── Debounced Auto-Save to Database & LocalStorage ──────────────────────────
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      // 1. Save to localStorage for instant local persistence
      try {
        localStorage.setItem(
          'loanfit_simulator_params',
          JSON.stringify({ amount, tenureYears, income, existingEMI, creditScore })
        );
      } catch {
        // ignore
      }

      // 2. Persist to Supabase database via API
      try {
        await Promise.all([
          fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'financial',
              monthly_income: income,
              existing_emi: existingEMI,
              credit_score: creditScore,
            }),
          }),
          fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'loan_requirement',
              loan_type: 'Home Loan',
              loan_amount: amount,
              tenure_years: tenureYears,
            }),
          }),
        ]);

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      } catch (err) {
        console.error('Failed to auto-save simulator params:', err);
      }
    }, 600);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [amount, tenureYears, income, existingEMI, creditScore]);

  const tenureMonths = tenureYears * 12;
  const emi = calcEMI(amount, DEMO_RATE, tenureMonths);
  const totalPaid = emi * tenureMonths;
  const totalInterest = totalPaid - amount;
  const netCost = totalInterest + 10000;
  const foir = income > 0 ? (existingEMI + emi) / income : 0;
  const foirPct = foir * 100;
  const status = foirStatus(foir);
  const cibil = cibilRating(creditScore);

  const divider = { borderTop: '1px solid var(--border-subtle)' };

  return (
    <div style={{ width: '100%' }}>
      {/* ── Sliders panel ── */}
      <div
        style={{
          borderRadius: '12px',
          background: 'var(--bg-canvas)',
          border: '1px solid var(--border-subtle)',
          padding: '16px',
          marginBottom: '12px',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            Financial & Loan Parameters
          </span>
          {isSaved && (
            <span className="text-[10px] font-medium text-emerald-600 transition-opacity">
              ✓ Saved to profile
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Slider
            id="sim-amount"
            label="Loan amount"
            value={amount}
            min={500000}
            max={10000000}
            step={100000}
            format={formatINR}
            onChange={setAmount}
          />
          <Slider
            id="sim-tenure"
            label="Repayment tenure"
            value={tenureYears}
            min={1}
            max={30}
            step={1}
            format={(v) => `${v} yr${v !== 1 ? 's' : ''}`}
            onChange={setTenureYears}
          />
          <Slider
            id="sim-income"
            label="Monthly income"
            value={income}
            min={20000}
            max={300000}
            step={5000}
            format={formatINR}
            onChange={setIncome}
          />
          <Slider
            id="sim-emi"
            label="Existing EMIs"
            value={existingEMI}
            min={0}
            max={50000}
            step={1000}
            format={(v) => (v === 0 ? 'None' : formatINR(v))}
            onChange={setExistingEMI}
          />
          <Slider
            id="sim-cibil"
            label="Credit score (CIBIL)"
            value={creditScore}
            min={300}
            max={900}
            step={5}
            format={(v) => `${v} (${cibil.label})`}
            onChange={setCreditScore}
          />
        </div>

        <p
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            ...divider,
            fontSize: '10px',
            color: 'var(--text-muted)',
            lineHeight: '1.5',
          }}
        >
          {DEMO_RATE}% p.a. illustrative rate. Values automatically persist to your borrower profile.
        </p>
      </div>

      {/* ── Hero: Monthly EMI ── */}
      <div
        style={{
          borderRadius: '12px',
          background: 'var(--navy-950)',
          border: '1px solid var(--navy-800)',
          padding: '16px',
          marginBottom: '8px',
        }}
      >
        <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--navy-450)', display: 'block' }}>
          Monthly installment
        </span>
        <div
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'white',
            fontFamily: 'var(--font-geist-mono, monospace)',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.15,
            marginTop: '2px',
          }}
        >
          <AnimatedNumber value={emi} format={formatINR} />
        </div>
        <span style={{ fontSize: '10px', color: 'var(--navy-300)', marginTop: '4px', display: 'block' }}>
          per month · {tenureYears} yr{tenureYears !== 1 ? 's' : ''} · {DEMO_RATE}% p.a.
        </span>
      </div>

      {/* ── Cost breakdown ── */}
      <div
        style={{
          borderRadius: '12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          padding: '12px 16px',
          marginBottom: '8px',
        }}
      >
        <StatRow label="Principal" value={<AnimatedNumber value={amount} format={formatINR} />} />
        <div style={divider}>
          <StatRow label="Total interest" value={<AnimatedNumber value={totalInterest} format={formatINR} />} />
        </div>
        <div style={divider}>
          <StatRow label="Processing fee" value="₹10,000" />
        </div>
        <div style={divider}>
          <StatRow
            label="Net borrowing cost"
            value={<AnimatedNumber value={netCost} format={formatINR} />}
            valueColor="var(--navy-600)"
            bold
          />
        </div>
      </div>

      {/* ── FOIR & Credit score meter ── */}
      <div
        style={{
          borderRadius: '12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          padding: '12px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', flexShrink: 1, minWidth: 0 }}>
            Debt-to-income (FOIR)
          </span>
          <span
            style={{
              flexShrink: 0,
              fontSize: '10px',
              fontWeight: 600,
              color: status.color,
              background: status.bg,
              padding: '2px 6px',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
            }}
          >
            {status.icon} {status.label}
          </span>
        </div>

        <div
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '9999px',
            background: 'var(--navy-150)',
            overflow: 'hidden',
            marginBottom: '6px',
          }}
        >
          <motion.div
            style={{ height: '100%', borderRadius: '9999px', background: status.color }}
            animate={{ width: `${Math.min(foirPct, 100)}%` }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.32 }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-geist-mono, monospace)',
              fontVariantNumeric: 'tabular-nums',
              fontSize: '11px',
              fontWeight: 700,
              color: status.color,
              flexShrink: 0,
            }}
          >
            {foirPct.toFixed(1)}%
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
            of income · 60% safe cap
          </span>
        </div>
      </div>
    </div>
  );
}
