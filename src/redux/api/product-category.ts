import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const ProductCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProductCategory: builder.mutation({
      query: (data) => ({
        url: "/admin/product-category",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.productCategories],
    }),
    getProductCategories: builder.query({
      query: (params) => ({
        url: "/product-category",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.productCategories],
    }),
    updateProductCategoryStatus: builder.mutation({
      query: ({ data, id }) => ({
        url: `/admin/product-category/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.productCategories],
    }),
  }),
});

export const {
  useCreateProductCategoryMutation,
  useGetProductCategoriesQuery,
  useUpdateProductCategoryStatusMutation,
} = ProductCategoryApi;
