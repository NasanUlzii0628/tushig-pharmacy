import { NextRequest, NextResponse } from "next/server";
import logger from "./lib/logger";

/**
 * Admin panel authentication middleware using Next.js proxy (Next 16+)
 */

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read token from cookies
  const token = req.cookies.get("token")?.value;

  // Public routes (no auth required)
  const publicRoutes = [
    "/auth/login",
  ];

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  if (token && pathname.startsWith("/auth/login")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 2️⃣ Allow public routes without token
  if (isPublic) {
    return NextResponse.next();
  }

  console.log("asdasd123", token)

  // 3️⃣ Protect everything inside /dashboard or other protected areas
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

/**
 * Matcher — runs ONLY on page routes, NOT static files or _next assets.
 */
export const config = {
  matcher: [
    // Run proxy on all routes EXCEPT static assets
    "/((?!_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.jpg$|favicon.ico).*)",
  ],
};
