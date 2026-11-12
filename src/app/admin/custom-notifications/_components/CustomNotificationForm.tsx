"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSendCustomNotificationMutation } from "@/redux/api/notificationApi";
import { handleApiError } from "@/utils/handleApiError";
import { Success_model } from "@/lib/utils";

const notificationSchema = z.object({
  title: z.string().min(1, "Notification title is required"),
  description: z.string().min(1, "Notification description is required"),
  targetType: z.enum(["user", "business-owner"], {
    errorMap: () => ({
      message: "targetType must be 'user' or 'business-owner'.",
    }),
  }),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

const targetOptions = [
  { value: "user", label: "User" },
  { value: "business-owner", label: "Business Owner" },
] as const;

export function CustomNotificationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [sendCustomNotification] = useSendCustomNotificationMutation();

  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      description: "",
      targetType: "user",
    },
  });

  const onSubmit = async (data: NotificationFormData) => {
    try {
      setIsLoading(true);
      await sendCustomNotification({
        title: data.title,
        description: data.description,
        targetType: data.targetType,
      }).unwrap();

      Success_model({ title: "Notification sent successfully" });
      form.reset({
        title: "",
        description: "",
        targetType: "user",
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-6 rounded-lg p-8'>
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-200'>Notification Title</FormLabel>
              <FormControl>
                <Input
                  placeholder='write Notifications'
                  className='border-gray-600 bg-black text-gray-200 placeholder-gray-500'
                  {...field}
                />
              </FormControl>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-200'>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='write Description'
                  className='border-gray-600 bg-black text-gray-200 placeholder-gray-500'
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='targetType'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-gray-200'>Select User</FormLabel>
              <FormControl>
                <div className='flex flex-wrap gap-3'>
                  {targetOptions.map((option) => (
                    <button
                      key={option.value}
                      type='button'
                      onClick={() => field.onChange(option.value)}
                      className={`rounded-full px-6 py-2 font-medium transition-colors ${
                        field.value === option.value
                          ? "bg-yellow-500 text-black"
                          : "border border-gray-600 bg-black text-gray-200 hover:border-gray-500"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          disabled={isLoading}
          className='w-full rounded-full bg-yellow-500 py-4 font-semibold text-white hover:bg-yellow-600'
        >
          {isLoading ? "Sending..." : "Send Notification"}
        </Button>
      </form>
    </Form>
  );
}
