"use client";

import PaginationSection from "@/components/shared/PaginationSection";
import UserAvatar from "@/components/shared/UserAvatar";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { cn } from "@/lib/utils";
import { useGetSubscriptionEarningsQuery } from "@/redux/api/earningApi";
import { TSubscriptionEarning } from "@/types";
import DataTable from "@/utils/DataTable";
import { Empty, Skeleton, TableProps } from "antd";
import moment from "moment";
import { useSearchParams } from "next/navigation";

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

const SubscriptionEarningsTable = () => {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);

  const { data, isLoading, isFetching } = useGetSubscriptionEarningsQuery({
    page,
    limit,
  });

  const response = data as
    | {
        data?: TSubscriptionEarning[];
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

  const columns: TableProps<TSubscriptionEarning>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      render: (_text, record) => {
        const fullName =
          record.name ||
          `${record.user?.firstName ?? ""} ${record.user?.lastName ?? ""}`.trim();

        return (
          <div className='flex items-center gap-x-3'>
            <UserAvatar src={record.user?.avatar} name={fullName || "User"} />
            <div>
              <p className='font-medium'>{fullName || "Unknown"}</p>
              <p className='text-xs text-[#93A4B0]'>{record.user?.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      title: "Subscription Type",
      dataIndex: "accountType",
      render: (_text, record) => (
        <p className='capitalize'>
          {record.planName || record.accountType || record.planTier || "-"}
        </p>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (_text, record) => (
        <p>{formatAmount(record.amount ?? record.transactionAmount, record.currency)}</p>
      ),
    },
    {
      title: "Status",
      dataIndex: "paymentStatus",
      render: (_text, record) => {
        const status = record.paymentStatus || record.status || "-";
        return (
          <p
            className={cn(
              "capitalize font-medium",
              status.toLowerCase() === "active" && "text-[#4BB54B]",
              status.toLowerCase() === "expired" && "text-[#FFA36E]",
              status.toLowerCase() === "paid" && "text-[#4BB54B]",
            )}
          >
            {status}
          </p>
        );
      },
    },
    {
      title: "Expire date",
      dataIndex: "expireDate",
      render: (text) => <p>{text ? moment(text).format("LL") : "-"}</p>,
    },
    {
      title: "Purchase date",
      dataIndex: "purchaseDate",
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
        <Empty description='No subscription earnings found' />
      </div>
    );
  }

  return (
    <div className='rounded-2xl'>
      <DataTable
        columns={columns}
        data={rows.map((row) => ({ ...row, id: row.id || row._id }))}
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
    </div>
  );
};

export default SubscriptionEarningsTable;
