import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isDesignerRoute = createRouteMatcher(["/designer_management(.*)"]);
const isProtectedRoute = createRouteMatcher(["/settings(.*)", "wishlist(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, getToken } = await auth();
  const token = await getToken();
  console.log("Token:", token);

  if (isAdminRoute(req) && sessionClaims?.metadata?.role !== "admin" && sessionClaims?.metadata?.role !== "designer") {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }
  
  if (isDesignerRoute(req) && sessionClaims?.metadata?.role !== "designer" && sessionClaims?.metadata?.role !== "admin") {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
