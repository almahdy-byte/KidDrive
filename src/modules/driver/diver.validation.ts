import Joi, { func } from "joi"
import { generalValidationSchema } from "../../middleware/validation.middleware";
import { FileType, ImageType, paginationValidation } from "../../common";
import { objectId } from "../parent/parent.validation";


        
export const fileSchema = function ({
  fieldname,
  fileType,
}: {
  fieldname: string;
  fileType: string[];
}) {
  return Joi.object()
    .keys({
      fieldname: generalValidationSchema.file.fieldname
        .valid(fieldname)
        .required(),
      originalname: generalValidationSchema.file.originalname.required(),
      encoding: generalValidationSchema.file.encoding.required(),
      mimetype: generalValidationSchema.file.mimetype
        .valid(...fileType)
        .required(),
      destination: generalValidationSchema.file.destination.required(),
      filename: generalValidationSchema.file.filename.required(),
      path: generalValidationSchema.file.path.required(),
      size: generalValidationSchema.file.size.required(),
    })
    .required();
};
export const apply = Joi.object({
  // licenseImage: Joi.array()
  //   .items(fileSchema({ fieldname: "licenseImage", fileType: ImageType }))
  //   .min(1)
  //   .required(),
  // carImage: Joi.array()
  //   .items(fileSchema({ fieldname: "carImage", fileType: ImageType }))
  //   .min(1)
  //   .required(),
  // nationalIdImage: Joi.array()
  //   .items(fileSchema({ fieldname: "nationalIdImage", fileType: ImageType }))
  //   .min(1)
  //   .required(),
  carModel: Joi.string().required(),
  plateNumber: Joi.string().required(),
  carColor: Joi.string().required(),
  // governmentDocuments: Joi.array().items(
  //   fileSchema({ fieldname: "governmentDocuments", fileType: FileType })
  // ).min(1).required(),
  nationalId: Joi.string().required(),
  userName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().required(),
  city: Joi.string().required(),
  department: Joi.string().required(),
}).unknown(true); // Allow unknown fields to prevent validation errors

export const approveApplication = Joi.object({
    applicationId: Joi.string().custom(objectId).required(),
});

export const login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const updateProfile = Joi.object({
    userName: Joi.string().optional(),
    email: Joi.string().email().optional(),
}).min(1);

export const updateVehicle = Joi.object({
    carModel: Joi.string().optional(),
    plateNumber: Joi.string().optional(),
    carColor: Joi.string().optional(),
    governmentDocuments: Joi.array().items(
        fileSchema({ fieldname: "governmentDocuments", fileType: FileType })
    ).optional(),
}).min(1);

export const getAllDrivers = Joi.object({
    city: Joi.string().optional(),
    department: Joi.string().optional(),
}).concat(paginationValidation.query);

export const getDriversNearParent = paginationValidation.query;

export const rateDriver = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
});

export const getDriverById = Joi.object({
    driverId: Joi.string().custom(objectId).required(),
});

