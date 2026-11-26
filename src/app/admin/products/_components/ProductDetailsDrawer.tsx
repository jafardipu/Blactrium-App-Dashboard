"use client";

import {
  useDeleteAdminProductMutation,
  useGetAdminProductByIdQuery,
  useUpdateAdminProductStatusMutation,
} from "@/redux/api/productsApi";
import { TAdminProduct, TAdminProductStatus } from "@/types";
import { Success_model, cn } from "@/lib/utils";
import { handleApiError } from "@/utils/handleApiError";
import { Button, Drawer, Empty, Image, Popconfirm, Rate, Skeleton } from "antd";
import Link from "next/link";
import { useEffect, useRef } from "react";

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

type ProductDetailsDrawerProps = {
  open: boolean;
  productId: string | null;
  onClose: () => void;
  onChanged: () => void | Promise<unknown>;
};

export default function ProductDetailsDrawer({
  open,
  productId,
  onClose,
  onChanged,
}: ProductDetailsDrawerProps) {
  const { data, isLoading, isFetching, error } = useGetAdminProductByIdQuery(
    productId as string,
    { skip: !open || !productId },
  );
  const [deleteProduct, { isLoading: isDeleting }] =
    useDeleteAdminProductMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateAdminProductStatusMutation();

  const product = data?.data as TAdminProduct | undefined;
  const stats = product?.stats;
  const openOrders = stats?.openOrdersCount || 0;
  const isActive = product?.status === "active";
  const nextStatus: TAdminProductStatus = isActive ? "inactive" : "active";
  const handledMissingRef = useRef<string | null>(null);

  const afterAction = async (message?: string, goBack = false) => {
    Success_model({ title: message || "Action completed successfully" });
    await onChanged();
    if (goBack) onClose();
  };

  const handleMissingProduct = async (actionError: unknown) => {
    handleApiError(actionError);
    await onChanged();
    onClose();
  };

  useEffect(() => {
    if (!open || !productId || !isNotFoundError(error)) {
      if (!open) handledMissingRef.current = null;
      return;
    }
    if (handledMissingRef.current === productId) return;
    handledMissingRef.current = productId;
    void handleMissingProduct(error);
  }, [open, productId, error]);

  const handleStatusUpdate = async () => {
    if (!productId) return;
    try {
      const res = await updateStatus({ id: productId, status: nextStatus }).unwrap();
      await afterAction((res as { message?: string })?.message);
    } catch (actionError) {
      if (isNotFoundError(actionError)) {
        await handleMissingProduct(actionError);
        return;
      }
      handleApiError(actionError);
    }
  };

  const handleDelete = async () => {
    if (!productId) return;
    try {
      const res = await deleteProduct(productId).unwrap();
      await afterAction((res as { message?: string })?.message, true);
    } catch (actionError) {
      if (isNotFoundError(actionError)) {
        await handleMissingProduct(actionError);
        return;
      }
      handleApiError(actionError);
    }
  };

  const ownerName = product?.userId
    ? `${product.userId.firstName ?? ""} ${product.userId.lastName ?? ""}`.trim()
    : "-";

  return (
    <Drawer
      title={<span className='text-white'>Product Details</span>}
      open={open}
      onClose={onClose}
      width={560}
      destroyOnClose
      styles={{
        body: { background: "#111827", color: "#fff" },
        header: { background: "#111827", color: "#fff" },
      }}
    >
      {isLoading || isFetching ? (
        <Skeleton active paragraph={{ rows: 12 }} />
      ) : !product ? (
        <Empty description='Product not found' />
      ) : (
        <div className='space-y-5 text-white'>
          <div className='flex gap-4'>
            {product.productImage ? (
              <Image
                src={product.productImage}
                alt={product.productName}
                width={120}
                height={120}
                className='rounded-xl object-cover !w-[120px] !h-[120px]'
              />
            ) : (
              <div className='size-[120px] rounded-xl bg-[#D1D5DB]' />
            )}
            <div className='space-y-2'>
              <h3 className='text-xl font-semibold'>{product.productName}</h3>
              <p className={cn("capitalize font-medium", statusColor(product.status))}>
                {product.status}
              </p>
              <div className='flex items-center gap-2'>
                <Rate disabled allowHalf value={product.averageRating || 0} className='text-sm' />
                <span className='text-sm text-[#93A4B0]'>
                  ({product.totalReviews || 0} reviews)
                </span>
              </div>
              <p className='font-medium'>
                {formatMoney(
                  product.pricing?.effectivePrice ?? product.priceDetails?.price,
                  product.pricing?.currency || product.priceDetails?.currency,
                )}
              </p>
            </div>
          </div>

          <div>
            <p className='text-[#93A4B0] text-sm mb-1'>Description</p>
            <p className='whitespace-pre-wrap'>
              {product.productDescription || "No description"}
            </p>
          </div>

          <div className='grid grid-cols-2 gap-3 text-sm'>
            <div>
              <p className='text-[#93A4B0]'>Brand</p>
              <p>{product.brand || "-"}</p>
            </div>
            <div>
              <p className='text-[#93A4B0]'>Category</p>
              <p>{product.category?.name || product.productCategory || "-"}</p>
            </div>
            <div>
              <p className='text-[#93A4B0]'>Stock</p>
              <p>{product.stock ?? 0}</p>
            </div>
            <div>
              <p className='text-[#93A4B0]'>Shipping</p>
              <p>
                {formatMoney(
                  product.shippingCost,
                  product.pricing?.currency || product.priceDetails?.currency,
                )}
              </p>
            </div>
            <div>
              <p className='text-[#93A4B0]'>Material</p>
              <p>{product.material || "-"}</p>
            </div>
            <div>
              <p className='text-[#93A4B0]'>Condition</p>
              <p>{product.condition || "-"}</p>
            </div>
            <div>
              <p className='text-[#93A4B0]'>Weight</p>
              <p>{product.weight ?? "-"}</p>
            </div>
            <div>
              <p className='text-[#93A4B0]'>Dimensions</p>
              <p>{product.dimensions || "-"}</p>
            </div>
            <div>
              <p className='text-[#93A4B0]'>Discount</p>
              <p>{product.pricing?.discount ? `${product.pricing.discount}%` : "-"}</p>
            </div>
            <div>
              <p className='text-[#93A4B0]'>Original price</p>
              <p>
                {formatMoney(
                  product.pricing?.originalPrice ?? product.priceDetails?.price,
                  product.pricing?.currency || product.priceDetails?.currency,
                )}
              </p>
            </div>
          </div>

          {product.color?.length ? (
            <div>
              <p className='text-[#93A4B0] text-sm mb-1'>Colors</p>
              <p>{product.color.join(", ")}</p>
            </div>
          ) : null}

          {product.size?.length ? (
            <div>
              <p className='text-[#93A4B0] text-sm mb-1'>Sizes</p>
              <p>{product.size.join(", ")}</p>
            </div>
          ) : null}

          {product.tags?.length ? (
            <div>
              <p className='text-[#93A4B0] text-sm mb-1'>Tags</p>
              <p>{product.tags.join(", ")}</p>
            </div>
          ) : null}

          {product.attributes?.length ? (
            <div>
              <p className='text-[#93A4B0] text-sm mb-2'>Attributes</p>
              <div className='space-y-1'>
                {product.attributes.map((attr, index) => (
                  <div key={`${attr.name}-${index}`} className='flex justify-between gap-3 text-sm'>
                    <span className='text-[#93A4B0]'>{attr.name}</span>
                    <span>{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {product.location ? (
            <div>
              <p className='text-[#93A4B0] text-sm mb-1'>Location</p>
              <p>
                {[
                  ...(product.location.address || []),
                  product.location.city,
                  product.location.state,
                  product.location.country,
                  product.location.zip,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </p>
            </div>
          ) : null}

          <div className='grid grid-cols-1 gap-3'>
            <div className='rounded-xl border border-[#FFFFFF33]/[0.2] p-3'>
              <p className='text-[#93A4B0] text-sm mb-1'>Shop</p>
              <p className='font-medium'>{product.merchantShopId?.shopName || "-"}</p>
            </div>
            <div className='rounded-xl border border-[#FFFFFF33]/[0.2] p-3'>
              <p className='text-[#93A4B0] text-sm mb-1'>Business</p>
              <p className='font-medium'>{product.businessProfileId?.businessName || "-"}</p>
              {product.businessProfileId?.status ? (
                <p className='text-sm text-[#93A4B0] capitalize'>
                  {product.businessProfileId.status}
                </p>
              ) : null}
            </div>
            <div className='rounded-xl border border-[#FFFFFF33]/[0.2] p-3'>
              <p className='text-[#93A4B0] text-sm mb-1'>Owner</p>
              {product.userId?._id ? (
                <Link
                  href={`/admin/users?search=${encodeURIComponent(product.userId.email || "")}`}
                  className='text-[#FCB806] hover:underline'
                >
                  {ownerName || product.userId.email}
                </Link>
              ) : (
                <p>{ownerName}</p>
              )}
              <p className='text-sm text-[#93A4B0]'>{product.userId?.email || "-"}</p>
            </div>
          </div>

          <div>
            <p className='text-[#93A4B0] text-sm mb-2'>Stats</p>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div className='rounded-xl border border-[#FFFFFF33]/[0.2] p-3'>
                <p className='text-[#93A4B0]'>Favorites</p>
                <p className='text-lg font-semibold'>{stats?.favoritesCount ?? 0}</p>
              </div>
              <div className='rounded-xl border border-[#FFFFFF33]/[0.2] p-3'>
                <p className='text-[#93A4B0]'>In carts</p>
                <p className='text-lg font-semibold'>{stats?.inCartsCount ?? 0}</p>
              </div>
              <div className='rounded-xl border border-[#FFFFFF33]/[0.2] p-3'>
                <p className='text-[#93A4B0]'>Orders</p>
                <p className='text-lg font-semibold'>{stats?.ordersCount ?? 0}</p>
              </div>
              <div className='rounded-xl border border-[#FFFFFF33]/[0.2] p-3'>
                <p className='text-[#93A4B0]'>Open orders</p>
                <p className='text-lg font-semibold'>{stats?.openOrdersCount ?? 0}</p>
              </div>
              <div className='rounded-xl border border-[#FFFFFF33]/[0.2] p-3'>
                <p className='text-[#93A4B0]'>Units sold</p>
                <p className='text-lg font-semibold'>{stats?.unitsSold ?? 0}</p>
              </div>
              <div className='rounded-xl border border-[#FFFFFF33]/[0.2] p-3'>
                <p className='text-[#93A4B0]'>Revenue</p>
                <p className='text-lg font-semibold'>
                  {formatMoney(
                    stats?.revenue,
                    product.pricing?.currency || product.priceDetails?.currency,
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <Popconfirm
              title={isActive ? "Deactivate product" : "Activate product"}
              description={
                isActive
                  ? `Hide "${product.productName}" from customers?`
                  : `Make "${product.productName}" visible to customers?`
              }
              onConfirm={handleStatusUpdate}
              okText={isActive ? "Deactivate" : "Activate"}
              cancelText='Cancel'
              disabled={isUpdatingStatus}
            >
              <Button size='large' loading={isUpdatingStatus} block>
                {isActive ? "Deactivate" : "Activate"}
              </Button>
            </Popconfirm>

            <Popconfirm
              title='Delete product'
              description={
                <div className='space-y-2 max-w-xs'>
                  <p>
                    <strong>{product.productName}</strong> will be removed for everyone,
                    taken out of shopping carts, and cannot be undone from the dashboard.
                  </p>
                  {openOrders > 0 ? (
                    <p className='text-[#FFA36E]'>This product has unfinished orders.</p>
                  ) : null}
                </div>
              }
              onConfirm={handleDelete}
              okText='Delete'
              okButtonProps={{ danger: true }}
              cancelText='Cancel'
              disabled={isDeleting}
            >
              <Button danger size='large' loading={isDeleting} block>
                Delete
              </Button>
            </Popconfirm>
          </div>
        </div>
      )}
    </Drawer>
  );
}
