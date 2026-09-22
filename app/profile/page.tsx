'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getProfile, upsertProfile } from '@/services/profile/profileService';
import { upsertLoanRequirement, getLoanRequirement } from '@/services/loan/loanService';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

type EmploymentType = 'Salaried' | 'Self-Employed' | 'Student' | '';
type LoanType = 'Home Loan' | 'Personal Loan' | 'Car Loan' | 'Education Loan' | 'Business Loan';

interface FormState {
  fullName: string;
  age: string;
  employment: EmploymentType;
  city: string;
  loanType: LoanType;
  loanAmount: number;
  tenureYears: number;
}

interface Errors {
  [key: string]: string;
}

function formatINR(v: string | number): string {
  const n = typeof v === 'string' ? parseInt(v.replace(/,/g, ''), 10) : v;
  if (isNaN(n)) return '';
  const s = n.toString();
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${last3}`;
}

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

const LOAN_TYPES: LoanType[] = ['Home Loan', 'Personal Loan', 'Car Loan', 'Education Loan', 'Business Loan'];
const EMPLOYMENT_TYPES: EmploymentType[] = ['Salaried', 'Self-Employed', 'Student'];

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceEditPersonal = searchParams.get('edit') === 'personal';


  // State: 'checking' | 'personal' | 'loan_type'
  const [activeStep, setActiveStep] = useState<'checking' | 'personal' | 'loan_type'>('checking');
  const [userId, setUserId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<FormState>({
    fullName: '',
    age: '',
    employment: '',
    city: '',
    loanType: 'Home Loan',
    loanAmount: 3000000,
    tenureYears: 20,
  });

  const [errors, setErrors] = useState<Errors>({});

  const set = (key: keyof FormState) => (value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const clearError = (key: string) => {
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  };

  // ── Database Verification on Load / Refresh ──────────────────────────────────
  useEffect(() => {
    async function checkExistingProfile() {
      try {
        let currentUserId = '';

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
            currentUserId = data.user.id;
          }
        } else {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('loanfit_demo_user') : null;
          if (stored) {
            const parsed = JSON.parse(stored);
            currentUserId = parsed.id || 'demo-user-123';
          }
        }

        setUserId(currentUserId);

        // Fetch from API route which checks borrower_profiles in DB
        let personalDone = false;
        try {
          const res = await fetch('/api/profile');
          if (res.ok) {
            const data = await res.json();
            if (data.personalInfo?.full_name) {
              setForm((prev) => ({
                ...prev,
                fullName: data.personalInfo.full_name || '',
                age: data.personalInfo.age ? String(data.personalInfo.age) : '',
                employment: (data.personalInfo.employment_type as EmploymentType) || 'Salaried',
                city: data.personalInfo.city || '',
                loanType: data.loanRequirement?.loan_type || prev.loanType,
                loanAmount: data.loanRequirement?.loan_amount || prev.loanAmount,
                tenureYears: data.loanRequirement?.tenure_years || prev.tenureYears,
              }));
            }
            if (data.isPersonalInfoCompleted) {
              personalDone = true;
            }
          }
        } catch {
          // fallback to client service
        }

        // If API didn't confirm, check via profileService fallback
        if (!personalDone && currentUserId) {
          const profile = await getProfile(currentUserId);
          if (profile && (profile.personal_info_completed_at || (profile.full_name && profile.age))) {
            personalDone = true;
            setForm((prev) => ({
              ...prev,
              fullName: profile.full_name || '',
              age: profile.age ? String(profile.age) : '',
              employment: (profile.employment_type as EmploymentType) || 'Salaried',
              city: profile.city || profile.location || '',
            }));
          }
        }

        // Decision: If personal info is already submitted, skip to loan type selection!
        if (personalDone && !forceEditPersonal) {
          setActiveStep('loan_type');
        } else {
          setActiveStep('personal');
        }
      } catch (err) {
        console.error('Profile check error:', err);
        setActiveStep('personal');
      }
    }

    checkExistingProfile();
  }, [forceEditPersonal]);

  // ── Step 1 Validation ───────────────────────────────────────────────────────
  function validatePersonal(): boolean {
    const e: Errors = {};
    if (!form.fullName.trim()) e.fullName = 'Enter your full name.';
    const age = parseInt(form.age, 10);
    if (!form.age || isNaN(age) || age < 21 || age > 65) e.age = 'Age must be between 21 and 65.';
    if (!form.employment) e.employment = 'Select your employment type.';
    if (!form.city.trim()) e.city = 'Enter your city.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit Step 1: Personal Details ─────────────────────────────────────────
  async function handlePersonalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validatePersonal()) return;

    setIsSubmitting(true);
    try {
      // 1. Write to database via server API route
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'personal',
          full_name: form.fullName.trim(),
          age: parseInt(form.age, 10),
          employment_type: form.employment,
          city: form.city.trim(),
        }),
      });

      // 2. Also update via service for local cache/client fallbacks
      if (userId) {
        await upsertProfile(userId, {
          full_name: form.fullName.trim(),
          age: parseInt(form.age, 10),
          employment_type: form.employment as any,
          location: form.city.trim(),
        });
      }

      // 3. Immediately advance to "Choose loan type" without re-asking
      setActiveStep('loan_type');
    } catch (err) {
      console.error('Failed to save personal info:', err);
      // Advance anyway so user is not blocked
      setActiveStep('loan_type');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Submit Step 2: Choose Loan Type ─────────────────────────────────────────
  async function handleLoanSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Write loan requirement to database via API route
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'loan_requirement',
          loan_type: form.loanType,
          loan_amount: form.loanAmount,
          tenure_years: form.tenureYears,
        }),
      });

      // 2. Also update via service
      if (userId) {
        await upsertLoanRequirement(userId, {
          loan_type: form.loanType as any,
          loan_amount: form.loanAmount,
          tenure_years: form.tenureYears,
        });
      }

      // 3. Navigate directly to recommendations/simulator screen!
      router.push('/recommendations');
    } catch (err) {
      console.error('Failed to save loan requirements:', err);
      router.push('/recommendations');
    } finally {
      setIsSubmitting(false);
    }
  }

  const maxTenure = form.loanType === 'Home Loan' ? 30 : form.loanType === 'Personal Loan' ? 7 : 15;

  if (activeStep === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-canvas)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--navy-600)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'var(--bg-canvas)' }}>
      <div className="w-full max-w-lg">
        <motion.div
          className="rounded-2xl p-8"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-raised)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {activeStep === 'personal' ? 'Personal details' : 'Choose loan type'}
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {activeStep === 'personal'
                ? 'Asked once to establish your eligibility. You will not be asked again on subsequent logins.'
                : 'Select the loan type, target borrowing amount, and preferred tenure.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {activeStep === 'personal' ? (
              <motion.form
                key="personal-step"
                onSubmit={handlePersonalSubmit}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <Field error={errors.fullName}>
                  <Label htmlFor="fullName">Full name</Label>
                  <TextInput
                    id="fullName"
                    type="text"
                    placeholder="e.g. Adarsh Karpe"
                    value={form.fullName}
                    error={errors.fullName}
                    onChange={e => set('fullName')(e.target.value)}
                    onBlur={() => { if (!form.fullName.trim()) setErrors(prev => ({ ...prev, fullName: 'Enter your full name.' })); else clearError('fullName'); }}
                  />
                </Field>

                <Field error={errors.age}>
                  <Label htmlFor="age">Age</Label>
                  <TextInput
                    id="age"
                    type="number"
                    min={21}
                    max={65}
                    placeholder="21 - 65"
                    value={form.age}
                    error={errors.age}
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
                      <button
                        key={e}
                        type="button"
                        onClick={() => { set('employment')(e); clearError('employment'); }}
                        className="px-4 py-2 rounded-md text-xs font-medium transition-colors"
                        style={{
                          background: form.employment === e ? 'var(--navy-600)' : 'var(--bg-canvas)',
                          color: form.employment === e ? 'white' : 'var(--text-secondary)',
                          border: `1px solid ${form.employment === e ? 'var(--navy-600)' : 'var(--border-subtle)'}`,
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  {errors.employment && <p className="text-[11px] mt-1.5" style={{ color: 'var(--status-ineligible)' }}>{errors.employment}</p>}
                </Field>

                <Field error={errors.city}>
                  <Label htmlFor="city">City</Label>
                  <TextInput
                    id="city"
                    type="text"
                    placeholder="e.g. Pune, Mumbai, Bangalore"
                    value={form.city}
                    error={errors.city}
                    onChange={e => set('city')(e.target.value)}
                    onBlur={() => { if (!form.city.trim()) setErrors(prev => ({ ...prev, city: 'Enter your city.' })); else clearError('city'); }}
                  />
                </Field>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-xs font-semibold px-6 py-2.5 rounded-md text-white transition-colors"
                    style={{ background: 'var(--navy-950)' }}
                  >
                    {isSubmitting ? 'Saving...' : 'Continue to loan selection'}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="loan-step"
                onSubmit={handleLoanSubmit}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <Field>
                  <Label htmlFor="loanType">Select loan category</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {LOAN_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => set('loanType')(t)}
                        className="px-3 py-2.5 rounded-md text-xs font-medium text-left transition-colors"
                        style={{
                          background: form.loanType === t ? 'var(--navy-600)' : 'var(--bg-canvas)',
                          color: form.loanType === t ? 'white' : 'var(--text-secondary)',
                          border: `1px solid ${form.loanType === t ? 'var(--navy-600)' : 'var(--border-subtle)'}`,
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Loan Amount Slider */}
                <div className="space-y-1.5">
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                    <label htmlFor="loanAmount" style={{ minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', flexShrink: 1 }}>
                      Loan amount
                    </label>
                    <span style={{ flexShrink: 0, whiteSpace: 'nowrap', fontFamily: 'var(--font-geist-mono, monospace)', fontVariantNumeric: 'tabular-nums', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{formatINR(form.loanAmount)}
                    </span>
                  </div>
                  <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: 'var(--navy-150)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '9999px', background: 'var(--navy-300)', width: `${((form.loanAmount - 100000) / (10000000 - 100000)) * 100}%` }} />
                    </div>
                    <input
                      id="loanAmount"
                      type="range"
                      min={100000}
                      max={10000000}
                      step={100000}
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

                {/* Tenure Slider */}
                <div className="space-y-1.5">
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                    <label htmlFor="tenureYears" style={{ minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', flexShrink: 1 }}>
                      Repayment tenure
                    </label>
                    <span style={{ flexShrink: 0, whiteSpace: 'nowrap', fontFamily: 'var(--font-geist-mono, monospace)', fontVariantNumeric: 'tabular-nums', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {form.tenureYears} yr{form.tenureYears !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '100%', height: '6px', borderRadius: '9999px', background: 'var(--navy-150)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '9999px', background: 'var(--navy-300)', width: `${((form.tenureYears - 1) / (maxTenure - 1)) * 100}%` }} />
                    </div>
                    <input
                      id="tenureYears"
                      type="range"
                      min={1}
                      max={maxTenure}
                      step={1}
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

                <div className="pt-4 flex items-center justify-between">
                  {forceEditPersonal ? (
                    <button
                      type="button"
                      onClick={() => setActiveStep('personal')}
                      className="text-xs font-medium px-4 py-2.5 rounded-md"
                      style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                    >
                      Back to personal info
                    </button>
                  ) : <div />}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-xs font-semibold px-6 py-2.5 rounded-md text-white transition-colors"
                    style={{ background: 'var(--navy-600)' }}
                  >
                    {isSubmitting ? 'Loading matches...' : 'Find my loan matches'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-[11px] mt-4" style={{ color: 'var(--text-muted)' }}>
          No impact on your credit score. Zero phone calls from lenders.
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-canvas)' }}>
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--navy-600)', borderTopColor: 'transparent' }} />
        </div>
      }
    >
      <ProfileContent />
    </React.Suspense>
  );
}

