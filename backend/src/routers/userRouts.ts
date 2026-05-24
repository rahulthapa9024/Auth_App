import { Router } from "express";

const userRouter = Router();


// MIDDLEWARES
import authMiddleware from "../middlewares/authMiddleware";

import guestMiddleware from "../middlewares/guestMiddleware";


// CONTROLLERS
import { AuthUser } from "../controllers/userSignUp";

import { Logout } from "../controllers/userLogout";

import { CheckAuth } from "../controllers/userCheck";

import { SendOtp } from "../controllers/SendOtp";

import { VerifyOtp } from "../controllers/VerifyOtp";


// FIREBASE SIGNUP
userRouter.post(
  "/signup",
  guestMiddleware,
  AuthUser
);


// SEND OTP
userRouter.post(
  "/send-otp",
  guestMiddleware,
  SendOtp
);


// VERIFY OTP
userRouter.post(
  "/verify-otp",
  guestMiddleware,
  VerifyOtp
);


// CHECK AUTH
userRouter.get(
  "/checkAuth",
  authMiddleware,
  CheckAuth
);


// LOGOUT
userRouter.post(
  "/logout",
  authMiddleware,
  Logout
);


export default userRouter;