import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/actions/user-actions";

// Add home page to public routes
const publicRoutes = ["/", "/login", "/no-access"];

export async function middleware(request: Request & { nextUrl: URL }) {
  const session = await auth();
  const isAuth = !!session?.user;
  const pathname = request.nextUrl.pathname;

  // Handle public routes
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

  // Handle authenticated users
  if (isAuth && session?.user?.id) {
    // Check if user is trying to access login page - redirect to appropriate destination
    if (pathname.startsWith("/login")) {
      try {
        const userProfile = await getUserProfile(session.user.id);
        
        if (userProfile?.profileComplete) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        } else {
          return NextResponse.redirect(new URL("/profile-setup", request.url));
        }
      } catch (error) {
        console.error("Error checking user profile in middleware:", error);
        return NextResponse.redirect(new URL("/profile-setup", request.url));
      }
    }

    // Check if user needs to complete profile setup
    if (!pathname.startsWith("/profile-setup")) {
      try {
        const userProfile = await getUserProfile(session.user.id);
        
        // If user doesn't have a completed profile, redirect to setup
        if (!userProfile?.profileComplete) {
          return NextResponse.redirect(new URL("/profile-setup", request.url));
        }
      } catch (error) {
        console.error("Error checking user profile in middleware:", error);
        // If there's an error, allow them to proceed (fail safely)
      }
    }

    // If user has completed profile but is trying to access setup page, redirect to dashboard
    if (pathname.startsWith("/profile-setup")) {
      try {
        const userProfile = await getUserProfile(session.user.id);
        
        if (userProfile?.profileComplete) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } catch (error) {
        console.error("Error checking user profile in middleware:", error);
        // If there's an error, allow them to access setup page
      }
    }
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
