import { Request, Response, NextFunction } from "express";
import Joi, { ObjectSchema, Schema } from "joi";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../common";
import { Types } from "mongoose";

// export const validate = (schema: ObjectSchema) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const data = {
//       ...req.body,
//       ...req.params,
//       ...req.query,
//     };

//     const { error } = schema.validate(data, {
//       abortEarly: false,
//     });

//     if (error) {
//       const lang = req.headers["lang"] as string;
//       if (lang === "ar") {
//         const arabicErrors = error.details
//           .map((detail) => {
//             let message = detail.message;
//             switch (detail.type) {
//               case "any.required":
//                 message = ` ${detail.context?.label} حقل مطلوب`;
//                 break;
//               case "string.empty":
//                 message = ` ${detail.context?.label} حقل لا يمكن أن يكون فارغاً`;
//                 break;
//               case "string.email":
//                 message = `${detail.context?.label} البريد الإلكتروني غير صالح`;
//                 break;
//               case "string.base":
//                 message = `${detail.context?.label}حقل يجب أن يكون نصاً`;
//                 break;
//               case "string.min":
//                 message = `${detail.context?.label}حقل يجب أن يحتوي على ${detail.context?.limit} أحرف على الأقل`;
//                 break;
//               case "string.max":
//                 message = `${detail.context?.label}حقل يجب أن لا يتجاوز ${detail.context?.limit} أحرف`;
//                 break;
//               case "number.base":
//                 message = `${detail.context?.label}حقل يجب أن يكون رقماً`;
//                 break;
//               case "number.min":
//                 message = `${detail.context?.label}حقل يجب أن لا يقل عن ${detail.context?.limit}`;
//                 break;
//               case "number.max":
//                 message = `${detail.context?.label}حقل يجب أن لا يزيد عن ${detail.context?.limit}`;
//                 break;
//               case "any.only":
//                 message = `${detail.context?.label}حقل يجب أن يكون أحد القيم التالية: ${detail.context?.valids.join(
//                   ", "
//                 )}`;
//                 break;
//               case "string.pattern.base":
//                 const label = detail.context?.label || "";
//                 if (label.endsWith("AR")) {
//                   message = `${detail.context?.label}حقل ${label} يجب أن يحتوي على حروف عربية ومسافات فقط`;
//                 } else if (label.endsWith("EN")) {
//                   message = `${detail.context?.label}حقل ${label} يجب أن يحتوي على حروف إنجليزية ومسافات فقط`;
//                 } else if (label === "firstName" || label === "lastName") {
//                   message = `${detail.context?.label}حقل ${label} يجب أن يحتوي على حروف (عربية أو إنجليزية) فقط بدون أرقام أو رموز`;
//                 } else if (label === "phone" || label === "parentPhone") {
//                   message = "رقم الهاتف غير صالح";
//                 } else {
//                   message = `${detail.context?.label}تنسيق حقل ${label} غير صالح`;
//                 }
//                 break;
//               case "any.invalid":
//                 if (detail.context?.label === "parentPhone") {
//                   message = "رقم ولي الأمر لا يمكن أن يكون نفس رقم الهاتف";
//                 } else if (detail.context?.label === "id") {
//                   message = "معرف غير صالح";
//                 } else {
//                   message = `${detail.context?.label}قيمة حقل ${detail.context?.label} غير صالحة`;
//                 }
//                 break;
//             }
//             // If the message was already customized (e.g. in schema definition), it might not match above types exactly or we might want to preserve it if it's already arabic.
//             // However, detail.message represents the *rendered* message.
//             // If we defined a custom message in Joi schema using .messages(), Joi returns that.
//             // We should check if we have a custom message that is likely Arabic, or just rely on type.
//             // But here we are overriding standard English messages.
//             // If the schema provided a custom message, usually it is preferred.
//             // Let's rely on type mapping ONLY if standard message is returned or we want to force Arabic.
//             // But wait, if the schema has .messages({'any.required': '...arabic...'}), detail.message will be that arabic string.
//             // If we override it here blindly, we might overwrite a specific custom message.
//             // BUT, currently most schemas don't have custom arabic messages for required fields.
//             // A safer approach: Only translate known types if the message looks English (ASCII).
//             if (/^[\x00-\x7F]*$/.test(detail.message)) {
//               return message;
//             }
//             return detail.message;
//           })
//           .join(", ");

//         return next(new AppError(arabicErrors, StatusCodes.BAD_REQUEST));
//       }

//       return next(
//         new AppError(
//           error.details.map((detail) => detail.message).join(", "),
//           StatusCodes.BAD_REQUEST
//         )
//       );
//     }

//     next();
//   };
// };



/**
 * Joi Validation Middleware
 */
export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {

    // If the schema is expecting an array and body is an array, validate it directly
    // Otherwise, merge all request data (body, params, query)
    let data;
    if (schema.type === 'array' && Array.isArray(req.body)) {
      data = req.body;
    } else {
      data = {
        ...req.body,
        ...req.params,
        ...req.query,
        ...req.file,
        ...req.files,
      };
    }

    // Validate data against schema
    const { error } = schema.validate(data, {
      abortEarly: false,
    });

    // If no error, proceed to next middleware
    if (!error) return next();




    return next(
      new AppError(error.details.map((detail) => detail.message).join(", "), StatusCodes.BAD_REQUEST)
    );
    next();
  };
};


// General Validation Schema
export const generalValidationSchema = {
  id: Joi.string().custom((value, helpers) => {
    if (!Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }),
  email: Joi.string().email(),
  firstName: Joi.string().min(3).max(30),
  lastName: Joi.string().min(3).max(30),
  password: Joi.string(),
  phone: Joi.string(),
  role: Joi.string(),
  code: Joi.string().length(6),
  file: {
    fieldname: Joi.string(),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string(),
    finalPath: Joi.string(),
    destination: Joi.string(),
    filename: Joi.string(),
    path: Joi.string(),
    size: Joi.number().positive(),
  },
};
