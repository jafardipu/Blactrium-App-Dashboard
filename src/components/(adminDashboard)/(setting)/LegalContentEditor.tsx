"use client";

import { Success_model } from "@/lib/utils";
import { handleApiError } from "@/utils/handleApiError";
import { useGetLegalQuery, useUpdateLegalMutation } from "@/redux/api/legalApi";
import { TLegal, TLegalContentType } from "@/types";
import { Button, Skeleton } from "antd";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

type LegalContentEditorProps = {
  contentType: TLegalContentType;
  title: string;
};

const toolbarOptions = [
  ["image"],
  [{ header: [1, 2, false] }],
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ align: [] }],
  [{ color: [] }, { background: [] }],
];

const modules = {
  toolbar: toolbarOptions,
};

const LegalContentEditor = ({ contentType, title }: LegalContentEditorProps) => {
  const [value, setValue] = useState("");
  const { data, isLoading } = useGetLegalQuery(contentType);
  const [updateLegal, { isLoading: isSaving }] = useUpdateLegalMutation();
  const legal = data?.data as TLegal | undefined;

  useEffect(() => {
    if (legal?.content != null) {
      setValue(legal.content);
    }
  }, [legal]);

  const handleSave = async () => {
    if (!legal?._id) return;

    try {
      await updateLegal({
        id: legal._id,
        content: value,
      }).unwrap();
      Success_model({ title: `${title} updated successfully` });
    } catch (error) {
      handleApiError(error);
    }
  };

  if (isLoading) {
    return (
      <div className='mt-4'>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <>
      <div className='flex items-center gap-2'>
        <h4 className='text-2xl font-medium text-text-color'>
          {legal?.title || title}
        </h4>
      </div>
      <ReactQuill
        modules={modules}
        theme='snow'
        value={value}
        onChange={setValue}
        placeholder='Start writing ......'
        style={{
          border: "1px solid #EFE8FD",
          marginTop: "20px",
          borderRadius: "10px",
          backgroundColor: "#68c0a114",
        }}
        className='placeholder:!text-white'
      />
      <Button
        size='large'
        block
        className='bg-[#fcb806] hover:!bg-[#fcb806]/90 text-white hover:!text-white border-none'
        style={{ marginTop: "20px" }}
        onClick={handleSave}
        loading={isSaving}
        disabled={!legal?._id || !value || isSaving}
      >
        Save Changes
      </Button>
    </>
  );
};

export default dynamic(() => Promise.resolve(LegalContentEditor), {
  ssr: false,
});
