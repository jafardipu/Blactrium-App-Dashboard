import Cookies from "js-cookie";

export const ACCESS_TOKEN_COOKIE = "accesstoken";
export const REFRESH_TOKEN_COOKIE = "refreshtoken";

export const setAuthCookies = (accessToken?: string, refreshToken?: string) => {
  if (accessToken) {
    Cookies.set(ACCESS_TOKEN_COOKIE, accessToken, { path: "/" });
  }
  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, { path: "/" });
  }
};
