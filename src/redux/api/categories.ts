import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (data) => ({
        url: "/admin/category",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.categories],
    }),
    createSubCategory: builder.mutation({
      query: (data) => ({
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
      query: (data) => ({
        url: `/admin/category/${data.id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.categories],
    }),
    updateSubCategory: builder.mutation({
      query: (data) => ({
        url: `/admin/subcategory/${data.id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.categories],
    }),
  }),
});

export const { useCreateCategoryMutation, useCreateSubCategoryMutation, useGetCategoriesQuery, useGetSubCategoriesQuery, useUpdateCategoryMutation, useUpdateSubCategoryMutation } = categoriesApi;
