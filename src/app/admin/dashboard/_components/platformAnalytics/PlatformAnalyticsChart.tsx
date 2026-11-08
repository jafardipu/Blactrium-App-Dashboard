"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useGetDashboardQuery } from "@/redux/api/dashboardApi";
import { TDashboardData } from "@/types";
import { useMemo, useState } from "react";
import { Empty, Skeleton } from "antd";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className='custom-tooltip bg-white p-3 shadow-md rounded-md border border-gray-100'>
        <p className='text-sm font-medium text-black'>{payload[0].value.toLocaleString()}</p>
        <p className='text-xs text-gray-500'>{payload[0].payload.month}</p>
      </div>
    );
  }
  return null;
};

interface EarningsChartProps {
  className?: string;
}

const PlatformAnalyticsChart = ({ className }: EarningsChartProps) => {
  const currentYear = new Date().getFullYear();
  const startYear = 2024;
  const yearsArray = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index,
  );
  const [selectedYear, setSetSelectedYear] = useState(currentYear);
  const { data, isLoading } = useGetDashboardQuery(undefined);
  const platformAnalytics = (data?.data as TDashboardData | undefined)?.platformAnalytics ?? [];
  const hasAnalytics = platformAnalytics.length > 0;

  const chartData = useMemo(
    () =>
      MONTHS.map((month, index) => ({
        month,
        income: platformAnalytics[index] ?? 0,
      })),
    [platformAnalytics],
  );

  return (
    <Card className={`p-3 !bg-transparent border border-[#FFFFFF33]/[0.2] rounded-2xl ${className}`}>
      <CardHeader>
        <div className='flex justify-between items-center mb-5'>
          <div className='flex-1 '>
            <CardTitle className='text-xl font-semibold flex items-center text-text-color'>
              Platform Analytics
            </CardTitle>
          </div>

          <div className='flex-1'>
            <div className='w-fit ml-auto '>
              <Popover>
                <PopoverTrigger className='rounded-full bg-white/20 text-white border-none' asChild>
                  <Button variant='outline' size='sm' className='h-8'>
                    {selectedYear} <ChevronDown className='ml-1 h-4 w-4' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-24 p-0 bg-white/30 text-white border-none'>
                  <div className='flex flex-col'>
                    {yearsArray?.map((year) => (
                      <Button
                        onClick={() => setSetSelectedYear(year)}
                        key={year}
                        variant='ghost'
                        className='justify-start'
                      >
                        {year}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardHeader>

      <div>
        {isLoading ? (
          <div className='h-[300px] flex items-center justify-center px-4'>
            <Skeleton active paragraph={{ rows: 8 }} title={false} className='w-full' />
          </div>
        ) : !hasAnalytics ? (
          <div className='h-[300px] flex items-center justify-center'>
            <Empty description='No analytics data found' />
          </div>
        ) : (
          <ChartContainer
            config={{
              expense: { theme: { light: "#F9F9FA", dark: "#EEEEEF" } },
            }}
            className='h-[300px] w-full'
          >
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                className='h-[300px]'
              >
                <defs>
                  <linearGradient id='colorExpense' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='20%' stopColor='#A8640F' opacity={0.9} />
                    <stop offset='80%' stopColor='#A28F59' stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <XAxis dataKey='month' axisLine={true} tickLine={true} tick={{ fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    value >= 1000 ? `${value / 1000}k` : `${value}`
                  }
                  allowDecimals={false}
                />
                <ChartTooltip content={<CustomTooltip />} />

                <Area
                  type='monotone'
                  dataKey='income'
                  stroke='#FCB806'
                  strokeWidth={1}
                  fillOpacity={1}
                  fill='url(#colorExpense)'
                  activeDot={{
                    r: 6,
                    fill: "#fff",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </Card>
  );
};

export default PlatformAnalyticsChart;
