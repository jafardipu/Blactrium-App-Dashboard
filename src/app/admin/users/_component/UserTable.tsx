"use client";

import { Empty, Input, Popconfirm, Skeleton, TableProps } from "antd";
import UserDetails from "@/components/(adminDashboard)/user/UserDetails";
import UserAvatar from "@/components/shared/UserAvatar";
import DataTable from "@/utils/DataTable";
import PaginationSection from "@/components/shared/PaginationSection";
import { Eye, Trash2 } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { CgUnblock } from "react-icons/cg";
import { useSearchParams } from "next/navigation";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { useDebounced } from "@/redux/hooks";
import {
  useGetUsersQuery,
  useUpdateUserStatusMutation,
} from "@/redux/api/usersApi";
import { TAdminUser } from "@/types";
import { Success_model, cn } from "@/lib/utils";
import { handleApiError } from "@/utils/handleApiError";

type UserRole = "user" | "business-owner";

type UserTableProps = {
  role: UserRole;
};

const UserTable = ({ role }: UserTableProps) => {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();
  const [updateUserStatus, { isLoading: isUpdatingStatus }] =
    useUpdateUserStatusMutation();

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
    role,
  };

  if (search) {
    queryParams.search = search;
  }

  const { data, isLoading } = useGetUsersQuery(queryParams);

  const response = data as
    | {
        data?:
          | TAdminUser[]
          | {
              data?: TAdminUser[];
              meta?: {
                page?: number;
                limit?: number;
                total?: number;
                totalPages?: number;
                totalPage?: number;
              };
            };
        meta?: {
          page?: number;
          limit?: number;
          total?: number;
          totalPages?: number;
          totalPage?: number;
        };
      }
    | undefined;

  const nested = !Array.isArray(response?.data) ? response?.data : undefined;
  const users = Array.isArray(response?.data) ? response.data : nested?.data ?? [];
  const responseMeta = response?.meta ?? nested?.meta;
  const meta = {
    page: responseMeta?.page || page,
    limit: responseMeta?.limit || limit,
    total: responseMeta?.total || 0,
    totalPage: responseMeta?.totalPages || responseMeta?.totalPage || 1,
  };

  const handleStatusUpdate = async (
    user: TAdminUser,
    status: "blocked" | "deleted" | "active",
  ) => {
    try {
      const id = user.id || user._id;
      await updateUserStatus({ id, status }).unwrap();
      Success_model({
        title:
          status === "blocked"
            ? `${user.firstName} blocked successfully`
            : status === "active"
              ? `${user.firstName} unblocked successfully`
              : `${user.firstName} deleted successfully`,
      });
    } catch (error) {
      handleApiError(error);
    }
  };

  const columns: TableProps<TAdminUser>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      render: (_text, _record, index) => (
        <p>#{(meta.page - 1) * meta.limit + index + 1}</p>
      ),
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
      title: "Join Date",
      dataIndex: "joinDate",
      render: (text) => <p>{moment(text).format("LL")}</p>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: string) => (
        <p
          className={cn(
            "capitalize font-medium",
            text?.toLowerCase() === "active" && "text-[#4BB54B]",
            text?.toLowerCase() === "blocked" && "text-[#FFA36E]",
            text?.toLowerCase() === "deleted" && "text-[#FF4848]",
          )}
        >
          {text}
        </p>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_text, record) => {
        const isBlocked = record.status?.toLowerCase() === "blocked";
        const isDeleted = record.status?.toLowerCase() === "deleted";

        return (
          <div className='flex items-center gap-2'>
            <div className='bg-[#FA86001A] p-1 rounded-full'>
              <Eye
                size={22}
                color='#78C0A8'
                onClick={() => {
                  setSelectedUserId(record.id || record._id);
                  setOpen(true);
                }}
                className='cursor-pointer rounded-full'
              />
            </div>

            {!isDeleted && (
              <Popconfirm
                title={isBlocked ? "Unblock the user" : "Block the user"}
                description={
                  isBlocked
                    ? `Are you sure to unblock ${record.firstName}?`
                    : `Are you sure to block ${record.firstName}?`
                }
                onConfirm={() =>
                  handleStatusUpdate(record, isBlocked ? "active" : "blocked")
                }
                okText='Yes'
                cancelText='No'
                disabled={isUpdatingStatus}
              >
                <div
                  className={cn(
                    "p-1 bg-[#CBE2FF1A] rounded-full",
                    isUpdatingStatus && "opacity-50",
                  )}
                >
                  <CgUnblock
                    size={22}
                    color={isBlocked ? "#4BB54B" : "red"}
                    className='cursor-pointer'
                  />
                </div>
              </Popconfirm>
            )}

            {!isDeleted && (
              <Popconfirm
                title='Delete the user'
                description={`Are you sure to delete ${record.firstName}? This cannot be undone.`}
                onConfirm={() => handleStatusUpdate(record, "deleted")}
                okText='Yes'
                cancelText='No'
                disabled={isUpdatingStatus}
              >
                <div
                  className={cn(
                    "p-1 bg-[#FF48481A] rounded-full",
                    isUpdatingStatus && "opacity-50",
                  )}
                >
                  <Trash2 size={20} color='#FF4848' className='cursor-pointer' />
                </div>
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  const title = role === "business-owner" ? "All Business Owners" : "All users";
  const emptyText =
    role === "business-owner" ? "No business owners found" : "No users found";

  return (
    <div className='border border-[#FFFFFF33]/[0.2] rounded-t-xl'>
      <div className='flex items-center justify-between py-2 px-2 gap-3'>
        <h4 className='text-xl font-semibold text-[#cad1d6]'>{title}</h4>
        <Input.Search
          placeholder='Search here'
          size='large'
          className='max-w-[300px]'
          allowClear
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={(value) => setSearchValue(value)}
        />
      </div>
      <div className='rounded-2xl'>
        {isLoading ? (
          <div className='p-4 space-y-3'>
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} active avatar paragraph={{ rows: 1 }} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className='py-10'>
            <Empty description={emptyText} />
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={users} pagination={false} />
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
        <UserDetails
          open={open}
          setOpen={(value) => {
            setOpen(value);
            if (!value) setSelectedUserId(null);
          }}
          userId={selectedUserId}
        />
      </div>
    </div>
  );
};

export default UserTable;
