"use client";

import { Tabs } from "antd";
import UserTable from "./_component/UserTable";
import { useSearchParams } from "next/navigation";
import { useUpdateSearchParams } from "@/hooks/useUpdateSearchParams";

const ROLE_TABS = [
  { key: "user", label: "Users" },
  { key: "business-owner", label: "Business Owners" },
] as const;

export default function UsersPage() {
  const searchParams = useSearchParams();
  const updateParams = useUpdateSearchParams();
  const roleParam = searchParams.get("role");
  const activeRole =
    roleParam === "business-owner" || roleParam === "user" ? roleParam : "user";

  return (
    <Tabs
      activeKey={activeRole}
      destroyInactiveTabPane
      onChange={(key) =>
        updateParams({
          role: key,
          page: "1",
          search: null,
        })
      }
      items={ROLE_TABS.map((tab) => ({
        key: tab.key,
        label: tab.label,
        children: <UserTable role={tab.key} />,
      }))}
    />
  );
}
