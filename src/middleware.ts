import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { authRoutes } from "./utils/authRoutes";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./utils/authCookies";
import { TTokenUser } from "./types";

const clearAuthCookies = (response: NextResponse) => {
  [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE].forEach((name) => {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    response.cookies.delete(name);
  });

  return response;
};

const isTokenExpired = (exp?: number) => {
  if (!exp) return false;
  return exp < Date.now() / 1000;
};

export default function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAdminRoute = pathname.startsWith("/admin");

  if (accessToken && isAuthRoute) {
    try {
      const decoded = jwtDecode<TTokenUser>(accessToken);
      if (!isTokenExpired(decoded?.exp)) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    } catch {
      return clearAuthCookies(NextResponse.next());
    }
  }

  if (isAuthRoute) {
    return NextResponse.next();
  }

  if (isAdminRoute && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAdminRoute && accessToken) {
    try {
      const decoded = jwtDecode<TTokenUser>(accessToken);

      if (isTokenExpired(decoded?.exp)) {
        if (refreshToken) {
          return NextResponse.next();
        }

        return clearAuthCookies(
          NextResponse.redirect(new URL("/login", req.url)),
        );
      }

      const role = String(decoded?.role || "").toUpperCase();
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        return NextResponse.next();
      }

      return clearAuthCookies(
        NextResponse.redirect(new URL("/login", req.url)),
      );
    } catch {
      if (refreshToken) {
        return NextResponse.next();
      }

      return clearAuthCookies(
        NextResponse.redirect(new URL("/login", req.url)),
      );
    }
  }

  if (isAdminRoute && refreshToken) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/forget-password",
    "/verify-email",
    "/reset-password",
    "/admin/:path*",
  ],
};
