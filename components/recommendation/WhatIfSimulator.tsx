'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatINR(value: number): string {
  // Indian lakh grouping: ₹12,30,000
  const rounded = Math.round(value);
  if (rounded >= 10000000) {
    return `₹${(rounded / 10000000).toFixed(2)} Cr`;
  }
  if (rounded >= 100000) {
    const lakhs = Math.floor(rounded / 100000);
    const remainder = rounded % 100000;
    if (remainder === 0) return `₹${lakhs.toFixed(0)} Lakh`;
    const thousands = Math.floor(remainder / 1000);
    return `₹${lakhs},${thousands.toString().padStart(2, '0')},${(remainder % 1000).toString().padStart(3, '0')}`;
  }
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(rounded);
}

function calcEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ─── Animated number ──────────────────────────────────────────────────────────

function AnimatedNumber({ value, format }: { value: number; format: (v: number) => string }) {
  const spring = useSpring(value, { stiffness: 120, damping: 24 });
  const [display, setDisplay] = useState(value);

  useEffect(() => { spring.set(value); }, [value, spring]);
  useEffect(() => {
    const unsub = spring.on('change', (v) => setDisplay(v));
    return unsub;
  }, [spring]);

  return <span className="tabular-nums font-mono">{format(display)}</span>;
}

// ─── Slider ───────────────────────────────────────────────────────────────────

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
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
        <span className="text-xs font-mono tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>
          {format(value)}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        {/* Track */}
        <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--navy-050)' }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--navy-600)' }} />
        </div>
        {/* Native range for accessibility */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ zIndex: 1 }}
        />
        {/* Thumb visual */}
        <div
          className="absolute w-4 h-4 rounded-full border-2 pointer-events-none"
          style={{
            left: `calc(${pct}% - 8px)`,
            background: 'white',
            borderColor: 'var(--navy-600)',
            boxShadow: '0 1px 4px rgba(0,0,42,0.16)',
          }}
        />
      </div>
    </div>
  );
}

// ─── FOIR Status ──────────────────────────────────────────────────────────────

function foirStatus(foir: number): { label: string; color: string; bg: string; icon: string } {
  if (foir < 0.40) return { label: 'Very comfortable', color: 'var(--status-eligible)', bg: 'var(--status-eligible-bg)', icon: '✓' };
  if (foir < 0.55) return { label: 'Within safe limits', color: 'var(--status-eligible)', bg: 'var(--status-eligible-bg)', icon: '✓' };
  if (foir < 0.60) return { label: 'Approaching limit', color: 'var(--status-borderline)', bg: 'var(--status-borderline-bg)', icon: '!' };
  return { label: 'Exceeds 60% cap — loans will be filtered out', color: 'var(--status-ineligible)', bg: 'var(--status-ineligible-bg)', icon: '✗' };
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DEMO_RATE = 8.75; // fixed representative rate for demo

export default function WhatIfSimulator() {
  const [amount, setAmount] = useState(2000000); // ₹20L
  const [tenureYears, setTenureYears] = useState(15);
  const [income, setIncome] = useState(80000);
  const [existingEMI, setExistingEMI] = useState(5000);

  const tenureMonths = tenureYears * 12;
  const emi = calcEMI(amount, DEMO_RATE, tenureMonths);
  const totalPaid = emi * tenureMonths;
  const totalInterest = totalPaid - amount;
  const netCost = totalInterest + 10000; // fixed demo processing fee
  const foir = income > 0 ? (existingEMI + emi) / income : 0;
  const foirPct = foir * 100;
  const status = foirStatus(foir);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sliders */}
        <div className="p-6 rounded-2xl space-y-6"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Adjust your loan parameters
          </h3>

          <Slider
            id="amount"
            label="Loan amount"
            value={amount}
            min={500000}
            max={10000000}
            step={100000}
            format={(v) => formatINR(v)}
            onChange={setAmount}
          />

          <Slider
            id="tenure"
            label="Repayment tenure"
            value={tenureYears}
            min={1}
            max={30}
            step={1}
            format={(v) => `${v} year${v !== 1 ? 's' : ''}`}
            onChange={setTenureYears}
          />

          <Slider
            id="income"
            label="Monthly income"
            value={income}
            min={20000}
            max={300000}
            step={5000}
            format={(v) => formatINR(v)}
            onChange={setIncome}
          />

          <Slider
            id="existing-emi"
            label="Existing monthly EMIs"
            value={existingEMI}
            min={0}
            max={50000}
            step={1000}
            format={(v) => v === 0 ? 'None' : formatINR(v)}
            onChange={setExistingEMI}
          />

          <div className="pt-2 text-xs" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
            <p className="pt-3">Illustrative rate: {DEMO_RATE}% p.a. (reducing balance). Final rate depends on your credit profile and lender terms.</p>
          </div>
        </div>

        {/* Live output */}
        <div className="space-y-4">
          {/* EMI — the hero number */}
          <div className="p-6 rounded-2xl"
            style={{ background: 'var(--navy-950)', border: '1px solid var(--navy-800)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--navy-450)' }}>Monthly installment</span>
            <div className="mt-1 text-4xl font-semibold tracking-tight text-white">
              <AnimatedNumber value={emi} format={(v) => formatINR(v)} />
            </div>
            <span className="text-xs mt-1 block" style={{ color: 'var(--navy-300)' }}>
              Per month for {tenureYears} year{tenureYears !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Cost breakdown */}
          <div className="p-6 rounded-2xl space-y-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Principal</span>
                <p className="tabular-nums font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  <AnimatedNumber value={amount} format={formatINR} />
                </p>
              </div>
              <div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total interest</span>
                <p className="tabular-nums font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  <AnimatedNumber value={totalInterest} format={formatINR} />
                </p>
              </div>
              <div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Processing fee (demo)</span>
                <p className="tabular-nums font-mono text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>₹10,000</p>
              </div>
              <div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Net borrowing cost</span>
                <p className="tabular-nums font-mono text-sm font-bold mt-0.5" style={{ color: 'var(--navy-600)' }}>
                  <AnimatedNumber value={netCost} format={formatINR} />
                </p>
              </div>
            </div>
          </div>

          {/* FOIR meter */}
          <div className="p-5 rounded-2xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Debt-to-income (FOIR)</span>
              <span className="px-2 py-0.5 rounded-xs text-[11px] font-semibold"
                style={{ color: status.color, background: status.bg }}>
                {status.icon} {status.label}
              </span>
            </div>
            {/* Bar */}
            <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ background: 'var(--navy-050)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: status.color }}
                animate={{ width: `${Math.min(foirPct, 100)}%` }}
                transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.32 }}
              />
              {/* 60% cap line */}
            </div>
            <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="tabular-nums font-mono font-semibold" style={{ color: status.color }}>
                {foirPct.toFixed(1)}% of income
              </span>
              <span style={{ color: 'var(--status-ineligible)' }}>60% safe cap</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
