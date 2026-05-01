import Joi from "joi";
import { generalValidationSchema } from "../../middleware/validation.middleware";
import { paginationValidation } from "../../common";

const locationValidation = Joi.object({
  latitude: Joi.number().required().min(-90).max(90),
  longitude: Joi.number().required().min(-180).max(180),
  address: Joi.string().required(),
});

export const createTrip = Joi.object({
  driverId: generalValidationSchema.id.required(),
  parentId: generalValidationSchema.id.required(),
  childId: generalValidationSchema.id.required(),
  subscriptionId: generalValidationSchema.id.required(),
  origin: locationValidation.required(),
  destination: locationValidation.required(),
  tripType: Joi.string().valid('pickup', 'dropoff').optional(),
  scheduledDate: Joi.date().iso().optional(),
  scheduledTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      "string.pattern.base": "Scheduled time must be in HH:MM format (24-hour)",
    }),
});

export const updateTripStatus = Joi.object({
  status: Joi.string()
    .valid('child_boarded', 'child_dropped_off', 'trip_started', 'trip_finished')
    .required(),
});

export const getTripById = Joi.object({
  id: generalValidationSchema.id.required(),
});

export const getTripsByDriver = Joi.object({
  driverId: generalValidationSchema.id.required(),
  status: Joi.string()
    .valid('child_boarded', 'child_dropped_off', 'trip_started', 'trip_finished')
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
}).concat(paginationValidation.query);

export const getTripsByParent = Joi.object({
  parentId: generalValidationSchema.id.required(),
  status: Joi.string()
    .valid('child_boarded', 'child_dropped_off', 'trip_started', 'trip_finished')
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
}).concat(paginationValidation.query);

export const getTripsByChild = Joi.object({
  childId: generalValidationSchema.id.required(),
  status: Joi.string()
    .valid('child_boarded', 'child_dropped_off', 'trip_started', 'trip_finished')
    .optional(),
}).concat(paginationValidation.query);

export const getTripsBySubscription = Joi.object({
  subscriptionId: generalValidationSchema.id.required(),
  status: Joi.string()
    .valid('child_boarded', 'child_dropped_off', 'trip_started', 'trip_finished')
    .optional(),
}).concat(paginationValidation.query);

export const getDriverTripsFromSubscriptions = Joi.object({
  driverId: generalValidationSchema.id.required(),
  day: Joi.number().integer().min(0).max(6).optional()
    .messages({
      "number.min": "Day must be between 0 (Sunday) and 6 (Saturday)",
      "number.max": "Day must be between 0 (Sunday) and 6 (Saturday)",
    }),
  date: Joi.date().iso().optional(),
}).concat(paginationValidation.query);

export const getParentTripsFromSubscriptions = Joi.object({
  parentId: generalValidationSchema.id.required(),
  day: Joi.number().integer().min(0).max(6).optional()
    .messages({
      "number.min": "Day must be between 0 (Sunday) and 6 (Saturday)",
      "number.max": "Day must be between 0 (Sunday) and 6 (Saturday)",
    }),
  date: Joi.date().iso().optional(),
}).concat(paginationValidation.query);

export const generateTripsFromSubscription = Joi.object({
  subscriptionId: generalValidationSchema.id.required(),
  daysAhead: Joi.number().integer().min(1).max(365).optional()
    .messages({
      "number.min": "Days ahead must be at least 1",
      "number.max": "Days ahead cannot exceed 365",
    }),
});

export const getAllTrips = Joi.object({
  status: Joi.string()
    .valid('child_boarded', 'child_dropped_off', 'trip_started', 'trip_finished')
    .optional(),
}).concat(paginationValidation.query);

export const getActiveTrips = paginationValidation.query;
