import { TAdminProductStatus } from "@/types";
import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminProducts: builder.query({
      query: (params) => ({
        url: "/admin/products",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.products],
    }),
    getAdminProductById: builder.query({
      query: (id: string) => ({
        url: `/admin/products/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: tagTypes.products, id }],
    }),
    deleteAdminProduct: builder.mutation({
      query: (id: string) => ({
        url: `/admin/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.products],
    }),
    updateAdminProductStatus: builder.mutation({
      query: ({
        id,
        status,
      }: {
        id: string;
        status: TAdminProductStatus;
      }) => ({
        url: `/admin/products/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [tagTypes.products],
    }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useGetAdminProductByIdQuery,
  useDeleteAdminProductMutation,
  useUpdateAdminProductStatusMutation,
} = productsApi;
