import { NextFunction, Response } from "express";
import { AppError, ApplicationStatus, asyncErrorHandler, IRequest, Role, uploadFiles, cloud } from "../../common";
import { userRepo, vehicleRepo } from "../../db";
import { StatusCodes } from "http-status-codes";
import mongoose, { Types } from "mongoose";


export const createVehicle = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {

        const { driverId } = req.params;
        const driver = await userRepo.findOne({
            filter: {
                _id: req.user?._id ? new mongoose.Types.ObjectId(req.user._id.toString()) : new mongoose.Types.ObjectId(Array.isArray(driverId) ? driverId[0] : driverId),
                role: Role.Driver,
                isApprovedDriver: true,
            } as any
        });

        if (!driver) {
            return next(new AppError("Driver not found or not approved", StatusCodes.NOT_FOUND));
        }

        const existingVehicle = await vehicleRepo.findOne({
            filter: {
                driver: req.user?._id ? new mongoose.Types.ObjectId(req.user._id.toString()) : undefined,
                plateNumber: req.body.plateNumber,
            } as any
        });

    if (existingVehicle) {
      return next(
        new AppError(
          "This vehicle already exist",
          StatusCodes.BAD_REQUEST,
        ),
      );
    }

    if (!req.files) {
      return next(new AppError("documents are required", StatusCodes.BAD_REQUEST));
    }

    // Check Cloudinary configuration
    if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
        return next(new AppError("Cloudinary configuration is missing", StatusCodes.INTERNAL_SERVER_ERROR));
    }

    const files = [...(req.files as Express.Multer.File[])];
    let governmentDocuments = [];
    
    for(const file of files){
       const {public_id, secure_url} = await cloud().uploader.upload(file.path);
       if(file.fieldname === "documents") {
           governmentDocuments.push({public_id, secure_url});
       }
    }

    if (governmentDocuments.length === 0) {
        return next(new AppError("At least one document is required", StatusCodes.BAD_REQUEST));
    }

        const vehicle = await vehicleRepo.create({
            driver: driver._id,
            carModel: req.body.carModel,
            plateNumber: req.body.plateNumber,
            carColor: req.body.carColor,
            governmentDocuments: governmentDocuments,
        });

      

    return res.status(StatusCodes.CREATED).json({
      message: "Vehicle submitted successfully",
      success: true,
      status: "success",
      data: vehicle,
    });
  },
);

export const approveVehicle = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {
        const { driverId, vehicleId } = req.params;
       
        const vehicle = await vehicleRepo.findOne({
            filter: {
                _id: new mongoose.Types.ObjectId(Array.isArray(vehicleId) ? vehicleId[0] : vehicleId),
                driver: new mongoose.Types.ObjectId(Array.isArray(driverId) ? driverId[0] : driverId),
                status: ApplicationStatus.PENDING,
            } as any
        });

    if (!vehicle) {
      return next(new AppError("Vehicle not found", StatusCodes.NOT_FOUND));
    }

        await vehicleRepo.updateOne({
            filter: { _id: vehicle._id },
            update: { status: ApplicationStatus.APPROVED },
        });

          await userRepo.updateOne({
            filter: {
              _id: new mongoose.Types.ObjectId(Array.isArray(driverId) ? driverId[0] : driverId),
              role: Role.Driver,
            } as any,
            update: {
              vehicles: vehicle._id,
            },
          });

    return res.status(StatusCodes.OK).json({
      message: "Driver approved successfully",
      data: vehicle,
    });
  },
);

