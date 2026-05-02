import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, verifySession } from "@/src/lib/auth/session";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isProtectedPath = pathname.startsWith("/library")
    || pathname.startsWith("/search")
    || pathname.startsWith("/books");
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isRootPage = pathname === "/";

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let isAuthenticated = false;
  if (token) {
    const session = await verifySession(token);
    isAuthenticated = Boolean(session);
  }

  if (isProtectedPath && !isAuthenticated) {
    return redirectToLogin(request);
  }

  if ((isAuthPage || isRootPage) && isAuthenticated) {
    return NextResponse.redirect(new URL("/library", request.url));
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/", "/login", "/signup", "/library/:path*", "/search/:path*", "/books/:path*"],
};
