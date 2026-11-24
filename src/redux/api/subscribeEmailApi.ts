import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const subscribeEmailApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscribeEmails: builder.query({
      query: (params) => ({
        url: "/admin/subscribers",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.subscribers],
    }),
  }),
});

export const { useGetSubscribeEmailsQuery } = subscribeEmailApi;
