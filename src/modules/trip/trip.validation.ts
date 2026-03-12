import Joi from "joi";
import { generalValidationSchema } from "../../middleware/validation.middleware";
import { paginationValidation } from "../../common";

export const createTrip = Joi.object({
  driverId: generalValidationSchema.id.required(),
  parentId: generalValidationSchema.id.required(),
  childId: generalValidationSchema.id.required(),
  subscriptionId: generalValidationSchema.id.required(),
  origin: Joi.object({
    latitude: Joi.number().required().min(-90).max(90),
    longitude: Joi.number().required().min(-180).max(180),
    address: Joi.string().required(),
  }).required(),
  destination: Joi.object({
    latitude: Joi.number().required().min(-90).max(90),
    longitude: Joi.number().required().min(-180).max(180),
    address: Joi.string().required(),
  }).required(),
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
}).concat(paginationValidation.query);

export const getTripsByParent = Joi.object({
  parentId: generalValidationSchema.id.required(),
  status: Joi.string()
    .valid('child_boarded', 'child_dropped_off', 'trip_started', 'trip_finished')
    .optional(),
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
});

export const getAllTrips = Joi.object({
  status: Joi.string()
    .valid('child_boarded', 'child_dropped_off', 'trip_started', 'trip_finished')
    .optional(),
}).concat(paginationValidation.query);

export const getActiveTrips = paginationValidation.query;
