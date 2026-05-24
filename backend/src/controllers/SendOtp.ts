import { Request, Response } from "express";

import crypto from "crypto";

import bcrypt from "bcryptjs";

import { redis } from "../config/redis";

import { resend } from "../config/resend";

import { prisma } from "../../lib/prisma";


const SendOtp = async (
  req: Request,
  res: Response
) => {

  try {

    const { email } = req.body;

    // VALIDATION
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // CHECK USER EXISTS
    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    // CHECK COOLDOWN
    const cooldown = await redis.get(
      `cooldown:${email}`
    );

    if (cooldown) {
      return res.status(429).json({
        success: false,
        message:
          "Please wait before requesting another OTP",
      });
    }

    // GENERATE OTP
    const otp = crypto.randomInt(
      100000,
      999999
    ).toString();

    // HASH OTP
    const hashedOtp = await bcrypt.hash(
      otp,
      10
    );

    // STORE HASHED OTP
    await redis.set(
      `otp:${email}`,
      hashedOtp,
      {
        EX: 300, // 5 MINUTES
      }
    );

    // COOLDOWN
    await redis.set(
      `cooldown:${email}`,
      "true",
      {
        EX: 30,
      }
    );

    // SEND EMAIL
    await resend.emails.send({
      from:
        "Auth App <onboarding@resend.dev>",

      to: email,

      subject: "Your OTP Code",

      html: `
        <div style="
          font-family:sans-serif;
          padding:20px;
        ">

          <h1>OTP Verification</h1>

          <p>
            Your OTP code is:
          </p>

          <h2>${otp}</h2>

          <p>
            This OTP expires in 5 minutes.
          </p>

        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });

  }

};

export { SendOtp };