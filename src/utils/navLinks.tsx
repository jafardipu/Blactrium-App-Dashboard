import { RiDashboardHorizontalFill } from "react-icons/ri";
import { GoPeople } from "react-icons/go";
import Link from "next/link";
import { Bell, BellDot, ChartBarStacked, CircleAlert, Globe, Mail, Podcast, SquareStack, Wallet } from "lucide-react";
import { IoSettingsOutline } from "react-icons/io5";

export const navLinks = [
  {
    key: "dashboard",
    icon: <RiDashboardHorizontalFill size={18} />,
    label: <Link href={"/admin/dashboard"}>Dashboard</Link>,
  },
  {
    key: "users",
    icon: <GoPeople size={18} />,
    label: <Link href={"/admin/users"}>Profiles</Link>,
  },
  {
    key: "subscribe-email",
    icon: <Mail size={18} />,
    label: <Link href={"/admin/subscribe-email"}>Subscribe Email</Link>,
  },

  // {
  //   key: "subscription",
  //   icon: <Podcast size={18} />,
  //   label: <Link href={"/admin/subscription"}>Subscriptions</Link>,
  // },
  {
    key: "complains",
    icon: <CircleAlert size={18} />,
    label: <Link href={"/admin/complains"}>Complains</Link>,
  },
  {
    key: "product_categories",
    icon: <SquareStack size={18} />,
    label: <Link href={"/admin/product-categories"}>Product Categories</Link>,
  },
  {
    key: "category",
    icon: <ChartBarStacked size={18} />,
    label: <Link href={"/admin/categories"}>Categories</Link>,
  },
  {
    key: "country_management",
    icon: <Globe size={18} />,
    label: <Link href={"/admin/country-management"}>Country Management</Link>,
  },
  {
    key: "earning",
    icon: <Wallet size={18} />,
    label: <Link href={"/admin/earning"}>Earning</Link>,
  },
  {
    key: "Custom Notifications",
    icon: <BellDot size={18} />,
    label: <Link href={"/admin/custom-notifications"}>Push Notifications</Link>,
  },
  {
    key: "settings",
    icon: <IoSettingsOutline size={18} />,
    label: <Link href={"/admin/settings"}>Settings</Link>,
  }
];
