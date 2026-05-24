import {
    createSlice,
    createAsyncThunk,
  } from "@reduxjs/toolkit";
  
import type {
    PayloadAction,
  } from "@reduxjs/toolkit";

import axiosClient from "../utils/axiosClient";
import { getErrorMessage } from "../utils/errorMessage";
  
  
  // USER TYPE
  interface User {
    id: string;
    email: string;
    userName?: string | null;
    photoURL?: string | null;
    phoneNumber?: string | null;
  }
  
  
  // STATE TYPE
  interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
  }
  
  
  // INITIAL STATE
  const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: true,   // true so we block routes until checkAuth resolves
    error: null,
  };
  
  
  // CHECK AUTH
  export const checkAuth = createAsyncThunk(
    "auth/checkAuth",
  
    async (_, thunkAPI) => {
  
      try {
  
        const response = await axiosClient.get(
          "/auth/checkAuth",
          {
            withCredentials: true,
          }
        );
  
        return response.data.user;
  
      } catch (err: any) {
  
        return thunkAPI.rejectWithValue(
          getErrorMessage(err)
        );
  
      }
  
    }
  );


  // LOGOUT
  export const logoutAsync = createAsyncThunk(
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

  
  // AUTH SLICE
  const authSlice = createSlice({
    name: "auth",
  
    initialState,
  
    reducers: {
  
      // LOGIN SUCCESS
      setUser: (
        state,
        action: PayloadAction<User>
      ) => {
  
        state.user = action.payload;
  
        state.isAuthenticated = true;
  
      },
  
      // LOGOUT (local reset)
      logoutUser: (state) => {
  
        state.user = null;
  
        state.isAuthenticated = false;
  
      },
  
    },
  
    extraReducers: (builder) => {
  
      builder
  
        // PENDING
        .addCase(checkAuth.pending, (state) => {
  
          state.loading = true;
  
        })
  
        // SUCCESS
        .addCase(checkAuth.fulfilled, (state, action) => {
  
          state.loading = false;
  
          state.user = action.payload;
  
          state.isAuthenticated = true;
  
        })
  
        // FAILED
        .addCase(checkAuth.rejected, (state, action) => {
  
          state.loading = false;
  
          state.user = null;
  
          state.isAuthenticated = false;
  
          state.error = action.payload as string;
  
        })

        // LOGOUT — pending
        .addCase(logoutAsync.pending, (state) => {

          state.loading = true;

        })

        // LOGOUT — fulfilled: clear state
        .addCase(logoutAsync.fulfilled, (state) => {

          state.loading = false;

          state.user = null;

          state.isAuthenticated = false;

        })

        // LOGOUT — rejected: still clear state
        .addCase(logoutAsync.rejected, (state) => {

          state.loading = false;

          state.user = null;

          state.isAuthenticated = false;

          state.error = null;

        });
  
    },
  
  });
  
  export const {
    setUser,
    logoutUser,
  } = authSlice.actions;
  
  export default authSlice.reducer;
