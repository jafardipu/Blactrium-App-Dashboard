"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Empty, Popconfirm, Skeleton } from "antd";
import { TProductCategory } from "@/types";
import { useUpdateProductCategoryStatusMutation } from "@/redux/api/product-category";
import { Success_model } from "@/lib/utils";
import { handleApiError } from "@/utils/handleApiError";

interface CategoryGridProps {
  categories: TProductCategory[];
  isLoading?: boolean;
}

export function AllCategories({ categories, isLoading = false }: CategoryGridProps) {
  const [openConfirmId, setOpenConfirmId] = useState<string | null>(null);
  const [updateStatus, { isLoading: isDeleting }] =
    useUpdateProductCategoryStatusMutation();

  const handleDelete = async (id: string) => {
    try {
      await updateStatus({
        id,
        data: { status: false },
      }).unwrap();
      Success_model({ title: "Category deleted successfully" });
      setOpenConfirmId(null);
    } catch (error) {
      handleApiError(error);
    }
  };

  if (isLoading) {
    return (
      <div className='w-full bg-zinc-900 p-4 rounded-md'>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton.Button
              key={index}
              active
              block
              style={{ height: 48, borderRadius: 8 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className='w-full bg-zinc-900 p-10 rounded-md'>
        <Empty description='No product categories found' />
      </div>
    );
  }

  return (
    <div className='w-full bg-zinc-900 p-4 rounded-md'>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {categories.map((category) => {
          const id = category._id || category.id || "";
          const isConfirmOpen = openConfirmId === id;

          return (
            <div key={id} className='relative group'>
              <button className='w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors duration-200 flex items-center justify-center text-sm font-medium'>
                {category.categoryName}
              </button>

              <Popconfirm
                title='Delete category'
                description={`Are you sure you want to delete "${category.categoryName}"?`}
                open={isConfirmOpen}
                onOpenChange={(open) => setOpenConfirmId(open ? id : null)}
                onConfirm={() => handleDelete(id)}
                okText='Yes'
                cancelText='No'
                disabled={isDeleting}
                placement='topRight'
              >
                <button
                  type='button'
                  className={`absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 transition-opacity duration-200 shadow-lg ${
                    isConfirmOpen
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                  aria-label={`Delete ${category.categoryName}`}
                >
                  <Trash2 size={16} />
                </button>
              </Popconfirm>
            </div>
          );
        })}
      </div>
    </div>
  );
}
