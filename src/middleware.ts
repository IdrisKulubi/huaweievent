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
        
        // Role-based redirection after login
        if (userProfile?.role === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
        } else if (userProfile?.role === "employer") {
          return NextResponse.redirect(new URL("/employer/setup", request.url));
        } else if (userProfile?.role === "security") {
          return NextResponse.redirect(new URL("/security/setup", request.url));
        } else if (userProfile?.profileComplete) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        } else {
          return NextResponse.redirect(new URL("/profile-setup", request.url));
        }
      } catch (error) {
        console.error("Error checking user profile in middleware:", error);
        return NextResponse.redirect(new URL("/profile-setup", request.url));
      }
    }

    // Role-based profile setup access control
    if (pathname.startsWith("/profile-setup")) {
      try {
        const userProfile = await getUserProfile(session.user.id);
        
        // Only job seekers should access the general profile setup
        if (userProfile?.role && userProfile.role !== "job_seeker") {
          // Redirect to appropriate role-specific setup or dashboard
          if (userProfile.role === "admin") {
            return NextResponse.redirect(new URL("/admin", request.url));
          } else if (userProfile.role === "employer") {
            return NextResponse.redirect(new URL("/employer/setup", request.url));
          } else if (userProfile.role === "security") {
            return NextResponse.redirect(new URL("/security/setup", request.url));
          }
        }
        
        // If job seeker has completed profile, redirect to dashboard
        if (userProfile?.profileComplete && userProfile.role === "job_seeker") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } catch (error) {
        console.error("Error checking user profile in middleware:", error);
        // If there's an error, allow them to access setup page
      }
    }

    // Check if user needs to complete profile setup (only for job seekers)
    if (!pathname.startsWith("/profile-setup") && 
        !pathname.startsWith("/admin") && 
        !pathname.startsWith("/employer") && 
        !pathname.startsWith("/security")) {
      try {
        const userProfile = await getUserProfile(session.user.id);
        
        // If user doesn't have a completed profile and is a job seeker, redirect to setup
        if (!userProfile?.profileComplete && userProfile?.role === "job_seeker") {
          return NextResponse.redirect(new URL("/profile-setup", request.url));
        }
        
        // Role-based dashboard redirections for incomplete setups
        if (userProfile?.role === "employer" && !userProfile.profileComplete) {
          return NextResponse.redirect(new URL("/employer/setup", request.url));
        }
        
        if (userProfile?.role === "security" && !userProfile.profileComplete) {
          return NextResponse.redirect(new URL("/security/setup", request.url));
        }
      } catch (error) {
        console.error("Error checking user profile in middleware:", error);
        // If there's an error, allow them to proceed (fail safely)
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
