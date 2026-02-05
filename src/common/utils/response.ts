import { Response } from "express";

interface SuccessResponseOptions {
  res: Response;
  message: string;
  data?: any;
  statusCode?: number;
}


