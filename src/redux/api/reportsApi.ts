import { TReportStatus } from "@/types";
import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query({
      query: (params) => ({
        url: "/admin/reports",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.reports],
    }),
    getPendingReportsCount: builder.query({
      query: () => ({
        url: "/admin/reports",
        method: "GET",
        params: { status: "pending", limit: 1, page: 1 },
      }),
      providesTags: [tagTypes.reports],
    }),
    getReportById: builder.query({
      query: (id: string) => ({
        url: `/admin/reports/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: tagTypes.reports, id }],
    }),
    updateReportStatus: builder.mutation({
      query: ({
        id,
        status,
        adminNote,
      }: {
        id: string;
        status: TReportStatus;
        adminNote?: string;
      }) => ({
        url: `/admin/reports/${id}/status`,
        method: "PATCH",
        body: {
          status,
          ...(adminNote?.trim() ? { adminNote: adminNote.trim() } : {}),
        },
      }),
      invalidatesTags: [tagTypes.reports],
    }),
    removeReportedReview: builder.mutation({
      query: ({ id, adminNote }: { id: string; adminNote?: string }) => ({
        url: `/admin/reports/${id}/remove-review`,
        method: "POST",
        body: {
          ...(adminNote?.trim() ? { adminNote: adminNote.trim() } : {}),
        },
      }),
      invalidatesTags: [tagTypes.reports],
    }),
    deleteReport: builder.mutation({
      query: (id: string) => ({
        url: `/admin/reports/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.reports],
    }),
  }),
});

export const {
  useGetReportsQuery,
  useGetPendingReportsCountQuery,
  useGetReportByIdQuery,
  useUpdateReportStatusMutation,
  useRemoveReportedReviewMutation,
  useDeleteReportMutation,
} = reportsApi;
