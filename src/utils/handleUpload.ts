import Cookies from "js-cookie";
import { ACCESS_TOKEN_COOKIE } from "./authCookies";

type UploadResponse = {
  success?: boolean;
  message?: string;
  data?: {
    imageUrl?: string;
  };
};

export const handleUpload = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const token = Cookies.get(ACCESS_TOKEN_COOKIE);

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/image`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const payload = (await res.json()) as UploadResponse;
  const imageUrl = payload?.data?.imageUrl;

  if (!res.ok || !imageUrl) {
    throw payload || new Error("Image upload failed");
  }

  return imageUrl;
};
