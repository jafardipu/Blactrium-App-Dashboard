"use client";

import {
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/redux/api/categories";
import { useDebounced } from "@/redux/hooks";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import PaginationSection from "@/components/shared/PaginationSection";
import { Success_model } from "@/lib/utils";
import { handleApiError } from "@/utils/handleApiError";
import { TCategory } from "@/types";
import { Button, Empty, Input, Popconfirm, Skeleton } from "antd";
import { Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function CategoryCardImage({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  if (showFallback) {
    return (
      <div
        className='rounded-2xl w-full h-[220px] bg-[#D1D5DB]'
        aria-label={alt}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={1200}
      className='rounded-2xl w-full h-[220px] object-cover'
      onError={() => setFailed(true)}
    />
  );
}

export default function CategoriesContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();
  const [updateCategory, { isLoading: isDeleting }] = useUpdateCategoryMutation();

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
  };

  if (search) {
    queryParams.search = search;
  }

  const { data, isLoading } = useGetCategoriesQuery(queryParams);
  const payload = data?.data as
    | {
        data?: TCategory[];
        meta?: {
          total?: number;
          totalPages?: number;
          links?: {
            currentPage?: number;
          };
        };
      }
    | undefined;

  const categories = payload?.data ?? [];
  const meta = {
    page: payload?.meta?.links?.currentPage || page,
    limit,
    total: payload?.meta?.total || 0,
    totalPage: payload?.meta?.totalPages || 1,
  };

  const handleDelete = async (category: TCategory) => {
    try {
      await updateCategory({
        id: category._id,
        status: false,
      }).unwrap();
      Success_model({ title: "Category deleted successfully" });
    } catch (error) {
      handleApiError(error);
    }
  };

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
        <Link href='/admin/categories/add-category'>
          <Button
            type='primary'
            size='large'
            icon={<Plus />}
            className='bg-gradient-to-t from-[#E6CA6E] to-[#775806]'
          >
            Add Category
          </Button>
        </Link>
      </div>

      <div className='border border-[#3D3D3D] rounded-xl px-5 py-3 pb-5'>
        <h3 className='text-[#93A4B0] text-xl font-semibold mb-3'>All Categories</h3>

        {isLoading ? (
          <div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton.Node key={index} active style={{ width: "100%", height: 220 }} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className='py-10'>
            <Empty description='No categories found' />
          </div>
        ) : (
          <div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {categories.map((category) => (
              <div
                key={category._id}
                className='flex flex-col items-center gap-3 border border-[#FFFFFF33]/[0.2] rounded-2xl relative cursor-pointer group overflow-hidden'
              >
                <div
                  onClick={() => router.push(`/admin/categories/${category._id}`)}
                  className='w-full'
                >
                  <CategoryCardImage
                    src={category.categoryImage}
                    alt={category.categoryName}
                  />
                  <div className='absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#1f1d1d]/90 to-transparent py-2 px-4 space-y-1 rounded-2xl pointer-events-none'>
                    <h5 className='text-[#F6F6F6] lg:text-xl max-w-[200px] font-medium'>
                      {category.categoryName}
                    </h5>
                    <p className='text-[#CBD5E1] text-lg'>
                      {category.subCategoryCount ?? 0} Sub Categories
                    </p>
                  </div>
                </div>

                <Popconfirm
                  title='Delete category'
                  description={`Are you sure to delete "${category.categoryName}"?`}
                  onConfirm={() => handleDelete(category)}
                  okText='Yes'
                  cancelText='No'
                  disabled={isDeleting}
                >
                  <button
                    type='button'
                    className='absolute top-3 right-3 z-10 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg'
                    aria-label={`Delete ${category.categoryName}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 size={16} />
                  </button>
                </Popconfirm>
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
