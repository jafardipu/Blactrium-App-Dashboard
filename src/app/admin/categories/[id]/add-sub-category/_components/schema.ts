import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").min(2, "Category name must be at least 2 characters"),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
