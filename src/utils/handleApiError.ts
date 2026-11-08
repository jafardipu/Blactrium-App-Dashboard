import { Error_Modal } from "@/lib/utils";

type ApiFieldError = {
  field?: string;
  message?: string;
};

type ApiErrorBody = {
  message?: string;
  errors?: Array<ApiFieldError | string>;
};

const getErrorBody = (error: unknown): ApiErrorBody | undefined => {
  if (!error || typeof error !== "object") return undefined;

  if ("data" in error && error.data && typeof error.data === "object") {
    return error.data as ApiErrorBody;
  }

  return error as ApiErrorBody;
};

const firstErrorMessage = (error: unknown): string => {
  const body = getErrorBody(error);
  const firstError = body?.errors?.[0];

  if (typeof firstError === "string" && firstError.trim()) {
    return firstError;
  }

  if (firstError && typeof firstError === "object" && firstError.message?.trim()) {
    return firstError.message;
  }

  if (typeof body?.message === "string" && body.message.trim()) {
    return body.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return "Something went wrong";
};

export const handleApiError = (error: unknown) => {
  const message = firstErrorMessage(error);

  Error_Modal({ title: message });

  return message;
};
