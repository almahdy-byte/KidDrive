import { StatusCodes } from "http-status-codes";
import multer, { FileFilterCallback } from "multer";
import { AppError } from "../../../common/error";
import { IRequest } from "../../../common/utils/type";

export const ImageType = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp"
];

export const FileType = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",

  // PDF
  "application/pdf",

  // Word
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx

  // PowerPoint
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation" // .pptx
];


export type ImageMimeType = typeof ImageType[number];


export const uploadFile = (type: string[]) => {
  const storage = multer.diskStorage({
  });

  const fileFilter = (req: IRequest, file: any, cb: CallableFunction) => {
    if (type.includes(file.mimetype)) {
      return cb(null, true)
    }
    return cb(new AppError('invalid type', StatusCodes.BAD_GATEWAY), false);
  }

  const upload = multer({ storage, fileFilter });

  return upload;
};

export const uploadFiles = (types: readonly string[]) => {

  const storage = multer.diskStorage({
  });

  const fileFilter = (
    req: IRequest,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (types.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(
      new AppError("invalid file type", StatusCodes.BAD_REQUEST)
    );
  };

  return multer({ storage, fileFilter });
};
