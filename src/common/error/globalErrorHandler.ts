import { StatusCodes } from 'http-status-codes';
// Global Error Handler
import { NextFunction, Request, Response } from 'express';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    return res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: err.message,
        cause: err.cause,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });



};
