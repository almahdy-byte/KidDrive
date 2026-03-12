import Joi from "joi";
import { generalValidationSchema } from "../../middleware/validation.middleware";

export const createChatRoomSchema = Joi.object({
  driverId: generalValidationSchema.id.required(),
});

export const sendMessageSchema = Joi.object({
  chatRoomId: generalValidationSchema.id.required(),
  text: Joi.string().min(1).max(1000).required(),
});

export const getMessagesSchema = Joi.object({
  chatRoomId: generalValidationSchema.id.required(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});
