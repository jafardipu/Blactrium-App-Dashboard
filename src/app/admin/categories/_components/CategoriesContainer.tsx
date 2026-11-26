"use client";

import PaginationSection from "@/components/shared/PaginationSection";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { Success_model } from "@/lib/utils";
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/redux/api/categories";
import { useDebounced } from "@/redux/hooks";
import { TCategory } from "@/types";
import DataTable from "@/utils/DataTable";
import { handleApiError } from "@/utils/handleApiError";
import {
  Button,
  Empty,
  Input,
  Modal,
  Skeleton,
  Switch,
  TableProps,
} from "antd";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import EditCategoryModal from "./EditCategoryModal";

type CategoryOverrides = Record<
  string,
  { status?: boolean; isPopular?: boolean }
>;

const getErrorStatus = (error: unknown) =>
  error && typeof error === "object" && "status" in error
    ? (error as { status?: number }).status
    : undefined;

const getErrorMessage = (error: unknown) => {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  return "Something went wrong";
};

function CategoryThumb({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className='size-12 rounded-lg bg-[#D1D5DB]' aria-label={alt} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={48}
      height={48}
      className='size-12 rounded-lg object-cover'
      onError={() => setFailed(true)}
    />
  );
}

export default function CategoriesContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();

  const [overrides, setOverrides] = useState<CategoryOverrides>({});
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<TCategory | null>(null);

  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

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

  const queryParams: Record<string, string | number> = { page, limit };
  if (search) queryParams.search = search;

  const { data, isLoading, isFetching, refetch } =
    useGetCategoriesQuery(queryParams);

  const payload = data?.data as
    | {
        data?: TCategory[];
        meta?: {
          total?: number;
          totalPages?: number;
          links?: { currentPage?: number };
        };
      }
    | undefined;

  const categories = useMemo(() => payload?.data ?? [], [payload?.data]);
  const meta = {
    page: payload?.meta?.links?.currentPage || page,
    limit,
    total: payload?.meta?.total || 0,
  };

  const rows = useMemo(
    () =>
      categories.map((category) => {
        const override = overrides[category._id] || {};
        return {
          ...category,
          id: category._id,
          status:
            override.status !== undefined ? override.status : Boolean(category.status),
          isPopular:
            override.isPopular !== undefined
              ? override.isPopular
              : Boolean(category.isPopular),
        };
      }),
    [categories, overrides],
  );

  const clearOverride = (id: string, field: "status" | "isPopular") => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (!next[id]) return prev;
      const copy = { ...next[id] };
      delete copy[field];
      if (Object.keys(copy).length === 0) delete next[id];
      else next[id] = copy;
      return next;
    });
  };

  const handleToggle = async (
    category: TCategory,
    field: "status" | "isPopular",
    value: boolean,
  ) => {
    const key = `${category._id}:${field}`;
    setOverrides((prev) => ({
      ...prev,
      [category._id]: { ...prev[category._id], [field]: value },
    }));
    setTogglingKey(key);

    try {
      const res = await updateCategory({
        id: category._id,
        [field]: value,
      }).unwrap();
      Success_model({
        title: (res as { message?: string })?.message || "Category updated successfully",
      });
      clearOverride(category._id, field);
    } catch (error) {
      clearOverride(category._id, field);
      handleApiError(error);
    } finally {
      setTogglingKey(null);
    }
  };

  const deactivateCategory = async (category: TCategory) => {
    try {
      const res = await updateCategory({
        id: category._id,
        status: false,
      }).unwrap();
      Success_model({
        title:
          (res as { message?: string })?.message || "Category deactivated successfully",
      });
    } catch (error) {
      handleApiError(error);
    }
  };

  const runDelete = async (category: TCategory) => {
    try {
      const res = await deleteCategory(category._id).unwrap();
      Success_model({
        title: (res as { message?: string })?.message || "Category deleted successfully",
      });
    } catch (error) {
      if (getErrorStatus(error) === 409) {
        Modal.confirm({
          title: "Cannot delete category",
          content: getErrorMessage(error),
          okText: "Deactivate instead",
          cancelText: "Cancel",
          onOk: () => deactivateCategory(category),
        });
        return;
      }
      handleApiError(error);
    }
  };

  const handleDeleteClick = (category: TCategory) => {
    const subCount = category.subCategoryCount ?? 0;
    const businessCount = category.businessCount ?? 0;

    if (businessCount > 0) {
      Modal.confirm({
        title: "Category in use",
        content: `"${category.categoryName}" is used by ${businessCount} business(es). Deletion will be refused. Deactivate instead?`,
        okText: "Deactivate instead",
        cancelText: "Cancel",
        onOk: () => deactivateCategory(category),
      });
      return;
    }

    Modal.confirm({
      title: "Delete category",
      content: `Delete "${category.categoryName}" and its ${subCount} subcategories? This cannot be undone.`,
      okText: "Delete",
      okButtonProps: { danger: true, loading: isDeleting },
      cancelText: "Cancel",
      onOk: () => runDelete(category),
    });
  };

  const columns: TableProps<(typeof rows)[number]>["columns"] = [
    {
      title: "Category",
      dataIndex: "categoryName",
      render: (_text, record) => (
        <button
          type='button'
          className='flex items-center gap-3 text-left'
          onClick={() => router.push(`/admin/categories/${record._id}`)}
        >
          <CategoryThumb src={record.categoryImage} alt={record.categoryName} />
          <span className='font-medium text-white hover:underline'>
            {record.categoryName}
          </span>
        </button>
      ),
    },
    {
      title: "Subcategories",
      dataIndex: "subCategoryCount",
      render: (value) => value ?? 0,
    },
    {
      title: "Businesses",
      dataIndex: "businessCount",
      render: (value) => value ?? 0,
    },
    {
      title: "Popular",
      dataIndex: "isPopular",
      render: (_text, record) => (
        <Switch
          checked={Boolean(record.isPopular)}
          loading={togglingKey === `${record._id}:isPopular`}
          onChange={(checked) => handleToggle(record, "isPopular", checked)}
        />
      ),
    },
    {
      title: "Active",
      dataIndex: "status",
      render: (_text, record) => (
        <Switch
          checked={Boolean(record.status)}
          loading={togglingKey === `${record._id}:status`}
          onChange={(checked) => handleToggle(record, "status", checked)}
        />
      ),
    },
    {
      title: "Actions",
      dataIndex: "action",
      render: (_text, record) => (
        <div className='flex items-center gap-2'>
          <button
            type='button'
            className='p-1.5 rounded-full bg-[#FA86001A]'
            onClick={() => setEditTarget(record)}
            aria-label='Edit category'
          >
            <Pencil size={16} color='#78C0A8' />
          </button>
          <button
            type='button'
            className='p-1.5 rounded-full bg-[#FF48481A]'
            onClick={() => handleDeleteClick(record)}
            aria-label='Delete category'
          >
            <Trash2 size={16} color='#FF4848' />
          </button>
        </div>
      ),
    },
  ];

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

      <div className='border border-[#FFFFFF33]/[0.2] rounded-xl'>
        <div className='px-3 py-3'>
          <h3 className='text-[#93A4B0] text-xl font-semibold'>All Categories</h3>
        </div>

        {isLoading ? (
          <div className='p-4 space-y-3'>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} active avatar paragraph={{ rows: 1 }} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className='py-10'>
            <Empty description='No categories found' />
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={rows} loading={isFetching} pagination={false} />
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

      <EditCategoryModal
        open={Boolean(editTarget)}
        category={editTarget}
        onClose={() => setEditTarget(null)}
        onNotFound={() => {
          void refetch();
        }}
      />
    </div>
  );
}
