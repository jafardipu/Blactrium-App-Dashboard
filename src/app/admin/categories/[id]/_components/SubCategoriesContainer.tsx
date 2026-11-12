"use client";

import PaginationSection from "@/components/shared/PaginationSection";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { useGetSubCategoriesQuery } from "@/redux/api/categories";
import { useDebounced } from "@/redux/hooks";
import { TSubCategory } from "@/types";
import { Button, Empty, Input, Skeleton } from "antd";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SubCategoriesContainer() {
  const params = useParams();
  const categoryId = String(params?.id || "");
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
    status: true,
    category: categoryId,
  };

  if (search) {
    queryParams.search = search;
  }

  const { data, isLoading } = useGetSubCategoriesQuery(queryParams, {
    skip: !categoryId,
  });

  const payload = data?.data as
    | {
        data?: TSubCategory[];
        meta?: {
          total?: number;
          totalPages?: number;
          links?: {
            currentPage?: number;
          };
        };
      }
    | undefined;

  const subCategories = payload?.data ?? [];
  const meta = {
    page: payload?.meta?.links?.currentPage || page,
    limit,
    total: payload?.meta?.total || 0,
    totalPage: payload?.meta?.totalPages || 1,
  };

  const categoryName =
    subCategories[0]?.categoryId?.categoryName || "Category";

  return (
    <div>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5'>
        <Input.Search
          placeholder='Search Sub Category'
          size='large'
          className='max-w-[400px]'
          allowClear
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={(value) => setSearchValue(value)}
        />
        <Link href={`/admin/categories/${categoryId}/add-sub-category`}>
          <Button
            type='primary'
            size='large'
            icon={<Plus />}
            className='bg-gradient-to-t from-[#E6CA6E] to-[#775806]'
          >
            Add Sub Category
          </Button>
        </Link>
      </div>

      <div className='border border-[#3D3D3D] rounded-xl px-5 py-3 pb-5'>
        <h3 className='text-[#93A4B0] text-xl font-semibold mb-3'>
          {categoryName} Sub Categories
        </h3>

        {isLoading ? (
          <div className='space-y-4'>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton.Input
                key={index}
                active
                block
                style={{ height: 72 }}
              />
            ))}
          </div>
        ) : subCategories.length === 0 ? (
          <div className='py-10'>
            <Empty description='No sub categories found' />
          </div>
        ) : (
          <div className='space-y-4'>
            {subCategories.map((subCategory) => (
              <div
                key={subCategory._id}
                className='border border-[#FFFFFF33]/[0.2] p-3 rounded-xl'
              >
                <h4 className='text-xl text-white font-semibold'>
                  {subCategory.subCategoryName}
                </h4>
                <p className='text-[#CBD5E1]'>
                  Discover {subCategory.subCategoryName} near you
                </p>
              </div>
            ))}
          </div>
        )}

        {!isLoading && meta.total > 0 && (
          <PaginationSection
            total={meta.total}
            current={meta.page}
            pageSize={meta.limit}
          />
        )}
      </div>
    </div>
  );
}
