import { z } from "zod";

const getFile = (value: unknown): File | null => {
  if (!value) return null;
  if (value instanceof File) return value;
  if (typeof FileList !== "undefined" && value instanceof FileList) {
    return value[0] ?? null;
  }
  if (Array.isArray(value) && value[0] instanceof File) {
    return value[0];
  }
  return null;
};

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .min(2, "Category name must be at least 2 characters"),
  image: z
    .any()
    .refine((value) => !!getFile(value), "Category image is required")
    .refine(
      (value) => {
        const file = getFile(value);
        return !!file && file.size <= 5_000_000;
      },
      "Image size must be less than 5MB",
    )
    .refine(
      (value) => {
        const file = getFile(value);
        return (
          !!file &&
          ["image/jpeg", "image/png", "image/webp"].includes(file.type)
        );
      },
      "Only JPG, PNG, and WebP images are allowed",
    )
    .transform((value) => getFile(value) as File),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
