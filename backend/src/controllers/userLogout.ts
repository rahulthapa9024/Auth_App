import { Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { blacklistToken } from "../utils/tokenBlacklist";

const Logout = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const token = req.token || req.cookies?.token;

    if (token) {
      await blacklistToken(
        token,
        jwt.decode(token)
      );
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
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

export { Logout };
