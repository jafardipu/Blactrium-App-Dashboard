import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

type UpdateCategoryBody = {
  id: string;
  categoryName?: string;
  categoryImage?: string;
  status?: boolean;
  isPopular?: boolean;
};

type UpdateSubCategoryBody = {
  id: string;
  subCategoryName?: string;
  status?: boolean;
  categoryId?: string;
};

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
      query: ({ id, ...body }: UpdateCategoryBody) => ({
        url: `/admin/category/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.categories],
    }),
    updateSubCategory: builder.mutation({
      query: ({ id, ...body }: UpdateSubCategoryBody) => ({
        url: `/admin/subcategory/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.categories],
    }),
    deleteCategory: builder.mutation({
      query: (id: string) => ({
        url: `/admin/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.categories],
    }),
    deleteSubCategory: builder.mutation({
      query: (id: string) => ({
        url: `/admin/subcategory/${id}`,
        method: "DELETE",
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
  useDeleteCategoryMutation,
  useDeleteSubCategoryMutation,
} = categoriesApi;
