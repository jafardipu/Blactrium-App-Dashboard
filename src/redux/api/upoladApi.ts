import { baseApi } from "./baseApi";

const uploadApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    upload: build.mutation({
      query: (data: FormData) => ({
        url: "/image",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useUploadMutation } = uploadApi;
