import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth"];

const ROLE_PATHS: Record<string, string[]> = {
  admin: ["/admin", "/manager", "/worker", "/api"],
  manager: ["/manager", "/worker", "/api"],
  worker: ["/worker", "/api"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = (session.user as any).role || "worker";
    const allowedPaths = ROLE_PATHS[userRole] || ROLE_PATHS.worker;

    const hasAccess = allowedPaths.some((path) => pathname.startsWith(path));

    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const response = NextResponse.next();
    response.headers.set("x-user-id", String(session.user.id));
    response.headers.set("x-user-role", userRole);

    return response;
  } catch (error) {
    console.error("Auth middleware error:", error);
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
