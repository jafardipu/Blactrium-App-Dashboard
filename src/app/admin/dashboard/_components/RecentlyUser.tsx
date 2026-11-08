"use client";
import { Empty, Popconfirm, Skeleton, TableProps } from "antd";
import UserDetails from "@/components/(adminDashboard)/user/UserDetails";
import UserAvatar from "@/components/shared/UserAvatar";
import DataTable from "@/utils/DataTable";
import { Eye, Trash2 } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { CgUnblock } from "react-icons/cg";
import { useGetDashboardQuery } from "@/redux/api/dashboardApi";
import { useUpdateUserStatusMutation } from "@/redux/api/usersApi";
import { TDashboardData, TDashboardNewUser } from "@/types";
import { Success_model, cn } from "@/lib/utils";
import { handleApiError } from "@/utils/handleApiError";

const RecentlyUser = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data, isLoading } = useGetDashboardQuery(undefined);
  const [updateUserStatus, { isLoading: isUpdatingStatus }] =
    useUpdateUserStatusMutation();
  const users = (data?.data as TDashboardData | undefined)?.newUsers ?? [];

  const handleStatusUpdate = async (
    user: TDashboardNewUser,
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

  const columns: TableProps<TDashboardNewUser>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      render: (_text, _record, index) => <p>#{index + 1}</p>,
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
            <Eye
              size={22}
              color='#78C0A8'
              onClick={() => {
                setSelectedUserId(record.id || record._id);
                setOpen(true);
              }}
              className='cursor-pointer'
            />

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
                <CgUnblock
                  size={22}
                  color={isBlocked ? "#4BB54B" : "red"}
                  className={cn(
                    "cursor-pointer",
                    isUpdatingStatus && "opacity-50",
                  )}
                />
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
                <Trash2
                  size={20}
                  color='#FF4848'
                  className={cn(
                    "cursor-pointer",
                    isUpdatingStatus && "opacity-50",
                  )}
                />
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className='border border-[#FFFFFF33]/[0.2] rounded-t-xl'>
      <h4 className='text-xl font-semibold text-[#cad1d6] py-2 px-2'>New users</h4>
      <div className='rounded-2xl'>
        {isLoading ? (
          <div className='p-4 space-y-3'>
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} active avatar paragraph={{ rows: 1 }} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className='py-10'>
            <Empty description='No new users found' />
          </div>
        ) : (
          <DataTable columns={columns} data={users} pagination={false} />
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

export default RecentlyUser;
