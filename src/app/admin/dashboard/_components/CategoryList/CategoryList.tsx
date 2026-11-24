"use client";
import EventCard from "@/components/cards/EventCard";
import { useGetDashboardQuery } from "@/redux/api/dashboardApi";
import { TDashboardData } from "@/types";
import { Empty, Skeleton } from "antd";

export default function CategoryList() {
  const { data, isLoading } = useGetDashboardQuery(undefined);
  const categories = (data?.data as TDashboardData | undefined)?.categoryList ?? [];

  return (
    <div className='xl:col-span-2 border border-[#FFFFFF33]/[0.2] rounded-2xl p-4'>
      <div className='flex items-center gap-x-2 mb-3'>
        <h4 className='text-xl text-[#cad1d6] font-semibold'>Category Lists</h4>
        <hr className='flex-1 border-[#FFFFFF33]/[0.2]' />
      </div>
      <div className='space-y-5'>
        {isLoading ? (
          <div className='space-y-4'>
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} active avatar paragraph={{ rows: 1 }} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Empty description='No categories found' />
        ) : (
          categories.map((category) => (
            <EventCard
              key={category._id}
              event={{
                id: category._id,
                name: category.categoryName,
                date: `${category.subCategoryCount} Sub Categor${
                  category.subCategoryCount === 1 ? "y" : "ies"
                }`,
                image: category.categoryImage || "",
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
