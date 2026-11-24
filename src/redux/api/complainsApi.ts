import { TComplainStatus } from "@/types";
import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const complainsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComplains: builder.query({
      query: (params) => ({
        url: "/admin/complains",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.complains],
    }),
    getComplainById: builder.query({
      query: (id: string) => ({
        url: `/admin/complains/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: tagTypes.complains, id }],
    }),
    updateComplain: builder.mutation({
      query: ({
        id,
        ...body
      }: {
        id: string;
        status?: TComplainStatus;
        adminNote?: string;
      }) => ({
        url: `/admin/complains/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.complains],
    }),
    deleteComplain: builder.mutation({
      query: (id: string) => ({
        url: `/admin/complains/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.complains],
    }),
  }),
});

export const {
  useGetComplainsQuery,
  useGetComplainByIdQuery,
  useUpdateComplainMutation,
  useDeleteComplainMutation,
} = complainsApi;
