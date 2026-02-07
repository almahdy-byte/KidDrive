import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncErrorHandler, AppError,  IRequest, Role, hash } from "../../common";
import { childRepo, userRepo } from "../../db";
import { Types } from "mongoose";


export const addChild = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const parentId = req.user?._id;

    if (!parentId) {
      return next(
        new AppError("User not authenticated", StatusCodes.UNAUTHORIZED),
      );
    }

    const parent = await userRepo.findOne({
      filter: { _id: parentId, role: Role.Parent },
    });

    if (!parent) {
     return next(
       new AppError("Parent not found", StatusCodes.NOT_FOUND),
     );
    }


    const childData = {
      ...req.body,
      parent: parentId,
    };

    const existingChild = await childRepo.findOne({
      filter: {
        parentId: parentId,
        name: childData.name,
        isDeleted: false
      }
    });

    if (existingChild) {
      return next(
        new AppError("Child with the same name already exists", StatusCodes.CONFLICT),
      );
    }
    const newChild = await childRepo.create(childData);

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
    const parentId = req.user?._id;

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
    
    const children = await childRepo.findAll({
      filter: { parent: parentId, isDeleted: false },
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      status: "success",
      results: children.length,
      data: children,
    });
  },
);

export const getSingleChild = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const parentId = req.user?._id;
    const { childId } = req.params as unknown as { childId: Types.ObjectId };

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


    const child = await childRepo.findOne({
      filter: {
        _id: childId,
        parent: parentId,
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
    
    const updatedChild = await childRepo.findOneAndUpdate({
      filter: {
        _id: childId,
        parent: parentId,
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
    const parentId = req.user?._id;
    const { childId } = req.params as unknown as { childId: Types.ObjectId };

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
 

    const deletedChild = await childRepo.findOneAndUpdate({
      filter: {
        _id: childId,
        parent: parentId,
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
        parent: parentId,
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
