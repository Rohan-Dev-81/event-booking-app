import express from "express";
import { loginController, registerController, verifyOtpController } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post("/verify-otp", verifyOtpController);

export default authRouter;