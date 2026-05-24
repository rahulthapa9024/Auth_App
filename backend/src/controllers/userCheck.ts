import { Response } from "express";

import { prisma } from "../../lib/prisma";

import type { AuthRequest } from "../middlewares/authMiddleware";


const CheckAuth = async (
  req: AuthRequest,
  res: Response
) => {

  try {

    // USER NOT LOGGED IN
    if (!req.user) {
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        user: null,
      });
    }

    const { id } = req.user;

    // FIND USER
    const user = await prisma.user.findUnique({
      where: { id },
    });

    // USER NOT FOUND
    if (!user) {
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        user: null,
      });
    }

    // AUTHENTICATED
    return res.status(200).json({
      success: true,
      isAuthenticated: true,
      user,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });

  }

};

export { CheckAuth };