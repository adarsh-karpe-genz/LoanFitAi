'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, useSpring } from 'framer-motion';

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
  // Below 1 lakh: standard Indian format
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

// ─── Slider ───────────────────────────────────────────────────────────────────
//
// FIX: Label and value are in a flex row with:
//   - gap-3 (minimum 12px separation)
//   - label: min-w-0, overflow-hidden, whitespace-nowrap, text-overflow: ellipsis
//     → truncates before it ever touches the value
//   - value: flex-shrink-0, whitespace-nowrap
//     → value never compresses or wraps
// This fixes the "Repayment tenure 15 years" overlap completely.

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
      {/* ── Label + Value row: explicit flex with gap, no collision possible ── */}
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

      {/* ── Track + thumb ── */}
      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        {/* Track */}
        <div
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '9999px',
            background: 'var(--navy-150)',
            overflow: 'hidden',
          }}
        >
          {/* Filled portion */}
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

        {/* Native input (invisible, handles all interaction) */}
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

        {/* Thumb visual */}
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
//
// FIX: "Principal ₹20 Lakh" and "Total interest ₹15,98,015" were
// rendering in 2 columns of a grid inside an already-narrow container.
// Now each stat is its own flex row: label left, value right, gap ensures
// they can never overlap even with 8-digit currency strings.

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

// ─── Main Component ───────────────────────────────────────────────────────────

const DEMO_RATE = 8.75;

export default function WhatIfSimulator() {
  const [amount, setAmount] = useState(2000000);
  const [tenureYears, setTenureYears] = useState(15);
  const [income, setIncome] = useState(80000);
  const [existingEMI, setExistingEMI] = useState(5000);

  const tenureMonths = tenureYears * 12;
  const emi = calcEMI(amount, DEMO_RATE, tenureMonths);
  const totalPaid = emi * tenureMonths;
  const totalInterest = totalPaid - amount;
  const netCost = totalInterest + 10000;
  const foir = income > 0 ? (existingEMI + emi) / income : 0;
  const foirPct = foir * 100;
  const status = foirStatus(foir);

  // ── Separator line style ──
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          {DEMO_RATE}% p.a. illustrative rate. Final rate subject to lender underwriting.
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

      {/* ── Cost breakdown: vertical stack (no 2-col grid) ── */}
      <div
        style={{
          borderRadius: '12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          padding: '12px 16px',
          marginBottom: '8px',
        }}
      >
        {/* Each row is a separate StatRow — label left, value right, gap: 12px */}
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

      {/* ── FOIR meter ── */}
      <div
        style={{
          borderRadius: '12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          padding: '12px 16px',
        }}
      >
        {/* Title row: label left, status tag right — gap ensures no collision */}
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

        {/* Bar */}
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

        {/* Percentage + cap label — flex, gap, no overlap */}
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
