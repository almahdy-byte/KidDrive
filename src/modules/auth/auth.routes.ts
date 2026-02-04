import { Router } from "express";
import * as authService from "./auth.controller";
import Joi from "joi";
import { validate } from "../../middleware/validation.middleware";
import * as authValidation from './auth.validation'

const router = Router();


router.post(
    "/register",
    validate(authValidation.registerSchema),
    authService.register
);
router.post(
    "/verify-otp",
     validate(authValidation.verifyOTPSchema),
     authService.verifyOTP 
    );
router.post(
    "/login",
     validate(authValidation.loginSchema),
      authService.login
    );

    
router.post(
    "/refresh",
     validate(authValidation.resendOtpSchema),
     authService.refreshToken)
    ;
router.post(
    "/resend-otp",
     validate(authValidation.resendOtpSchema),
     authService.resetOtp
    );

export default router;  
