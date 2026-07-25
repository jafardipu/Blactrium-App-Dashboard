import { baseApi } from "./baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: "/admin/auth/login",
        method: "POST",
        body: data,
      }),
    }),
    forgetPass: builder.mutation({
      query: (data) => ({
        url: "/auth/recover/find",
        method: "POST",
        body: data,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/recover/verify",
        method: "POST",
        body: data,
      }),
    }),
    resendOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/recover/resend",
        method: "POST",
        body: data,
      }),
    }),
    reSetPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/recover/reset",
        method: "POST",
        body: data,
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/admin/profile/password",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useForgetPassMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useReSetPasswordMutation,
  useChangePasswordMutation,
} = authApi;
