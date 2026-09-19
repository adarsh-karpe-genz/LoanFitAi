'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;

type EmploymentType = 'Salaried' | 'Self-Employed' | 'Student' | '';
type LoanType = 'Home Loan' | 'Personal Loan' | 'Car Loan' | 'Education Loan' | 'Business Loan' | '';

interface FormState {
  // Step 1
  fullName: string;
  age: string;
  employment: EmploymentType;
  city: string;
  // Step 2
  monthlyIncome: string;
  monthlyExpenses: string;
  existingEMI: string;
  creditScore: string;
  // Step 3
  loanType: LoanType;
  loanAmount: number;
  tenureYears: number;
  // Step 4
  costPriority: number;
  emiPriority: number;
  eligibilityPriority: number;
}

interface Errors {
  [key: string]: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatINR(v: string | number): string {
  const n = typeof v === 'string' ? parseInt(v.replace(/,/g, ''), 10) : v;
  if (isNaN(n)) return '';
  const s = n.toString();
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${last3}`;
}

// ─── Form Primitives ──────────────────────────────────────────────────────────

function Label({ htmlFor, children, hint }: { htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium block" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </label>
      {hint && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
    </div>
  );
}

function Field({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div>
      {children}
      {error && <p className="text-[11px] mt-1.5" style={{ color: 'var(--status-ineligible)' }}>{error}</p>}
    </div>
  );
}

const inputClass = {
  base: 'w-full px-3 py-2.5 text-sm rounded-xs outline-none transition-colors',
  style: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
  },
};

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const { error, style, ...rest } = props;
  return (
    <input
      {...rest}
      className={inputClass.base}
      style={{ ...inputClass.style, borderColor: error ? 'var(--status-ineligible)' : 'var(--border-subtle)' }}
      onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
      onBlur={e => (e.target.style.borderColor = error ? 'var(--status-ineligible)' : 'var(--border-subtle)')}
    />
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const isDone = n < current;
        const isActive = n === current;
        return (
          <React.Fragment key={n}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors"
              style={{
                background: isActive ? 'var(--navy-600)' : isDone ? 'var(--navy-300)' : 'var(--navy-050)',
                color: isActive || isDone ? 'white' : 'var(--navy-450)',
                border: isActive ? '2px solid var(--navy-600)' : '2px solid transparent',
              }}
            >
              {isDone ? '✓' : n}
            </div>
            {n < total && (
              <div className="flex-1 h-0.5 rounded-full"
                style={{ background: isDone ? 'var(--navy-300)' : 'var(--navy-050)' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function PrioritySlider({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) {
  const pct = value;
  return (
    <div className="space-y-1.5">
      {/* Collision-safe: gap-3, flex-shrink-0 on value, min-width-0 on label */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
        <label
          htmlFor={id}
          style={{
            minWidth: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            fontSize: '12px',
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
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          {value}
        </span>
      </div>
      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: 'var(--navy-150)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: '9999px', background: 'var(--navy-300)', width: `${pct}%` }} />
        </div>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={5}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 2 }}
        />
        <div
          style={{
            position: 'absolute',
            left: `calc(${pct}% - 9px)`,
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'var(--navy-600)',
            border: '2px solid white',
            boxShadow: '0 1px 4px rgba(0,0,42,.18)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      </div>
    </div>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────

const STEP_LABELS = ['Personal details', 'Your finances', 'Loan requirement', 'Your priorities'];

export default function ProfilePage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>({
    fullName: '', age: '', employment: '', city: '',
    monthlyIncome: '', monthlyExpenses: '', existingEMI: '', creditScore: '',
    loanType: '', loanAmount: 3000000, tenureYears: 20,
    costPriority: 60, emiPriority: 20, eligibilityPriority: 20,
  });
  const [errors, setErrors] = useState<Errors>({});

  const set = (key: keyof FormState) => (value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const clearError = (key: string) => {
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  };

  // ── Validation per step ──────────────────────────────────────────────────

  function validateStep(): boolean {
    const e: Errors = {};
    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = 'Enter your full name.';
      const age = parseInt(form.age, 10);
      if (!form.age || isNaN(age) || age < 21 || age > 65) e.age = 'Age must be between 21 and 65.';
      if (!form.employment) e.employment = 'Select your employment type.';
      if (!form.city.trim()) e.city = 'Enter your city.';
    }
    if (step === 2) {
      const income = parseInt(form.monthlyIncome.replace(/,/g, ''), 10);
      if (!form.monthlyIncome || isNaN(income) || income < 10000) e.monthlyIncome = 'Enter a valid monthly income (minimum ₹10,000).';
      const expenses = parseInt(form.monthlyExpenses.replace(/,/g, ''), 10);
      if (!form.monthlyExpenses || isNaN(expenses) || expenses < 0) e.monthlyExpenses = 'Enter your monthly expenses.';
      if (form.creditScore) {
        const cs = parseInt(form.creditScore, 10);
        if (isNaN(cs) || cs < 300 || cs > 900) e.creditScore = 'CIBIL score must be between 300 and 900.';
      }
    }
    if (step === 3) {
      if (!form.loanType) e.loanType = 'Select a loan type.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validateStep()) return;
    if (step < 4) setStep((s) => (s + 1) as Step);
  }

  function handleBack() {
    if (step > 1) setStep((s) => (s - 1) as Step);
  }

  const LOAN_TYPES: LoanType[] = ['Home Loan', 'Personal Loan', 'Car Loan', 'Education Loan', 'Business Loan'];
  const EMPLOYMENT_TYPES: EmploymentType[] = ['Salaried', 'Self-Employed', 'Student'];
  const maxTenure = form.loanType === 'Home Loan' ? 30 : form.loanType === 'Personal Loan' ? 7 : 15;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'var(--bg-canvas)' }}>
      <div className="w-full max-w-lg">
        {/* Card */}
        <motion.div
          className="rounded-2xl p-8"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-raised)' }}
        >
          <StepIndicator current={step} total={4} />
          <h2 className="text-xl font-semibold mb-1 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {STEP_LABELS[step - 1]}
          </h2>
          <p className="text-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
            {step === 1 && 'Basic personal details to build your borrower profile.'}
            {step === 2 && 'Income and obligations help us check what you can sustainably afford.'}
            {step === 3 && 'Tell us what you need — we will filter and rank options for your situation.'}
            {step === 4 && 'Set your priorities. We use these to rank loan options. Weights are normalized during scoring — enter values from 0 to 100.'}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.2 }}
              className="space-y-5"
            >
              {/* ── Step 1: Personal ── */}
              {step === 1 && (
                <>
                  <Field error={errors.fullName}>
                    <Label htmlFor="fullName">Full name</Label>
                    <TextInput id="fullName" type="text" value={form.fullName} error={errors.fullName}
                      onChange={e => set('fullName')(e.target.value)}
                      onBlur={() => { if (!form.fullName.trim()) setErrors(prev => ({ ...prev, fullName: 'Enter your full name.' })); else clearError('fullName'); }}
                    />
                  </Field>

                  <Field error={errors.age}>
                    <Label htmlFor="age">Age</Label>
                    <TextInput id="age" type="number" min={21} max={65} value={form.age} error={errors.age}
                      onChange={e => set('age')(e.target.value)}
                      onBlur={() => {
                        const n = parseInt(form.age, 10);
                        if (!form.age || isNaN(n) || n < 21 || n > 65) setErrors(prev => ({ ...prev, age: 'Age must be between 21 and 65.' }));
                        else clearError('age');
                      }}
                    />
                  </Field>

                  <Field error={errors.employment}>
                    <Label htmlFor="employment">Employment type</Label>
                    <div className="flex gap-2 flex-wrap">
                      {EMPLOYMENT_TYPES.map((e) => (
                        <button key={e}
                          type="button"
                          onClick={() => { set('employment')(e); clearError('employment'); }}
                          className="px-4 py-2 rounded-md text-xs font-medium transition-colors"
                          style={{
                            background: form.employment === e ? 'var(--navy-600)' : 'var(--bg-canvas)',
                            color: form.employment === e ? 'white' : 'var(--text-secondary)',
                            border: `1px solid ${form.employment === e ? 'var(--navy-600)' : 'var(--border-subtle)'}`,
                          }}>
                          {e}
                        </button>
                      ))}
                    </div>
                    {errors.employment && <p className="text-[11px] mt-1.5" style={{ color: 'var(--status-ineligible)' }}>{errors.employment}</p>}
                  </Field>

                  <Field error={errors.city}>
                    <Label htmlFor="city">City</Label>
                    <TextInput id="city" type="text" value={form.city} error={errors.city}
                      onChange={e => set('city')(e.target.value)}
                      onBlur={() => { if (!form.city.trim()) setErrors(prev => ({ ...prev, city: 'Enter your city.' })); else clearError('city'); }}
                    />
                  </Field>
                </>
              )}

              {/* ── Step 2: Finances ── */}
              {step === 2 && (
                <>
                  <Field error={errors.monthlyIncome}>
                    <Label htmlFor="monthlyIncome" hint="Net monthly income after tax">Monthly income (₹)</Label>
                    <TextInput id="monthlyIncome" type="text" value={form.monthlyIncome} error={errors.monthlyIncome}
                      onChange={e => set('monthlyIncome')(e.target.value.replace(/[^0-9]/g, ''))}
                      onBlur={() => {
                        const n = parseInt(form.monthlyIncome, 10);
                        if (isNaN(n) || n < 10000) setErrors(prev => ({ ...prev, monthlyIncome: 'Enter a valid monthly income (minimum ₹10,000).' }));
                        else clearError('monthlyIncome');
                      }}
                    />
                  </Field>

                  <Field error={errors.monthlyExpenses}>
                    <Label htmlFor="monthlyExpenses" hint="Rent, utilities, food, etc.">Monthly expenses (₹)</Label>
                    <TextInput id="monthlyExpenses" type="text" value={form.monthlyExpenses} error={errors.monthlyExpenses}
                      onChange={e => set('monthlyExpenses')(e.target.value.replace(/[^0-9]/g, ''))}
                      onBlur={() => {
                        const n = parseInt(form.monthlyExpenses, 10);
                        if (isNaN(n) || n < 0) setErrors(prev => ({ ...prev, monthlyExpenses: 'Enter your monthly expenses.' }));
                        else clearError('monthlyExpenses');
                      }}
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="existingEMI" hint="Credit cards, car loans, other EMIs">Existing monthly EMI obligations (₹)</Label>
                    <TextInput id="existingEMI" type="text" value={form.existingEMI}
                      onChange={e => set('existingEMI')(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="0 if none"
                    />
                  </Field>

                  <Field error={errors.creditScore}>
                    <Label htmlFor="creditScore" hint="Your CIBIL or Equifax score — optional, but improves matching">Credit score (300–900)</Label>
                    <TextInput id="creditScore" type="number" min={300} max={900} value={form.creditScore} error={errors.creditScore}
                      onChange={e => set('creditScore')(e.target.value)}
                      onBlur={() => {
                        if (form.creditScore) {
                          const n = parseInt(form.creditScore, 10);
                          if (isNaN(n) || n < 300 || n > 900) setErrors(prev => ({ ...prev, creditScore: 'CIBIL score must be between 300 and 900.' }));
                          else clearError('creditScore');
                        }
                      }}
                      placeholder="Optional"
                    />
                  </Field>
                </>
              )}

              {/* ── Step 3: Loan requirement ── */}
              {step === 3 && (
                <>
                  <Field error={errors.loanType}>
                    <Label htmlFor="loanType">Loan type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {LOAN_TYPES.map((t) => (
                        <button key={t} type="button"
                          onClick={() => { set('loanType')(t); clearError('loanType'); }}
                          className="px-3 py-2.5 rounded-md text-xs font-medium text-left transition-colors"
                          style={{
                            background: form.loanType === t ? 'var(--navy-600)' : 'var(--bg-canvas)',
                            color: form.loanType === t ? 'white' : 'var(--text-secondary)',
                            border: `1px solid ${form.loanType === t ? 'var(--navy-600)' : 'var(--border-subtle)'}`,
                          }}>
                          {t}
                        </button>
                      ))}
                    </div>
                    {errors.loanType && <p className="text-[11px] mt-1.5" style={{ color: 'var(--status-ineligible)' }}>{errors.loanType}</p>}
                  </Field>

                  <div className="space-y-1.5">
                    {/* Collision-safe header: gap ensures label never overlaps value */}
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                      <label htmlFor="loanAmount" style={{ minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', flexShrink: 1 }}>Loan amount</label>
                      <span style={{ flexShrink: 0, whiteSpace: 'nowrap', fontFamily: 'var(--font-geist-mono, monospace)', fontVariantNumeric: 'tabular-nums', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{formatINR(form.loanAmount)}
                      </span>
                    </div>
                    <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: 'var(--navy-150)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '9999px', background: 'var(--navy-300)', width: `${((form.loanAmount - 100000) / (10000000 - 100000)) * 100}%` }} />
                      </div>
                      <input id="loanAmount" type="range" min={100000} max={10000000} step={100000}
                        value={form.loanAmount}
                        onChange={e => set('loanAmount')(Number(e.target.value))}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 2 }}
                      />
                      <div style={{ position: 'absolute', left: `calc(${((form.loanAmount - 100000) / (10000000 - 100000)) * 100}% - 9px)`, width: '18px', height: '18px', borderRadius: '50%', background: 'var(--navy-600)', border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,42,.18)', pointerEvents: 'none', zIndex: 1 }} />
                    </div>
                    <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      <span>₹1 Lakh</span><span>₹1 Crore</span>
                    </div>
                  </div>


                  <div className="space-y-1.5">
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                      <label htmlFor="tenureYears" style={{ minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', flexShrink: 1 }}>Repayment tenure</label>
                      <span style={{ flexShrink: 0, whiteSpace: 'nowrap', fontFamily: 'var(--font-geist-mono, monospace)', fontVariantNumeric: 'tabular-nums', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {form.tenureYears} yr{form.tenureYears !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: 'var(--navy-150)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '9999px', background: 'var(--navy-300)', width: `${((form.tenureYears - 1) / (maxTenure - 1)) * 100}%` }} />
                      </div>
                      <input id="tenureYears" type="range" min={1} max={maxTenure} step={1}
                        value={form.tenureYears}
                        onChange={e => set('tenureYears')(Number(e.target.value))}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 2 }}
                      />
                      <div style={{ position: 'absolute', left: `calc(${((form.tenureYears - 1) / (maxTenure - 1)) * 100}% - 9px)`, width: '18px', height: '18px', borderRadius: '50%', background: 'var(--navy-600)', border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,42,.18)', pointerEvents: 'none', zIndex: 1 }} />
                    </div>
                    <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      <span>1 year</span><span>{maxTenure} years</span>
                    </div>
                  </div>
                </>
              )}

              {/* ── Step 4: Priorities ── */}
              {step === 4 && (
                <>
                  <PrioritySlider id="costPriority" label="Minimize total cost of borrowing" value={form.costPriority} onChange={v => set('costPriority')(v)} />
                  <PrioritySlider id="emiPriority" label="Keep monthly EMI low" value={form.emiPriority} onChange={v => set('emiPriority')(v)} />
                  <PrioritySlider id="eligibilityPriority" label="Maximize approval chances" value={form.eligibilityPriority} onChange={v => set('eligibilityPriority')(v)} />

                  <div className="p-3.5 rounded-md text-xs" style={{ background: 'var(--navy-050)', color: 'var(--text-secondary)' }}>
                    Your top priority currently has a 60% default cost weight applied during scoring. You can adjust your results after seeing your matches.
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {step > 1 ? (
              <button onClick={handleBack} className="text-xs font-medium px-4 py-2.5 rounded-md"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button onClick={handleNext}
                className="text-xs font-semibold px-6 py-2.5 rounded-md text-white transition-colors"
                style={{ background: 'var(--navy-950)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--navy-800)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--navy-950)')}>
                Continue
              </button>
            ) : (
              <Link href="/recommendations"
                className="text-xs font-semibold px-6 py-2.5 rounded-md text-white transition-colors flex items-center gap-2"
                style={{ background: 'var(--navy-600)' }}>
                Find my loan matches
              </Link>
            )}
          </div>
        </motion.div>

        <p className="text-center text-[11px] mt-4" style={{ color: 'var(--text-muted)' }}>
          No impact on your credit score. Zero phone calls from lenders.
        </p>
      </div>
    </div>
  );
}
