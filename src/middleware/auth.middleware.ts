import { StatusCodes } from "http-status-codes";
import { AppError, asyncErrorHandler, decodedToken,  IRequest, Payload, Role, SubscriptionType, TokenType } from "../common";
import { NextFunction, Request, Response } from "express";
import { driverRepo, userRepo } from "../db";


export const auth = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {

    const { authorization } = req.headers;
    if (!authorization) {
      return next(new AppError("unathorized", StatusCodes.UNAUTHORIZED));
    }

    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer" || !token) {
      return next(new AppError("unathorized", StatusCodes.UNAUTHORIZED));
    }

    let decoded: Payload;

    try {
      decoded = await decodedToken(token, TokenType.Access, next);
    } catch (error: any) {
      // ✅ JWT Expired
      if (error?.name === "TokenExpiredError") {
        return next(
          new AppError(
            'access token expired',
            StatusCodes.UNAUTHORIZED
          )
        );
      }

      return next(
        new AppError("unathorized", StatusCodes.UNAUTHORIZED)
      );
    }

    if (!decoded) {
      return next(new AppError("unathorized", StatusCodes.UNAUTHORIZED));
    }

    let user: any;
    switch (decoded.role) {
      case Role.Admin:
        user = await userRepo.findOne({
          filter: {
            _id: decoded._id,
            role: decoded.role,
          },
          select:"-password"
        });
        break;
      case Role.Driver:
        user = await driverRepo.findOne({
          filter: {
            _id: decoded._id,
          },
          select:"-password"
        });
        break;
      default:
        return next(new AppError("unathorized", StatusCodes.UNAUTHORIZED));
    }
    
    if (user?.changeCredentialTime && decoded.changeCredentialTime && user?.changeCredentialTime.getTime() > Number(decoded.changeCredentialTime)) {
      return next(new AppError("Forbidden" , StatusCodes.FORBIDDEN))
    }
    if (!user) {
      return next(new AppError("unathorized", StatusCodes.UNAUTHORIZED));
    }
   
    
    req.user = user;
    next();
  }
);

export const roleGuard = (roles:Role[] = [ Role.Admin ]) =>{
        return (req:IRequest , res:Response , next:NextFunction) =>{ 
        
        //Check Role
        if (!roles.includes(req.user?.role as Role)) {
            return next(new AppError("Forbidden" , StatusCodes.FORBIDDEN))
        
        }
        
        next();
    }
}