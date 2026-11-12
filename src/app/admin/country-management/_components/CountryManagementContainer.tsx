"use client";

import PaginationSection from "@/components/shared/PaginationSection";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { useGetCountriesQuery } from "@/redux/api/country";
import { useDebounced } from "@/redux/hooks";
import { TCountry } from "@/types";
import { Empty, Input, Skeleton } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CountryManagementTable from "./CountryManagementTable";

export default function CountryManagementContainer() {
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";
  const [searchValue, setSearchValue] = useState(search);
  const debouncedSearch = useDebounced({ value: searchValue, delay: 400 });

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  useEffect(() => {
    const nextSearch = String(debouncedSearch).trim();
    if (nextSearch === search) return;

    updateParams({
      search: nextSearch || null,
      page: "1",
    });
  }, [debouncedSearch, search, updateParams]);

  const queryParams: Record<string, string | number | boolean> = {
    page,
    limit,
  };

  if (search) {
    queryParams.search = search;
  }

  const { data, isLoading, isFetching } = useGetCountriesQuery(queryParams);

  const payload = data?.data as
    | {
        data?: TCountry[];
        meta?: {
          total?: number;
          totalPages?: number;
          links?: {
            currentPage?: number;
          };
        };
      }
    | undefined;

  const countries = payload?.data ?? [];
  const meta = {
    page: payload?.meta?.links?.currentPage || page,
    limit,
    total: payload?.meta?.total || 0,
  };

  return (
    <div className='space-y-5'>
      <Input.Search
        placeholder='Search country'
        size='large'
        className='max-w-[400px]'
        allowClear
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onSearch={(value) => setSearchValue(value)}
      />

      <div className='border border-[#FFFFFF33]/[0.2] rounded-xl'>
        {isLoading ? (
          <div className='p-4 space-y-3'>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} active avatar paragraph={{ rows: 1 }} />
            ))}
          </div>
        ) : countries.length === 0 ? (
          <div className='py-10'>
            <Empty description='No countries found' />
          </div>
        ) : (
          <>
            <CountryManagementTable countries={countries} loading={isFetching} />
            {meta.total > 0 && (
              <div className='px-2 pb-3'>
                <PaginationSection
                  total={meta.total}
                  current={meta.page}
                  pageSize={meta.limit}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
