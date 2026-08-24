'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getFullBorrowerProfile } from '@/services/loan/loanService';
import { BorrowerFullProfile } from '@/types/database';
import ReviewSummary from '@/components/forms/ReviewSummary';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ReviewPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<BorrowerFullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        let currentUserId = '';
        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const { data, error } = await supabase.auth.getUser();
          if (error || !data.user) {
            router.push('/login?redirect=/profile/review');
            return;
          }
          currentUserId = data.user.id;
        } else {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('loanfit_demo_user') : null;
          if (!stored) {
            router.push('/login?redirect=/profile/review');
            return;
          }
          currentUserId = JSON.parse(stored).id || 'demo-user-123';
        }

        setUserId(currentUserId);
        const data = await getFullBorrowerProfile(currentUserId);
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching review profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleEditSection = (stepIdx: number) => {
    router.push(`/profile?step=${stepIdx}`);
  };

  const handleFinalSubmit = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const refreshed = await getFullBorrowerProfile(userId);
      setProfileData(refreshed);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200/70 rounded-2xl w-48" />
          <div className="h-96 bg-slate-200/70 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-card">
        <ReviewSummary
          data={profileData}
          onEditSection={handleEditSection}
          onSubmitProfile={handleFinalSubmit}
          isLoading={saving}
        />
      </div>
    </div>
  );
}
