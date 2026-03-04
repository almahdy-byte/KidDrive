import Joi, { func } from "joi"
import { objectId } from "../child/child.validation";
import { generalValidationSchema } from "../../middleware/validation.middleware";
import { FileType, ImageType } from "../../common";


        
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
  licenseImage: Joi.array()
    .items(fileSchema({ fieldname: "licenseImage", fileType: ImageType }))
    .min(1)
    .required(),
  carImage: Joi.array()
    .items(fileSchema({ fieldname: "carImage", fileType: ImageType }))
    .min(1)
    .required(),
  nationalIdImage: Joi.array()
    .items(fileSchema({ fieldname: "nationalIdImage", fileType: ImageType }))
    .min(1)
    .required(),
});

export const approveApplication = Joi.object({
    applicationId: Joi.string().custom(objectId).required(),
});