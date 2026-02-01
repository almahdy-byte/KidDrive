import { NextFunction, Request, Response } from "express"
import { AppError, IError } from "./error.type"
import { StatusCodes } from "http-status-codes"

export const asyncErrorHandler=(fun : Function)=> {
    return async(req:Request,res:Response,next:NextFunction)=>{
        
        await fun(req , res , next)
        .catch((err:IError)=>next(new AppError(err.message+"" ,StatusCodes.INTERNAL_SERVER_ERROR)))
    }
}

export const notFoundHandler = (req:Request , res:Response , next:NextFunction)=>{
    return next(new AppError("Page Not Found" , StatusCodes.NOT_FOUND))
}
