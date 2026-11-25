"use client";

import PaginationSection from "@/components/shared/PaginationSection";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { Success_model, cn } from "@/lib/utils";
import {
  useDeleteReportMutation,
  useGetReportByIdQuery,
  useGetReportsQuery,
  useRemoveReportedReviewMutation,
  useUpdateReportStatusMutation,
} from "@/redux/api/reportsApi";
import { useDebounced } from "@/redux/hooks";
import {
  TReport,
  TReportItemType,
  TReportPerson,
  TReportStatus,
} from "@/types";
import { handleApiError } from "@/utils/handleApiError";
import DataTable from "@/utils/DataTable";
import {
  Button,
  Drawer,
  Empty,
  Form,
  Image,
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
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const ITEM_TYPE_TABS = [
  { key: "all", label: "All" },
  { key: "product", label: "Product" },
  { key: "business", label: "Business" },
  { key: "business-profile", label: "Business Profile" },
] as const;

const STATUS_OPTIONS: Array<{ value: TReportStatus | "all"; label: string }> = [
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

const personName = (person?: TReportPerson) => {
  if (!person) return "-";
  return `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() || "-";
};

const truncate = (value?: string | null, max = 80) => {
  if (!value) return "-";
  return value.length > max ? `${value.slice(0, max)}...` : value;
};

type NoteFormValues = {
  adminNote?: string;
};

export default function ReviewReportsContainer() {
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();
  const [form] = Form.useForm<NoteFormValues>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";
  const statusParam = searchParams.get("status");
  const itemTypeParam = searchParams.get("itemType");

  const activeStatus =
    statusParam === "pending" ||
    statusParam === "reviewed" ||
    statusParam === "resolved" ||
    statusParam === "dismissed"
      ? statusParam
      : "all";

  const activeItemType =
    itemTypeParam === "product" ||
    itemTypeParam === "business" ||
    itemTypeParam === "business-profile"
      ? itemTypeParam
      : "all";

  const [searchValue, setSearchValue] = useState(search);
  const debouncedSearch = useDebounced({ value: searchValue, delay: 400 });

  const [updateReportStatus, { isLoading: isUpdating }] =
    useUpdateReportStatusMutation();
  const [removeReportedReview, { isLoading: isRemoving }] =
    useRemoveReportedReviewMutation();
  const [deleteReport, { isLoading: isDeleting }] = useDeleteReportMutation();

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
  if (activeStatus !== "all") queryParams.status = activeStatus;
  if (activeItemType !== "all") queryParams.itemType = activeItemType;

  const { data, isLoading, isFetching, refetch } = useGetReportsQuery(queryParams);
  const {
    data: detailData,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
  } = useGetReportByIdQuery(selectedId as string, { skip: !selectedId });

  const response = data as
    | {
        data?: TReport[];
        meta?: {
          page?: number;
          limit?: number;
          total?: number;
          totalPages?: number;
          links?: { currentPage?: number };
        };
        message?: string;
      }
    | undefined;

  const reports = response?.data ?? [];
  const meta = {
    page: response?.meta?.links?.currentPage || response?.meta?.page || page,
    limit: response?.meta?.limit || limit,
    total: response?.meta?.total || 0,
  };

  const selectedReport = (detailData?.data as TReport | undefined) || null;

  useEffect(() => {
    if (!selectedReport) return;
    form.setFieldsValue({ adminNote: selectedReport.adminNote || "" });
  }, [selectedReport, form]);

  const openDetail = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

  const closeDetail = () => {
    setDrawerOpen(false);
    setSelectedId(null);
    form.resetFields();
  };

  const afterAction = async (message?: string) => {
    Success_model({ title: message || "Action completed successfully" });
    await refetch();
  };

  const handleStatusUpdate = async (status: TReportStatus) => {
    if (!selectedId) return;
    const adminNote = form.getFieldValue("adminNote");

    try {
      const res = await updateReportStatus({
        id: selectedId,
        status,
        adminNote,
      }).unwrap();
      await afterAction((res as { message?: string })?.message);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleRemoveReview = async () => {
    if (!selectedId) return;
    const adminNote = form.getFieldValue("adminNote");

    try {
      const res = await removeReportedReview({
        id: selectedId,
        adminNote,
      }).unwrap();
      await afterAction((res as { message?: string })?.message);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      const res = await deleteReport(id).unwrap();
      await afterAction((res as { message?: string })?.message);
      if (selectedId === id) closeDetail();
    } catch (error) {
      handleApiError(error);
    }
  };

  const columns: TableProps<TReport>["columns"] = [
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (text) => <p>{text ? moment(text).format("LLL") : "-"}</p>,
    },
    {
      title: "Reporter",
      dataIndex: "reporterId",
      render: (_text, record) => (
        <div>
          <p className='font-medium'>{personName(record.reporterId)}</p>
          <p className='text-xs text-[#93A4B0]'>{record.reporterId?.email || "-"}</p>
        </div>
      ),
    },
    {
      title: "Reviewed item",
      dataIndex: "target",
      render: (_text, record) => (
        <div className='space-y-1'>
          <p className='font-medium'>{record.target?.name || "-"}</p>
          <span className='inline-block rounded-full bg-white/10 px-2 py-0.5 text-xs capitalize'>
            {record.target?.type || record.itemType}
          </span>
        </div>
      ),
    },
    {
      title: "Review",
      dataIndex: "reviewId",
      render: (_text, record) => {
        if (!record.reviewId) {
          return <p className='text-[#93A4B0] italic'>Review removed</p>;
        }

        return (
          <div className='space-y-1 max-w-[220px]'>
            <Rate disabled allowHalf value={record.reviewId.rating || 0} className='text-sm' />
            <p className='text-sm'>{truncate(record.reviewId.text)}</p>
          </div>
        );
      },
    },
    {
      title: "Review author",
      dataIndex: "reviewAuthor",
      render: (_text, record) => {
        if (!record.reviewId) {
          return <p className='text-[#93A4B0] italic'>Review removed</p>;
        }
        if (record.reviewId.isAnonymous) {
          return <p>Anonymous User</p>;
        }
        return (
          <div>
            <p className='font-medium'>{personName(record.reviewId.userId)}</p>
            <p className='text-xs text-[#93A4B0]'>{record.reviewId.userId?.email || "-"}</p>
          </div>
        );
      },
    },
    {
      title: "Reason",
      dataIndex: "reason",
      render: (text) => <p className='max-w-[200px]'>{truncate(text, 70)}</p>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: TReportStatus) => (
        <p className={cn("capitalize font-medium", statusColor(text))}>{text}</p>
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
            onClick={() => openDetail(record._id)}
            aria-label='View report'
          >
            <Eye size={16} color='#78C0A8' />
          </button>
          <Popconfirm
            title='Delete report'
            description='Are you sure you want to delete this report record?'
            onConfirm={() => handleDeleteReport(record._id)}
            okText='Yes'
            cancelText='No'
            disabled={isDeleting}
          >
            <button
              type='button'
              className='p-1.5 rounded-full bg-[#FF48481A]'
              aria-label='Delete report'
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
        activeKey={activeItemType}
        onChange={(key) =>
          updateParams({
            itemType: key === "all" ? null : key,
            page: "1",
          })
        }
        items={ITEM_TYPE_TABS.map((tab) => ({
          key: tab.key,
          label: tab.label,
        }))}
      />

      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-3'>
        <Select
          size='large'
          className='min-w-[200px]'
          value={activeStatus}
          onChange={(value) =>
            updateParams({
              status: value === "all" ? null : value,
              page: "1",
            })
          }
          options={STATUS_OPTIONS}
        />

        <Input.Search
          placeholder='Search reporter, author, or review text'
          size='large'
          className='max-w-[360px]'
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
        ) : reports.length === 0 ? (
          <div className='py-10'>
            <Empty description='No review reports found' />
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={reports.map((item) => ({ ...item, id: item._id }))}
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
        title={<span className='text-white'>Review Report Details</span>}
        open={drawerOpen}
        onClose={closeDetail}
        width={520}
        destroyOnClose
        styles={{
          body: { background: "#111827", color: "#fff" },
          header: { background: "#111827", color: "#fff" },
        }}
      >
        {isDetailLoading || isDetailFetching ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : !selectedReport ? (
          <Empty description='Report not found' />
        ) : (
          <div className='space-y-5 text-white'>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <p className='text-[#93A4B0]'>Status</p>
                <p className={cn("capitalize font-medium", statusColor(selectedReport.status))}>
                  {selectedReport.status}
                </p>
              </div>
              <div>
                <p className='text-[#93A4B0]'>Item type</p>
                <p className='capitalize'>{selectedReport.itemType}</p>
              </div>
              <div>
                <p className='text-[#93A4B0]'>Reviewed item</p>
                <p>{selectedReport.target?.name || "-"}</p>
              </div>
              <div>
                <p className='text-[#93A4B0]'>Created</p>
                <p>
                  {selectedReport.createdAt
                    ? moment(selectedReport.createdAt).format("LLL")
                    : "-"}
                </p>
              </div>
            </div>

            <div>
              <p className='text-sm text-[#93A4B0] mb-1'>Reporter</p>
              <p className='font-medium'>{personName(selectedReport.reporterId)}</p>
              <p className='text-sm text-[#93A4B0]'>{selectedReport.reporterId?.email || "-"}</p>
            </div>

            <div>
              <p className='text-sm text-[#93A4B0] mb-1'>Reason</p>
              <div className='rounded-xl border border-[#FFFFFF33]/[0.2] p-3 whitespace-pre-wrap'>
                {selectedReport.reason}
              </div>
            </div>

            <div>
              <p className='text-sm text-[#93A4B0] mb-1'>Reported review</p>
              {!selectedReport.reviewId ? (
                <p className='text-[#93A4B0] italic'>Review removed</p>
              ) : (
                <div className='rounded-xl border border-[#FFFFFF33]/[0.2] p-3 space-y-3'>
                  <div className='flex items-center justify-between gap-3'>
                    <Rate
                      disabled
                      allowHalf
                      value={selectedReport.reviewId.rating || 0}
                    />
                    <p className='text-sm'>
                      {selectedReport.reviewId.isAnonymous
                        ? "Anonymous User"
                        : personName(selectedReport.reviewId.userId)}
                    </p>
                  </div>
                  <p className='whitespace-pre-wrap'>
                    {selectedReport.reviewId.text || "No review text"}
                  </p>
                  {selectedReport.reviewId.image ? (
                    <Image
                      src={selectedReport.reviewId.image}
                      alt='Review'
                      width={220}
                      className='rounded-lg object-cover'
                    />
                  ) : null}
                </div>
              )}
            </div>

            <Form form={form} layout='vertical'>
              <Form.Item
                label={<span className='text-white'>Admin note</span>}
                name='adminNote'
              >
                <Input.TextArea rows={4} placeholder='Optional admin note' />
              </Form.Item>
            </Form>

            <div className='grid grid-cols-2 gap-2'>
              <Button
                size='large'
                loading={isUpdating}
                onClick={() => handleStatusUpdate("reviewed")}
                icon={<CheckCircle2 size={16} />}
              >
                Mark reviewed
              </Button>
              <Button
                size='large'
                type='primary'
                className='bg-[#4BB54B]'
                loading={isUpdating}
                onClick={() => handleStatusUpdate("resolved")}
              >
                Resolve
              </Button>
              <Button
                size='large'
                loading={isUpdating}
                onClick={() => handleStatusUpdate("dismissed")}
                icon={<Ban size={16} />}
              >
                Dismiss
              </Button>
              <Button
                size='large'
                loading={isUpdating}
                onClick={() => handleStatusUpdate("pending")}
              >
                Mark pending
              </Button>
            </div>

            <div className='flex gap-2'>
              {selectedReport.reviewId ? (
                <Popconfirm
                  title='Remove review'
                  description='This permanently deletes the review and its replies, and resolves all reports on it.'
                  onConfirm={handleRemoveReview}
                  okText='Remove'
                  cancelText='Cancel'
                  disabled={isRemoving}
                >
                  <Button danger size='large' loading={isRemoving} className='flex-1'>
                    Remove review
                  </Button>
                </Popconfirm>
              ) : null}

              <Popconfirm
                title='Delete report'
                description='Are you sure you want to delete this report record?'
                onConfirm={() => handleDeleteReport(selectedReport._id)}
                okText='Yes'
                cancelText='No'
                disabled={isDeleting}
              >
                <Button danger size='large' loading={isDeleting} className='flex-1'>
                  Delete report
                </Button>
              </Popconfirm>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
