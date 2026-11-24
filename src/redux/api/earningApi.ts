import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const earningApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEarningStats: builder.query({
      query: () => ({
        url: "/admin/earning/stats",
        method: "GET",
      }),
      providesTags: [tagTypes.earnings],
    }),
    getSubscriptionEarnings: builder.query({
      query: (params) => ({
        url: "/admin/earning/subscriptions",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.earnings],
    }),
    getCommissionEarnings: builder.query({
      query: (params) => ({
        url: "/admin/earning/commissions",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.earnings],
    }),
  }),
});

export const {
  useGetEarningStatsQuery,
  useGetSubscriptionEarningsQuery,
  useGetCommissionEarningsQuery,
} = earningApi;
