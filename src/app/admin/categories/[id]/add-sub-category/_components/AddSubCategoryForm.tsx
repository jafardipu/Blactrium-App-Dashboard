"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoryFormSchema, type CategoryFormData } from "./schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateSubCategoryMutation } from "@/redux/api/categories";
import { handleApiError } from "@/utils/handleApiError";
import { Success_model } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";

export function AddSubCategoryForm() {
  const router = useRouter();
  const params = useParams();
  const categoryId = String(params?.id || "");
  const [isLoading, setIsLoading] = useState(false);
  const [createSubCategory] = useCreateSubCategoryMutation();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: CategoryFormData) => {
    if (!categoryId) return;

    try {
      setIsLoading(true);

      await createSubCategory({
        subCategoryName: data.name,
        categoryId,
      }).unwrap();

      Success_model({ title: "Sub category created successfully" });
      form.reset();
      router.push(`/admin/categories/${categoryId}`);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='text-white'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-white'>Sub Category Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter Sub category name'
                    className='text-white placeholder:text-gray-400 py-5'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            disabled={isLoading || !categoryId}
            className='w-full bg-amber-500 hover:bg-amber-600 text-black rounded-full h-10 text-base font-medium'
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
