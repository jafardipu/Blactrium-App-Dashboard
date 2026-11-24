"use client";

import PaginationSection from "@/components/shared/PaginationSection";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";
import { Success_model, cn } from "@/lib/utils";
import {
  useCreateFaqMutation,
  useDeleteFaqMutation,
  useGetAdminFaqsQuery,
  useUpdateFaqMutation,
} from "@/redux/api/faqApi";
import { useDebounced } from "@/redux/hooks";
import { TFaq, TFaqStatus } from "@/types";
import { handleApiError } from "@/utils/handleApiError";
import { Button, ConfigProvider, Empty, Form, Input, Modal, Popconfirm, Select, Skeleton, Switch, Table, TableProps } from "antd";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { HTMLAttributes, useEffect, useState } from "react";

type FaqFormValues = {
  question: string;
  answer: string;
  status: TFaqStatus;
};

type FaqListMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

const parseFaqResponse = (response: unknown) => {
  const body = response as
    | {
        data?: TFaq[] | { data?: TFaq[]; meta?: FaqListMeta } | TFaq | null;
        meta?: FaqListMeta;
      }
    | undefined;

  if (Array.isArray(body?.data)) {
    return { faqs: body.data, meta: body.meta };
  }

  if (body?.data && typeof body.data === "object" && "data" in body.data) {
    return {
      faqs: body.data.data ?? [],
      meta: body.data.meta ?? body.meta,
    };
  }

  return { faqs: [] as TFaq[], meta: body?.meta };
};

