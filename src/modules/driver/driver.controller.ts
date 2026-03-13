import { NextFunction, Response } from "express";
import { AppError, ApplicationStatus, asyncErrorHandler, compare, createToken, encrypt, hash, IRequest, Role, uploadFiles, getPaginationOptions, calculatePagination, createPaginatedResponse, getSkipValue, cloud } from "../../common";
import { driverApplicationRepo, userRepo, vehicleRepo } from "../../db";
import { driverRepo } from "../../db/models/driverModel/driver.repo";
import { StatusCodes } from "http-status-codes";
import mongoose, { Types } from "mongoose";


export const apply = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        
        // Check if driver already exists by nationalId
        const existingDriver = await driverRepo.findByNationalId(req.body.nationalId);
        
        if (existingDriver) {
            const isExistingApplication = await driverApplicationRepo.findOne({ filter: { driver: existingDriver._id.toString() } });
            if (isExistingApplication) {
                return next(
                    new AppError("Driver with this national ID already has an application", StatusCodes.BAD_REQUEST)
                );
            }
        }

        // Validate location fields
        if (!req.body.city || !req.body.department) {
            return next(new AppError("City and department are required for driver application", StatusCodes.BAD_REQUEST));
        }

        const files = [...(req.files as Express.Multer.File[])];
        if (!files || files.length === 0) {
            return next(new AppError("Images are required", StatusCodes.BAD_REQUEST));
        }

        // Check Cloudinary configuration
        if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
            return next(new AppError("Cloudinary configuration is missing", StatusCodes.INTERNAL_SERVER_ERROR));
        }

        let licenseImage = null;
        let nationalIdImage = null;
        let governmentDocuments = null;
        for(const file of files){
           const {public_id, secure_url} = await cloud().uploader.upload(file.path);
           if(file.fieldname === "licenseImage") {
               licenseImage = {public_id, secure_url};
           } else if(file.fieldname === "nationalIdImage") {
               nationalIdImage = {public_id, secure_url};
           } else if(file.fieldname === "governmentDocuments") {
               governmentDocuments = {public_id, secure_url};
           }
        }

        let driver;
        
        if(!existingDriver){
        // Create driver
        const hashedPassword = await hash(req.body.password);
        const encryptedPhone = await encrypt(req.body.phone);
        driver = await driverRepo.create({
            userName: req.body.userName,
            email: req.body.email,
            nationalId: req.body.nationalId,
            licenseImage: {
                public_id: licenseImage?.public_id || "",
                secure_url: licenseImage?.secure_url || "",
            },
            nationalIdImage: {
                public_id: nationalIdImage?.public_id || "",
                secure_url: nationalIdImage?.secure_url || "",
            },
            role: Role.Driver,
            password: hashedPassword,
            phone: encryptedPhone,
            isApproved: false,
            location: {
                city: req.body.city,
                department: req.body.department,
            },
            rating: {
                average: 0,
                count: 0,
            },
        });
        }else{
            driver = existingDriver;
        }


        // Create driver application linking driver and vehicle
        if (!driver) {
            return next(new AppError("Failed to create driver", StatusCodes.INTERNAL_SERVER_ERROR));
        }

        // Check if plate number already exists
        const existingVehicle = await vehicleRepo.findByPlateNumber(req.body.plateNumber);
        if (existingVehicle) {
            return next(new AppError("Vehicle with this plate number already exists", StatusCodes.BAD_REQUEST));
        }

        // Create vehicle first
        const vehicle = await vehicleRepo.create({
            driver: driver._id,
            carModel: req.body.carModel,
            plateNumber: req.body.plateNumber,
            carColor: req.body.carColor,
            governmentDocuments: [{
                public_id: governmentDocuments?.public_id || "",
                secure_url: governmentDocuments?.secure_url || "",
            }],
            status: ApplicationStatus.PENDING,
            isApproved: false,
        });

        if (!vehicle) {
            return next(new AppError("Failed to create vehicle", StatusCodes.INTERNAL_SERVER_ERROR));
        }

        
        const application = await driverApplicationRepo.create({
            driver: driver._id,
            vehicle: vehicle._id,
            status: ApplicationStatus.PENDING,
        });

        return res.status(StatusCodes.CREATED).json({
            message: "Application submitted successfully",
            success: true,
            status: "success",
            data: {
                application,
                driver,
                vehicle,
            },
        });
    },
);

