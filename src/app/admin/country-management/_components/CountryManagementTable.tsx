"use client";

import { useUpdateCountryStatusMutation } from "@/redux/api/country";
import { TCountry } from "@/types";
import { Success_model } from "@/lib/utils";
import { handleApiError } from "@/utils/handleApiError";
import DataTable from "@/utils/DataTable";
import { Switch, TableProps } from "antd";
import { useState } from "react";

type CountryRow = TCountry & { id: string };

function CountryFlag({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className='h-6 w-9 rounded bg-[#D1D5DB]' aria-label={alt} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className='h-6 w-9 rounded object-contain bg-[#1f2937]'
      onError={() => setFailed(true)}
    />
  );
}

export default function CountryManagementTable({
  countries,
  loading = false,
}: {
  countries: TCountry[];
  loading?: boolean;
}) {
  const [updateCountryStatus] = useUpdateCountryStatusMutation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (country: TCountry, status: boolean) => {
    try {
      setUpdatingId(country._id);
      await updateCountryStatus({
        id: country._id,
        status,
      }).unwrap();
      // Success_model({
      //   title: status ? "Country activated" : "Country deactivated",
      // });
    } catch (error) {
      handleApiError(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const rows: CountryRow[] = countries.map((country) => ({
    ...country,
    id: country._id,
  }));

  const columns: TableProps<CountryRow>["columns"] = [
    {
      title: "COUNTRY",
      dataIndex: "countryName",
      render: (_, record) => (
        <div className='flex items-center gap-3'>
          <CountryFlag src={record.flag} alt={record.countryName} />
          <span>{record.countryName}</span>
        </div>
      ),
    },
    {
      title: "CODE",
      dataIndex: "countryCode",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: boolean) => (
        <p className={status ? "text-[#4BB54B]" : "text-[#FF4848]"}>
          {status ? "Active" : "Inactive"}
        </p>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <Switch
          checked={record.status}
          loading={updatingId === record._id}
          disabled={updatingId === record._id}
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      ),
    },
  ];

  return <DataTable columns={columns} data={rows} loading={loading} pagination={false} />;
}
