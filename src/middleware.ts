import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value;

  // Allow access to static files, /signin, /signup
  const publicPaths = ["/signin", "/signup", "/favicon.ico"];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    // If already logged in and tries to access /signin or /signup, redirect to /
    if (isLoggedIn && (pathname === "/signin" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

// Apply middleware to all routes except _next, api, and static files
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
