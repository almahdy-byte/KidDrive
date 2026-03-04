import Joi from "joi";
import { objectId } from "../child/child.validation";
import { fileSchema } from "../driver/diver.validation";
import { FileType } from "../../common";

export const createVehicle = Joi.object({
  driverId: Joi.string().custom(objectId).required(),
  carModel: Joi.string().trim().min(2).max(50).required(),
  plateNumber: Joi.string().pattern(new RegExp("^\\d{4}\\s[ء-ي]+$")).required(),
  carColor: Joi.string().trim().min(2).max(50).required(),
  files: Joi.array()
    .items(fileSchema({ fieldname: "documents", fileType: FileType }))
    .min(1)
    .max(3)
    .required(),
});

export const approveVehicle = Joi.object({
  driverId: Joi.string().custom(objectId).required(),
  vehicleId: Joi.string().custom(objectId).required(),
});