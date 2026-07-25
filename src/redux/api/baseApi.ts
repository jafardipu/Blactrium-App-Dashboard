import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, setUser } from "../features/authSlice";
import { tagTypesList } from "../tagTypes";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const otpToken = sessionStorage.getItem("otpToken");
    const forgotPasswordToken = sessionStorage.getItem("forgotPasswordToken");
    const token = (getState() as any).auth.token;

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

const baseQueryWithRefreshToken = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401 || result?.error?.status === 403) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data?.data?.accessToken) {
        const user = api.getState().auth.user;

        api.dispatch(setUser({ user, token: data.data.accessToken }));

        // নতুন token দিয়ে original request retry
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } catch (error) {
      console.error("Refresh token error:", error);
      api.dispatch(logout());
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