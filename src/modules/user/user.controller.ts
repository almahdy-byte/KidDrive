import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncErrorHandler, AppError,  IRequest, Role, hash } from "../../common";
import { userRepo } from "../../db";

// Get Profile (Self)
export const getProfile = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const user = req.user;
        if (!user) {
            return next(new AppError("User not found", StatusCodes.NOT_FOUND));
        }
        return res.status(StatusCodes.OK).json({
            message: "Profile retrieved successfully",
            success: true,
            status: "success",
            data: user
        });
    }
);

// Update Profile (Self)
export const updateProfile = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const userId = req.user?._id;
        if (!userId) {
            return next(new AppError("User not authenticated", StatusCodes.UNAUTHORIZED));
        }

        const updateData = req.body;

        const updatedUser = await userRepo.findByIdAndUpdate({
            id: userId,
            update: updateData
        });

        if (!updatedUser) {
            return next(new AppError("User not found", StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            message: "Profile updated successfully",
            success: true,
            status: "success",
            data: updatedUser
        });
    }
);
