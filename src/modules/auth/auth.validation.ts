import { generalValidationSchema } from "../../middleware/validation.middleware";
import Joi from "joi";
export const registerSchema = Joi.object({
  firstName: Joi.string().min(3).max(30).required(),
  lastName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("parent").required(),
  phone: Joi.string().required(),
});

export const verifyOTPSchema = Joi.object({
  email: generalValidationSchema.email.required(),
  code: generalValidationSchema.code.required(),
});

export const loginSchema = Joi.object({
  email: generalValidationSchema.email.required(),
  password: generalValidationSchema.password.required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const resendOtpSchema = Joi.object({
  email: generalValidationSchema.email.required(),
});
