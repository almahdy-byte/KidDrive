import Joi from "joi";
import { generalValidationSchema } from "../../middleware/validation.middleware";

export const updateProfileSchema = Joi.object({
    firstName: Joi.string().min(3).max(30),
    lastName: Joi.string().min(3).max(30),
    phone: Joi.string(),
    location: {
        latitude: Joi.number(),
        longitude: Joi.number(),
        address: Joi.string(),
        city: Joi.string(),
        department: Joi.string(),
    },
});

export const getProfileSchema = Joi.object({
});