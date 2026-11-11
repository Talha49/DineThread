import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required");
}
const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

export async function middleware(req) {
  const token = req.cookies.get("auth-token")?.value;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isDashboardPage = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");

  if (isDashboardPage) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("auth-token");
      return response;
    }
  }

  if (isAuthPage && token) {
    try {
      await jwtVerify(token, secret);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch (error) {
      // Token is invalid/expired; clear it and allow viewing login/signup
      const response = NextResponse.next();
      response.cookies.delete("auth-token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/login", "/signup"],
};
