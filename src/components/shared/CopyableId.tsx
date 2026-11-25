"use client";

import { message } from "antd";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type CopyableIdProps = {
  id?: string | null;
  previewLast?: number | false;
  className?: string;
};

export default function CopyableId({
  id,
  previewLast = false,
  className,
}: CopyableIdProps) {
  const [copied, setCopied] = useState(false);

  if (!id) return <span>-</span>;

  const display =
    typeof previewLast === "number" && previewLast > 0
      ? `...${id.slice(-previewLast)}`
      : id;

  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      message.success("ID copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      message.error("Failed to copy ID");
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span className='font-mono text-sm' title={id}>
        {display}
      </span>
      <button
        type='button'
        onClick={handleCopy}
        className='p-1 rounded-md hover:bg-white/10 transition-colors'
        aria-label='Copy user ID'
        title='Copy full ID'
      >
        {copied ? (
          <Check size={14} className='text-[#4BB54B]' />
        ) : (
          <Copy size={14} className='text-[#93A4B0]' />
        )}
      </button>
    </div>
  );
}
