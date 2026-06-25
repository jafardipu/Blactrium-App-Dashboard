"use client";;
import React from "react"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoryFormSchema, type CategoryFormData } from "./schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function AddSubCategoryForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsLoading(true);
      console.log("Form data:", {
        name: data.name,
      });
      
      // Here you would typically send the data to your API
      // const formData = new FormData();
      // formData.append("name", data.name);
      // formData.append("image", data.image);
      // await fetch("/api/categories", { method: "POST", body: formData });
      
      alert("Category saved successfully!");
      form.reset();
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className=" text-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white"> Sub Category  Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Sub category name"
                    className="text-white placeholder:text-gray-400 py-5"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black rounded-full h-10 text-base font-medium"
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
