import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import type {
  PayloadAction,
} from "@reduxjs/toolkit";

import axiosClient from "../utils/axiosClient";
import { getErrorMessage } from "../utils/errorMessage";


// ======================
// USER TYPE
// ======================
interface User {
  id: string;
  email: string;
  userName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
}


// ======================
// CHECK AUTH RESPONSE
// ======================
interface CheckAuthResponse {
  success: boolean;
  isAuthenticated: boolean;
  user: User | null;
}


// ======================
// STATE TYPE
// ======================
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}


// ======================
// INITIAL STATE
// ======================
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};


// ======================
// CHECK AUTH
// ======================
export const checkAuth = createAsyncThunk<
  CheckAuthResponse,
  void,
  { rejectValue: string }
>(
  "auth/checkAuth",

  async (_, thunkAPI) => {

    try {

      const response = await axiosClient.get(
        "/auth/checkAuth",
        {
          withCredentials: true,
        }
      );

      return response.data;

    } catch (err: any) {

      return thunkAPI.rejectWithValue(
        getErrorMessage(err)
      );

    }

  }
);


// ======================
// LOGOUT
// ======================
export const logoutAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  "auth/logout",

  async (_, thunkAPI) => {

    try {

      await axiosClient.post(
        "/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );

    } catch (err: any) {

      return thunkAPI.rejectWithValue(
        getErrorMessage(
          err,
          "Could not sign out. Please try again."
        )
      );

    }

  }
);


// ======================
// AUTH SLICE
// ======================
const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {

    // SET USER AFTER LOGIN
    setUser: (
      state,
      action: PayloadAction<User>
    ) => {

      state.user = action.payload;

      state.isAuthenticated = true;

      state.error = null;

    },

    // LOCAL LOGOUT
    logoutUser: (state) => {

      state.user = null;

      state.isAuthenticated = false;

      state.error = null;

    },

  },

  extraReducers: (builder) => {

    builder

      // ======================
      // CHECK AUTH
      // ======================

      // PENDING
      .addCase(checkAuth.pending, (state) => {

        state.loading = true;

      })

      // SUCCESS
      .addCase(checkAuth.fulfilled, (state, action) => {

        state.loading = false;

        state.user = action.payload.user;

        state.isAuthenticated =
          action.payload.isAuthenticated;

        state.error = null;

      })

      // FAILED
      .addCase(checkAuth.rejected, (state) => {

        state.loading = false;

        state.user = null;

        state.isAuthenticated = false;

        state.error = null;

      })


      // ======================
      // LOGOUT
      // ======================

      // PENDING
      .addCase(logoutAsync.pending, (state) => {

        state.loading = true;

      })

      // SUCCESS
      .addCase(logoutAsync.fulfilled, (state) => {

        state.loading = false;

        state.user = null;

        state.isAuthenticated = false;

        state.error = null;

      })

      // FAILED
      .addCase(logoutAsync.rejected, (state, action) => {

        state.loading = false;

        state.user = null;

        state.isAuthenticated = false;

        state.error =
          action.payload || null;

      });

  },

});


// ======================
// EXPORTS
// ======================
export const {
  setUser,
  logoutUser,
} = authSlice.actions;

export default authSlice.reducer;