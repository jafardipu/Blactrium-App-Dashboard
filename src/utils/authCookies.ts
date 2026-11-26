import Cookies from "js-cookie";

export const ACCESS_TOKEN_COOKIE = "accesstoken";
export const REFRESH_TOKEN_COOKIE = "refreshtoken";
export const REMEMBER_ME_KEY = "rememberMe";

/** Match backend JWT lifetimes */
export const ACCESS_TOKEN_MAX_AGE_DAYS = 15;
export const REFRESH_TOKEN_MAX_AGE_DAYS = 30;

export const ACCESS_TOKEN_MAX_AGE_SECONDS =
  ACCESS_TOKEN_MAX_AGE_DAYS * 24 * 60 * 60;
export const REFRESH_TOKEN_MAX_AGE_SECONDS =
  REFRESH_TOKEN_MAX_AGE_DAYS * 24 * 60 * 60;

export const getRememberMe = () => {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(REMEMBER_ME_KEY);
  if (stored === null) return true;
  return stored === "true";
};

export const setRememberMe = (rememberMe: boolean) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? "true" : "false");
};

type SetAuthCookieOptions = {
  rememberMe?: boolean;
};

export const setAuthCookies = (
  accessToken?: string,
  refreshToken?: string,
  options?: SetAuthCookieOptions,
) => {
  const rememberMe = options?.rememberMe ?? getRememberMe();

  if (typeof window !== "undefined") {
    setRememberMe(rememberMe);
  }

  const common = {
    path: "/",
    sameSite: "lax" as const,
  };

  if (accessToken) {
    Cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
      ...common,
      ...(rememberMe ? { expires: ACCESS_TOKEN_MAX_AGE_DAYS } : {}),
    });
  }

  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...common,
      ...(rememberMe ? { expires: REFRESH_TOKEN_MAX_AGE_DAYS } : {}),
    });
  }
};

export const clearClientAuthCookies = () => {
  Cookies.remove(ACCESS_TOKEN_COOKIE, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_COOKIE, { path: "/" });
  if (typeof window !== "undefined") {
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
};
