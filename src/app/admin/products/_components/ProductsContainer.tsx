"use client";

import PaginationSection from "@/components/shared/PaginationSection";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { Success_model, cn } from "@/lib/utils";
import {
  useDeleteAdminProductMutation,
  useGetAdminProductsQuery,
  useUpdateAdminProductStatusMutation,
} from "@/redux/api/productsApi";
import { useDebounced } from "@/redux/hooks";
import { TAdminProduct, TAdminProductStatus } from "@/types";
import { handleApiError } from "@/utils/handleApiError";
import DataTable from "@/utils/DataTable";
import {
  Empty,
  Input,
  Popconfirm,
  Rate,
  Select,
  Skeleton,
  TableProps,
  Tabs,
} from "antd";
import { Ban, CheckCircle2, Eye, Trash2 } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductDetailsDrawer from "./ProductDetailsDrawer";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
] as const;

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest" },
  { value: "createdAt:asc", label: "Oldest" },
  { value: "productName:asc", label: "Name A-Z" },
  { value: "productName:desc", label: "Name Z-A" },
  { value: "price:desc", label: "Price high-low" },
  { value: "price:asc", label: "Price low-high" },
  { value: "stock:desc", label: "Stock high-low" },
  { value: "stock:asc", label: "Stock low-high" },
];

const formatMoney = (amount?: number, currency?: string) => {
  const value = Math.round((amount || 0) * 100) / 100;
  const formatted = Number.isInteger(value)
    ? value.toLocaleString("en-US")
    : value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return currency ? `${formatted} ${currency}` : formatted;
};

const statusColor = (status?: string) => {
  const value = status?.toLowerCase();
  if (value === "active") return "text-[#4BB54B]";
  if (value === "inactive") return "text-[#FFA36E]";
  return "text-white";
};

const isNotFoundError = (error: unknown) =>
  Boolean(
    error &&
      typeof error === "object" &&
      "status" in error &&
      (error as { status?: number | string }).status === 404,
  );

