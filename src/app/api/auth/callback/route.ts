/**
 * /api/auth/callback — OAuth callback handler
 *
 * Exchanges the OAuth code for a Supabase session,
 * creates the Prisma UserProfile if needed, then redirects to /dashboard.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureUserProfile } from '@/lib/auth/server-utils';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Create the Prisma UserProfile if this is a new OAuth user
      try {
        await ensureUserProfile({
          supabaseId: data.user.id,
          email: data.user.email!,
          fullName:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            null,
        });
      } catch (profileErr) {
        console.error('[OAuth Callback] Profile creation error:', profileErr);
        // Non-fatal — user is still authenticated
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('[OAuth Callback] Error exchanging code:', error);
  }

  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
