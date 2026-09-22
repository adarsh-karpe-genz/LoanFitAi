import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Fires a best-effort login event to our internal audit API.
 * Uses the internal secret so the API route knows the call is server-originated.
 * Deliberately fire-and-forget — if this fails, the login still succeeds.
 */
async function recordLoginEvent(
  request: NextRequest,
  user_id: string,
  email: string,
  success: boolean,
  provider?: string
) {
  try {
    const login_method =
      provider === 'google' ? 'google'
      : provider === 'email' ? 'magic_link'
      : provider === 'otp' ? 'otp'
      : 'password';

    const internalSecret = process.env.INTERNAL_API_SECRET;
    if (!internalSecret) return; // env not configured, skip silently

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      `https://${request.headers.get('host') ?? 'localhost:3000'}`;

    await fetch(`${baseUrl}/api/auth/login-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': internalSecret,
      },
      body: JSON.stringify({
        user_id,
        email,
        login_method,
        success,
        user_agent: request.headers.get('user-agent') ?? undefined,
      }),
    });
  } catch {
    // Best-effort — never block the auth flow
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          },
        },
      });

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data.session) {
        const { user } = data.session;
        const provider = user.app_metadata?.provider ?? 'password';

        // Record successful login — fire-and-forget, does not block redirect
        recordLoginEvent(
          request,
          user.id,
          user.email ?? '',
          true,
          provider
        );

        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
