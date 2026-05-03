import { NextRequest, NextResponse } from "next/server";
import logger from "./lib/logger";
import { hasRouteAccess } from "./lib/permissions";


function getUserRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.role || null;
  } catch (error) {
    logger.error("Failed to decode token", error);
    return null;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("tushig_pharmacy_token")?.value;
  const userRole = req.cookies.get("tushig_pharmacy_user_role")?.value;

  const publicRoutes = [
    "/auth/login",
  ];

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  if (token && pathname.startsWith("/auth/login")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isPublic) {
    return NextResponse.next();
  }

  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (token && pathname.startsWith("/dashboard")) {
    let role: string | undefined = userRole;

    if (!role) {
      role = getUserRoleFromToken(token) ?? undefined;
    }

    if (!hasRouteAccess(pathname, role)) {
      logger.warn(`Unauthorized access attempt to ${pathname} by role: ${role}`);
      return NextResponse.rewrite(new URL("/dashboard/not-found", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run proxy on all routes EXCEPT static assets
    "/((?!_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.jpg$|favicon.ico).*)",
  ],
};