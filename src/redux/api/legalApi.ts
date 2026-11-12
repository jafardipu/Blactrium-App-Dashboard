import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";
import { TLegalContentType } from "@/types";

const legalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLegal: builder.query({
      query: (contentType: TLegalContentType) => ({
        url: "/legal",
        method: "GET",
        params: { contentType },
      }),
      providesTags: (_result, _error, contentType) => [
        { type: tagTypes.legal, id: contentType },
      ],
    }),
    updateLegal: builder.mutation({
      query: ({ id, content }: { id: string; content: string }) => ({
        url: `/admin/legal/${id}`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: [tagTypes.legal],
    }),
  }),
});

export const { useGetLegalQuery, useUpdateLegalMutation } = legalApi;