const FaqsManager = () => {
  const [form] = Form.useForm<FaqFormValues>();
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TFaq | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rows, setRows] = useState<TFaq[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "active" || statusParam === "inactive" ? statusParam : "";

  const [searchValue, setSearchValue] = useState(search);
  const debouncedSearch = useDebounced({ value: searchValue, delay: 400 });

  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();

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
  if (status) queryParams.status = status;

  const { data, isLoading, isFetching } = useGetAdminFaqsQuery(queryParams);
  const { meta: responseMeta } = parseFaqResponse(data);
  const meta = {
    page: responseMeta?.page || page,
    limit: responseMeta?.limit || limit,
    total: responseMeta?.total || 0,
  };

  useEffect(() => {
    const { faqs: nextFaqs } = parseFaqResponse(data);
    setRows([...nextFaqs].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
  }, [data]);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({
      question: "",
      answer: "",
      status: "active",
    });
    setOpen(true);
  };

  const openEdit = (faq: TFaq) => {
    setEditing(faq);
    form.setFieldsValue({
      question: faq.question,
      answer: faq.answer,
      status: faq.status,
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const handleDrop = async (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex || isReordering) {
      setDragIndex(null);
      return;
    }

    const previous = rows;
    const next = [...rows];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setRows(next);
    setDragIndex(null);

    const base = (meta.page - 1) * meta.limit;
    const updates = next
      .map((faq, index) => ({ faq, sortOrder: base + index + 1 }))
      .filter(({ faq, sortOrder }) => faq.sortOrder !== sortOrder);

    if (!updates.length) return;

    try {
      setIsReordering(true);
      await Promise.all(
        updates.map(({ faq, sortOrder }) => updateFaq({ id: faq._id, sortOrder }).unwrap()),
      );
    } catch (error) {
      setRows(previous);
      handleApiError(error);
    } finally {
      setIsReordering(false);
    }
  };

  const handleSubmit = async (values: FaqFormValues) => {
    const body = {
      question: values.question.trim(),
      answer: values.answer.trim(),
      status: values.status,
    };

    try {
      if (editing) {
        await updateFaq({ id: editing._id, ...body }).unwrap();
        Success_model({ title: "FAQ updated successfully" });
      } else {
        await createFaq(body).unwrap();
        Success_model({ title: "FAQ created successfully" });
      }
      closeModal();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleStatusToggle = async (faq: TFaq, checked: boolean) => {
    try {
      setUpdatingId(faq._id);
      await updateFaq({
        id: faq._id,
        status: checked ? "active" : "inactive",
      }).unwrap();
      Success_model({ title: checked ? "FAQ activated" : "FAQ deactivated" });
    } catch (error) {
      handleApiError(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (faq: TFaq) => {
    try {
      await deleteFaq(faq._id).unwrap();
      Success_model({ title: "FAQ deleted successfully" });
    } catch (error) {
      handleApiError(error);
    }
  };

  const columns: TableProps<TFaq>["columns"] = [
    {
      title: "",
      dataIndex: "drag",
      width: 48,
      render: () => <GripVertical size={18} className='text-white/70 cursor-grab' />,
    },
    {
      title: "Question",
      dataIndex: "question",
      render: (text: string) => <p className='max-w-[280px] font-medium text-white'>{text}</p>,
    },
    {
      title: "Answer",
      dataIndex: "answer",
      render: (text: string) => (
        <p className='max-w-[360px] line-clamp-2 text-[#CBD5E1]'>{text}</p>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: TFaqStatus, record) => (
        <div className='flex items-center gap-2'>
          <Switch
            checked={text === "active"}
            loading={updatingId === record._id}
            disabled={updatingId === record._id}
            onChange={(checked) => handleStatusToggle(record, checked)}
          />
          <span
            className={cn(
              "capitalize text-sm",
              text === "active" ? "text-[#4BB54B]" : "text-[#FFA36E]",
            )}
          >
            {text}
          </span>
        </div>
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
            onClick={() => openEdit(record)}
            aria-label='Edit FAQ'
          >
            <Pencil size={16} color='#78C0A8' />
          </button>
          <Popconfirm
            title='Delete FAQ'
            description='Are you sure you want to delete this FAQ?'
            onConfirm={() => handleDelete(record)}
            okText='Yes'
            cancelText='No'
            disabled={isDeleting}
          >
            <button
              type='button'
              className='p-1.5 rounded-full bg-[#FF48481A]'
              aria-label='Delete FAQ'
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
      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-3'>
        <div className='flex flex-col sm:flex-row gap-3'>
          <Input.Search
            placeholder='Search FAQs'
            size='large'
            className='max-w-[320px]'
            allowClear
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onSearch={(value) => setSearchValue(value)}
          />
          <Select
            size='large'
            className='min-w-[160px]'
            value={status || "all"}
            onChange={(value) =>
              updateParams({
                status: value === "all" ? null : value,
                page: "1",
              })
            }
            options={[
              { value: "all", label: "All statuses" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>
        <Button
          type='primary'
          size='large'
          icon={<Plus size={16} />}
          className='bg-gradient-to-t from-[#E6CA6E] to-[#775806]'
          onClick={openCreate}
        >
          Add FAQ
        </Button>
      </div>

      <div className='border border-[#FFFFFF33]/[0.2] rounded-xl'>
        {isLoading ? (
          <div className='p-4 space-y-3'>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} active paragraph={{ rows: 1 }} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className='py-10'>
            <Empty description='No FAQs found' />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={rows}
              loading={isFetching || isReordering}
              pagination={false}
              rowKey='_id'
              scroll={{ x: "max-content" }}
              components={{
                body: {
                  row: (props: HTMLAttributes<HTMLTableRowElement> & { "data-row-key"?: string }) => {
                    const index = rows.findIndex((item) => item._id === props["data-row-key"]);

                    return (
                      <tr
                        {...props}
                        draggable={!isReordering}
                        onDragStart={() => setDragIndex(index)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleDrop(index)}
                        className={cn(props.className, "cursor-grab")}
                      />
                    );
                  },
                },
              }}
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

      <Modal
        open={open}
        title={
          <span className='bg-transparent text-lg font-medium'>
            {editing ? "Edit FAQ" : "Add FAQ"}
          </span>
        }
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <ConfigProvider
          theme={{
            components: {
              Form: {
                labelColor: "#ffffff",
              },
            },
          }}
        >
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          className='mt-4 [&_.ant-form-item-label>label]:!text-white'
        >
          <Form.Item
            label='Question'
            name='question'
            rules={[{ required: true, message: "Question is required" }]}
          >
            <Input size='large' placeholder='Enter question' />
          </Form.Item>
          <Form.Item
            label='Answer'
            name='answer'
            rules={[{ required: true, message: "Answer is required" }]}
          >
            <Input.TextArea rows={4} placeholder='Enter answer' />
          </Form.Item>
          <Form.Item
            label='Status'
            name='status'
            rules={[{ required: true, message: "Status is required" }]}
          >
            <Select
              size='large'
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </Form.Item>
          <Button
            htmlType='submit'
            type='primary'
            size='large'
            block
            loading={isCreating || isUpdating}
            className='bg-[#fcb806] hover:!bg-[#fcb806]/90'
          >
            {editing ? "Save changes" : "Create FAQ"}
          </Button>
        </Form>
        </ConfigProvider>
      </Modal>
    </div>
  );
};

export default FaqsManager;
