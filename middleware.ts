import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Auth guard skeleton for the protected app surface.
 * Replace the placeholder cookie check with real session validation
 * when auth provider wiring is implemented.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Placeholder auth check: presence of session cookie means "authenticated".
  const sessionCookie = request.cookies.get('session')?.value;

  if (pathname.startsWith('/app') && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};
