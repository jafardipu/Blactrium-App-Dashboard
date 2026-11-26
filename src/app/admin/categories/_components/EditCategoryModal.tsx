"use client";

import { useUpdateCategoryMutation } from "@/redux/api/categories";
import { TCategory } from "@/types";
import { Success_model } from "@/lib/utils";
import { handleApiError } from "@/utils/handleApiError";
import { handleUpload } from "@/utils/handleUpload";
import { Button, Input, Modal, Upload } from "antd";
import { Upload as UploadIcon } from "lucide-react";
import { useEffect, useState } from "react";

type EditCategoryModalProps = {
  open: boolean;
  category: TCategory | null;
  onClose: () => void;
  onNotFound?: () => void;
};

export default function EditCategoryModal({
  open,
  category,
  onClose,
  onNotFound,
}: EditCategoryModalProps) {
  const [name, setName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [updateCategory] = useUpdateCategoryMutation();

  useEffect(() => {
    if (!open || !category) return;
    setName(category.categoryName || "");
    setPreviewUrl(category.categoryImage || null);
    setSelectedFile(null);
  }, [open, category]);

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  const handleSave = async () => {
    if (!category?._id) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      setSaving(true);

      const body: {
        id: string;
        categoryName?: string;
        categoryImage?: string;
      } = { id: category._id };

      if (trimmed !== category.categoryName) {
        body.categoryName = trimmed;
      }

      if (selectedFile) {
        body.categoryImage = await handleUpload(selectedFile);
      }

      if (!body.categoryName && body.categoryImage === undefined) {
        handleClose();
        return;
      }

      const res = await updateCategory(body).unwrap();
      Success_model({
        title: (res as { message?: string })?.message || "Category updated successfully",
      });
      handleClose();
    } catch (error) {
      const status =
        error && typeof error === "object" && "status" in error
          ? (error as { status?: number }).status
          : undefined;
      if (status === 404) {
        handleApiError(error);
        onNotFound?.();
        handleClose();
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
      title='Edit Category'
      onCancel={handleClose}
      onOk={handleSave}
      okText='Save'
      confirmLoading={saving}
      destroyOnClose
    >
      <div className='space-y-4 py-2'>
        <div>
          <p className='mb-1 text-sm font-medium'>Category Name</p>
          <Input
            size='large'
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder='Enter category name'
          />
        </div>

        <div>
          <p className='mb-1 text-sm font-medium'>Category Image</p>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={name || "Category"}
              className='mb-3 h-32 w-full rounded-xl object-cover border border-[#FFFFFF33]/[0.2]'
            />
          ) : null}
          <Upload
            accept='image/jpeg,image/png,image/webp'
            showUploadList={false}
            beforeUpload={(file) => {
              setSelectedFile(file);
              setPreviewUrl(URL.createObjectURL(file));
              return false;
            }}
          >
            <Button icon={<UploadIcon size={16} />}>
              {selectedFile ? "Replace selected image" : "Upload new image"}
            </Button>
          </Upload>
          <p className='mt-2 text-xs text-[#93A4B0]'>
            Leave unchanged to keep the current image.
          </p>
        </div>
      </div>
    </Modal>
  );
}
