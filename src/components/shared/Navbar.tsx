"use client";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import useGreeting from "@/hooks/useGreeting";
import { cn } from "@/lib/utils";
import { useGetProfileQuery } from "@/redux/api/profileApi";
import { useAppDispatch } from "@/redux/hooks";
import { TAdminProfile } from "@/types";
import { performLogout } from "@/utils/logout";
import UserAvatar from "@/components/shared/UserAvatar";
import { Flex } from "antd";
import { ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaBars } from "react-icons/fa6";

type TNavbarProps = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

const Navbar = ({ collapsed, setCollapsed }: TNavbarProps) => {
  const greeting = useGreeting();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data } = useGetProfileQuery(undefined);
  const user = data?.data as TAdminProfile | undefined;
  const firstName = user?.firstName || "Admin";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Admin";

  const handleLogout = async (event?: Event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await performLogout(dispatch);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <div className='flex items-center justify-between w-[97%] font-poppins text-text-color xl:px-8 px-4'>
      <Flex align='center' gap={20}>
        <button
          onClick={() => setCollapsed(collapsed ? false : true)}
          className='cursor-pointer hover:bg-gray-300 rounded-full duration-1000'
        >
          {collapsed ? (
            <X size={20} className='text-primary-gray' />
          ) : (
            <FaBars size={20} className='text-primary-gray' />
          )}
        </button>
        <div className='flex flex-col text-white '>
          <h2 className='text-lg  font-medium'>
            Dashboard
            <span className='block  text-sm font-normal'>
              {greeting}, {fullName}
            </span>
          </h2>
        </div>
      </Flex>

      <Flex align='center' gap={20}>
        <Menubar className='py-8 border-none shadow-none px-0 border bg-transparent '>
          <MenubarMenu>
            <MenubarTrigger className='shadow-none px-0 bg-[#111827] data-[state=open]:bg-[#111827] active:bg-[#111827]'>
              <div className={cn("text-black flex items-center gap-x-2 cursor-pointer")}>
                <UserAvatar
                  src={user?.profileAvatar}
                  name={firstName}
                  className='size-10 border border-main-color'
                />
                <h4
                  className={cn(
                    "text-base font-medium truncate flex-1 text-white",
                    collapsed && "hidden",
                  )}
                >
                  {firstName}
                </h4>
              </div>
            </MenubarTrigger>
            <MenubarContent className='text-primary-gray bg-[#111827]'>
              <Link href={"/admin/personal-information"}>
                <MenubarItem className='hover:bg-gray-100 cursor-pointer'>
                  Profile{" "}
                  <MenubarShortcut>
                    <ChevronRight size={16} />
                  </MenubarShortcut>
                </MenubarItem>
              </Link>
              <MenubarSeparator />
              <MenubarItem
                className='hover:bg-gray-100 cursor-pointer'
                disabled={isLoggingOut}
                onSelect={(event) => {
                  event.preventDefault();
                  void handleLogout(event);
                }}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </Flex>
    </div>
  );
};

export default Navbar;
