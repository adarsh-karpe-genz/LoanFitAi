'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import SuitabilityScoreMeter from '@/components/ui/SuitabilityScoreMeter';

function formatINR(value: number): string {
  const rounded = Math.round(value);
  if (rounded >= 10000000) return `₹${(rounded / 10000000).toFixed(2)} Cr`;
  const s = rounded.toString();
  if (s.length <= 3) return `₹${s}`;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${rest},${last3}`;
}

export interface XaiProps {
  open: boolean;
  onClose: () => void;
  lenderName: string;
  loanType: string;
  rank: number;
  score: number;
  costUtility: number;   // 0-1
  feeUtility: number;    // 0-1
  eligibilityUtility: number; // 0-1
  emi: number;
  netCost: number;
  foir: number;
  interestRate: number;
  creditScoreBuffer: number;
  explanation: string;
}

interface BarProps { label: string; max: number; value: number; delay: number; }

function DecompositionBar({ label, max, value, delay }: BarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="tabular-nums font-mono text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
          +{value.toFixed(1)} / {max}
        </span>
      </div>
      <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--navy-050)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--navy-600)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5, delay }}
        />
      </div>
    </div>
  );
}

function EligibilityTag({ foir }: { foir: number }) {
  if (foir <= 0.55) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-semibold border"
      style={{ color: 'var(--status-eligible)', background: 'var(--status-eligible-bg)', borderColor: 'var(--status-eligible)' }}>
      <CheckCircle2 className="w-3 h-3" /> Eligible
    </span>
  );
  if (foir < 0.60) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-semibold border"
      style={{ color: 'var(--status-borderline)', background: 'var(--status-borderline-bg)', borderColor: 'var(--status-borderline)' }}>
      <AlertTriangle className="w-3 h-3" /> Borderline
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-semibold border"
      style={{ color: 'var(--status-ineligible)', background: 'var(--status-ineligible-bg)', borderColor: 'var(--status-ineligible)' }}>
      <XCircle className="w-3 h-3" /> Not eligible
    </span>
  );
}

export default function XaiExplanationCard({
  open, onClose,
  lenderName, loanType, rank, score,
  costUtility, feeUtility, eligibilityUtility,
  emi, netCost, foir, interestRate, creditScoreBuffer, explanation,
}: XaiProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) { setTimeout(() => closeRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const costPts = costUtility * 0.6 * 100;
  const feePts = feeUtility * 0.2 * 100;
  const eligPts = eligibilityUtility * 0.2 * 100;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,42,0.48)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Why ${lenderName} ranked #${rank}`}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.24 }}
          >
            <div
              className="w-full max-w-lg rounded-3xl p-8 relative overflow-y-auto max-h-[90vh]"
              style={{
                background: 'color-mix(in srgb, var(--bg-surface) 96%, transparent)',
                backdropFilter: 'blur(20px) saturate(140%)',
                border: '1px solid color-mix(in srgb, var(--white, #fff) 18%, transparent)',
                boxShadow: 'var(--shadow-raised)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                ref={closeRef}
                onClick={onClose}
                className="absolute top-5 right-5 p-1.5 rounded-md"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Close explanation"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-4 pb-5 mb-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <SuitabilityScoreMeter score={score} size="lg" animate={true} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ background: 'var(--navy-600)' }}>
                      #{rank} Match
                    </span>
                    <EligibilityTag foir={foir} />
                  </div>
                  <h2 className="text-lg font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {lenderName}
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{loanType}</p>
                </div>
              </div>

              {/* Score decomposition */}
              <div className="space-y-4 mb-6">
                <h3 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  How this score was calculated
                </h3>
                <DecompositionBar label="Net cost of borrowing (60%)" max={60} value={costPts} delay={0} />
                <DecompositionBar label="Processing fee (20%)" max={20} value={feePts} delay={0.05} />
                <DecompositionBar label="Approval cushion (20%)" max={20} value={eligPts} delay={0.1} />
              </div>

              {/* Key figures */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-md" style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Monthly EMI</span>
                  <p className="tabular-nums font-mono text-base font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    {formatINR(emi)}
                  </p>
                </div>
                <div className="p-3 rounded-md" style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Net borrowing cost</span>
                  <p className="tabular-nums font-mono text-base font-bold mt-0.5" style={{ color: 'var(--navy-600)' }}>
                    {formatINR(netCost)}
                  </p>
                </div>
                <div className="p-3 rounded-md" style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Interest rate</span>
                  <p className="tabular-nums font-mono text-base font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    {interestRate}% p.a.
                  </p>
                </div>
                <div className="p-3 rounded-md" style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Debt ratio (FOIR)</span>
                  <p className="tabular-nums font-mono text-base font-bold mt-0.5" style={{ color: foir < 0.60 ? 'var(--status-eligible)' : 'var(--status-ineligible)' }}>
                    {(foir * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Credit score buffer */}
              {creditScoreBuffer > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-md mb-4 text-xs"
                  style={{ background: 'var(--status-eligible-bg)', color: 'var(--status-eligible)', border: '1px solid var(--status-eligible)' }}>
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Your CIBIL score gives you a <strong>+{creditScoreBuffer} point</strong> safety cushion above the minimum threshold.</span>
                </div>
              )}

              {/* Plain-language explanation */}
              <div className="p-4 rounded-md" style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Info className="w-3.5 h-3.5" style={{ color: 'var(--navy-600)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Plain-language explanation</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '68ch' }}>
                  {explanation}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
