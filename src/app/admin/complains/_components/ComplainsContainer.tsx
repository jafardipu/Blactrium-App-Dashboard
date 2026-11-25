"use client";

import PaginationSection from "@/components/shared/PaginationSection";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { Success_model, cn } from "@/lib/utils";
import {
  useDeleteComplainMutation,
  useGetComplainByIdQuery,
  useGetComplainsQuery,
  useUpdateComplainMutation,
} from "@/redux/api/complainsApi";
import { useDebounced } from "@/redux/hooks";
import { TComplain, TComplainStatus, TComplainType } from "@/types";
import { handleApiError } from "@/utils/handleApiError";
import DataTable from "@/utils/DataTable";
import {
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  Popconfirm,
  Select,
  Skeleton,
  TableProps,
  Tabs,
} from "antd";
import { Eye, Trash2 } from "lucide-react";
import moment from "moment";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const TYPE_TABS = [
  { key: "all", label: "All" },
  { key: "product", label: "Products" },
  { key: "profile", label: "Profiles" },
  { key: "event", label: "Events" },
] as const;

const STATUS_OPTIONS: Array<{ value: TComplainStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

const statusColor = (status?: string) => {
  const value = status?.toLowerCase();
  if (value === "pending") return "text-[#FCB806]";
  if (value === "reviewed") return "text-[#78C0A8]";
  if (value === "resolved") return "text-[#4BB54B]";
  if (value === "dismissed") return "text-[#FFA36E]";
  return "text-white";
};

const getReporterName = (complain?: TComplain | null) => {
  if (!complain) return "-";
  if (complain.userId) {
    return `${complain.userId.firstName ?? ""} ${complain.userId.lastName ?? ""}`.trim() || "-";
  }
  return complain.name || "-";
};

type UpdateFormValues = {
  status: TComplainStatus;
  adminNote?: string;
};

export default function ComplainsContainer() {
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();
  const [form] = Form.useForm<UpdateFormValues>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";
  const typeParam = searchParams.get("type");
  const statusParam = searchParams.get("status");
  const activeType =
    typeParam === "product" || typeParam === "profile" || typeParam === "event"
      ? typeParam
      : "all";
  const activeStatus =
    statusParam === "pending" ||
    statusParam === "reviewed" ||
    statusParam === "resolved" ||
    statusParam === "dismissed"
      ? statusParam
      : "all";

  const [searchValue, setSearchValue] = useState(search);
  const debouncedSearch = useDebounced({ value: searchValue, delay: 400 });

  const [updateComplain, { isLoading: isUpdating }] = useUpdateComplainMutation();
  const [deleteComplain, { isLoading: isDeleting }] = useDeleteComplainMutation();

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
  if (activeType !== "all") queryParams.type = activeType;
  if (activeStatus !== "all") queryParams.status = activeStatus;

  const { data, isLoading, isFetching } = useGetComplainsQuery(queryParams);
  const {
    data: detailData,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
  } = useGetComplainByIdQuery(selectedId as string, {
    skip: !selectedId,
  });

  const response = data as
    | {
        data?: TComplain[];
        meta?: {
          page?: number;
          limit?: number;
          total?: number;
          totalPages?: number;
        };
      }
    | undefined;

  const complains = response?.data ?? [];
  const meta = {
    page: response?.meta?.page || page,
    limit: response?.meta?.limit || limit,
    total: response?.meta?.total || 0,
  };

  const selectedComplain = (detailData?.data as TComplain | undefined) || null;

  useEffect(() => {
    if (!selectedComplain) return;
    form.setFieldsValue({
      status: selectedComplain.status,
      adminNote: selectedComplain.adminNote || "",
    });
  }, [selectedComplain, form]);

  const openDetail = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

  const closeDetail = () => {
    setDrawerOpen(false);
    setSelectedId(null);
    form.resetFields();
  };

  const handleUpdate = async (values: UpdateFormValues) => {
    if (!selectedId) return;
    try {
      await updateComplain({
        id: selectedId,
        status: values.status,
        adminNote: values.adminNote?.trim() || undefined,
      }).unwrap();
      Success_model({ title: "Complaint updated successfully" });
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComplain(id).unwrap();
      Success_model({ title: "Complaint deleted successfully" });
      if (selectedId === id) closeDetail();
    } catch (error) {
      handleApiError(error);
    }
  };

  const columns: TableProps<TComplain>["columns"] = [
    {
      title: "Subject",
      dataIndex: "subject",
      render: (text) => <p className='max-w-[220px] font-medium'>{text || "-"}</p>,
    },
    {
      title: "Name / Email",
      dataIndex: "name",
      render: (_text, record) => (
        <div>
          <p className='font-medium'>{getReporterName(record)}</p>
          <p className='text-xs text-[#93A4B0]'>{record.email || record.userId?.email || "-"}</p>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      render: (text: TComplainType) => <p className='capitalize'>{text}</p>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: TComplainStatus) => (
        <p className={cn("capitalize font-medium", statusColor(text))}>{text}</p>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (text) => <p>{text ? moment(text).format("LLL") : "-"}</p>,
    },
    {
      title: "Reporter",
      dataIndex: "userId",
      render: (_text, record) => (
        <p className='text-xs break-all'>{record.userId?._id || "-"}</p>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_text, record) => (
        <div className='flex items-center gap-2'>
          <button
            type='button'
            className='p-1.5 rounded-full bg-[#FA86001A]'
            onClick={() => openDetail(record._id)}
            aria-label='View complaint'
          >
            <Eye size={16} color='#78C0A8' />
          </button>
          <Popconfirm
            title='Delete complaint'
            description='Are you sure you want to delete this complaint?'
            onConfirm={() => handleDelete(record._id)}
            okText='Yes'
            cancelText='No'
            disabled={isDeleting}
          >
            <button
              type='button'
              className='p-1.5 rounded-full bg-[#FF48481A]'
              aria-label='Delete complaint'
            >
              <Trash2 size={16} color='#FF4848' />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className='space-y-4'>
      <Tabs
        activeKey={activeType}
        onChange={(key) =>
          updateParams({
            type: key === "all" ? null : key,
            page: "1",
          })
        }
        items={TYPE_TABS.map((tab) => ({
          key: tab.key,
          label: tab.label,
        }))}
      />

      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-3'>
        <div className='flex flex-wrap gap-2'>
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type='button'
              onClick={() =>
                updateParams({
                  status: option.value === "all" ? null : option.value,
                  page: "1",
                })
              }
              className={cn(
                "rounded-full px-4 py-1.5 text-sm border transition-colors",
                activeStatus === option.value
                  ? "bg-[#FCB806] text-black border-[#FCB806]"
                  : "border-[#FFFFFF33] text-[#CBD5E1] hover:border-[#FCB806]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <Input.Search
          placeholder='Search complaints'
          size='large'
          className='max-w-[320px]'
          allowClear
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          onSearch={(value) => setSearchValue(value)}
        />
      </div>

      <div className='border border-[#FFFFFF33]/[0.2] rounded-xl'>
        {isLoading ? (
          <div className='p-4 space-y-3'>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} active paragraph={{ rows: 1 }} />
            ))}
          </div>
        ) : complains.length === 0 ? (
          <div className='py-10'>
            <Empty description='No complaints found' />
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={complains.map((item) => ({ ...item, id: item._id }))}
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

      <Drawer
        title={<span className='text-white'>Complaint Details</span>}
        open={drawerOpen}
        onClose={closeDetail}
        width={480}
        destroyOnClose
        styles={{
          body: { background: "#111827", color: "#fff" },
          header: { background: "#111827", color: "#fff" },
        }}
      >
        {isDetailLoading || isDetailFetching ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : !selectedComplain ? (
          <Empty description='Complaint not found' />
        ) : (
          <div className='space-y-5 text-white'>
            <div className='space-y-2'>
              <p className='text-sm text-[#93A4B0]'>Subject</p>
              <p className='text-lg font-medium'>{selectedComplain.subject || "-"}</p>
            </div>

            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <p className='text-[#93A4B0]'>Type</p>
                <p className='capitalize'>{selectedComplain.type}</p>
              </div>
              <div>
                <p className='text-[#93A4B0]'>Status</p>
                <p className={cn("capitalize font-medium", statusColor(selectedComplain.status))}>
                  {selectedComplain.status}
                </p>
              </div>
              <div>
                <p className='text-[#93A4B0]'>Name</p>
                <p>{getReporterName(selectedComplain)}</p>
              </div>
              <div>
                <p className='text-[#93A4B0]'>Email</p>
                <p>{selectedComplain.email || selectedComplain.userId?.email || "-"}</p>
              </div>
              <div>
                <p className='text-[#93A4B0]'>Phone</p>
                <p>{selectedComplain.phone || selectedComplain.userId?.phone || "-"}</p>
              </div>
              <div>
                <p className='text-[#93A4B0]'>Created</p>
                <p>
                  {selectedComplain.createdAt
                    ? moment(selectedComplain.createdAt).format("LLL")
                    : "-"}
                </p>
              </div>
              <div className='col-span-2'>
                <p className='text-[#93A4B0]'>Reporter ID</p>
                <p className='break-all'>{selectedComplain.userId?._id || "-"}</p>
              </div>
              {selectedComplain.targetId ? (
                <div className='col-span-2'>
                  <p className='text-[#93A4B0]'>Target ID</p>
                  <p className='break-all'>{selectedComplain.targetId}</p>
                </div>
              ) : null}
            </div>

            <div>
              <p className='text-sm text-[#93A4B0] mb-1'>Message</p>
              <div className='rounded-xl border border-[#FFFFFF33]/[0.2] p-3 whitespace-pre-wrap'>
                {selectedComplain.message}
              </div>
            </div>

            <Form form={form} layout='vertical' onFinish={handleUpdate}>
              <Form.Item
                label={<span className='text-white'>Status</span>}
                name='status'
                rules={[{ required: true, message: "Status is required" }]}
              >
                <Select
                  size='large'
                  options={STATUS_OPTIONS.filter((item) => item.value !== "all")}
                />
              </Form.Item>
              <Form.Item label={<span className='text-white'>Admin note</span>} name='adminNote'>
                <Input.TextArea rows={4} placeholder='Optional admin note' />
              </Form.Item>
              <div className='flex gap-2'>
                <Button
                  htmlType='submit'
                  type='primary'
                  size='large'
                  loading={isUpdating}
                  className='flex-1 bg-[#FCB806]'
                >
                  Save changes
                </Button>
                <Popconfirm
                  title='Delete complaint'
                  description='Are you sure you want to delete this complaint?'
                  onConfirm={() => handleDelete(selectedComplain._id)}
                  okText='Yes'
                  cancelText='No'
                  disabled={isDeleting}
                >
                  <Button danger size='large' loading={isDeleting}>
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            </Form>
          </div>
        )}
      </Drawer>
    </div>
  );
}