function ProductThumb({ src, alt }: { src?: string | null; alt: string }) {
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

export default function ProductsContainer() {
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";
  const statusParam = searchParams.get("status");
  const sortParam = searchParams.get("sort") || "createdAt:desc";

  const activeStatus =
    statusParam === "active" || statusParam === "inactive" ? statusParam : "all";

  const [sortBy, sortOrder] = (sortParam.includes(":")
    ? sortParam
    : "createdAt:desc"
  ).split(":") as [string, "asc" | "desc"];

  const [searchValue, setSearchValue] = useState(search);
  const debouncedSearch = useDebounced({ value: searchValue, delay: 400 });

  const [deleteProduct, { isLoading: isDeleting }] =
    useDeleteAdminProductMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateAdminProductStatusMutation();

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
    sortBy,
    sortOrder,
  };
  if (search) queryParams.search = search;
  if (activeStatus !== "all") queryParams.status = activeStatus;

  const { data, isLoading, isFetching, refetch } =
    useGetAdminProductsQuery(queryParams);

  const response = data as
    | {
        data?: TAdminProduct[];
        meta?: {
          page?: number;
          limit?: number;
          total?: number;
          totalPages?: number;
          statusCounts?: {
            all?: number;
            active?: number;
            inactive?: number;
          };
        };
        message?: string;
      }
    | undefined;

  const products = response?.data ?? [];
  const statusCounts = response?.meta?.statusCounts;
  const meta = {
    page: response?.meta?.page || page,
    limit: response?.meta?.limit || limit,
    total: response?.meta?.total || 0,
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedId(null);
  };

  const afterAction = async (message?: string, close = false) => {
    Success_model({ title: message || "Action completed successfully" });
    await refetch();
    if (close) closeDrawer();
  };

  const handleMissingProduct = async (error: unknown) => {
    handleApiError(error);
    await refetch();
    closeDrawer();
  };

  const handleStatusUpdate = async (
    product: TAdminProduct,
    status: TAdminProductStatus,
  ) => {
    try {
      const res = await updateStatus({ id: product._id, status }).unwrap();
      await afterAction((res as { message?: string })?.message);
    } catch (error) {
      if (isNotFoundError(error)) {
        await handleMissingProduct(error);
        return;
      }
      handleApiError(error);
    }
  };

  const handleDelete = async (product: TAdminProduct) => {
    try {
      const res = await deleteProduct(product._id).unwrap();
      await afterAction(
        (res as { message?: string })?.message,
        selectedId === product._id,
      );
    } catch (error) {
      if (isNotFoundError(error)) {
        await handleMissingProduct(error);
        return;
      }
      handleApiError(error);
    }
  };

  const columns: TableProps<TAdminProduct>["columns"] = [
    {
      title: "Product",
      dataIndex: "productName",
      render: (_text, record) => (
        <div className='flex items-center gap-3'>
          <ProductThumb src={record.productImage} alt={record.productName} />
          <p className='font-medium'>{record.productName}</p>
        </div>
      ),
    },
    {
      title: "Shop",
      dataIndex: "merchantShopId",
      render: (_text, record) => record.merchantShopId?.shopName || "-",
    },
    {
      title: "Owner",
      dataIndex: "userId",
      render: (_text, record) => {
        const name = `${record.userId?.firstName ?? ""} ${record.userId?.lastName ?? ""}`.trim();
        return (
          <div>
            <p className='font-medium'>{name || "-"}</p>
            <p className='text-xs text-[#93A4B0]'>{record.userId?.email || "-"}</p>
          </div>
        );
      },
    },
    {
      title: "Category",
      dataIndex: "category",
      render: (_text, record) => record.category?.name || record.productCategory || "-",
    },
    {
      title: "Price",
      dataIndex: "pricing",
      render: (_text, record) => {
        const currency = record.pricing?.currency || record.priceDetails?.currency;
        const effective = record.pricing?.effectivePrice ?? record.priceDetails?.price;
        const original = record.pricing?.originalPrice;
        const discount = record.pricing?.discount || 0;

        return (
          <div>
            <p className='font-medium'>{formatMoney(effective, currency)}</p>
            {discount > 0 && original != null ? (
              <p className='text-xs text-[#93A4B0]'>
                <span className='line-through mr-1'>{formatMoney(original, currency)}</span>
                <span className='text-[#4BB54B]'>-{discount}%</span>
              </p>
            ) : null}
          </div>
        );
      },
    },
    {
      title: "Stock",
      dataIndex: "stock",
      render: (text) => text ?? 0,
    },
    {
      title: "Rating",
      dataIndex: "averageRating",
      render: (_text, record) => (
        <div className='space-y-1'>
          <Rate disabled allowHalf value={record.averageRating || 0} className='text-xs' />
          <p className='text-xs text-[#93A4B0]'>{record.totalReviews || 0} reviews</p>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: TAdminProductStatus) => (
        <p className={cn("capitalize font-medium", statusColor(text))}>{text}</p>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      render: (text) => (text ? moment(text).format("LL") : "-"),
    },
    {
      title: "Actions",
      dataIndex: "action",
      render: (_text, record) => {
        const isActive = record.status === "active";
        const nextStatus: TAdminProductStatus = isActive ? "inactive" : "active";

        return (
          <div className='flex items-center gap-2'>
            <button
              type='button'
              className='p-1.5 rounded-full bg-[#FA86001A]'
              onClick={() => {
                setSelectedId(record._id);
                setDrawerOpen(true);
              }}
              aria-label='View product'
            >
              <Eye size={16} color='#78C0A8' />
            </button>

            <Popconfirm
              title={isActive ? "Deactivate product" : "Activate product"}
              description={
                isActive
                  ? `Hide "${record.productName}" from customers?`
                  : `Make "${record.productName}" visible to customers?`
              }
              onConfirm={() => handleStatusUpdate(record, nextStatus)}
              okText={isActive ? "Deactivate" : "Activate"}
              cancelText='Cancel'
              disabled={isUpdatingStatus}
            >
              <button
                type='button'
                className='p-1.5 rounded-full bg-[#CBE2FF1A]'
                aria-label={isActive ? "Deactivate product" : "Activate product"}
                disabled={isUpdatingStatus}
              >
                {isActive ? (
                  <Ban size={16} color='#FFA36E' />
                ) : (
                  <CheckCircle2 size={16} color='#4BB54B' />
                )}
              </button>
            </Popconfirm>

            <Popconfirm
              title='Delete product'
              description={
                <span>
                  <strong>{record.productName}</strong> will be removed for everyone,
                  taken out of shopping carts, and cannot be undone from the dashboard.
                </span>
              }
              onConfirm={() => handleDelete(record)}
              okText='Delete'
              okButtonProps={{ danger: true }}
              cancelText='Cancel'
              disabled={isDeleting}
            >
              <button
                type='button'
                className='p-1.5 rounded-full bg-[#FF48481A]'
                aria-label='Delete product'
                disabled={isDeleting}
              >
                <Trash2 size={16} color='#FF4848' />
              </button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div className='space-y-4'>
      <Tabs
        activeKey={activeStatus}
        onChange={(key) =>
          updateParams({
            status: key === "all" ? null : key,
            page: "1",
          })
        }
        items={STATUS_TABS.map((tab) => {
          const count =
            tab.key === "all"
              ? statusCounts?.all
              : statusCounts?.[tab.key as keyof typeof statusCounts];

          return {
            key: tab.key,
            label:
              typeof count === "number" ? `${tab.label} (${count})` : tab.label,
          };
        })}
      />

      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-3'>
        <Input.Search
          placeholder='Search products, shop, brand, or owner'
          size='large'
          className='max-w-[360px]'
          allowClear
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          onSearch={(value) => setSearchValue(value)}
        />

        <Select
          size='large'
          className='min-w-[200px]'
          value={sortParam}
          onChange={(value) =>
            updateParams({
              sort: value,
              page: "1",
            })
          }
          options={SORT_OPTIONS}
        />
      </div>

      <div className='border border-[#FFFFFF33]/[0.2] rounded-xl'>
        {isLoading ? (
          <div className='p-4 space-y-3'>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} active avatar paragraph={{ rows: 1 }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className='py-10'>
            <Empty description='No products found' />
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={products.map((item) => ({ ...item, id: item._id }))}
              loading={isFetching}
              pagination={false}
            />
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

      <ProductDetailsDrawer
        open={drawerOpen}
        productId={selectedId}
        onClose={closeDrawer}
        onChanged={refetch}
      />
    </div>
  );
}
