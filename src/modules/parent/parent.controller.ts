import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncErrorHandler, AppError,  IRequest, Role, hash, getPaginationOptions, calculatePagination, createPaginatedResponse } from "../../common";
import { childRepo, userRepo } from "../../db";
import { Types } from "mongoose";

export const getParentById = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return next(new AppError("Invalid parent ID", StatusCodes.BAD_REQUEST));
    }

    const parent = await userRepo.findUserByIdWithChildren(id);

    if (!parent || parent.isDeleted || parent.role !== Role.Parent) {
      return next(new AppError("Parent not found", StatusCodes.NOT_FOUND));
    }

    // Check permissions
    const userId = req.user?._id?.toString();
    const userRole = req.user?.role;

    // Allow access if user is admin, the parent themselves, or a driver
    const isSelf = parent._id.toString() === userId;
    const isAdmin = userRole === Role.Admin;
    const isDriver = userRole === Role.Driver;

    if (!isSelf && !isAdmin && !isDriver) {
      return next(new AppError("Access denied", StatusCodes.FORBIDDEN));
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Parent retrieved successfully",
      data: {
        _id: parent._id,
        firstName: parent.firstName,
        lastName: parent.lastName,
        fullName: parent.fullName,
        email: parent.email,
        phone: parent.phone,
        location: parent.location,
        children: parent.children,
      },
    });
  }
);

export const getParentBasicInfo = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return next(new AppError("Invalid parent ID", StatusCodes.BAD_REQUEST));
    }

    const parent = await userRepo.findUserById(id, "firstName lastName fullName email phone");

    if (!parent || parent.isDeleted || parent.role !== Role.Parent) {
      return next(new AppError("Parent not found", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Parent basic info retrieved successfully",
      data: {
        _id: parent._id,
        firstName: parent.firstName,
        lastName: parent.lastName,
        fullName: parent.fullName,
        email: parent.email,
        phone: parent.phone,
      },
    });
  }
);


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
    const pagination = getPaginationOptions(req.query);
    
    const filter: any = { parentId: parentId, isDeleted: false };
    
    if (pagination.search) {
      filter.name = { $regex: pagination.search, $options: "i" };
    }
    
    const children = await childRepo.findAll({
      filter,
      page: pagination.page,
      limit: pagination.limit
    });

    const total = await childRepo.countDocuments(filter);
    const paginationResult = calculatePagination(pagination.page!, pagination.limit!, total, "children");
    const paginatedResponse = createPaginatedResponse(children, paginationResult);

    return res.status(StatusCodes.OK).json({
      success: true,
      status: "success",
      ...paginatedResponse
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
