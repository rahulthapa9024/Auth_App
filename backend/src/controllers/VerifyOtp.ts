import { Request, Response } from "express";

import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import { prisma } from "../../lib/prisma";

import { redis } from "../config/redis";


const VerifyOtp = async (
  req: Request,
  res: Response
) => {

  try {

    const { email, otp } = req.body;


    // VALIDATION
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required",
      });
    }


    // CONVERT OTP TO STRING
    const otpString = otp.toString();


    // GET STORED OTP
    const storedOtp = await redis.get(
      `otp:${email}`
    );


    // OTP EXPIRED
    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }


    // VERIFY OTP
    const isOtpCorrect = await bcrypt.compare(
      otpString,
      storedOtp
    );


    // INVALID OTP
    if (!isOtpCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }


    // DELETE OTP AFTER SUCCESS
    await redis.del(`otp:${email}`);


    // FIND USER
    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });


    // CREATE USER IF NOT EXISTS
    if (!user) {

      user = await prisma.user.create({
        data: {
          email,
        },
      });

    }


    // CREATE JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );


    // STORE JWT COOKIE
    res.cookie("token", token, {
      httpOnly: true,

      secure: false,

      sameSite: "lax",

      maxAge:
        7 * 24 * 60 * 60 * 1000,
    });


    return res.status(200).json({
      success: true,

      message:
        "OTP verified successfully",

      user,
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,

      message:
        "OTP verification failed",
    });

  }

};

export { VerifyOtp };