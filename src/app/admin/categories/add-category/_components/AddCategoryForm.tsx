"use client";
import React from "react";
import { useState } from "react";
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

export function AddCategoryForm() {
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [addCategory, {isLoading: isAddCategoryLoading}] = useCreateCategoryMutation();

    const form = useForm<CategoryFormData>({
        // @ts-ignore
        resolver: zodResolver(categoryFormSchema),
        mode: "onChange",
    });

    const onSubmit = async (data: CategoryFormData) => {
        try {
            setIsLoading(true);
            console.log("Form data:", {
                name: data.name,
                image: data.image.name,
                size: data.image.size,
                type: data.image.type,
            });

            // Here you would typically send the data to your API
            // const formData = new FormData();
            // formData.append("name", data.name);
            // formData.append("image", data.image);
            // await fetch("/api/categories", { method: "POST", body: formData });

            alert("Category saved successfully!");
            form.reset();
            setPreview(null);
        } catch (error) {
            console.error("Error saving category:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
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

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            const file = files[0];
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            const inputElement = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (inputElement) {
                inputElement.files = dataTransfer.files;

                const event = new Event("change", { bubbles: true });
                inputElement.dispatchEvent(event);

                handleImageChange({ target: { files: dataTransfer.files } } as any);
            }
        }
    };

    const handleRemoveImage = () => {
        setPreview(null);
        form.resetField("image");
        const inputElement = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (inputElement) {
            inputElement.value = "";
        }
    };

    return (
        <div className=" text-white">
            <Form {...form}>
                {/* @ts-ignore */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        // @ts-ignore
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">Category Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter category name"
                                        className="text-white placeholder:text-gray-400"
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
                        name="image"
                        render={({ field: { onChange, value, ...field } }) => (
                            <FormItem>
                                <FormLabel className="text-white">Category Image</FormLabel>
                                <FormControl>
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        className={`relative w-full transition-all duration-200 ${preview ? "h-64" : "h-40"
                                            } rounded-2xl border-2 border-dashed ${dragActive
                                                ? "border-amber-500 bg-amber-500/10"
                                                : "border-gray-600 bg-gray-900/50 hover:bg-gray-900/70"
                                            } flex items-center justify-center cursor-pointer group`}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                onChange(e.target.files);
                                                handleImageChange(e);
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            {...field}
                                        />

                                        {preview ? (
                                            <div className="relative w-full h-full">
                                                <img
                                                    src={preview || "/placeholder.svg"}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleRemoveImage();
                                                    }}
                                                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors shadow-lg"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                                                <div className="p-3 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                                                    <Upload className="w-6 h-6 text-amber-500" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-white font-medium">Drag and drop your image</p>
                                                    <p className="text-gray-400 text-sm">or click to browse</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormDescription className="text-gray-400 mt-3">
                                    JPG, PNG or WebP. Max 5MB.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-full h-10 text-base font-medium"
                    >
                        {isLoading ? "Saving..." : "Save"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
