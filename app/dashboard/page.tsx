'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getFullBorrowerProfile } from '@/services/loan/loanService';
import { BorrowerFullProfile } from '@/types/database';
import { formatINR, formatTenure } from '@/lib/utils';
import {
  User,
  Home,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Pencil,
  Info,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profileData, setProfileData] = useState<BorrowerFullProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        let currentUserId = '';
        let currentUserEmail = '';

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const { data, error } = await supabase.auth.getUser();
          if (error || !data.user) {
            router.push('/login?redirect=/dashboard');
            return;
          }
          currentUserId = data.user.id;
          currentUserEmail = data.user.email || '';
          setUser({ id: currentUserId, email: currentUserEmail });
        } else {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('loanfit_demo_user') : null;
          if (!stored) {
            router.push('/login?redirect=/dashboard');
            return;
          }
          const parsed = JSON.parse(stored);
          currentUserId = parsed.id || 'demo-user-123';
          currentUserEmail = parsed.email || 'borrower@demo.com';
          setUser({ id: currentUserId, email: currentUserEmail });
        }

        const fullProfile = await getFullBorrowerProfile(currentUserId);
        setProfileData(fullProfile);

        // If user hasn't completed personal info, send directly to /profile
        const isPersonalComplete = Boolean(
          fullProfile?.profile?.personal_info_completed_at ||
          (fullProfile?.profile?.full_name && fullProfile?.profile?.age)
        );

        if (!isPersonalComplete) {
          router.push('/profile');
          return;
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-40 rounded-3xl" style={{ background: 'var(--navy-050)' }} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 rounded-2xl" style={{ background: 'var(--navy-050)' }} />
            <div className="h-48 rounded-2xl" style={{ background: 'var(--navy-050)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profileData) {
    return null;
  }

  const { profile, financialProfile, loanRequirement } = profileData;
  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Borrower';

  return (
    <div className="min-h-screen py-10" style={{ background: 'var(--bg-canvas)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* 1. Header Banner */}
        <div
          className="rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          style={{ background: 'var(--navy-950)', color: 'white' }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-300" style={{ background: 'rgba(28,124,84,0.25)' }}>
                Active Profile
              </span>
              <span className="text-xs" style={{ color: 'var(--navy-300)' }}>
                Verified & Protected
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome back, {displayName}
            </h1>
            <p className="text-xs max-w-xl leading-relaxed" style={{ color: 'var(--navy-150)' }}>
              Your loan requirements and suitability analysis are synchronized. Adjust income or tenure anytime in the live simulator to see new institutional matches.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              href="/compare"
              className="w-full sm:w-auto text-center px-5 py-2.5 rounded-md text-xs font-semibold transition-colors"
              style={{ color: 'white', background: 'var(--navy-800)', border: '1px solid var(--navy-600)' }}
            >
              Compare Catalog
            </Link>
            <Link
              href="/recommendations"
              className="w-full sm:w-auto text-center px-6 py-2.5 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              style={{ background: 'var(--navy-600)', color: 'white' }}
            >
              <span>View Recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2. Unobtrusive Banner */}
        <div
          className="rounded-xl p-4 flex items-center justify-between gap-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: 'var(--navy-050)' }}>
              <Info className="w-4 h-4" style={{ color: 'var(--navy-600)' }} />
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Looking to test different monthly installments? Adjust your income, existing obligations, and CIBIL score live in the{' '}
              <Link href="/recommendations" className="font-semibold underline" style={{ color: 'var(--navy-600)' }}>
                Recommendations Simulator
              </Link>.
            </p>
          </div>
        </div>

        {/* 3. Streamlined Bento Overview (No Checklist / No Multi-step Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1: Active Loan Goal */}
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--navy-050)' }}>
                  <Home className="w-4 h-4" style={{ color: 'var(--navy-600)' }} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Active Loan Goal</h2>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Target borrowing parameters</p>
                </div>
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: 'var(--navy-600)' }}
              >
                <Pencil className="w-3 h-3" />
                Change loan type
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-md" style={{ background: 'var(--bg-canvas)' }}>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Category</span>
                <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {loanRequirement?.loan_type || 'Home Loan'}
                </p>
              </div>
              <div className="p-3 rounded-md" style={{ background: 'var(--bg-canvas)' }}>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Target Amount</span>
                <p className="text-xs font-mono font-bold mt-0.5 tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  {formatINR(loanRequirement?.loan_amount || 3000000)}
                </p>
              </div>
              <div className="p-3 rounded-md" style={{ background: 'var(--bg-canvas)' }}>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Tenure</span>
                <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {formatTenure(loanRequirement?.tenure_months || 240)}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Borrower Personal Profile */}
          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--navy-050)' }}>
                  <User className="w-4 h-4" style={{ color: 'var(--navy-600)' }} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Borrower Details</h2>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Permanent demographic info</p>
                </div>
              </div>
              <Link
                href="/profile?edit=personal"
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: 'var(--navy-600)' }}
              >
                <Pencil className="w-3 h-3" />
                Edit
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-md" style={{ background: 'var(--bg-canvas)' }}>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Full Name</span>
                <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>
                  {profile?.full_name || displayName}
                </p>
              </div>
              <div className="p-3 rounded-md" style={{ background: 'var(--bg-canvas)' }}>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Employment</span>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {profile?.employment_type || 'Salaried'}
                </p>
              </div>
              <div className="p-3 rounded-md" style={{ background: 'var(--bg-canvas)' }}>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>City</span>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {profile?.city || profile?.location || 'Pune'}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
