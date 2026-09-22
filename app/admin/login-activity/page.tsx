import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginActivityClient from './LoginActivityClient';

/**
 * /admin/login-activity — Server Component
 *
 * Security: auth check runs server-side before ANY content renders.
 * Non-admins and unauthenticated users receive a 404 — not a 403.
 * A 403 would confirm the route exists to someone probing the app.
 * A 404 makes the admin area invisible to non-admins.
 */
export default async function LoginActivityPage() {
  const supabase = createClient();

  // ── 1. Must be authenticated ──────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // ── 2. Must be in admin_users ─────────────────────────────────────────────
  // This query uses the user-scoped client (not service role), so RLS applies.
  // The admin_users policy only allows auth.uid() = user_id — if this user
  // isn't an admin, the row won't be returned (RLS hides it, no error).
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!adminRow) {
    // 404 — do not reveal the route exists to non-admins
    notFound();
  }

  // ── 3. Pre-fetch initial rows for SSR — admin client can read login_events
  // Fetch the 200 most recent events for initial render; Realtime adds new ones
  const { data: initialRows } = await supabase
    .from('login_events')
    .select('id, user_id, email, login_method, user_agent, ip_address, success, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-canvas)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 text-[10px] font-semibold rounded-xs"
              style={{ background: 'var(--navy-600)', color: 'white' }}
            >
              Admin
            </span>
          </div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Login activity
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Live log of all sign-in events. New rows appear automatically via Realtime.
            Access restricted to admin accounts — data is never accessible to regular users.
          </p>
        </div>

        <LoginActivityClient initialRows={initialRows ?? []} />
      </div>
    </div>
  );
}
