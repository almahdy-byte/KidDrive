import { NextFunction } from "express";
import { AppError, ApplicationStatus, asyncErrorHandler, IRequest, Role, uploadFiles } from "../../common";
import { userRepo, vehicleRepo } from "../../db";
import { StatusCodes } from "http-status-codes";
import mongoose, { Types } from "mongoose";


export const createVehicle = asyncErrorHandler(
  async (req: IRequest, res: Response, next: NextFunction) => {

        const { driverId } = req.params;
        const driver = await userRepo.findOne({
            filter: {
                _id: req.user?._id || driverId,
                role: Role.Driver,
                isApprovedDriver: true,
            }
        });

        if (!driver) {
            return next(new AppError("Driver not found or not approved", StatusCodes.NOT_FOUND));
        }

        const existingVehicle = await vehicleRepo.findOne({
            filter: {
                driver: req.user?._id,
                plateNumber: req.body.plateNumber,
    
            },
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
        const documents = await uploadFiles({
            files: req.files as [],
            path: `driver/${req.user?._id}/vehicle/${req.body.plateNumber}`,
        });

        const vehicle = await vehicleRepo.create({
            driver: driver._id,
            carModel: req.body.carModel,
            plateNumber: req.body.plateNumber,
            carColor: req.body.carColor,
            governmentDocuments: documents as { public_id: string; secure_url: string }[],
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
                _id: vehicleId,
                driver: driverId,
                status: ApplicationStatus.PENDING,
            },
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
              _id: driverId,
              role: Role.Driver,
            },
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

