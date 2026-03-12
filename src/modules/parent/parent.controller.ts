import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncErrorHandler, AppError,  IRequest, Role, hash } from "../../common";
import { childRepo, userRepo } from "../../db";
import { Types } from "mongoose";


export const addChild = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const parentId = req.user?._id as Types.ObjectId;

    
    const childData = {
      ...req.body,
      parentId: parentId,
    };

    const existingChild = await childRepo.findOne({
      filter:{
        name: childData.name,
        parentId: parentId,
        isDeleted: false
      }
    });

    if (existingChild) {
      return next(
        new AppError("Child with the same name already exists", StatusCodes.CONFLICT),
      );
    }
    const newChild = await childRepo.create(childData);

    await userRepo.findOneAndUpdate({
      filter: {
        _id: parentId,
      },
      update: {
        $addToSet: { children: newChild._id },
      },
    });
    return res.status(StatusCodes.CREATED).json({
      message: "Child added successfully",
      success: true,
      status: "success",
      data: newChild,
    });
  },
);

export const getAllChildren = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const parentId = req.user?._id as Types.ObjectId;


    
    const children = await childRepo.findAll({
      filter: { parentId: parentId, isDeleted: false },
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      status: "success",
      results: children.length,
      data: children,
    });
  },
);

export const getChild = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const { childId } = req.params as unknown as { childId: Types.ObjectId };



    const parentId = req.user?._id as Types.ObjectId;
    const child = await childRepo.findOne({
      filter: {
        _id: childId,
        parentId: parentId,
        isDeleted: false
      },
    });

    if (!child) {
      return next(new AppError("Child not found", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      status: "success",
      data: child,
    });
  },
);

export const updateChild = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const parentId = req.user?._id;
    const { childId } = req.params as unknown as { childId: Types.ObjectId };

    
    const updatedChild = await childRepo.findOneAndUpdate({
      filter: {
        _id: childId,
        parentId: parentId,
        isDeleted: false,
      },
      update: req.body,
    });

    if (!updatedChild) {
      return next(new AppError("Child not found", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      message: "Child updated successfully",
      success: true,
      status: "success",
      data: updatedChild,
    });
  },
);

export const deleteChild = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {

    const { childId } = req.params as unknown as { childId: Types.ObjectId };
 

    const parentId = req.user?._id as Types.ObjectId;
    const deletedChild = await childRepo.findOneAndUpdate({
      filter: {
        _id: childId,
        parentId: parentId,
        isDeleted: false,
      },
      update: { isDeleted: true },
    });

    if (!deletedChild) {
      return next(new AppError("Child not found", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      message: "Child deleted successfully",
      success: true,
      status: "success",
    });
  },
);

export const restoreChild = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const parentId = req.user?._id;
    const { childId } = req.params;

    if (!parentId) {
      return next(
        new AppError("User not authenticated", StatusCodes.UNAUTHORIZED),
      );
    }

    const parent = await userRepo.findOne({
      filter: { _id: parentId, role: Role.Parent },
    });

    if (!parent) {
      return next(new AppError("Parent not found", StatusCodes.NOT_FOUND));
    }


    const restoredChild = await childRepo.findOneAndUpdate({
      filter: {
        _id: childId,
        parentId: parentId,
        isDeleted: true,
      },
      update: { isDeleted: false },
    });

    if (!restoredChild) {
      return next(new AppError("Child not found", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      message: "Child restored successfully",
      success: true,
      status: "success",
      data: restoredChild,
    });
  },
);

export const updateProfile = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const parentId = req.user?._id as Types.ObjectId;
    const { firstName, lastName, email, phone, location } = req.body;

    if (!parentId) {
      return next(new AppError("User not authenticated", StatusCodes.UNAUTHORIZED));
    }

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) {
      const existingUser = await userRepo.findOne({ filter: { email } });
      if (existingUser && existingUser._id.toString() !== parentId.toString()) {
        return next(new AppError("Email already exists", StatusCodes.BAD_REQUEST));
      }
      updateData.email = email;
    }
    if (phone) updateData.phone = phone;
    if (location) {
      updateData.location = {
        city: location.city,
        department: location.department,
      };
    }

    const updatedUser = await userRepo.findOneAndUpdate({
      filter: { _id: parentId },
      update: updateData,
    });

    if (!updatedUser) {
      return next(new AppError("User not found", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      message: "Profile updated successfully",
      success: true,
      status: "success",
      data: updatedUser,
    });
  },
);
