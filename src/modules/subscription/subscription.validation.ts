import Joi from "joi";
import { generalValidationSchema } from "../../middleware/validation.middleware";
import { Status, SubscriptionType } from "../../common";

export const createSubscription = Joi.object({
  driverId: generalValidationSchema.id.required(),
  parentId: generalValidationSchema.id.required(),
  childId: generalValidationSchema.id.required(),
  expiryDate: Joi.date()
    .iso()
    .greater("now")
    .required()
    .messages({
      "date.greater": "Expiry date must be in the future",
      "any.required": "Expiry date is required",
    }),
  subscriptionType: Joi.string()
    .valid(...Object.values(SubscriptionType))
    .required(),
});

export const updateSubscriptionStatus = Joi.object({
  status: Joi.string()
    .valid(...Object.values(Status))
    .required(),
});

export const getSubscriptionById = Joi.object({
  id: generalValidationSchema.id.required(),
});

export const getSubscriptionsByDriver = Joi.object({
  driverId: generalValidationSchema.id.required(),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
});

export const getSubscriptionsByParent = Joi.object({
  parentId: generalValidationSchema.id.required(),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
});

export const getSubscriptionsByChild = Joi.object({
  childId: generalValidationSchema.id.required(),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
});
