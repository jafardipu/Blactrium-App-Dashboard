"use client";

import PaginationSection from "@/components/shared/PaginationSection";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { Success_model } from "@/lib/utils";
import {
  useDeleteSubCategoryMutation,
  useGetCategoriesQuery,
  useGetSubCategoriesQuery,
  useUpdateSubCategoryMutation,
} from "@/redux/api/categories";
import { useDebounced } from "@/redux/hooks";
import { TCategory, TSubCategory } from "@/types";
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
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import EditSubCategoryModal from "./EditSubCategoryModal";

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

export default function SubCategoriesContainer() {
  const params = useParams();
  const categoryId = String(params?.id || "");
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();

  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>(
    {},
  );
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<TSubCategory | null>(null);

  const [updateSubCategory] = useUpdateSubCategoryMutation();
  const [deleteSubCategory, { isLoading: isDeleting }] =
    useDeleteSubCategoryMutation();

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

  const queryParams: Record<string, string | number> = {
    page,
    limit,
    category: categoryId,
  };
  if (search) queryParams.search = search;

  const { data, isLoading, isFetching, refetch } = useGetSubCategoriesQuery(
    queryParams,
    { skip: !categoryId },
  );

  const { data: categoriesData } = useGetCategoriesQuery(
    { page: 1, limit: 200 },
    { skip: !categoryId },
  );

  const payload = data?.data as
    | {
        data?: TSubCategory[];
        meta?: {
          total?: number;
          totalPages?: number;
          links?: { currentPage?: number };
        };
      }
    | undefined;

  const subCategories = useMemo(() => payload?.data ?? [], [payload?.data]);
  const meta = {
    page: payload?.meta?.links?.currentPage || page,
    limit,
    total: payload?.meta?.total || 0,
  };

  const parentCategoryName = useMemo(() => {
    const nested = categoriesData?.data as
      | { data?: TCategory[] }
      | TCategory[]
      | undefined;
    const list = Array.isArray(nested) ? nested : nested?.data ?? [];
    const match = list.find((item) => item._id === categoryId);
    return (
      match?.categoryName ||
      subCategories[0]?.categoryId?.categoryName ||
      "Category"
    );
  }, [categoriesData, categoryId, subCategories]);

  const rows = useMemo(
    () =>
      subCategories.map((item) => ({
        ...item,
        id: item._id,
        status:
          statusOverrides[item._id] !== undefined
            ? statusOverrides[item._id]
            : Boolean(item.status),
      })),
    [subCategories, statusOverrides],
  );

  const handleToggle = async (subCategory: TSubCategory, value: boolean) => {
    setStatusOverrides((prev) => ({ ...prev, [subCategory._id]: value }));
    setTogglingId(subCategory._id);

    try {
      const res = await updateSubCategory({
        id: subCategory._id,
        status: value,
      }).unwrap();
      Success_model({
        title:
          (res as { message?: string })?.message ||
          "Sub category updated successfully",
      });
      setStatusOverrides((prev) => {
        const next = { ...prev };
        delete next[subCategory._id];
        return next;
      });
    } catch (error) {
      setStatusOverrides((prev) => {
        const next = { ...prev };
        delete next[subCategory._id];
        return next;
      });
      handleApiError(error);
    } finally {
      setTogglingId(null);
    }
  };

  const deactivateSubCategory = async (subCategory: TSubCategory) => {
    try {
      const res = await updateSubCategory({
        id: subCategory._id,
        status: false,
      }).unwrap();
      Success_model({
        title:
          (res as { message?: string })?.message ||
          "Sub category deactivated successfully",
      });
    } catch (error) {
      handleApiError(error);
    }
  };

  const runDelete = async (subCategory: TSubCategory) => {
    try {
      const res = await deleteSubCategory(subCategory._id).unwrap();
      Success_model({
        title:
          (res as { message?: string })?.message ||
          "Sub category deleted successfully",
      });
    } catch (error) {
      if (getErrorStatus(error) === 409) {
        Modal.confirm({
          title: "Cannot delete sub category",
          content: getErrorMessage(error),
          okText: "Deactivate instead",
          cancelText: "Cancel",
          onOk: () => deactivateSubCategory(subCategory),
        });
        return;
      }
      handleApiError(error);
    }
  };

  const handleDeleteClick = (subCategory: TSubCategory) => {
    Modal.confirm({
      title: "Delete sub category",
      content: `Delete "${subCategory.subCategoryName}"? This cannot be undone.`,
      okText: "Delete",
      okButtonProps: { danger: true, loading: isDeleting },
      cancelText: "Cancel",
      onOk: () => runDelete(subCategory),
    });
  };

  const columns: TableProps<(typeof rows)[number]>["columns"] = [
    {
      title: "Sub Category",
      dataIndex: "subCategoryName",
      render: (text) => <span className='font-medium text-white'>{text}</span>,
    },
    {
      title: "Parent Category",
      dataIndex: "categoryId",
      render: (_text, record) => record.categoryId?.categoryName || parentCategoryName,
    },
    {
      title: "Active",
      dataIndex: "status",
      render: (_text, record) => (
        <Switch
          checked={Boolean(record.status)}
          loading={togglingId === record._id}
          onChange={(checked) => handleToggle(record, checked)}
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
            aria-label='Edit sub category'
          >
            <Pencil size={16} color='#78C0A8' />
          </button>
          <button
            type='button'
            className='p-1.5 rounded-full bg-[#FF48481A]'
            onClick={() => handleDeleteClick(record)}
            aria-label='Delete sub category'
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

      <div className='border border-[#FFFFFF33]/[0.2] rounded-xl'>
        <div className='px-3 py-3'>
          <h3 className='text-[#93A4B0] text-xl font-semibold'>
            {parentCategoryName} Sub Categories
          </h3>
        </div>

        {isLoading ? (
          <div className='p-4 space-y-3'>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} active paragraph={{ rows: 1 }} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className='py-10'>
            <Empty description='No sub categories found' />
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

      <EditSubCategoryModal
        open={Boolean(editTarget)}
        subCategory={editTarget}
        onClose={() => setEditTarget(null)}
        onNotFound={() => {
          void refetch();
        }}
      />
    </div>
  );
}
