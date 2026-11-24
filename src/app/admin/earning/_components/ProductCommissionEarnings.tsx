"use client";

import { useGetCommissionEarningsQuery } from "@/redux/api/earningApi";
import { TCommissionEarning } from "@/types";
import DataTable from "@/utils/DataTable";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { Empty, Image, Pagination, Skeleton, TableProps } from "antd";
import moment from "moment";
import { useSearchParams } from "next/navigation";
import { useState } from "react";


const formatAmount = (amount?: number, currency?: string) => {
  const value = Math.round((amount || 0) * 100) / 100;
  const formatted = Number.isInteger(value)
    ? value.toLocaleString("en-US")
    : value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return currency ? `${formatted} ${currency}` : formatted;
};

function ProductImage({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className='size-10 rounded-lg bg-[#D1D5DB]' aria-label={alt} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className='size-10 rounded-lg object-cover'
      onError={() => setFailed(true)}
    />
  );
}

const ProductCommissionEarnings = () => {
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();
  const page = Number(searchParams.get("cPage") || 1);
  const limit = Number(searchParams.get("limit") || 10);

  const { data, isLoading, isFetching } = useGetCommissionEarningsQuery({
    page,
    limit,
  });

  const response = data as
    | {
        data?: TCommissionEarning[];
        meta?: {
          page?: number;
          limit?: number;
          total?: number;
          totalPages?: number;
        };
      }
    | undefined;

  const rows = response?.data ?? [];
  const meta = {
    page: response?.meta?.page || page,
    limit: response?.meta?.limit || limit,
    total: response?.meta?.total || 0,
  };

  const columns: TableProps<TCommissionEarning>["columns"] = [
    {
      title: "Products name",
      dataIndex: "productName",
      render: (_text, record) => (
        <div className='flex items-center gap-x-3'>
          <ProductImage src={record.productImage} alt={record.productName} />
          <div>
            <p className='font-medium'>{record.productName}</p>
            <p className='text-xs text-[#93A4B0]'>
              {[record.user?.firstName, record.user?.lastName].filter(Boolean).join(" ") ||
                record.user?.email ||
                "-"}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (_text, record) => <p>{formatAmount(record.price, record.currency)}</p>,
    },
    {
      title: "Total Sales",
      dataIndex: "totalSales",
      render: (_text, record) => <p>{formatAmount(record.totalSales, record.currency)}</p>,
    },
    {
      title: "Total Earnings",
      dataIndex: "totalEarnings",
      render: (_text, record) => <p>{formatAmount(record.totalEarnings, record.currency)}</p>,
    },
    {
      title: "Orders",
      dataIndex: "orderCount",
      render: (text) => <p>{text ?? 0}</p>,
    },
    {
      title: "Date",
      dataIndex: "transactionDate",
      render: (text) => <p>{text ? moment(text).format("LL") : "-"}</p>,
    },
  ];

  if (isLoading) {
    return (
      <div className='p-4 space-y-3'>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} active avatar paragraph={{ rows: 1 }} />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className='py-10'>
        <Empty description='No commission earnings found' />
      </div>
    );
  }

  return (
    <div className='rounded-2xl'>
      <DataTable
        columns={columns}
        data={rows.map((row) => ({
          ...row,
          id: `${row.id || row.productId}-${row.currency}`,
        }))}
        loading={isFetching}
        pagination={false}
      />
      {meta.total > 0 && (
        <div className='px-2 pb-3 w-fit ml-auto mt-5'>
          <Pagination
            current={meta.page}
            total={meta.total}
            pageSize={meta.limit}
            onChange={(nextPage) => updateParams({ cPage: nextPage.toString() })}
          />
        </div>
      )}
    </div>
  );
};

export default ProductCommissionEarnings;
