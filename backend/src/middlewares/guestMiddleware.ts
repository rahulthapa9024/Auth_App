import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../utils/tokenBlacklist";

const guestMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;

    if (token) {
      const isBlacklisted =
        await isTokenBlacklisted(token);

      if (isBlacklisted) {
        return next();
      }

      jwt.verify(
        token,
        process.env.JWT_SECRET as string
      );

      return res.status(400).json({
        message: "You are already logged in",
      });
    }

    next();
  } catch (err) {
    next();
  }
};

export default guestMiddleware;
