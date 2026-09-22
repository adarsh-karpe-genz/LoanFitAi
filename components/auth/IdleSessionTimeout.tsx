'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

// 30 minutes of total inactivity timeout
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const LAST_ACTIVITY_KEY = 'loanfit_last_activity_timestamp';

export default function IdleSessionTimeout() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only track if running in browser
    if (typeof window === 'undefined') return;

    // Check if user is logged in
    async function checkActiveSession(): Promise<boolean> {
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const { data } = await supabase.auth.getSession();
          return Boolean(data.session);
        } catch {
          return false;
        }
      } else {
        return Boolean(localStorage.getItem('loanfit_demo_user'));
      }
    }

    async function handleInactivityExpiry() {
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
        } catch {
          // ignore
        }
      } else {
        localStorage.removeItem('loanfit_demo_user');
      }

      localStorage.removeItem(LAST_ACTIVITY_KEY);
      router.push('/login?reason=session_expired');
    }

    function recordActivity() {
      const now = Date.now();
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      resetTimer();
    }

    function resetTimer() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
        const lastActivity = lastActivityStr ? parseInt(lastActivityStr, 10) : Date.now();
        const elapsed = Date.now() - lastActivity;

        if (elapsed >= IDLE_TIMEOUT_MS) {
          const isLoggedIn = await checkActiveSession();
          if (isLoggedIn) {
            await handleInactivityExpiry();
          }
        } else {
          // Timer woke up early, re-schedule for remaining time
          timerRef.current = setTimeout(async () => {
            const loggedIn = await checkActiveSession();
            if (loggedIn) {
              await handleInactivityExpiry();
            }
          }, IDLE_TIMEOUT_MS - elapsed);
        }
      }, IDLE_TIMEOUT_MS);
    }

    // Set initial activity timestamp if not present
    if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    }

    resetTimer();

    // Event listeners for user interaction (throttled)
    let lastRecorded = 0;
    const onUserInteraction = () => {
      const now = Date.now();
      if (now - lastRecorded > 5000) {
        // throttle event writes to once per 5 seconds
        lastRecorded = now;
        recordActivity();
      }
    };

    window.addEventListener('mousemove', onUserInteraction, { passive: true });
    window.addEventListener('keydown', onUserInteraction, { passive: true });
    window.addEventListener('click', onUserInteraction, { passive: true });
    window.addEventListener('scroll', onUserInteraction, { passive: true });
    window.addEventListener('touchstart', onUserInteraction, { passive: true });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('mousemove', onUserInteraction);
      window.removeEventListener('keydown', onUserInteraction);
      window.removeEventListener('click', onUserInteraction);
      window.removeEventListener('scroll', onUserInteraction);
      window.removeEventListener('touchstart', onUserInteraction);
    };
  }, [router]);

  return null;
}
