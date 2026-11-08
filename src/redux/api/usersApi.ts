import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => ({
        url: "/admin/users",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.users],
    }),
    getUserById: builder.query({
      query: (id: string) => ({
        url: `/admin/users/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.user],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, status }: { id: string; status: "blocked" | "deleted" | "active" }) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [tagTypes.users, tagTypes.user, tagTypes.dashboard],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
} = usersApi;
