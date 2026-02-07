import Joi from "joi";
import { Types } from "mongoose";

const objectId = (value: string, helpers: any) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId");
  }
  return value;
};

export const addChildSchema = {
    body: Joi.object({
        name: Joi.string().trim().min(2).max(50).required(),
        age: Joi.number().integer().min(0).max(18).required(),
        gender: Joi.string().valid("male", "female").optional(),
        photo: Joi.string().uri().optional(),
    }),
    params: Joi.object({
        parentId: Joi.string().custom(objectId).required(),
    }),
};

export const getChildrenSchema = {
  params: Joi.object({
    parentId: Joi.string().custom(objectId).required(),
  }),
};

export const getSingleChildSchema = {
  params: Joi.object({
      childId: Joi.string().custom(objectId).required(),
      parentId: Joi.string().custom(objectId).required(),
  }),
};

export const updateChildSchema = {
  params: Joi.object({
    childId: Joi.string().custom(objectId).required(),
  }),

  body: Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    age: Joi.number().integer().min(0).max(18).required(),
    gender: Joi.string().valid("male", "female").optional(),
    photo: Joi.string().uri().optional(),
  }).min(1),
};


