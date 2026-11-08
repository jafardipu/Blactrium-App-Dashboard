import { clearAuthCookiesAction } from "@/actions/auth";
import { AppDispatch, persistor } from "@/redux/store";
import { logout } from "@/redux/features/authSlice";
import { baseApi } from "@/redux/api/baseApi";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./authCookies";
import Cookies from "js-cookie";

export const performLogout = async (dispatch: AppDispatch) => {
  // Remove cookies via next/headers cookieStore (server action)
  await clearAuthCookiesAction();

  // Also clear any client-readable copies
  Cookies.remove(ACCESS_TOKEN_COOKIE, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_COOKIE, { path: "/" });

  dispatch(logout());
  dispatch(baseApi.util.resetApiState());

  sessionStorage.removeItem("otpToken");
  sessionStorage.removeItem("forgotPasswordToken");
  localStorage.removeItem("activeNav");

  try {
    await persistor.purge();
  } catch {
    // ignore persist purge errors
  }
};
