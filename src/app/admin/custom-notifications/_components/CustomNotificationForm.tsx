'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required').min(10, 'Description must be at least 10 characters'),
  userType: z.enum(['user', 'merchant', 'organizer']),
})

type NotificationFormData = z.infer<typeof notificationSchema>

export function CustomNotificationForm() {
  const form = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      description: '',
      userType: 'user',
    },
  })

  const onSubmit = (data: NotificationFormData) => {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full  space-y-6 rounded-lg  p-8">
        {/* Notification Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Notification Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="write Notifications"
                  className="border-gray-600 bg-black text-gray-200 placeholder-gray-500"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="write Description"
                  className="border-gray-600 bg-black text-gray-200 placeholder-gray-500"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        {/* Select User */}
        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Select User</FormLabel>
              <FormControl>
                <div className="flex gap-3">
                  {(['user', 'merchant', 'organizer'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => field.onChange(type)}
                      className={`rounded-full px-6 py-2 font-medium transition-colors ${
                        field.value === type
                          ? 'bg-yellow-500 text-black'
                          : 'border border-gray-600 bg-black text-gray-200 hover:border-gray-500'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        {/* Save Changes Button */}
        <Button
          type="submit"
          className="w-full rounded-full bg-yellow-500 py-4 font-semibold text-white hover:bg-yellow-600"
        >
          Save Changes
        </Button>
      </form>
    </Form>
  )
}
