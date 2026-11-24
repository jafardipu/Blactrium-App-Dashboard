import { TFaqStatus } from "@/types";
import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

export type TFaqWriteBody = {
  question?: string;
  answer?: string;
  status?: TFaqStatus;
  sortOrder?: number;
};

const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFaqs: builder.query({
      query: (params) => ({
        url: "/faq",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.faqs],
    }),
    getAdminFaqs: builder.query({
      query: (params) => ({
        url: "/admin/faq",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.faqs],
    }),
    createFaq: builder.mutation({
      query: (body: {
        question: string;
        answer: string;
        status?: TFaqStatus;
        sortOrder?: number;
      }) => ({
        url: "/admin/faq",
        method: "POST",
        body,
      }),
      invalidatesTags: [tagTypes.faqs],
    }),
    updateFaq: builder.mutation({
      query: ({ id, ...body }: { id: string } & TFaqWriteBody) => ({
        url: `/admin/faq/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.faqs],
    }),
    deleteFaq: builder.mutation({
      query: (id: string) => ({
        url: `/admin/faq/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.faqs],
    }),
  }),
});

export const {
  useGetFaqsQuery,
  useGetAdminFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = faqApi;
