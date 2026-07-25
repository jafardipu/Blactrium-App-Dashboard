import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const profileApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getProfile: build.query({
            query: () => ({
                url: `/admin/profile`,
                method: "GET",
            }),
            providesTags: [tagTypes.profile],
        }),
        updateProfile: build.mutation({
            query: (data) => ({
                url: `/admin/profile`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: [tagTypes.profile],
        }),
    }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;