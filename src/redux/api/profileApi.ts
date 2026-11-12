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
            query: (data: {
                firstName: string;
                lastName: string;
                phone?: string;
                profileAvatar?: string;
                country?: string;
                interest?: string[];
            }) => ({
                url: `/admin/profile`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: [tagTypes.profile],
        }),
    }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;