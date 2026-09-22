-- ============================================================================
-- LoanFit AI — Login Activity Tracking
-- Migration: add admin_users + login_events with RLS
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================================

-- ── 1. admin_users ──────────────────────────────────────────────────────────
-- Minimal allowlist table. Seeded manually by the database owner.
-- No in-app "grant admin" button is built — this is intentional.

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can see who else is an admin.
-- Uses a direct auth.uid() check — no recursive EXISTS that could be circumvented.
CREATE POLICY "admins can read admin_users"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policy — changes happen only via service-role SQL,
-- never from the client. The owner seeds their own user_id manually:
--   INSERT INTO admin_users (user_id) VALUES ('<your-auth-uid>');

-- ── 2. login_events ─────────────────────────────────────────────────────────
-- One row per login attempt. Written server-side via service role only.
-- ip_address is stored per Step 0 — treat as PII, same access restriction.

CREATE TABLE IF NOT EXISTS public.login_events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  email        TEXT        NOT NULL,
  login_method TEXT        NOT NULL
    CHECK (login_method IN ('password', 'otp', 'google', 'magic_link', 'unknown')),
  user_agent   TEXT,
  ip_address   TEXT,       -- PII: admin-only, never expose publicly
  success      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_events_user_id    ON public.login_events(user_id);
CREATE INDEX IF NOT EXISTS idx_login_events_created_at ON public.login_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_events_email      ON public.login_events(email);

ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;

-- Default-deny is implicit (RLS enabled, no permissive policy = no access).

-- Admins can read everything.
CREATE POLICY "admins can read login_events"
  ON public.login_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Inserts happen ONLY from a trusted server context using the service role key.
-- The service role bypasses RLS entirely — this policy intentionally blocks
-- any attempt to insert from a client/anon/user JWT.
CREATE POLICY "deny client inserts on login_events"
  ON public.login_events FOR INSERT
  WITH CHECK (FALSE);

-- No UPDATE or DELETE policies — this is an append-only audit log.

-- ── 3. Enable Realtime for admin live-view ───────────────────────────────────
-- Run in Supabase Dashboard → Database → Replication → Add table → login_events
-- Or via SQL:

ALTER PUBLICATION supabase_realtime ADD TABLE public.login_events;

-- ── 4. Seed your admin account ───────────────────────────────────────────────
-- Replace the UUID below with your own auth.uid() (find it in:
--   Supabase Dashboard → Authentication → Users → copy the UUID)
-- IMPORTANT: Do not commit a real UUID to a public repo.

-- INSERT INTO public.admin_users (user_id)
-- VALUES ('YOUR-AUTH-UUID-HERE')
-- ON CONFLICT (user_id) DO NOTHING;
