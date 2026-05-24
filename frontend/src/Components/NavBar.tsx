import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";

import type { RootState, AppDispatch } from "../store/store";

import { logoutAsync } from "../slice/authSlice";
import ConfirmLogout from "./ConfirmLogout";
import { getErrorMessage } from "../utils/errorMessage";


export default function NavBar() {

  const navigate   = useNavigate();
  const dispatch   = useDispatch<AppDispatch>();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  // AUTH STATE
  const {
    user,
    isAuthenticated,
    loading,
  } = useSelector(
    (state: RootState) => state.auth
  );


  // LOGOUT HANDLER
  const handleLogout = async () => {
    try {
      setLogoutError("");
      await dispatch(logoutAsync()).unwrap();
      setShowLogoutConfirm(false);
      navigate("/");
    } catch (err) {
      setLogoutError(
        getErrorMessage(
          err,
          "Could not sign out. Please try again."
        )
      );
    }
  };


  return (

    <>
      <nav
        className="
          w-full
          flex
          items-center
          justify-between
          px-6
          py-4
          bg-black
          border-b
          border-zinc-800
        "
      >

      {/* LOGO */}
      <h1
        className="
          text-2xl
          font-bold
          text-white
          cursor-pointer
        "
        onClick={() => navigate("/")}
      >
        Auth App
      </h1>


      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {
          loading ? (

            <p className="text-white">
              Loading...
            </p>

          ) : isAuthenticated ? (

            <>
              <p className="text-white font-medium">
                Welcome, {user?.userName}
              </p>

              <button
                onClick={() => {
                  setLogoutError("");
                  setShowLogoutConfirm(true);
                }}
                className="
                  px-5
                  py-2
                  rounded-xl
                  bg-red-600
                  text-white
                  font-semibold
                  hover:bg-red-700
                  transition-all
                  duration-300
                  cursor-pointer
                "
              >
                Signout
              </button>
            </>

          ) : (

            <button
              onClick={() => navigate("/signup")}
              className="
                px-5
                py-2
                rounded-xl
                bg-white
                text-black
                font-semibold
                hover:bg-zinc-200
                transition-all
                duration-300
                cursor-pointer
              "
            >
              Sign Up
            </button>

          )
        }

      </div>

      </nav>

      <ConfirmLogout
        open={showLogoutConfirm}
        loading={loading}
        error={logoutError}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </>

  );
}
