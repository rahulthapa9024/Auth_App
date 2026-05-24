import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";

import { useEffect } from "react";

import type { RootState, AppDispatch } from "./store/store";

import { checkAuth } from "./slice/authSlice";

import SignUp from "./pages/SighUp";
import Home from "./pages/Home";

import NavBar from "./Components/NavBar";


export default function App() {

  const dispatch = useDispatch<AppDispatch>();

  const {
    isAuthenticated,
    loading,
  } = useSelector(
    (state: RootState) => state.auth
  );


  // RESTORE SESSION ON EVERY PAGE LOAD / REFRESH
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);


  // PREVENT ROUTE FLASH — wait until checkAuth has resolved
  if (loading) {
    return (
      <div className="
        w-screen
        h-screen
        flex
        items-center
        justify-center
        bg-black
        text-white
        text-2xl
      ">
        Loading...
      </div>
    );
  }


  return (

    <BrowserRouter>

      <NavBar />

      <Routes>

        {/* HOME — public: accessible whether logged in or not */}
        <Route
          path="/"
          element={<Home />}
        />


        {/* SIGNUP — redirect to Home if already logged in */}
        <Route
          path="/signup"
          element={
            !isAuthenticated
              ? <SignUp />
              : <Navigate to="/" replace />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}