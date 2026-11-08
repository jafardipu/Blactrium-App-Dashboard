"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  src?: string | null;
  name: string;
  className?: string;
  fallbackClassName?: string;
};

export const getNameInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

const UserAvatar = ({ src, name, className, fallbackClassName }: UserAvatarProps) => {
  const initials = getNameInitials(name);

  return (
    <Avatar className={cn("size-10 shrink-0", className)}>
      {src ? <AvatarImage src={src} alt={name} className='object-cover' /> : null}
      <AvatarFallback
        className={cn(
          "bg-[#FCB806]/20 text-[#FCB806] text-sm font-semibold",
          fallbackClassName,
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
