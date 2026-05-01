import Joi from "joi";
import { generalValidationSchema } from "../../middleware/validation.middleware";

export const getChildById = Joi.object({
  id: generalValidationSchema.id.required(),
});

export const createChild = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().integer().min(1).max(18).required(),
  gender: Joi.string().valid("Male", "Female").optional(),
  school: Joi.string().optional(),
  schoolAddress: Joi.string().optional(),
  schoolLatitude: Joi.number().optional(),
  schoolLongitude: Joi.number().optional(),
  arriveTime: Joi.string().optional(),
  backHome: Joi.string().optional(),
}).unknown(true); // Allow unknown fields for file upload
