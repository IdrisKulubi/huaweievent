import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Add home page to public routes
const publicRoutes = ["/", "/login", "/no-access"];

export async function middleware(request: Request & { nextUrl: URL }) {
  const session = await auth();
  const isAuth = !!session?.user;
  const pathname = request.nextUrl.pathname;

 

  //  public routes
  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === "/sw.js") {
    return NextResponse.rewrite(new URL("/sw", request.url));
  }

  // Handle non-authenticated users
  if (!isAuth) {
    // Don't redirect if it's the home page
    if (pathname === "/") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // After login redirects
  if (pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/profile/setup", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/ (API routes)
     * 2. /_next/ (Next.js internals)
     * 3. /static (public files)
     * 4. /*.* (files with extensions)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|static|.*\\.).*)",
    '/sw.js',
  ],
};
