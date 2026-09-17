import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;

  // Check if dashboard access is enabled
  const isDashboardEnabled = process.env.PASS_TO_DASHBOARD === 'true';

  // Add paths that require authentication
  const protectedPaths = ["/dashboard", "/profile"];
  const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard');
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Redirect from dashboard if access is disabled
  if (isDashboardPath && !isDashboardEnabled) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect to login if trying to access protected routes while not authenticated
  if (isProtectedPath && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};