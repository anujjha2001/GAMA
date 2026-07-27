import { NextResponse, type NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'gama-super-secret-key-change-in-production-12345';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/insights',
  '/schedule',
  '/vault',
  '/meals',
  '/settings',
  '/live-order',
  '/workout',
  '/workout-studio',
  '/chat',
  '/health',
  '/nutrition',
  '/profile',
];

const AUTH_ROUTES = ['/login', '/register', '/forgot', '/forgot-password'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and internal next paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/manifest.json') ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ogg|css|js|json|ico|woff2?)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Allow API routes through without session checks (API routes handle their own auth)
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('gama_session');
  let userPayload: any = null;
  let hasInvalidCookie = false;

  if (authCookie && authCookie.value) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(authCookie.value, secret);
      userPayload = payload;
    } catch (err: any) {
      console.warn('[PROXY] JWT verification failed, bailing out:', err?.message || String(err)); hasInvalidCookie = true;
    }
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  const isVerifyRoute = pathname === '/auth/verify' || pathname.startsWith('/auth/verify/');

  // ── No session / Invalid session ──────────────────────────────────────────
  if (!userPayload) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', pathname);
      const response = NextResponse.redirect(url);
      if (hasInvalidCookie) {
        response.cookies.delete('gama_session');
      }
      return response;
    }

    if (hasInvalidCookie) {
      const response = NextResponse.next();
      response.cookies.delete('gama_session');
      return response;
    }

    return NextResponse.next();
  }

  // ── Session exists ────────────────────────────────────────────────────────
  const isEmailVerified = Boolean(userPayload.emailVerified);

  // Unverified user trying to access protected routes → /auth/verify
  if (!isEmailVerified && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/verify';
    if (userPayload.email) url.searchParams.set('email', userPayload.email);
    return NextResponse.redirect(url);
  }

  // Verified user trying to access auth pages or verify page → /dashboard
  if (isEmailVerified && (isAuthRoute || isVerifyRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)',
  ],
};
