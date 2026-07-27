import { NextResponse } from 'next/server';
import { signToken, type DecodedToken } from '@/lib/jwt';

/**
 * Creates an authentication session JWT and sets it as an HttpOnly cookie.
 * @param response NextResponse object to append the cookie to
 * @param user The UserProfile model representation containing id, email, and fullName
 * @param emailVerified The verified status of the user's email
 */
export function createSessionCookie(
  response: NextResponse,
  user: { id: string; email: string; fullName: string | null },
  emailVerified: boolean
): string {
  const payload: DecodedToken = {
    id: user.id,
    email: user.email,
    fullName: user.fullName || user.email.split('@')[0],
    emailVerified,
  };

  const token = signToken(payload);

  response.cookies.set('gama_session', token, {
    path: '/',
    maxAge: 86400, // 1 day
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  return token;
}

/**
 * Clears the auth session cookie.
 * @param response NextResponse object to remove the cookie from
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.delete('gama_session');
}
