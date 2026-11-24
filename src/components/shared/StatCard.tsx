import { GownIcon } from "@/icons";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";
import { ReactNode } from "react";
import CountUp from "react-countup";

interface StatCardProps {
  title: string;
  value: string | number;
  text?: string;
  change?: {
    value: string;
    positive: boolean;
  };
  className?: string;
  icon?: ReactNode;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function StatCard({ title, value, text, className, icon, prefix, suffix, decimals = 0 }: StatCardProps) {
  return (
    <div className={cn("rounded-2xl p-6 flex flex-col gap-1 text-white", className)}>
      <h3 className='text-2xl  font-medium'>{title}</h3>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-x-2 text-[#7F8694]'>
          {icon && icon}
          {text ? (
            <p className='text-xl font-medium'>{text}</p>
          ) : (
          <div className="flex items-center gap-0.5">
            <span className="text-xl" >{prefix}</span>
            <p className='text-xl font-medium'>
              <CountUp
                end={typeof value === "string" ? Number(value) : value}
                decimals={decimals}
              />
            </p>
            <span className="text-xl">{suffix}</span>
          </div>
          )}
        </div>

        {/*<div
          className={cn(
            "flex items-center text-sm gap-x-2 font-medium",
            change.positive ? "text-emerald-400" : "text-rose-600"
          )}
        >
          <span>{change.value}</span>
          <GownIcon className={"text-emerald-400"} />
        </div>*/}
      </div>
    </div>
  );
}
