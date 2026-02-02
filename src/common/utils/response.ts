import { Response } from "express";

interface SuccessResponseOptions {
  res: Response;
  message: string;
  data?: any;
  statusCode?: number;
}

export const successResponse = ({
  res,
  message,
  data,
  statusCode = 200,
}: SuccessResponseOptions) => {
  return res.status(statusCode).json({
    status: "success",
    success: true,
    message,
    ...(data && { data }),
  });
};
