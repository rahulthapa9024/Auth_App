import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../../lib/prisma";
import admin from "../config/firebaseAdmin";

const AuthUser = async (
  req: Request,
  res: Response
) => {
  try {

    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        message: "Firebase token required",
      });
    }

    // VERIFY FIREBASE TOKEN
    const decodedToken = await admin
      .auth()
      .verifyIdToken(firebaseToken);

    const {
      uid,
      email,
      name,
      picture,
      phone_number,
    } = decodedToken;

    if (!email) {
      return res.status(400).json({
        message: "Email not found",
      });
    }

    // FIND USER
    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // REGISTER USER IF NOT EXISTS
    if (!user) {

      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email,
          userName: name || null,
          photoURL: picture || null,
          phoneNumber: phone_number || null,
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

    // STORE COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Authentication successful",
      token,
      user,
    });

  } catch (err) {

    if (err instanceof Error) {
      return res.status(500).json({
        message: err.message,
      });
    }

    return res.status(500).json({
      message: `Error: ${err}`,
    });
  }
};

export { AuthUser };