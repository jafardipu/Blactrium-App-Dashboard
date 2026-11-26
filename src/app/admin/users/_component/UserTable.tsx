"use client";

import { Empty, Input, Popconfirm, Select, Skeleton, TableProps } from "antd";
import UserDetails from "@/components/(adminDashboard)/user/UserDetails";
import UserAvatar from "@/components/shared/UserAvatar";
import CopyableId from "@/components/shared/CopyableId";
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
  useDeleteUserMutation,
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

const SUBSCRIPTION_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "trial", label: "Trial" },
  { value: "expired", label: "Expired (deactivated)" },
  { value: "cancelled", label: "Cancelled" },
  { value: "billing_issue", label: "Billing issue" },
  { value: "none", label: "No subscription" },
] as const;

const formatSubscriptionLabel = (status?: string | null) => {
  if (!status) return null;
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatSubscriptionDate = (value?: string | null) =>
  value ? moment(value).format("D MMM YYYY") : null;

function SubscriptionCell({ user }: { user: TAdminUser }) {
  const isDeactivated = user.deactivationReason === "subscription_expired";
  const status = user.subscriptionStatus;
  const expiresAt = formatSubscriptionDate(user.subscriptionExpiresAt);
  const deactivatedAt = formatSubscriptionDate(user.deactivatedAt);

  if (isDeactivated) {
    return (
      <div className='space-y-0.5'>
        <p className='font-semibold text-[#FF4848]'>
          Deactivated - subscription expired
        </p>
        {deactivatedAt ? (
          <p className='text-xs text-[#93A4B0]'>Expired on {deactivatedAt}</p>
        ) : null}
      </div>
    );
  }

  if (!status) {
    return <span className='text-[#93A4B0]'>—</span>;
  }

  const label = formatSubscriptionLabel(status);
  const isExpired = status === "expired";
  const dateLine = expiresAt
    ? isExpired
      ? `Expired on ${expiresAt}`
      : `Ends on ${expiresAt}`
    : null;

  return (
    <div className='space-y-0.5'>
      <p className='font-semibold text-white'>
        {label}
        {user.planTier ? (
          <span className='font-normal text-[#93A4B0]'> · {user.planTier}</span>
        ) : null}
      </p>
      {dateLine ? <p className='text-xs text-[#93A4B0]'>{dateLine}</p> : null}
    </div>
  );
}

const UserTable = ({ role }: UserTableProps) => {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();
  const [updateUserStatus, { isLoading: isUpdatingStatus }] =
    useUpdateUserStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";
  const subscriptionStatusParam = searchParams.get("subscriptionStatus") || "all";
  const [searchValue, setSearchValue] = useState(search);
  const debouncedSearch = useDebounced({ value: searchValue, delay: 400 });

  const subscriptionStatus = SUBSCRIPTION_FILTERS.some(
    (item) => item.value === subscriptionStatusParam,
  )
    ? subscriptionStatusParam
    : "all";

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

  if (subscriptionStatus !== "all") {
    queryParams.subscriptionStatus = subscriptionStatus;
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
    status: "blocked" | "active",
  ) => {
    try {
      const id = user.id || user._id;
      await updateUserStatus({ id, status }).unwrap();
      Success_model({
        title:
          status === "blocked"
            ? `${user.firstName} blocked successfully`
            : `${user.firstName} unblocked successfully`,
      });
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeleteUser = async (user: TAdminUser) => {
    try {
      const id = user.id || user._id;
      await deleteUser(id).unwrap();
      Success_model({ title: `${user.firstName} deleted successfully` });
    } catch (error) {
      handleApiError(error);
    }
  };

  const columns: TableProps<TAdminUser>["columns"] = [
    {
      title: "ID",
      dataIndex: "_id",
      render: (_text, record) => (
        <CopyableId id={record._id || record.id} previewLast={4} />
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
      render: (text) => <p>{text ? moment(text).format("LL") : "-"}</p>,
    },
    {
      title: "Subscription",
      dataIndex: "subscriptionStatus",
      render: (_text, record) => <SubscriptionCell user={record} />,
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
                onConfirm={() => handleDeleteUser(record)}
                okText='Yes'
                cancelText='No'
                disabled={isDeleting}
              >
                <div
                  className={cn(
                    "p-1 bg-[#FF48481A] rounded-full",
                    isDeleting && "opacity-50",
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
      <div className='flex flex-col lg:flex-row lg:items-center justify-between py-2 px-2 gap-3'>
        <h4 className='text-xl font-semibold text-[#cad1d6]'>{title}</h4>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
          <Select
            size='large'
            className='min-w-[220px]'
            value={subscriptionStatus}
            onChange={(value) =>
              updateParams({
                subscriptionStatus: value === "all" ? null : value,
                page: "1",
              })
            }
            options={SUBSCRIPTION_FILTERS.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            placeholder='Subscription'
          />
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
