import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").min(2, "Category name must be at least 2 characters"),
  image: z
    .any()
    .refine((files) => files?.length > 0, "Category image is required")
    .refine(
      (files) => files?.[0]?.size <= 5000000,
      "Image size must be less than 5MB"
    )
    .refine(
      (files) => ["image/jpeg", "image/png", "image/webp"].includes(files?.[0]?.type),
      "Only JPG, PNG, and WebP images are allowed"
    )
    .transform((files) => files[0] as File),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