export const approveApplication = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { applicationId } = req.params;
        
        const application = await driverApplicationRepo.findOne({
            filter: {
                _id: new Types.ObjectId(applicationId as string),
                status: ApplicationStatus.PENDING,
            },
        });

        if (!application) {
            return next(new AppError("Application not found", StatusCodes.NOT_FOUND));
        }

        // Update application status
        await driverApplicationRepo.updateOne({
            filter: { _id: application._id },
            update: { status: ApplicationStatus.APPROVED },
        });

        // Update driver and vehicle status to approved
        await driverRepo.updateOne({
            filter: { _id: application.driver },
            update: { role: Role.Driver },
        });

        await vehicleRepo.updateOne({
            filter: { _id: application.vehicle },
            update: { isApproved: true, status: ApplicationStatus.APPROVED },
        });

        // Get the driver to find the user ID (assuming driver has a reference to user)
        const driver = await driverRepo.findOne({
            filter: { _id: application.driver },
        });

        if (driver) {
            // Update user role to Driver (assuming user ID is stored in driver model)
            await userRepo.updateOne({
                filter: {
                    _id: req.user?._id as Types.ObjectId,
                },
                update: {
                    role: Role.Driver,
                    isApprovedDriver: true,
                },
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "Driver approved successfully",
            data: application,
        });
});

export const login = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        const driver = await driverRepo.findByEmail({ email });
        if (!driver) {
            return next(new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED));
        }

        if (!driver.isApproved) {
            return next(new AppError("Driver account is not approved", StatusCodes.UNAUTHORIZED));
        }

        const isPasswordValid = await compare(password, driver.password);
        if (!isPasswordValid) {
            return next(new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED));
        }

        const tokens = await createToken({
            _id: driver._id,
            changeCredentialTime: driver.changeCredentialTime?.getTime().toString() || new Date().getTime().toString(),
            role: Role.Driver
        });

        return res.status(StatusCodes.OK).json({
            message: "Login successful",
            success: true,
            status: "success",
            data: {
                tokens,
                driver: {
                    _id: driver._id,
                    userName: driver.userName,
                    email: driver.email,
                    isApproved: driver.isApproved
                }
            }
        });
    }
);

export const updateProfile = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { userName, email } = req.body;
        const driverId = req.user?._id;

        if (!driverId) {
            return next(new AppError("Driver not authenticated", StatusCodes.UNAUTHORIZED));
        }

        const updateData: any = {};
        if (userName) updateData.userName = userName;
        if (email) {
            const existingDriver = await driverRepo.findByEmail({ email });
            if (existingDriver && existingDriver._id.toString() !== driverId.toString()) {
                return next(new AppError("Email already exists", StatusCodes.BAD_REQUEST));
            }
            updateData.email = email;
        }

        const updatedDriver = await driverRepo.updateOne({
            filter: { _id: driverId },
            update: updateData
        });

        if (!updatedDriver.matchedCount) {
            return next(new AppError("Driver not found", StatusCodes.NOT_FOUND));
        }

        const driver = await driverRepo.findOne({
            filter: { _id: driverId }
        });

        return res.status(StatusCodes.OK).json({
            message: "Profile updated successfully",
            success: true,
            status: "success",
            data: driver
        });
    }
);

export const updateVehicle = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { carModel, plateNumber, carColor } = req.body;
        const driverId = req.user?._id;

        if (!driverId) {
            return next(new AppError("Driver not authenticated", StatusCodes.UNAUTHORIZED));
        }

        const vehicle = await vehicleRepo.findOne({
            filter: { driver: driverId }
        });

        if (!vehicle) {
            return next(new AppError("Vehicle not found", StatusCodes.NOT_FOUND));
        }

        const updateData: any = {};
        if (carModel) updateData.carModel = carModel;
        if (plateNumber) updateData.plateNumber = plateNumber;
        if (carColor) updateData.carColor = carColor;

        if (req.files) {
            // Check Cloudinary configuration
            if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
                return next(new AppError("Cloudinary configuration is missing", StatusCodes.INTERNAL_SERVER_ERROR));
            }

            const files = [...(req.files as Express.Multer.File[])];
            let governmentDocuments = null;
            
            for(const file of files){
               const {public_id, secure_url} = await cloud().uploader.upload(file.path);
               if(file.fieldname === "governmentDocuments") {
                   governmentDocuments = {public_id, secure_url};
               }
            }

            if (governmentDocuments) {
                updateData.governmentDocuments = [governmentDocuments];
            }
        }

        const updatedVehicle = await vehicleRepo.updateOne({
            filter: { _id: vehicle._id },
            update: updateData
        });

        if (!updatedVehicle.matchedCount) {
            return next(new AppError("Failed to update vehicle", StatusCodes.INTERNAL_SERVER_ERROR));
        }

        const updatedVehicleData = await vehicleRepo.findOne({
            filter: { _id: vehicle._id }
        });

        return res.status(StatusCodes.OK).json({
            message: "Vehicle updated successfully",
            success: true,
            status: "success",
            data: updatedVehicleData
        });
    }
);

