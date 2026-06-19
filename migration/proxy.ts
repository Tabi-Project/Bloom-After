import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_TOKEN_COOKIE,
  ADMIN_PUBLIC_PATHS,
  ADMIN_HOME,
  isTokenValid,
} from "@/lib/auth";

/**
 * Next 16 renamed `middleware` to `proxy`. This gate runs before admin routes
 * render and redirects unauthenticated users to the login page, and bounces
 * already-authenticated users away from the login page.
 *
 * It validates the mirrored `admin_token` cookie (presence + expiry). The
 * Express backend still verifies the JWT signature on every API call, so this
 * is the UX-level guard, not the only one.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicAdminPath = ADMIN_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const authenticated = isTokenValid(token);

  // Signed-in admins shouldn't see the login page.
  if (isPublicAdminPath) {
    if (authenticated && pathname === "/admin/login") {
      return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
    }
    return NextResponse.next();
  }

  // Everything else under /admin requires a valid session.
  if (!authenticated) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Clear a stale/expired cookie so the browser stops resending it.
    if (token) {
      response.cookies.set({
        name: ADMIN_TOKEN_COOKIE,
        value: "",
        path: "/",
        maxAge: 0,
      });
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
