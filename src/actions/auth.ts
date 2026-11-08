"use server";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/utils/authCookies";

export async function clearAuthCookiesAction() {
  const cookieStore = await cookies();

  [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE].forEach((name) => {
    cookieStore.delete(name);
    cookieStore.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  });

  return { success: true };
}
