"use client";

import { Button, Input } from "antd";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AllCategories } from "./AllCategories";
import AddCategory from "@/components/modal/AddCategory";
import { useSearchParams } from "next/navigation";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { useGetProductCategoriesQuery } from "@/redux/api/product-category";
import PaginationSection from "@/components/shared/PaginationSection";
import { TMeta, TProductCategory } from "@/types";
import { useDebounced } from "@/redux/hooks";

export default function CategoriesContainer() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 30);
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
    status: true,
  };

  if (search) {
    queryParams.search = search;
  }

  const { data, isLoading } = useGetProductCategoriesQuery(queryParams);

  const payload = data?.data;
  const categories = (
    Array.isArray(payload)
      ? payload
      : Array.isArray((payload as { data?: TProductCategory[] } | undefined)?.data)
        ? (payload as { data: TProductCategory[] }).data
        : []
  ) as TProductCategory[];

  const meta = (
    (data?.meta as TMeta | undefined) ||
    ((payload as { meta?: TMeta } | undefined)?.meta as TMeta | undefined) || {
      page,
      limit,
      total: categories.length,
      totalPage: 1,
    }
  );

  return (
    <div>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5'>
        <Input.Search
          placeholder='Search Category'
          size='large'
          className='max-w-[400px]'
          allowClear
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={(value) => setSearchValue(value)}
        />
        <Button
          onClick={() => setOpen(true)}
          type='primary'
          size='large'
          icon={<Plus />}
          className='bg-gradient-to-t from-[#E6CA6E] to-[#775806]'
        >
          Add Category
        </Button>
      </div>

      <AllCategories categories={categories} isLoading={isLoading} />

      {!isLoading && meta.total > 0 && (
        <PaginationSection
          total={meta.total}
          current={meta.page || page}
          pageSize={meta.limit || limit}
        />
      )}

      <AddCategory open={open} setOpen={setOpen} />
    </div>
  );
}
