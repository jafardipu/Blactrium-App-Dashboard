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
  if (!exp) return true;
  return exp < Date.now() / 1000;
};

const decodeToken = (token?: string | null) => {
  if (!token) return null;

  try {
    return jwtDecode<TTokenUser>(token);
  } catch {
    return null;
  }
};

const isTokenValid = (token?: string | null) => {
  const decoded = decodeToken(token);
  if (!decoded) return false;
  return !isTokenExpired(decoded.exp);
};

const getRefreshUrl = (req: NextRequest) => {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "/api/v1";
  if (base.startsWith("http")) {
    return `${base.replace(/\/$/, "")}/admin/auth/refresh`;
  }
  return `${req.nextUrl.origin}${base.startsWith("/") ? base : `/${base}`}/admin/auth/refresh`;
};

const getAccessTokenFromPayload = (payload: any) =>
  payload?.data?.accessToken ||
  payload?.data?.token ||
  payload?.accessToken ||
  payload?.token ||
  null;

const getRefreshTokenFromPayload = (payload: any) =>
  payload?.data?.refreshToken || payload?.refreshToken || null;

const refreshAccessToken = async (
  req: NextRequest,
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken?: string } | null> => {
  try {
    const res = await fetch(getRefreshUrl(req), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
        Cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!res.ok) return null;

    const payload = await res.json().catch(() => ({}));
    const accessToken = getAccessTokenFromPayload(payload);
    if (!accessToken) return null;

    return {
      accessToken,
      refreshToken: getRefreshTokenFromPayload(payload) || undefined,
    };
  } catch {
    return null;
  }
};

const applyAuthCookies = (
  response: NextResponse,
  accessToken: string,
  refreshToken?: string,
) => {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    path: "/",
    sameSite: "lax",
  });

  if (refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
};

const redirectToLogin = (req: NextRequest) =>
  clearAuthCookies(NextResponse.redirect(new URL("/login", req.url)));

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  let accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  let refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAdminRoute = pathname.startsWith("/admin");

  const accessValid = isTokenValid(accessToken);
  const refreshValid = isTokenValid(refreshToken);

  // Auth pages: valid session → dashboard
  if (isAuthRoute) {
    if (accessValid) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    if (!accessValid && refreshValid && refreshToken) {
      const refreshed = await refreshAccessToken(req, refreshToken);
      if (refreshed?.accessToken) {
        const response = NextResponse.redirect(new URL("/admin/dashboard", req.url));
        return applyAuthCookies(
          response,
          refreshed.accessToken,
          refreshed.refreshToken || refreshToken,
        );
      }
    }

    return NextResponse.next();
  }

  // Protected admin routes
  if (isAdminRoute) {
    // Both missing/invalid → logout
    if (!accessValid && !refreshValid) {
      return redirectToLogin(req);
    }

    // Access invalid/missing but refresh valid → mint new access token
    if (!accessValid && refreshValid && refreshToken) {
      const refreshed = await refreshAccessToken(req, refreshToken);
      if (!refreshed?.accessToken) {
        return redirectToLogin(req);
      }

      accessToken = refreshed.accessToken;
      if (refreshed.refreshToken) {
        refreshToken = refreshed.refreshToken;
      }

      const decoded = decodeToken(accessToken);
      const role = String(decoded?.role || "").toUpperCase();
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        return redirectToLogin(req);
      }

      const response = NextResponse.next();
      return applyAuthCookies(
        response,
        accessToken,
        refreshed.refreshToken || refreshToken,
      );
    }

    // Access valid → role check
    const decoded = decodeToken(accessToken);
    const role = String(decoded?.role || "").toUpperCase();
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      return NextResponse.next();
    }

    return redirectToLogin(req);
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
