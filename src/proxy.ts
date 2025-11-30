import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

const authRoutes = ['/sign-in', '/sign-up'];
const protectedRoutes = ['/profile'];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isAuthRoute = authRoutes.includes(path);

  const sessionCookie = getSessionCookie(req);

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', req.nextUrl));
  }

  if (
    isAuthRoute &&
    sessionCookie &&
    !req.nextUrl.pathname.startsWith('/profile')
  ) {
    return NextResponse.redirect(new URL('/profile', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
