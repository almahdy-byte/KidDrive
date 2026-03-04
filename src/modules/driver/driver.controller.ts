import { NextFunction } from "express";
import { AppError, ApplicationStatus, asyncErrorHandler, IRequest, Role, uploadFiles } from "../../common";
import { driverApplicationRepo, userRepo } from "../../db";
import { StatusCodes } from "http-status-codes";
import mongoose, { Types } from "mongoose";


export const apply = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        
        const existingApplication = await driverApplicationRepo.findOne({
            filter: {
                user: req.user?._id,
                status: ApplicationStatus.PENDING,
        
            },
        });

        if (existingApplication) {
         return next(
           new AppError("You already have a pending application", StatusCodes.BAD_REQUEST),
         );
    }

        if (!req.files) {
            return next(new AppError("Images are required", StatusCodes.BAD_REQUEST));
        }
        const attachments = await uploadFiles({
            files: req.files as {
                [fieldname: string]: Express.Multer.File[];
            },
            path: `driver/${req.user?._id}/application`,
        });


        const application = await driverApplicationRepo.create({
            user: req.user?._id,
            licenseImage: {
                public_id: attachments["licenseImage"]?.public_id || "",
                secure_url: attachments["licenseImage"]?.secure_url || "",
            },
            carImage: {
                public_id: attachments["carImage"]?.public_id || "",
                secure_url: attachments["carImage"]?.secure_url || "",
            },
            nationalIdImage: {
                public_id: attachments["nationalIdImage"]?.public_id || "",
                secure_url: attachments["nationalIdImage"]?.secure_url || "",
            },
        });

    return res.status(StatusCodes.CREATED).json({
      message: "Application submitted successfully",
      success: true,
      status: "success",
      data: application,
    });
  },
);

export const approveApplication = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { applicationId } = req.params;
        
        const application = await driverApplicationRepo.findOne({
            filter: {
                _id: applicationId,
                status: ApplicationStatus.PENDING,
            },
        });

        if (!application) {
            return next(new AppError("Application not found", StatusCodes.NOT_FOUND));
        }

        const driApp = await driverApplicationRepo.updateOne({
            filter: { _id: application._id },
            update: { status: ApplicationStatus.APPROVED },
        });

        const driver = await userRepo.updateOne({
          filter: {
            _id: application.user as Types.ObjectId,
          },
            update: {
                $unset: { children: " " },
                role: Role.Driver,
                isApprovedDriver: true,
            },
        });
        

       return  res.status(StatusCodes.OK).json({
            message: "Driver approved successfully",
            data: driver,
        });
    });

