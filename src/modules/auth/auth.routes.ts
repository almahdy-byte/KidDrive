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
    "/verify-email",
     validate(authValidation.verifyOTPSchema),
     authService.verifyOTP 
    );
router.post(
    "/login",
    validate(authValidation.loginSchema),
    authService.login
);


router.post(
    "/refresh-token",
    validate(authValidation.refreshSchema),
    authService.refreshToken)
    ;
router.post(
    "/resend-email-otp",
     validate(authValidation.resendOtpSchema),
     authService.resetOtp
    );

router.post(
    "/forget-password",
    validate(authValidation.forgetPasswordSchema),
    authService.forgetPassword
);
router.post(
    "/verify-reset-otp",
    validate(authValidation.verifyResetOtpSchema),
    authService.verifyResetPasswordOTP
);
router.post(
    "/reset-password",
    validate(authValidation.resetPasswordSchema),
    authService.resetPassword
);

export default router;  
