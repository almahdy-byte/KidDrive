import Joi from "joi";
import { Types } from "mongoose";

export const objectId = (value: string, helpers: any) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId");
  }
  return value;
};


export const addChildSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  age: Joi.number().integer().min(0).max(18).required(),
  gender: Joi.string().valid("male", "female").optional(),
  photo: Joi.string().uri().optional(),
  parentId: Joi.string().custom(objectId).required(),
});

export const getChildrenSchema = Joi.object({
  parentId: Joi.string().custom(objectId).required(),
});

export const getSingleChildSchema = Joi.object({
  childId: Joi.string().custom(objectId).required(),
  parentId: Joi.string().custom(objectId).required(),
});

export const updateChildSchema =
  Joi.object({
    childId: Joi.string().custom(objectId).required(),
    name: Joi.string().trim().min(2).max(50).required(),
    age: Joi.number().integer().min(0).max(18).required(),
    gender: Joi.string().valid("male", "female").optional(),
    photo: Joi.string().uri().optional(),
  });

export const updateParentProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional(),
  lastName: Joi.string().trim().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  location: Joi.object({
    city: Joi.string().required(),
    department: Joi.string().required(),
  }).optional(),
}).min(1);


