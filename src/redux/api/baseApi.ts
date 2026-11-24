import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, setUser } from "../features/authSlice";
import { tagTypesList } from "../tagTypes";
import Cookies from "js-cookie";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/utils/authCookies";

type RefreshResult = {
  ok: boolean;
  accessToken: string | null;
};

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const otpToken = sessionStorage.getItem("otpToken");
    const forgotPasswordToken = sessionStorage.getItem("forgotPasswordToken");
    const token =
      Cookies.get(ACCESS_TOKEN_COOKIE) ||
      (getState() as any).auth.token ||
      null;

    if (otpToken) {
      headers.set("authorization", `Bearer ${otpToken}`);
    } else if (forgotPasswordToken) {
      headers.set("authorization", `Bearer ${forgotPasswordToken}`);
    } else if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const AUTH_SKIP_REFRESH = [
  "/admin/auth/login",
  "/admin/auth/refresh",
  "/auth/recover",
];

const shouldSkipRefresh = (args: any) => {
  const url = typeof args === "string" ? args : args?.url;
  if (!url) return false;
  return AUTH_SKIP_REFRESH.some((path) => url.includes(path));
};

const getAccessToken = (payload: any) =>
  payload?.data?.accessToken ||
  payload?.data?.token ||
  payload?.accessToken ||
  payload?.token ||
  null;

const getRefreshToken = (payload: any) =>
  payload?.data?.refreshToken || payload?.refreshToken || null;

const isAuthError = (result: any) => {
  const status = result?.error?.status;
  const dataStatus = result?.error?.data?.status;
  const message = String(
    result?.error?.data?.message || result?.error?.data?.error || "",
  ).toLowerCase();

  return (
    status === 401 ||
    status === 403 ||
    dataStatus === 401 ||
    dataStatus === 403 ||
    message.includes("unauthorized") ||
    message.includes("jwt expired") ||
    message.includes("token expired") ||
    message.includes("invalid token") ||
    message.includes("access token")
  );
};

let refreshPromise: Promise<RefreshResult> | null = null;

const refreshAccessToken = async (api: any): Promise<RefreshResult> => {
  try {
    const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(refreshToken ? { Authorization: `Bearer ${refreshToken}` } : {}),
      },
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
    });

    const data = await res.json().catch(() => ({}));
    const accessToken = getAccessToken(data);
    const nextRefreshToken = getRefreshToken(data) || refreshToken || undefined;

    if (!res.ok) {
      api.dispatch(logout());
      return { ok: false, accessToken: null };
    }

    if (accessToken) {
      const user = api.getState().auth.user;
      api.dispatch(
        setUser({
          user,
          token: accessToken,
          refreshToken: nextRefreshToken,
        }),
      );
      return { ok: true, accessToken };
    }

    // Refresh succeeded via Set-Cookie only
    return { ok: true, accessToken: Cookies.get(ACCESS_TOKEN_COOKIE) || null };
  } catch (error) {
    console.error("Refresh token error:", error);
    api.dispatch(logout());
    return { ok: false, accessToken: null };
  }
};

const withAuthHeader = (args: any, accessToken: string | null) => {
  if (!accessToken) return args;

  if (typeof args === "string") {
    return {
      url: args,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    };
  }

  return {
    ...args,
    headers: {
      ...(args.headers || {}),
      authorization: `Bearer ${accessToken}`,
    },
  };
};

const baseQueryWithRefreshToken = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (isAuthError(result) && !shouldSkipRefresh(args)) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken(api).finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;

    if (refreshed.ok) {
      result = await baseQuery(
        withAuthHeader(args, refreshed.accessToken),
        api,
        extraOptions,
      );
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: tagTypesList,
  endpoints: () => ({}),
});
