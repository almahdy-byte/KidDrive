import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncErrorHandler, AppError,  IRequest, Role, hash, decrypt } from "../../common";
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
        const  user= req.user;
        if (!user) {
            return next(new AppError("User not authenticated", StatusCodes.UNAUTHORIZED));
        }

        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.phone = req.body.phone || user.phone;


        await user.save();
        return res.status(StatusCodes.OK).json({
            message: "Profile updated successfully",
            success: true,
            status: "success",
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone && await decrypt(user.phone),
                email: user.email,
                role: user.role,
                isDeleted: user.isDeleted,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                fullName: user.fullName,
                _id:user._id,
            }
        });
    }
);
