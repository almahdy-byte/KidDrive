import Joi from "joi";
import { generalValidationSchema } from "../../middleware/validation.middleware";
import { Status, SubscriptionType } from "../../common";

const locationValidation = Joi.object({
  latitude: Joi.number().required().min(-90).max(90),
  longitude: Joi.number().required().min(-180).max(180),
  address: Joi.string().required(),
});

const scheduleItemValidation = Joi.object({
  dayOfWeek: Joi.number().integer().min(0).max(6).required()
    .messages({
      "number.min": "Day of week must be between 0 (Sunday) and 6 (Saturday)",
      "number.max": "Day of week must be between 0 (Sunday) and 6 (Saturday)",
    }),
  pickupTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.pattern.base": "Pickup time must be in HH:MM format (24-hour)",
    }),
  dropoffTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.pattern.base": "Dropoff time must be in HH:MM format (24-hour)",
    }),
});

export const createSubscription = Joi.object({
  driverId: generalValidationSchema.id.required(),
  parentId: generalValidationSchema.id.required(),
  childId: generalValidationSchema.id.required(),
  expiryDate: Joi.date()
    .iso()
    .greater("now")
    .optional()
    .messages({
      "date.greater": "Expiry date must be in the future",
    }),
  subscriptionType: Joi.string()
    .valid(...Object.values(SubscriptionType))
    .required(),
  schedule: Joi.array()
    .items(scheduleItemValidation)
    .min(1)
    .required()
    .messages({
      "array.min": "At least one schedule day is required",
    }),
  origin: locationValidation.required(),
  destination: locationValidation.required(),
});

export const updateSubscriptionStatus = Joi.object({
  status: Joi.string()
    .valid(...Object.values(Status))
    .required(),
});

export const generateTripsFromSubscription = Joi.object({
  daysAhead: Joi.number().integer().min(1).max(365).optional()
    .messages({
      "number.min": "Days ahead must be at least 1",
      "number.max": "Days ahead cannot exceed 365",
    }),
});

export const getSubscriptionById = Joi.object({
  id: generalValidationSchema.id.required(),
});

import { paginationValidation } from "../../common";

export const getSubscriptionsByDriver = Joi.object({
  driverId: generalValidationSchema.id.required(),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
}).concat(paginationValidation.query);

export const getSubscriptionsByParent = Joi.object({
  parentId: generalValidationSchema.id.required(),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
}).concat(paginationValidation.query);

export const getSubscriptionsByChild = Joi.object({
  childId: generalValidationSchema.id.required(),
  status: Joi.string()
    .valid(...Object.values(Status))
    .optional(),
}).concat(paginationValidation.query);

export const getAllSubscriptions = paginationValidation.query;
export const getPendingSubscriptions = paginationValidation.query;
export const getMySubscriptions = paginationValidation.query;
