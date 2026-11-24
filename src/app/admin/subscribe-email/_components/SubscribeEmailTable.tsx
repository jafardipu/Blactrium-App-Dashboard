"use client";

import PaginationSection from "@/components/shared/PaginationSection";
import UserAvatar from "@/components/shared/UserAvatar";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { useGetSubscribeEmailsQuery } from "@/redux/api/subscribeEmailApi";
import { useDebounced } from "@/redux/hooks";
import { TSubscribeEmail } from "@/types";
import DataTable from "@/utils/DataTable";
import { cn } from "@/lib/utils";
import { Empty, Input, Skeleton, TableProps } from "antd";
import moment from "moment";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type SubscriberRow = TSubscribeEmail;

const SubscribeEmailTable = () => {
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

  const queryParams: Record<string, string | number> = {
    page,
    limit,
  };

  if (search) {
    queryParams.search = search;
  }

  const { data, isLoading, isFetching } = useGetSubscribeEmailsQuery(queryParams);

  const payload = data?.data as
    | {
        data?: TSubscribeEmail[];
        meta?: {
          page?: number;
          limit?: number;
          total?: number;
          totalPages?: number;
        };
      }
    | undefined;

  const subscribers = payload?.data ?? [];
  const meta = {
    page: payload?.meta?.page || page,
    limit: payload?.meta?.limit || limit,
    total: payload?.meta?.total || 0,
  };

  const columns: TableProps<SubscriberRow>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      render: (_text, _record, index) => <p>#{(meta.page - 1) * meta.limit + index + 1}</p>,
    },
    {
      title: "User",
      dataIndex: "firstName",
      render: (_text, record) => {
        const fullName = `${record.firstName ?? ""} ${record.lastName ?? ""}`.trim();

        return (
          <div className='flex items-center gap-x-3'>
            <UserAvatar src={record.avatar} name={fullName || "User"} />
            <p className='font-bold'>{fullName || "Unknown User"}</p>
          </div>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Subscribed at",
      dataIndex: "subscribedAt",
      render: (text) => <p>{text ? moment(text).format("LL") : "-"}</p>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: string) => (
        <p
          className={cn(
            "capitalize font-medium",
            text?.toLowerCase() === "active" && "text-[#4BB54B]",
            text?.toLowerCase() === "inactive" && "text-[#FFA36E]",
          )}
        >
          {text || "-"}
        </p>
      ),
    },
  ];

  return (
    <div className='space-y-5'>
      <Input.Search
        placeholder='Search here'
        size='large'
        className='max-w-[300px]'
        allowClear
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onSearch={(value) => setSearchValue(value)}
      />
      <div className='border border-[#FFFFFF33]/[0.2] rounded-t-xl'>
        <div className='rounded-2xl'>
          {isLoading ? (
            <div className='p-4 space-y-3'>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} active avatar paragraph={{ rows: 1 }} />
              ))}
            </div>
          ) : subscribers.length === 0 ? (
            <div className='py-10'>
              <Empty description='No subscribers found' />
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={subscribers}
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
      </div>
    </div>
  );
};

export default SubscribeEmailTable;
