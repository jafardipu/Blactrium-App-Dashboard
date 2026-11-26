import { clearAuthCookiesAction } from "@/actions/auth";
import { AppDispatch, persistor } from "@/redux/store";
import { logout } from "@/redux/features/authSlice";
import { baseApi } from "@/redux/api/baseApi";
import { clearClientAuthCookies } from "./authCookies";

export const performLogout = async (dispatch: AppDispatch) => {
  // Remove cookies via next/headers cookieStore (server action)
  await clearAuthCookiesAction();

  // Also clear any client-readable copies
  clearClientAuthCookies();

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
