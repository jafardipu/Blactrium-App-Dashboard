"use client";

import {
  useGetCategoriesQuery,
  useUpdateSubCategoryMutation,
} from "@/redux/api/categories";
import { TCategory, TSubCategory } from "@/types";
import { Success_model } from "@/lib/utils";
import { handleApiError } from "@/utils/handleApiError";
import { Input, Modal, Select } from "antd";
import { useEffect, useMemo, useState } from "react";

type EditSubCategoryModalProps = {
  open: boolean;
  subCategory: TSubCategory | null;
  onClose: () => void;
  onNotFound?: () => void;
};

export default function EditSubCategoryModal({
  open,
  subCategory,
  onClose,
  onNotFound,
}: EditSubCategoryModalProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [updateSubCategory] = useUpdateSubCategoryMutation();

  const { data: categoriesData } = useGetCategoriesQuery(
    { page: 1, limit: 200 },
    { skip: !open },
  );

  const categories = useMemo(() => {
    const payload = categoriesData?.data as
      | { data?: TCategory[] }
      | TCategory[]
      | undefined;
    if (Array.isArray(payload)) return payload;
    return payload?.data ?? [];
  }, [categoriesData]);

  useEffect(() => {
    if (!open || !subCategory) return;
    setName(subCategory.subCategoryName || "");
    setCategoryId(subCategory.categoryId?._id || "");
  }, [open, subCategory]);

  const handleSave = async () => {
    if (!subCategory?._id) return;
    const trimmed = name.trim();
    if (!trimmed || !categoryId) return;

    try {
      setSaving(true);
      const body: {
        id: string;
        subCategoryName?: string;
        categoryId?: string;
      } = { id: subCategory._id };

      if (trimmed !== subCategory.subCategoryName) {
        body.subCategoryName = trimmed;
      }
      if (categoryId !== subCategory.categoryId?._id) {
        body.categoryId = categoryId;
      }

      if (!body.subCategoryName && !body.categoryId) {
        onClose();
        return;
      }

      const res = await updateSubCategory(body).unwrap();
      Success_model({
        title:
          (res as { message?: string })?.message ||
          "Sub category updated successfully",
      });
      onClose();
    } catch (error) {
      const status =
        error && typeof error === "object" && "status" in error
          ? (error as { status?: number }).status
          : undefined;
      if (status === 404) {
        handleApiError(error);
        onNotFound?.();
        onClose();
        return;
      }
      handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title='Edit Sub Category'
      onCancel={onClose}
      onOk={handleSave}
      okText='Save'
      confirmLoading={saving}
      destroyOnClose
    >
      <div className='space-y-4 py-2'>
        <div>
          <p className='mb-1 text-sm font-medium'>Sub Category Name</p>
          <Input
            size='large'
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder='Enter sub category name'
          />
        </div>
        <div>
          <p className='mb-1 text-sm font-medium'>Parent Category</p>
          <Select
            size='large'
            className='w-full'
            value={categoryId || undefined}
            onChange={setCategoryId}
            options={categories.map((item) => ({
              value: item._id,
              label: item.categoryName,
            }))}
            placeholder='Select category'
            showSearch
            optionFilterProp='label'
          />
        </div>
      </div>
    </Modal>
  );
}
