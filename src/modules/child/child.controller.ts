import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { childRepo } from "../../db/models/childModel/child.repo";
import { AppError, IRequest, Role } from "../../common";

export const getChildById = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return next(new AppError("Invalid child ID", StatusCodes.BAD_REQUEST));
    }

    const child = await childRepo.findChildByIdWithParent(id);

    if (!child || child.isDeleted) {
      return next(new AppError("Child not found", StatusCodes.NOT_FOUND));
    }

    // Check permissions - allow if user is the parent, the driver of a subscription, or admin
    const userId = req.user?._id?.toString();
    const userRole = req.user?.role;

    // Allow access if:
    // 1. User is admin
    // 2. User is the parent of the child
    // 3. User is a driver (we'll assume they need access for subscriptions)
    const isParent = child.parentId._id?.toString() === userId || 
                     child.parentId.toString() === userId;
    const isAdmin = userRole === Role.Admin;
    const isDriver = userRole === Role.Driver;

    if (!isParent && !isAdmin && !isDriver) {
      return next(new AppError("Access denied", StatusCodes.FORBIDDEN));
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Child retrieved successfully",
      data: child,
    });
  } catch (error) {
    next(error);
  }
};

export const getChildBasicInfo = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return next(new AppError("Invalid child ID", StatusCodes.BAD_REQUEST));
    }

    const child = await childRepo.findChildById(id);

    if (!child || child.isDeleted) {
      return next(new AppError("Child not found", StatusCodes.NOT_FOUND));
    }

    // Return only basic info (name, age, photo)
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Child basic info retrieved successfully",
      data: {
        _id: child._id,
        name: child.name,
        age: child.age,
        photo: child.photo,
        gender: child.gender,
        school: child.school,
      },
    });
  } catch (error) {
    next(error);
  }
};
