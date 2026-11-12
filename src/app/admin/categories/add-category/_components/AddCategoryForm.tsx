"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoryFormSchema, type CategoryFormData } from "./schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { X, Upload } from "lucide-react";
import { useCreateCategoryMutation } from "@/redux/api/categories";
import { handleUpload } from "@/utils/handleUpload";
import { handleApiError } from "@/utils/handleApiError";
import { Success_model } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function AddCategoryForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [addCategory] = useCreateCategoryMutation();

  const form = useForm<CategoryFormData>({
    // @ts-ignore
    resolver: zodResolver(categoryFormSchema),
    mode: "onChange",
  });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const keepImageInForm = (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!file) {
      setPreviewUrl(null);
      setSelectedFile(null);
      form.setValue("image", undefined as any, {
        shouldValidate: true,
        shouldDirty: true,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    form.setValue("image", dataTransfer.files as any, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsLoading(true);

      const imageFile = data.image instanceof File ? data.image : selectedFile;
      if (!imageFile) {
        form.setError("image", { message: "Category image is required" });
        return;
      }

      const categoryImage = await handleUpload(imageFile);

      await addCategory({
        categoryName: data.name,
        categoryImage,
      }).unwrap();

      Success_model({ title: "Category created successfully" });
      keepImageInForm(null);
      form.reset();
      router.push("/admin/categories");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      keepImageInForm(file);
    }
  };

  return (
    <div className='text-white'>
      <Form {...form}>
        {/* @ts-ignore */}
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            // @ts-ignore
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-white'>Category Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter category name'
                    className='text-white placeholder:text-gray-400'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            // @ts-ignore
            control={form.control}
            name='image'
            render={() => (
              <FormItem>
                <FormLabel className='text-white'>Category Image</FormLabel>
                <FormControl>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative w-full h-40 rounded-2xl border-2 border-dashed transition-all duration-200 ${
                      dragActive
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-gray-600 bg-gray-900/50 hover:bg-gray-900/70"
                    } flex items-center justify-center cursor-pointer group`}
                  >
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/jpeg,image/png,image/webp'
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        keepImageInForm(file);
                      }}
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                    />

                    <div className='flex flex-col items-center justify-center space-y-3 pointer-events-none'>
                      <div className='p-3 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors'>
                        <Upload className='w-6 h-6 text-amber-500' />
                      </div>
                      <div className='text-center'>
                        <p className='text-white font-medium'>
                          {selectedFile
                            ? "Replace image"
                            : "Drag and drop your image"}
                        </p>
                        <p className='text-gray-400 text-sm'>
                          {selectedFile
                            ? selectedFile.name
                            : "or click to browse"}
                        </p>
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormDescription className='text-gray-400 mt-3'>
                  JPG, PNG or WebP. Max 5MB.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {previewUrl ? (
            <div className='relative w-40 h-40 rounded-2xl overflow-hidden border border-[#FFFFFF33]/[0.2] bg-gray-900/40'>
              <img
                src={previewUrl}
                alt='Category preview'
                className='w-full h-full object-contain'
              />
              <button
                type='button'
                onClick={() => keepImageInForm(null)}
                className='absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors shadow-lg'
              >
                <X className='w-4 h-4' />
              </button>
              {selectedFile ? (
                <div className='absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 text-xs text-white truncate'>
                  {selectedFile.name}
                </div>
              ) : null}
            </div>
          ) : null}

          <Button
            type='submit'
            disabled={isLoading}
            className='w-full bg-amber-500 hover:bg-amber-600 text-white rounded-full h-10 text-base font-medium'
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
