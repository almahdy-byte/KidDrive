import { generalValidationSchema } from "../../middleware/validation.middleware";
import Joi from "joi";
export const registerSchema = Joi.object({
  firstName: generalValidationSchema.firstName.required(),
  lastName: generalValidationSchema.lastName.required(),
  email: generalValidationSchema.email.required(),
  password: generalValidationSchema.password.required(),
  role: generalValidationSchema.role.optional(),
  phone: generalValidationSchema.phone.required(),
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
