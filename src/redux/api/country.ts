import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const countryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCountries: build.query({
      query: (params) => ({
        url: `/country`,
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.categories],
    }),
    updateCountryStatus: build.mutation({
      query: ({data, id}) => ({
        url: `/admin/country/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.categories],
    }),
  }),
});

export const { useGetCountriesQuery } = countryApi;
