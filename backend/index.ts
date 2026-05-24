import express, { Request, Response } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from "url";

dotenv.config({
  path: fileURLToPath(new URL(".env", import.meta.url)),
});

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Running✅");
});

import userRouter from "./src/routers/userRouts";
app.use("/auth", userRouter);

app.listen(3000, () => {
  console.log("Listening on PORT 3000");
});
