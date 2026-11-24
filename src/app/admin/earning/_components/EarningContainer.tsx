"use client";

import { StatCard } from "@/components/shared/StatCard";
import { useGetEarningStatsQuery } from "@/redux/api/earningApi";
import { TCurrencyEarning, TEarningStats } from "@/types";
import { Empty, Skeleton, Tabs } from "antd";
import { TabsProps } from "antd/lib";
import { Wallet } from "lucide-react";
import ProductCommissionEarnings from "./ProductCommissionEarnings";
import SubscriptionEarningsTable from "./SubscriptionEarningsTable";

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

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "Subscription Earnings",
    children: <SubscriptionEarningsTable />,
  },
  {
    key: "2",
    label: "Commission Earnings",
    children: <ProductCommissionEarnings />,
  },
];

const EarningContainer = () => {
  const { data, isLoading } = useGetEarningStatsQuery(undefined);
  const stats = data?.data as TEarningStats | undefined;

  return (
    <div>
      {isLoading ? (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-2xl mb-4'>
          {[1, 2].map((item) => (
            <Skeleton.Button
              key={item}
              active
              block
              style={{ height: 110, borderRadius: 16 }}
            />
          ))}
        </div>
      ) : !stats ? (
        <div className='border border-[#FFFFFF33]/[0.2] rounded-2xl py-10 mb-4 max-w-2xl'>
          <Empty description='No earning stats found' />
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-2xl mb-4'>
          <StatCard
            title='Subscription Earnings'
            value={0}
            text={formatEarnings(stats.subscriptionEarningsByCurrency)}
            icon={<Wallet />}
            className='bg-[#211604]'
          />
          <StatCard
            title='Product Earnings'
            value={0}
            text={formatEarnings(stats.productEarningsByCurrency)}
            icon={<Wallet />}
            className='bg-[#211604]'
          />
        </div>
      )}

      <Tabs defaultActiveKey='1' items={items} />
    </div>
  );
};

export default EarningContainer;
