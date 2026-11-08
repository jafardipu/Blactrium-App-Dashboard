import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, setUser } from "../features/authSlice";
import { tagTypesList } from "../tagTypes";
import Cookies from "js-cookie";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/utils/authCookies";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const otpToken = sessionStorage.getItem("otpToken");
    const forgotPasswordToken = sessionStorage.getItem("forgotPasswordToken");
    const token =
      (getState() as any).auth.token || Cookies.get(ACCESS_TOKEN_COOKIE);

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

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (api: any): Promise<string | null> => {
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

    const data = await res.json();
    const accessToken = getAccessToken(data);
    const nextRefreshToken = getRefreshToken(data) || refreshToken || undefined;

    if (!res.ok || !accessToken) {
      api.dispatch(logout());
      return null;
    }

    const user = api.getState().auth.user;
    api.dispatch(
      setUser({
        user,
        token: accessToken,
        refreshToken: nextRefreshToken,
      }),
    );

    return accessToken;
  } catch (error) {
    console.error("Refresh token error:", error);
    api.dispatch(logout());
    return null;
  }
};

const baseQueryWithRefreshToken = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (
    (result?.error?.status === 401 || result?.error?.status === 403) &&
    !shouldSkipRefresh(args)
  ) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken(api).finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;

    if (newToken) {
      result = await baseQuery(args, api, extraOptions);
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
