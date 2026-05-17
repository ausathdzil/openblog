import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse, type ProxyConfig } from 'next/server';

const protectedRoutes = ['/profile', '/editor'];
const authRoutes = ['/sign-in', '/sign-up'];

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(path);
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  const sessionCookie = getSessionCookie(req);

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', req.nextUrl));
  }

  if (isAuthRoute && sessionCookie && !path.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/profile', req.nextUrl));
  }

  return NextResponse.next();
}

export const config: ProxyConfig = {
  matcher: ['/((?!api|elysia|_next/static|_next/image|.*\\.png$).*)'],
};
