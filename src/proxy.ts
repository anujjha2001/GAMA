import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and internal next paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ogg|css|js|json)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check if session cookie exists
  const hasSessionCookie = request.cookies.has('gama_session');

  const isDashboardRoute = [
    '/dashboard',
    '/insights',
    '/schedule',
    '/vault',
    '/meals',
    '/settings',
    '/live-order',
  ].some((path) => pathname === path || pathname.startsWith(path + '/'));

  const isAuthRoute = [
    '/login',
    '/register',
    '/forgot',
    '/forgot-password',
    '/auth',
  ].some((path) => pathname === path || pathname.startsWith(path + '/'));

  // Allow landing page and public assets directly
  if (pathname === '/') {
    return supabaseResponse;
  }

  // Redirect unauthenticated user trying to access dashboard routes to /login
  if (isDashboardRoute && !hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated user trying to access auth pages to /dashboard
  if (isAuthRoute && hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)',
  ],
};
