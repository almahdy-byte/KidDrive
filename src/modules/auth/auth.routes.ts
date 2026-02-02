import { Router } from "express";
import * as authService from "./auth.controller";

const router = Router();

router.post("/register", authService.register);
router.post("/verify-otp", authService.verifyOTP);

export default router;  