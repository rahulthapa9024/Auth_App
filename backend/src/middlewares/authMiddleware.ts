import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../utils/tokenBlacklist";

export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "No User is Logged In",
      });
    }

    const isBlacklisted =
      await isTokenBlacklisted(token);

    if (isBlacklisted) {
      return res.status(401).json({
        message: "Token has been logged out",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    req.user = decoded;
    req.token = token;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

export default authMiddleware;