export const getAllDrivers = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { city, department } = req.query;
        const pagination = getPaginationOptions(req.query);
        
        let result;
        if (city || department) {
            result = await driverRepo.findByLocationPaginated(
                city as string,
                department as string,
                pagination.page,
                pagination.limit
            );
        } else {
            result = await driverRepo.findAllSortedByRatingPaginated(
                pagination.page,
                pagination.limit
            );
        }

        const paginationResult = calculatePagination(
            pagination.page!,
            pagination.limit!,
            result.total,
            'drivers'
        );

        const paginatedResponse = createPaginatedResponse(result.drivers, paginationResult);

        return res.status(StatusCodes.OK).json({
            message: "Drivers retrieved successfully",
            success: true,
            ...paginatedResponse
        });
    }
);

export const getDriversNearParent = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const parentId = req.user?._id;
        
        if (!parentId) {
            return next(new AppError("Parent not authenticated", StatusCodes.UNAUTHORIZED));
        }

        const parent = await userRepo.findOne({
            filter: { _id: parentId }
        });

        if (!parent || !parent.location) {
            return next(new AppError("Parent location not found", StatusCodes.NOT_FOUND));
        }

        const pagination = getPaginationOptions(req.query);
        const result = await driverRepo.findDriversNearParentPaginated(
            parent.location,
            pagination.page,
            pagination.limit
        );

        const paginationResult = calculatePagination(
            pagination.page!,
            pagination.limit!,
            result.total,
            'drivers'
        );

        const paginatedResponse = createPaginatedResponse(result.drivers, paginationResult);

        return res.status(StatusCodes.OK).json({
            message: "Nearby drivers retrieved successfully",
            success: true,
            ...paginatedResponse
        });
    }
);

export const getProfile = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const driverId = req.user?._id;

        if (!driverId) {
            return next(new AppError("Driver not authenticated", StatusCodes.UNAUTHORIZED));
        }

        const driver = await driverRepo.findOne({
            filter: { _id: driverId }
        });

        if (!driver) {
            return next(new AppError("Driver not found", StatusCodes.NOT_FOUND));
        }

        // Get driver's vehicle information
        const vehicle = await vehicleRepo.findOne({
            filter: { driver: driverId }
        });

        return res.status(StatusCodes.OK).json({
            message: "Profile retrieved successfully",
            success: true,
            status: "success",
            data: {
                driver: {
                    _id: driver._id,
                    userName: driver.userName,
                    email: driver.email,
                    phone: driver.phone,
                    nationalId: driver.nationalId,
                    isApproved: driver.isApproved,
                    rating: driver.rating,
                    location: driver.location,
                    licenseImage: driver.licenseImage,
                    nationalIdImage: driver.nationalIdImage,
                    createdAt: driver.createdAt,
                    updatedAt: driver.updatedAt
                },
                vehicle: vehicle ? {
                    _id: vehicle._id,
                    carModel: vehicle.carModel,
                    plateNumber: vehicle.plateNumber,
                    carColor: vehicle.carColor,
                    governmentDocuments: vehicle.governmentDocuments,
                    status: vehicle.status,
                    isApproved: vehicle.isApproved,
                    createdAt: vehicle.createdAt,
                    updatedAt: vehicle.updatedAt
                } : null
            }
        });
    }
);

export const rateDriver = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { driverId } = req.params;
        const { rating } = req.body;

        if (rating < 1 || rating > 5) {
            return next(new AppError("Rating must be between 1 and 5", StatusCodes.BAD_REQUEST));
        }

        const updatedDriver = await driverRepo.updateRating(driverId as string, rating);

        if (!updatedDriver) {
            return next(new AppError("Driver not found", StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            message: "Driver rated successfully",
            success: true,
            data: {
                driverId: updatedDriver._id,
                newRating: updatedDriver.rating.average,
                totalRatings: updatedDriver.rating.count,
            },
        });
    }
);

