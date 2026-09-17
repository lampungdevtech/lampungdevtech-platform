import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let next-intl handle locale detection, redirection (e.g. / -> /id), and cookie persistence
  const response = handleI18nRouting(request);

  // If next-intl already redirected (e.g., / -> /id or /unknown -> /id/unknown), return immediately
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  // Parse current locale and path without locale prefix
  const localeMatch = pathname.match(/^\/(id|en)(\/.*)?$/);
  const currentLocale = localeMatch ? localeMatch[1] : routing.defaultLocale;
  const pathWithoutLocale = localeMatch ? (localeMatch[2] || '/') : pathname;

  const token = await getToken({ req: request });
  const isAuthenticated = !!token;

  // Check if dashboard access is enabled
  const isDashboardEnabled = process.env.PASS_TO_DASHBOARD === 'true';

  // Add paths that require authentication
  const protectedPaths = ["/dashboard", "/profile"];
  const isDashboardPath = pathWithoutLocale.startsWith('/dashboard');
  const isProtectedPath = protectedPaths.some((path) =>
    pathWithoutLocale.startsWith(path)
  );

  // Redirect from dashboard if access is disabled
  if (isDashboardPath && !isDashboardEnabled) {
    return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
  }

  // Redirect to login if trying to access protected routes while not authenticated
  if (isProtectedPath && !isAuthenticated) {
    const redirectUrl = new URL(`/${currentLocale}/login`, request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Match root path
    '/',
    // Match all localized paths
    '/(id|en)/:path*',
    // Match all non-localized paths needing redirect to /id or /en, excluding static files & API
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};