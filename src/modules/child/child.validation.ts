import Joi from "joi";
import { generalValidationSchema } from "../../middleware/validation.middleware";

export const getChildById = Joi.object({
  id: generalValidationSchema.id.required(),
});
