import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (data: { categoryName: string; categoryImage: string }) => ({
        url: "/admin/category",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.categories],
    }),
    createSubCategory: builder.mutation({
      query: (data: { subCategoryName: string; categoryId: string }) => ({
        url: "/admin/subcategory",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.categories],
    }),
    getCategories: builder.query({
      query: (params) => ({
        url: "/category",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.categories],
    }),
    getSubCategories: builder.query({
      query: (params) => ({
        url: "/subcategory",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.categories],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...body }: { id: string; status?: boolean; categoryName?: string; categoryImage?: string }) => ({
        url: `/admin/category/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.categories],
    }),
    updateSubCategory: builder.mutation({
      query: ({ id, ...body }: { id: string; [key: string]: unknown }) => ({
        url: `/admin/subcategory/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.categories],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useCreateSubCategoryMutation,
  useGetCategoriesQuery,
  useGetSubCategoriesQuery,
  useUpdateCategoryMutation,
  useUpdateSubCategoryMutation,
} = categoriesApi;
