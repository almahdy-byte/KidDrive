import Joi from "joi";
import { generalValidationSchema } from "../../middleware/validation.middleware";

export const updateProfileSchema = Joi.object({
    firstName: Joi.string().min(3).max(30),
    lastName: Joi.string().min(3).max(30),
    phone: Joi.string(),
    // Add other fields that can be updated by user
});

export const getProfileSchema = Joi.object({
});