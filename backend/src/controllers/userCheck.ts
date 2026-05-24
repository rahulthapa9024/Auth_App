import { Response } from "express";

import { prisma } from "../../lib/prisma";

import type { AuthRequest } from "../middlewares/authMiddleware";


const CheckAuth = async (
  req: AuthRequest,
  res: Response
) => {

  try {

    // req.user is already decoded & verified by authMiddleware
    const { id } = req.user;

    // FIND USER IN DB
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
      isAuthenticated: true,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });

  }

};

export { CheckAuth };