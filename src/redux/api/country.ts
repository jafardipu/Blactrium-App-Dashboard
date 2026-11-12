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
      providesTags: [tagTypes.countries],
    }),
    updateCountryStatus: build.mutation({
      query: ({ id, status }: { id: string; status: boolean }) => ({
        url: `/admin/country/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: [tagTypes.countries],
    }),
  }),
});

export const { useGetCountriesQuery, useUpdateCountryStatusMutation } = countryApi;
