import { baseApi } from "./baseApi";

const uploadApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        upload: build.mutation({
            query: (data) => ({
                url: "/admin/image",
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const { useUploadMutation } = uploadApi;