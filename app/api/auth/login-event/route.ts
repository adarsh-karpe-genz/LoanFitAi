import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * POST /api/auth/login-event
 *
 * Records a login attempt in login_events using the service role key.
 * Called from the server-side auth callback — never from client JS.
 *
 * Security contract:
 * - Uses service role: bypasses RLS, data never touches the browser
 * - ip_address taken from request headers server-side, never trusted from body
 * - No credential material is ever accepted or logged
 * - Returns generic 200 regardless of outcome to avoid leaking timing information
 *   to potential attackers who might call this endpoint directly
 */

interface LoginEventBody {
  user_id: string;
  email: string;
  login_method: 'password' | 'otp' | 'google' | 'magic_link' | 'unknown';
  success: boolean;
  user_agent?: string;
}

export async function POST(request: NextRequest) {
  try {
    // ── 1. Verify request is from our own server (internal secret) ────────
    const secret = request.headers.get('x-internal-secret');
    if (secret !== process.env.INTERNAL_API_SECRET) {
      // Return 200 with empty body — do not confirm whether the endpoint exists
      // or why the request failed, to avoid information leakage
      return NextResponse.json({}, { status: 200 });
    }

    // ── 2. Parse body ────────────────────────────────────────────────────
    let body: LoginEventBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({}, { status: 200 });
    }

    const { user_id, email, login_method, success, user_agent } = body;

    // Validate login_method is a known value — never store arbitrary strings
    const VALID_METHODS = ['password', 'otp', 'google', 'magic_link', 'unknown'] as const;
    const method = VALID_METHODS.includes(login_method as typeof VALID_METHODS[number])
      ? login_method
      : 'unknown';

    // ── 3. Extract IP from headers — server-side only, never from body ───
    // x-forwarded-for may contain a comma-separated list of IPs (proxies).
    // We take the first (leftmost) which is the original client IP.
    const forwarded = request.headers.get('x-forwarded-for');
    const ip_address = forwarded ? forwarded.split(',')[0].trim() : null;

    // ── 4. Insert via service role — bypasses RLS ────────────────────────
    const supabase = createServiceClient();
    await supabase.from('login_events').insert({
      user_id: user_id || null,
      email,
      login_method: method,
      user_agent: user_agent ?? null,
      ip_address,
      success,
    });

    // Always return 200 — don't distinguish success/failure to callers
    return NextResponse.json({}, { status: 200 });
  } catch {
    // Swallow all errors — this is a best-effort audit log, not a critical path
    return NextResponse.json({}, { status: 200 });
  }
}

// Only allow POST — no GET handler means this can't be used to read data
export async function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
