"use client";
import { StatCard } from "@/components/shared/StatCard";
import { useGetDashboardQuery } from "@/redux/api/dashboardApi";
import { TDashboardData } from "@/types";
import { Tickets, UserRound, Wallet } from "lucide-react";
import { Empty, Skeleton } from "antd";
import { TCurrencyEarning } from "@/types";

const formatCurrencyAmount = (amount: number) => {
  const rounded = Math.round((amount || 0) * 100) / 100;
  if (Number.isInteger(rounded)) return rounded.toLocaleString("en-US");
  return rounded.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatEarnings = (items?: TCurrencyEarning[]) => {
  if (!items?.length) return "0";
  return items
    .map((item) => `${formatCurrencyAmount(item.amount)} ${item.currency}`)
    .join(", ");
};

const StatContainer = () => {
  const { data, isLoading } = useGetDashboardQuery(undefined);
  const overview = (data?.data as TDashboardData | undefined)?.overview;

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {[1, 2, 3, 4].map((item) => (
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
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
      <StatCard
        title='Active Users'
        value={overview.totalActiveUsers ?? 0}
        icon={<UserRound />}
        className='bg-[#211604]'
      />
      <StatCard
        title='Total Businesses'
        value={overview.totalBusinesses ?? 0}
        icon={<Tickets />}
        className='bg-[#211604]'
      />
      <StatCard
        title='Subscription Earnings'
        value={0}
        text={formatEarnings(overview.subscriptionEarningsByCurrency)}
        icon={<Wallet />}
        className='bg-[#211604]'
      />
      <StatCard
        title='Product Earnings'
        value={0}
        text={formatEarnings(overview.productEarningsByCurrency)}
        icon={<Wallet />}
        className='bg-[#211604]'
      />
    </div>
  );
};

export default StatContainer;
