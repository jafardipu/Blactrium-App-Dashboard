"use client";
import { StatCard } from "@/components/shared/StatCard";
import { useGetDashboardQuery } from "@/redux/api/dashboardApi";
import { TDashboardData } from "@/types";
import { Tickets, UserRound, Wallet } from "lucide-react";
import { Empty, Skeleton } from "antd";

const StatContainer = () => {
  const { data, isLoading } = useGetDashboardQuery(undefined);
  const overview = (data?.data as TDashboardData | undefined)?.overview;

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {[1, 2, 3].map((item) => (
          <Skeleton.Button key={item} active block style={{ height: 110, borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  if (!overview) {
    return (
      <div className='border border-[#FFFFFF33]/[0.2] rounded-2xl py-10'>
        <Empty description='No overview data found' />
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
      <StatCard
        title='Active User'
        value={overview.totalActiveUsers ?? 0}
        icon={<UserRound />}
        className='bg-[#211604]'
      />
      <StatCard
        title='Total Business'
        value={overview.totalBusinesses ?? 0}
        icon={<Tickets />}
        className='bg-[#211604]'
      />
      <StatCard
        title='Total Earning'
        value={overview.totalEarning ?? 0}
        prefix='$'
        decimals={2}
        icon={<Wallet />}
        className='bg-[#211604]'
      />
    </div>
  );
};

export default StatContainer;
