/* eslint-disable @typescript-eslint/no-explicit-any */

import { TUser } from "@/types";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from "@/utils/authCookies";
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

type TInitialState = { user: TUser | null; token: string | null };

const initialState: TInitialState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token, refreshToken } = action.payload;

      state.user = user ?? state.user;
      state.token = token;

      setAuthCookies(token, refreshToken);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;

      Cookies.remove(ACCESS_TOKEN_COOKIE, { path: "/" });
      Cookies.remove(REFRESH_TOKEN_COOKIE, { path: "/" });
    },
  },
});

export const selectUser = (state: any) => state.auth.user;
export const selectToken = (state: any) => state.auth.token;

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;
